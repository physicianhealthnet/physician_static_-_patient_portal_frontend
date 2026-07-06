import React, { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AxiosInstanceSecondryServer,
} from "../utilities/AxiosInstance.js";
import { sendWhatsAppNotification } from "../utilities/whatsappNotify.js";
import doctorsData from "../data/doctorsData.json";

const getFilteredDates = (filter) => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate = new Date(today);
  let endDate = new Date(today);

  if (filter === "this_week") {
    const dayOfWeek = startDate.getDay();
    // Assuming Monday is start of week
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + daysToMonday);
    endDate = new Date(startDate);
    // Show 14 days: this week and next week
    endDate.setDate(startDate.getDate() + 13);
  } else if (filter === "next_week") {
    const dayOfWeek = startDate.getDay();
    const daysToNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    startDate.setDate(today.getDate() + daysToNextMonday); // Use today to prevent changing past startDate
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  } else if (filter === "this_month") {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  } else if (filter === "next_month") {
    startDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  } else if (filter === "all") {
    endDate.setDate(today.getDate() + 365);
  }

  const currentDate = new Date(startDate);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  while (currentDate <= endDate) {
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dd = String(currentDate.getDate()).padStart(2, "0");
    const fullDate = `${yyyy}-${mm}-${dd}`;

    let label = "";
    if (currentDate.getTime() === today.getTime()) {
      label = `Today, ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`;
    } else {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      if (currentDate.getTime() === tomorrow.getTime()) {
        label = `Tomorrow, ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`;
      } else {
        label = `${dayNames[currentDate.getDay()]}, ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`;
      }
    }

    let past = currentDate.getTime() < today.getTime();
    if (filter === "this_week") {
      // Disable next week's days
      const thisSunday = new Date(startDate);
      thisSunday.setDate(startDate.getDate() + 6);
      thisSunday.setHours(23, 59, 59, 999);
      if (currentDate.getTime() > thisSunday.getTime()) {
        past = true;
      }
    }

    dates.push({
      label,
      fullDate,
      slots: `${20 + (currentDate.getDate() % 2)} Slots Available`,
      disabled: past,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

function DoctorAppointmentDetail() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("this_week");
  const tabs = getFilteredDates(selectedFilter);
  const [activeTab, setActiveTab] = useState(tabs[0]?.label);
  const [targetedDoctor, setTargetedDoctor] = useState({});
  // console.log(targetedDoctor);

  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  console.log(showContactModal, selectedClinic);

  // Inline booking state
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedFullDate, setSelectedFullDate] = useState(null);
  const [selectedDateLabel, setSelectedDateLabel] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);
  const [appointmentFor, setAppointmentFor] = useState("Specialist");
  const [loader, setLoader] = useState(false);
  const [doctorsLoader, setDoctorsLoader] = useState(false);
  const [dialogInfo, setDialogInfo] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    buttonText: "",
    onConfirm: null,
  });
  const bookingPanelRef = useRef(null);
  const slotSectionRef = useRef(null);
  const dateScrollRef = useRef(null);

  // Modal State for Send to Mobile
  const [shareModalClinic, setShareModalClinic] = useState(null);
  const [shareUserName, setShareUserName] = useState("");
  const [shareUserPhone, setShareUserPhone] = useState("");
  const [selectedQuickAction, setSelectedQuickAction] = useState(null);
  // console.log(shareUserPhone);

  const [isSendingShare, setIsSendingShare] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = sessionStorage.getItem("userData");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleShareAction = async (name, phone, action, quiet = false) => {
    if (!quiet) setIsSendingShare(true);
    const patientName = name || user?.name || "User";
    const actionLabel = action?.label || "";
    const clinicContact = String(
      targetedDoctor?.phone || targetedDoctor?.phno || "N/A",
    );
    const clinicDirections =
      targetedDoctor?.clinic_location || "Directions not available";
    const clinicName =
      targetedDoctor?.clinic_name || targetedDoctor?.clinicName || "Our Clinic";
    const clinicAddress = targetedDoctor?.address || "Address not available";

    let templateName = "address_share_to_mobile";
    let parameters = [];

    const isEmergency = actionLabel.toLowerCase().includes("emergency");
    const isPharmacy = actionLabel.toLowerCase().includes("pharmacy");
    const isLab = actionLabel.toLowerCase().includes("lab");
    const isScan = actionLabel.toLowerCase().includes("scan");
    const isDirections = actionLabel.toLowerCase().includes("directions");

    if (isEmergency) {
      templateName = "emergency_details_for_patient";
      parameters = [
        patientName,
        clinicName,
        clinicAddress,
        clinicContact,
        clinicDirections,
        clinicContact,
        clinicContact,
        clinicContact,
        clinicContact,
        clinicContact,
      ];
    } else if (isPharmacy) {
      templateName = "pharmacy_details_for_patient";
      parameters = [
        patientName, // {{1}}
        clinicName, // {{2}}
        clinicAddress, // {{3}}
        clinicContact, // {{4}} Pharmacy
        clinicDirections, // {{5}} Directions
        clinicContact, // {{6}} Customer Care
        clinicContact, // {{7}} Appointment
        clinicContact, // {{8}} Lab
        clinicContact, // {{9}} Scan Center
        clinicContact, // {{10}} Emergency
      ];
    } else if (isLab) {
      templateName = "lab_details_for_patient";
      parameters = [
        patientName, // {{1}}
        clinicName, // {{2}}
        clinicAddress, // {{3}}
        clinicContact, // {{4}} Lab
        clinicDirections, // {{5}} Directions
        clinicContact, // {{6}} Customer Care
        clinicContact, // {{7}} Appointment
        clinicContact, // {{8}} Pharmacy
        clinicContact, // {{9}} Scan Center
        clinicContact, // {{10}} Emergency
      ];
    } else if (isScan) {
      templateName = "scan_center_details_for_patient";
      parameters = [
        patientName, // {{1}}
        clinicName, // {{2}}
        clinicAddress, // {{3}}
        clinicContact, // {{4}} Scan Center
        clinicDirections, // {{5}} Directions
        clinicContact, // {{6}} Customer Care
        clinicContact, // {{7}} Appointment
        clinicContact, // {{8}} Pharmacy
        clinicContact, // {{9}} Lab
        clinicContact, // {{10}} Emergency
      ];
    } else if (isDirections) {
      templateName = "get_clinic_directions";
      parameters = [
        patientName, // {{1}}
        clinicName, // {{2}}
        clinicAddress, // {{3}}
        clinicDirections, // {{4}} Google Maps Link
        clinicContact, // {{5}} Contact Phone
      ];
    } else {
      // Determine specific template name for other services
      if (actionLabel.toLowerCase().includes("customer care")) {
        templateName = "customer_care_share";
      } else {
        templateName = "address_share_to_mobile";
      }

      // Default sharing structure: 10 params as per newest template
      parameters = [
        patientName, // {{1}}
        clinicName, // {{2}}
        clinicAddress, // {{3}}
        clinicContact, // {{4}} Appointment
        clinicContact, // {{5}} Pharmacy
        clinicContact, // {{6}} Lab
        clinicContact, // {{7}} Scan Center
        clinicContact, // {{8}} Emergency
        clinicContact, // {{9}} Customer Care
        clinicDirections, // {{10}} Driving Directions
      ];
    }

    try {
      await sendWhatsAppNotification(templateName, phone, parameters);

      setShareModalClinic(null);
      setSelectedClinic(targetedDoctor);
      setShowContactModal(true);
    } catch (err) {
      console.log(err);
      alert("Failed to send message. Please try again.");
    } finally {
      if (!quiet) setIsSendingShare(false);
    }
  };

  const handleShareActionCopyDoctor = async (action, quiet = false) => {
    if (!quiet) setIsSendingShare(true);
    const actionLabel = action?.label || "";

    const patientName = user?.name || shareUserName || "A Patient";
    const patientPhone = String(user?.phno || shareUserPhone || "N/A");
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    let templateName = "secondery_copy_for_doctor";
    let parameters = [];

    if (actionLabel.toLowerCase().includes("emergency")) {
      templateName = "emergency_contact";
      parameters = [
        patientName,
        patientPhone,
        "Emergency assistance requested from profile.",
        currentTime,
      ];
    } else if (actionLabel.toLowerCase().includes("pharmacy")) {
      templateName = "pharmacy";
      parameters = [patientName, patientPhone, currentTime];
    } else if (actionLabel.toLowerCase().includes("lab")) {
      templateName = "lab_test";
      parameters = [patientName, patientPhone];
    } else if (actionLabel.toLowerCase().includes("scan")) {
      templateName = "scan_center";
      parameters = [patientName, patientPhone];
    } else if (actionLabel.toLowerCase().includes("customer care")) {
      templateName = "customer_care";
      parameters = [patientName, patientPhone, currentTime];
    } else {
      parameters = [
        targetedDoctor?.clinic_name || targetedDoctor?.clinicName || "Clinic",
        patientName,
        patientPhone,
      ];
    }

    try {
      await sendWhatsAppNotification(
        templateName,
        targetedDoctor?.phone,
        parameters,
      );
    } catch (err) {
      console.log(err);
    } finally {
      if (!quiet) setIsSendingShare(false);
    }
  };

  const openWhatsAppModal = async (e, item) => {
    if (e) e.preventDefault();
    console.log(e, item);

    setSelectedQuickAction(item);
    if (user) {
      console.log(true);

      setIsSendingShare(true);
      try {
        // Send relevant clinic/service details to the patient
        await handleShareAction(user.name, user.phno, item, true);

        // Notify the doctor/clinic with the specific service request
        await handleShareActionCopyDoctor(item, true);

        // Show options modal to offer immediate calling or further WhatsApp contact
        setSelectedClinic(targetedDoctor);
        setShowContactModal(true);
      } finally {
        setIsSendingShare(false);
      }
    } else {
      setShareModalClinic(targetedDoctor);
      setShareUserName("");
      setShareUserPhone("");
    }
  };

  const selectedDoctorData =
    doctorsList.find((d) => d.userName === appointmentFor) || {};

  const handleTimeSlotClick = (time) => {
    const selectedTabData = tabs.find((t) => t.label === activeTab);
    setSelectedTime(time);
    setSelectedFullDate(selectedTabData?.fullDate || activeTab);
    setSelectedDateLabel(activeTab);

    // Scroll to booking panel after a short delay
    setTimeout(() => {
      bookingPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const fetchDoctorsList = async (domain) => {
    try {
      setDoctorsLoader(true);
      const response = await fetch(
        `https://${domain}.physicianhealthnet.com/api/user/getAllUsers`,
      );
      const data = await response.json();
      if (data?.user && Array.isArray(data.user)) {
        const filteredDoctors = data.user.filter(
          (u) => u.userType === "doctor" || u.userType === "master",
        );
        setDoctorsList(filteredDoctors);

        // Auto-select the first doctor so the user can see time slots instantly
        if (filteredDoctors.length > 0) {
          setAppointmentFor(filteredDoctors[0].userName);
        }
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setDoctorsLoader(false);
    }
  };

  const handleDoctorSelect = (doctorUserName) => {
    setAppointmentFor(doctorUserName);
    // Reset time selection when doctor changes
    setSelectedTime(null);
    setSelectedFullDate(null);
    setSelectedDateLabel(null);

    // Scroll to date/time slots
    setTimeout(() => {
      slotSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleConfirmAppointment = async () => {
    if (!user) {
      setDialogInfo({
        isOpen: true,
        type: "info",
        title: "Login Required",
        message:
          "Please login or create an account to securely book an appointment.",
        buttonText: "Proceed to Login",
        onConfirm: () => {
          setDialogInfo((prev) => ({ ...prev, isOpen: false }));
          navigate("/login");
        },
        hasRegister: true,
      });
      return;
    }

    const payload = {
      cid: cid,
      patientId: user?.id,
      patientName: user?.name,
      patientPhno: user?.phno,
      patientEmail: user?.email,
      appointmentDate: selectedFullDate,
      selectedSlot: selectedTime,
      clinicName:
        targetedDoctor.clinic_name || targetedDoctor.clinicName || "Clinic",
      docName:
        selectedDoctorData.userName ||
        targetedDoctor.doctor_name ||
        targetedDoctor.doctorName ||
        "Doctor",
      subdomainName: targetedDoctor.subdomainName,
      clinicLocation: targetedDoctor.address || "Location",
      clinicNumber: targetedDoctor.phone || targetedDoctor.phno || "",
      status: "pending",
    };

    try {
      setLoader(true);
      const res = await AxiosInstanceSecondryServer.post(
        "/user-appointment/create",
        payload,
      );
      console.log("Appointment Created:", res.data);

      // Send notification to clinic/doctor
      if (payload.clinicNumber) {
        await sendWhatsAppNotification(
          "patient_waiting_for_clinic_response",
          payload.clinicNumber,
          [
            payload.docName || payload.clinicName, // {{1}} - Greeting name (Clinic/Doc)
            payload.patientName, // {{2}} - Patient Name
            payload.appointmentDate, // {{3}} - Date
            payload.selectedSlot, // {{4}} - Time
            payload.patientPhno, // {{5}} - Patient Phone
          ],
        );
      }

      setDialogInfo({
        isOpen: true,
        type: "success",
        title: "Appointment Confirmed!",
        message:
          "Your appointment has been successfully booked. You can view the details in your dashboard.",
        buttonText: "Go to Dashboard",
        onConfirm: () => {
          setDialogInfo((prev) => ({ ...prev, isOpen: false }));
          navigate("/dashboard/appointments");
        },
      });
    } catch (error) {
      console.error(
        "Error creating appointment:",
        error.response?.data || error.message,
      );
      setDialogInfo({
        isOpen: true,
        type: "error",
        title: "Booking Failed",
        message:
          "We couldn't process your appointment booking at this time. Please try again later.",
        buttonText: "Try Again",
        onConfirm: () => setDialogInfo((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setLoader(false);
    }
  };

  const getDoctorDetails = async () => {
    try {
      const doctor = doctorsData.find((d) => d.cid === cid);
      if (doctor) {
        setTargetedDoctor(doctor);
        // Fetch doctors list as soon as clinic data is available
        if (doctor.subdomainName) {
          fetchDoctorsList(doctor.subdomainName);
        }
      } else {
        setTargetedDoctor({});
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getDoctorDetails();
  }, [cid]);

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    const newTabs = getFilteredDates(filter);
    if (newTabs.length > 0) {
      setActiveTab(newTabs[0].label);
    }
  };

  const scrollLeft = () => {
    if (dateScrollRef.current) {
      dateScrollRef.current.scrollBy({ left: -250, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (dateScrollRef.current) {
      dateScrollRef.current.scrollBy({ left: 250, behavior: "smooth" });
    }
  };

  const morningSlots = [
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
  ];
  const afternoonSlots = [
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
  ];
  const eveningSlots = [
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
  ];

  return (
    <div className="bg-[#f0f0f5] min-h-screen pb-12">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-bold text-gray-600 hover:text-[#14bef0] transition-colors"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 mr-1" />
            Back to Search
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 mt-6 flex flex-col gap-6">
        {/* Left Column - Doctor Profile & Slots */}
        <div className="flex-1 flex flex-row gap-6 min-w-0">
          {/* Profile Card */}
          <div className="bg-white w-2/5 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="w-full flex flex-col">
              <div className="p-6 pb-3 flex flex-col md:flex-row gap-8 w-full">
                {/* Doctor/Clinic Image Section */}
                {/* <div className="shrink-0 flex justify-center">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-2xl border-4 border-gray-50 flex items-center justify-center bg-[#14bef0]/5 overflow-hidden shadow-sm relative z-10">
                      {targetedDoctor.clinic_image ? (
                        <img
                          src={targetedDoctor.clinic_image}
                          alt={
                            targetedDoctor.clinic_name ||
                            targetedDoctor.clinicName ||
                            "Clinic"
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${(targetedDoctor.doctor_name || targetedDoctor.doctorName || "Doctor").replace("Dr. ", "")}&backgroundColor=14bef0&textColor=ffffff`}
                          alt={
                            targetedDoctor.doctor_name ||
                            targetedDoctor.doctorName ||
                            "Doctor"
                          }
                          className="w-full h-full object-cover text-xs"
                        />
                      )}
                    </div>
                  </div>
                </div> */}
                <div className="flex flex-row justify-between gap-4 min-w-full">
                  {/* Info Detail Section */}
                  <div className="flex flex-col w-2/3">
                    <div className="flex flex-col gap-1">
                      <h1 className="text-2xl md:text-3xl font-semibold">
                        {targetedDoctor.clinic_name ||
                          targetedDoctor.clinicName ||
                          "Clinic Name Loading..."}
                      </h1>
                      <div className="flex items-center gap-2">
                        <span className="text-[#14bef0] text-[9px] font-black py-0.5 rounded uppercase tracking-wider">
                          {targetedDoctor.specialization || "General"}
                        </span>
                        <span className="text-gray-400 text-[10px] font-medium border-l border-gray-200 pl-2">
                          Modern Practice & Lab
                        </span>
                      </div>
                    </div>
                    {/* Primary Contact Row */}
                    <div className="flex flex-col gap-1 mt-2">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClinic(targetedDoctor);
                          setShowContactModal(true);
                        }}
                        className="flex items-center gap-3 p-1 bg-gray-50/50 rounded border border-gray-100 hover:bg-white hover:border-[#14bef0]/30 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <div className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:bg-[#14bef0] transition-colors">
                          <Icon
                            icon="mdi:phone"
                            className="w-3 h-3 text-[#14bef0] group-hover:text-white"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-700 truncate">
                            +91 {targetedDoctor?.phone}
                          </p>
                        </div>
                      </div>

                      <a
                        href={targetedDoctor?.clinic_location}
                        target="_blank"
                        className="flex items-center gap-3 p-1 bg-gray-50/50 rounded border border-gray-100 hover:bg-white hover:border-[#14bef0]/30 hover:shadow-sm transition-all group"
                      >
                        <div className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:bg-[#14bef0] transition-colors">
                          <Icon
                            icon="mdi:map-marker"
                            className="w-3 h-3 text-[#14bef0] group-hover:text-white"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-700 truncate">
                            {targetedDoctor?.address}
                          </p>
                        </div>
                        <Icon
                          icon="mdi:open-in-new"
                          className="text-gray-300 w-4 h-4 mr-1 group-hover:text-[#14bef0]"
                        />
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-1/3 h-full justify-start">
                    <button
                      onClick={() => {
                        setSelectedClinic(targetedDoctor);
                        setShowContactModal(true);
                      }}
                      className="w-full bg-[#14bef0] text-white px-6 py-2.5 rounded shadow-sm font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0ba8d6] transition-colors cursor-pointer"
                    >
                      For Doctor's Appointment
                    </button>
                    <button
                      onClick={() => navigate('/dashboard/video-consult')}
                      className="w-full bg-purple-500 text-white px-6 py-2.5 rounded shadow-sm font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-600 transition-colors cursor-pointer"
                    >
                      Request Video Consult
                    </button>
                    <button
                      onClick={(e) => openWhatsAppModal(e, { label: "Clinic" })}
                      disabled={isSendingShare}
                      className="w-full bg-gray-500 text-white px-6 py-2.5 rounded shadow-sm font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors cursor-pointer mt-auto"
                    >
                      {isSendingShare && !shareModalClinic ? (
                        <Icon
                          icon="mdi:loading"
                          className="w-5 h-5 animate-spin"
                        />
                      ) : (
                        <>
                          {/* <Icon icon="mdi:whatsapp" className="text-lg" /> */}
                          <span>Get Clinic Details on WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-col md:flex-row items-stretch md:items-end p-6 pb-3 gap-6">
                <div className="flex flex-col gap-4 w-full pl-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {[
                      {
                        label: "Contact Pharmacy",
                        discription: "For Medicines or Refills",
                        icon: "mdi:pharmacy",
                        key: "Pharmacy",
                      },
                      {
                        label: "Contact Lab",
                        discription: "For Blood Tests or Reports",
                        icon: "mdi:flask-outline",
                        key: "Lab",
                      },
                      {
                        label: "Contact Scan Center",
                        discription: "X-Ray or CT Scan or MRI",
                        icon: "mdi:radiology-box",
                        key: "Scan Center",
                      },
                      {
                        label: "Contact Emergency",
                        discription: "For Emergency Services",
                        icon: "mdi:ambulance",
                        isEmergency: true,
                      },
                      {
                        label: "Contact Customer Care",
                        discription: "For Assistance",
                        icon: "mdi:headset",
                      },
                      {
                        label: "Get Directions",
                        discription: "Driving to the Clinic",
                        icon: "mdi:map-marker-path",
                        link: targetedDoctor?.clinic_location,
                      },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={(e) =>
                          openWhatsAppModal(e, {
                            label: item.key || item.label,
                            ...item,
                          })
                        }
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100 text-left"
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                            item.isEmergency
                              ? "bg-red-50 text-red-600"
                              : "bg-[#14bef0]/10 text-[#14bef0]"
                          }`}
                        >
                          <Icon icon={item.icon} className="text-xl" />
                        </div>
                        <p
                          className={`text-left text-xs transition-colors ${
                            item.isEmergency
                              ? "text-red-600"
                              : "text-gray-700 group-hover:text-[#14bef0]"
                          }`}
                        >
                          <span className="text-[10px] text-left transition-colors">
                            {item?.discription}
                          </span>
                          <br />
                          <span className="text-sm text-left font-bold transition-colors">
                            {item.label}
                          </span>
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full">
              <div className="p-6 w-full">
                <div className="flex-1 flex p-4 w-full rounded border border-gray-100 shadow-sm items-center gap-4 bg-white">
                  <div className="w-12 h-12 rounded bg-[#14bef0]/10 flex items-center justify-center shrink-0">
                    <Icon
                      icon="mdi:cash-check"
                      className="w-6 h-6 text-[#14bef0]"
                    />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      {/* <span className="text-xl font-black text-gray-800">
                        ₹{targetedDoctor.fees || "0"}
                      </span> */}
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                        Pay at Clinic
                      </span>
                    </div>
                    <p className="text-[10px] text-[#14bef0] font-bold tracking-widest uppercase">
                      Verified Doctors Consultation Fee
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slots Section */}
          <div
            className="bg-white w-3/5 rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            ref={slotSectionRef}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 text-2xl flex items-center gap-2">
                <Icon
                  icon="mdi:calendar-check"
                  className="text-[#14bef0] text-2xl"
                />
                Book a Doctor Appointment
              </h3>
              {doctorsList.length > 1 && (
                <select
                  value={appointmentFor}
                  onChange={(e) => handleDoctorSelect(e.target.value)}
                  className="border border-gray-300 rounded text-sm p-1.5 focus:outline-none focus:border-[#14bef0]"
                >
                  {doctorsList.map((doc, idx) => (
                    <option key={idx} value={doc.userName}>
                      {doc.userName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="p-0">
              {/* Filter Buttons */}
              <div className="flex gap-2 p-3 border-b border-gray-100 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden bg-gray-50/50">
                {[
                  "this_week",
                  "next_week",
                  "this_month",
                  "next_month",
                  "all",
                ].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterClick(filter)}
                    className={`px-5 py-2 rounded-full text-base font-bold transition-all ${selectedFilter === filter ? "bg-[#14bef0] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:border-[#14bef0] hover:text-[#14bef0]"}`}
                  >
                    {filter
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </button>
                ))}
              </div>

              {/* Date Selector */}
              <div className="flex items-center border-b border-gray-200 relative">
                <button
                  onClick={scrollLeft}
                  className="p-4 text-gray-500 hover:text-[#14bef0] bg-white z-10 border-r border-gray-100 shrink-0 shadow-[2px_0_5px_rgba(0,0,0,0.02)] transition-colors h-full flex items-center justify-center cursor-pointer"
                >
                  <Icon icon="mdi:chevron-left" className="w-6 h-6" />
                </button>

                <div
                  ref={dateScrollRef}
                  className="flex overflow-x-auto whitespace-nowrap w-full [&::-webkit-scrollbar]:hidden scroll-smooth flex-1 transition-all gap-2"
                >
                  {tabs.length > 0 ? (
                    tabs.map((tab) => (
                      <button
                        key={tab.label}
                        onClick={() => {
                          if (!tab.disabled) setActiveTab(tab.label);
                        }}
                        disabled={tab.disabled}
                        className={`px-5 py-2 rounded-full text-base font-bold transition-all ${activeTab === tab.label ? "bg-[#14bef0] text-white shadow-sm" : "bg-white border border-gray-200"} ${tab.disabled ? "opacity-50 cursor-not-allowed text-gray-400 bg-gray-50" : "text-gray-600 hover:border-[#14bef0] hover:text-[#14bef0] group"} `}
                      >
                        <span
                          className={`text-base font-bold ${activeTab === tab.label ? "text-white" : tab.disabled ? "text-gray-400" : "text-gray-700 group-hover:text-[#14bef0]"}`}
                        >
                          {tab.label}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="py-8 w-full text-center text-gray-500 font-medium text-sm">
                      No days available for this filter
                    </div>
                  )}
                </div>

                <button
                  onClick={scrollRight}
                  className="p-4 text-gray-500 hover:text-[#14bef0] bg-white z-10 border-l border-gray-100 shrink-0 shadow-[-2px_0_5px_rgba(0,0,0,0.02)] transition-colors h-full flex items-center justify-center cursor-pointer"
                >
                  <Icon icon="mdi:chevron-right" className="w-6 h-6" />
                </button>
              </div>

              {/* Time Slots */}
              <div className="p-6">
                {/* Morning */}
                <div className="mb-6 flex flex-col sm:flex-row items-start gap-4">
                  <div className="sm:w-36 flex items-center gap-2 text-base font-bold text-gray-800 shrink-0 pt-2">
                    <Icon
                      icon="mdi:weather-sunny"
                      className="text-yellow-500 text-lg"
                    />{" "}
                    Morning
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {morningSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeSlotClick(time)}
                        className={`px-4 py-2 text-base font-bold rounded border transition-colors ${selectedTime === time && selectedDateLabel === activeTab ? "bg-[#14bef0] text-white border-[#14bef0]" : "bg-white text-[#14bef0] border-[#14bef0] hover:bg-[#14bef0]/10"}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Afternoon */}
                <div className="mb-6 flex flex-col sm:flex-row items-start gap-4 border-t border-gray-100 pt-6">
                  <div className="sm:w-36 flex items-center gap-2 text-base font-bold text-gray-800 shrink-0 pt-2">
                    <Icon
                      icon="mdi:weather-partly-cloudy"
                      className="text-orange-500 text-lg"
                    />{" "}
                    Afternoon
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {afternoonSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeSlotClick(time)}
                        className={`px-4 py-2 text-base font-bold rounded border transition-colors ${selectedTime === time && selectedDateLabel === activeTab ? "bg-[#14bef0] text-white border-[#14bef0]" : "bg-white text-[#14bef0] border-[#14bef0] hover:bg-[#14bef0]/10"}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Evening */}
                <div className="flex flex-col sm:flex-row items-start gap-4 border-t border-gray-100 pt-6">
                  <div className="sm:w-36 flex items-center gap-2 text-base font-bold text-gray-800 shrink-0 pt-2">
                    <Icon
                      icon="mdi:weather-night"
                      className="text-indigo-500 text-lg"
                    />{" "}
                    Evening
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {eveningSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeSlotClick(time)}
                        className={`px-4 py-2 text-base font-bold rounded border transition-colors ${selectedTime === time && selectedDateLabel === activeTab ? "bg-[#14bef0] text-white border-[#14bef0]" : "bg-white text-[#14bef0] border-[#14bef0] hover:bg-[#14bef0]/10"}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Booking Summary (Sticky) */}
        <div className="w-full lg:w-[360px] shrink-0">
          <div className="sticky top-20 flex flex-col gap-6">
            {/* Info Widget */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <div className="flex items-start gap-3 mb-4">
                <Icon
                  icon="mdi:shield-check-outline"
                  className="text-[#14bef0] text-2xl shrink-0"
                />
                <div>
                  <h4 className="font-bold text-gray-800 text-[15px]">
                    Clinic Verified
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">
                    Medical Registration Verified. This clinic meets our quality
                    standards.
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-100 my-4"></div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Payment Mode</span>
                <span className="font-bold text-gray-800">Online & Clinic</span>
              </div>
            </div>

            {/* Booking Panel */}
            {selectedTime ? (
              <div
                ref={bookingPanelRef}
                className="bg-white rounded-lg shadow-lg border-t-4 border-[#14bef0] overflow-hidden animate-[fadeSlideIn_0.3s_ease-out]"
              >
                <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                  <Icon
                    icon="mdi:calendar-check"
                    className="text-[#14bef0] text-2xl"
                  />
                  <h3 className="font-bold text-gray-800 text-lg">
                    Confirm Appointment Date & Time
                  </h3>
                </div>

                <div className="p-5">
                  {/* <div className="mb-5">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                      Appointment With
                    </p>
                    <p className="font-bold text-gray-800 text-[15px]">
                      {selectedDoctorData.userName
                        ? selectedDoctorData.userName
                        : targetedDoctor.doctor_name ||
                          targetedDoctor.doctorName ||
                          appointmentFor}
                    </p>
                  </div> */}

                  <div className="flex items-center justify-between bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-6">
                    <div className="flex items-center gap-3">
                      <Icon
                        icon="mdi:clock-outline"
                        className="text-[#14bef0] text-xl"
                      />
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          {selectedDateLabel}
                        </p>
                        <p className="font-bold text-[#14bef0] text-[15px]">
                          {selectedTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmAppointment}
                    disabled={loader}
                    className="w-full bg-[#14bef0] hover:bg-[#0ba8d6] text-white font-bold py-3.5 rounded-lg shadow-sm transition-colors text-[15px] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {loader ? (
                      <>
                        <Icon
                          icon="mdi:loading"
                          className="animate-spin text-xl"
                        />{" "}
                        Booking...
                      </>
                    ) : (
                      "Confirm Appointment"
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-4 font-medium flex items-center justify-center gap-1.5">
                    <Icon
                      icon="mdi:check-decagram"
                      className="text-green-500 text-sm"
                    />{" "}
                    No booking fee
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center opacity-70">
                <Icon
                  icon="mdi:cursor-default-click-outline"
                  className="text-gray-300 text-5xl mb-3"
                />
                <p className="text-gray-500 text-sm font-medium">
                  Select a time slot to proceed with booking
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Dialog UI */}
      {dialogInfo.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-9999 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeSlideIn_0.3s_ease-out]">
            <div className="p-6 text-center shadow-sm">
              <div
                className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 shrink-0 shadow-sm border"
                style={{
                  backgroundColor:
                    dialogInfo.type === "success"
                      ? "#ECFDF5"
                      : dialogInfo.type === "error"
                        ? "#FEF2F2"
                        : "#EFF6FF",
                  borderColor:
                    dialogInfo.type === "success"
                      ? "#A7F3D0"
                      : dialogInfo.type === "error"
                        ? "#FECACA"
                        : "#BFDBFE",
                }}
              >
                {dialogInfo.type === "success" && (
                  <Icon
                    icon="mdi:check-circle"
                    className="text-3xl text-green-500"
                  />
                )}
                {dialogInfo.type === "error" && (
                  <Icon
                    icon="mdi:close-circle"
                    className="text-3xl text-red-500"
                  />
                )}
                {dialogInfo.type === "info" && (
                  <Icon
                    icon="mdi:information"
                    className="text-3xl text-blue-500"
                  />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {dialogInfo.title}
              </h3>
              <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
                {dialogInfo.message}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {dialogInfo.type !== "success" && (
                  <button
                    onClick={() =>
                      setDialogInfo((prev) => ({ ...prev, isOpen: false }))
                    }
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={dialogInfo.onConfirm}
                  className="flex-1 px-4 py-2.5 bg-[#14bef0] hover:bg-[#0ba8d6] text-white font-bold rounded-lg shadow-sm transition-colors"
                >
                  {dialogInfo.buttonText || "OK"}
                </button>
              </div>

              {dialogInfo.hasRegister && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500 font-medium">
                    New user?{" "}
                    <button
                      onClick={() => {
                        setDialogInfo((prev) => ({ ...prev, isOpen: false }));
                        navigate("/register");
                      }}
                      className="text-[#14bef0] font-bold hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share to Mobile Modal */}
      {shareModalClinic && (
        <div
          className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4"
          onClick={() => {
            setShareModalClinic(null);
            setSelectedQuickAction(null);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Contact{" "}
                {selectedQuickAction?.label
                  ?.replace(/^Contact /i, "")
                  ?.replace(/^for /i, "") || "Details"}{" "}
                to WhatsApp
              </h3>
              <button
                onClick={() => {
                  setShareModalClinic(null);
                  setSelectedQuickAction(null);
                }}
                className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Your Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-[#14bef0]"
                  placeholder="Enter your name"
                  value={shareUserName}
                  onChange={(e) => setShareUserName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-[#14bef0]"
                  placeholder="Enter your whatsapp number"
                  value={shareUserPhone}
                  onChange={(e) => setShareUserPhone(e.target.value)}
                />
              </div>
              <button
                disabled={isSendingShare || !shareUserName || !shareUserPhone}
                onClick={async () => {
                  await handleShareAction(
                    shareUserName,
                    shareUserPhone,
                    selectedQuickAction,
                  );
                  await handleShareActionCopyDoctor(selectedQuickAction);

                  // After work is done, show the contact options modal
                  setShareModalClinic(null);
                  setSelectedClinic(targetedDoctor);
                  setShowContactModal(true);
                }}
                className="w-full bg-[#14bef0] text-white py-2 rounded-lg font-semibold hover:bg-[#0e9ecf] transition-colors disabled:opacity-50 flex justify-center items-center h-10"
              >
                {isSendingShare ? (
                  <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                ) : (
                  `Send ${selectedQuickAction?.label?.replace(/^Contact /i, "")?.replace(/^for /i, "") || "Details"} via WhatsApp`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Contact Options Modal */}
      {showContactModal && selectedClinic && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedQuickAction?.label
                  ?.replace(/^Contact /i, "")
                  ?.replace(/^for /i, "") || "Clinic"}{" "}
                Contact Options
              </h3>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedQuickAction(null);
                }}
                className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <a
                href={`tel:${selectedClinic?.phone}`}
                className="flex items-center justify-center gap-3 bg-[#14bef0] text-white py-3 rounded-xl font-semibold hover:bg-[#12abd8] transition-all shadow-md active:scale-95"
                onClick={() => setShowContactModal(false)}
              >
                <Icon icon="mdi:phone" className="w-5 h-5" />
                Call Now
              </a>
              <a
                href={`https://wa.me/91${selectedClinic?.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white py-3 rounded-xl font-semibold hover:bg-[#20bd5a] transition-all shadow-md active:scale-95"
                onClick={() => setShowContactModal(false)}
              >
                <Icon icon="mdi:whatsapp" className="w-5 h-5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorAppointmentDetail;
