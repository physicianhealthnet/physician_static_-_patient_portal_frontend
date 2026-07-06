import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { AxiosInstanceSecondryServer, AxiosInstanceDependency } from "../utilities/AxiosInstance";
import dayjs from "dayjs";
import doctorsData from "../data/doctorsData.json";
import AIGaugeReport from "../components/AIGaugeReport";
import { AIReportModal } from "../components/AIReportModal";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const PatientDashboardOverview = () => {
  const navigate = useNavigate();
  const [userData] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData"));
    } catch (e) {
      return null;
    }
  });
  const id = userData?.id;
  console.log(id);

  const [userP] = useState(() => {
    if (userData?.patientId) return userData;
    try {
      return JSON.parse(sessionStorage.getItem("patientData"));
    } catch (e) {
      return null;
    }
  });
  const [appointments, setAppointments] = useState([]);
  const [videoAppointments, setVideoAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clinicIdResolvedData, setClinicIdResolvedData] = useState([]);
  const [selectedReportNotes, setSelectedReportNotes] = useState(null);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [expandedClinicId, setExpandedClinicId] = useState(null);

  console.log(appointments, "appointments");

  const patientClinicId = React.useMemo(() => userP?.clinicIds || [], [userP]);

  // Resolve subdomains
  useEffect(() => {
    if (!patientClinicId.length) return;
    const clinics = doctorsData.filter((d) => patientClinicId.includes(d.cid));
    const resolved = clinics.map((clinic) => ({
      cid: clinic.cid,
      clinic_name: clinic.clinic_name,
      subdomain:
        clinic.subdomain_name ||
        clinic.clinic_name.toLowerCase().replace(/\s+/g, "-"),
      address: clinic.address || "",
      phone: clinic.phone || "",
    }));
    setClinicIdResolvedData((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(resolved)) return prev;
      return resolved;
    });
  }, [patientClinicId]);

  const fetchPrescriptions = React.useCallback(async () => {
    try {
      const clinicPromises = clinicIdResolvedData.map(
        async ({ subdomain, clinic_name, phone }) => {
          const isLocal =
            window?.location?.hostname === "localhost" ||
            window?.location?.hostname === "127.0.0.1";
          let baseUrl = `https://${subdomain}.physicianhealthnet.com/api`;
          if (isLocal) {
            console.log(true);

            baseUrl =
              subdomain === "demo2"
                ? "http://localhost:4026"
                : "http://localhost:3026";
          }
          const [scanRes, labRes, rxRes, assessRes] = await Promise.all([
            fetch(`${baseUrl}/scan-prescription/by-patient/${id}`)
              .then((r) => r.json())
              .catch(() => ({ data: [] })),
            fetch(`${baseUrl}/lab-prescription/by-patient/${id}`)
              .then((r) => r.json())
              .catch(() => ({ data: [] })),
            fetch(`${baseUrl}/prescription/get-by-phn/${id}`)
              .then((r) => r.json())
              .catch(() => ({ data: [] })),
            fetch(`${baseUrl}/assessment/get-by-phn/${id}`)
              .then((r) => r.json())
              .catch(() => ({ data: [] })),
          ]);
          const scans = (scanRes?.data || []).map((r) => ({
            ...r,
            _type: "scan",
            _clinicName: clinic_name,
            _subdomain: subdomain,
          }));
          const labs = (labRes?.data || []).map((r) => ({
            ...r,
            _type: "lab",
            _clinicName: clinic_name,
            _clinicPhone: phone,
            _subdomain: subdomain,
          }));
          const prescriptions = (rxRes?.data || []).map((r) => ({
            ...r,
            _type: "prescription",
            _clinicName: clinic_name,
            _subdomain: subdomain,
          }));
          const assessments = (assessRes?.data || []).map((r) => ({
            ...r,
            _type: "assessment",
            _clinicName: clinic_name,
            _subdomain: subdomain,
          }));

          return { scans, labs, prescriptions, assessments };
        },
      );

      const results = await Promise.all(clinicPromises);
      let merged = [];
      let allVitals = [];
      results.forEach((res) => {
        merged.push(...res.scans, ...res.labs, ...res.prescriptions);
        if (res.assessments && Array.isArray(res.assessments)) {
          res.assessments.forEach((a) => {
            if (a.vitals && Array.isArray(a.vitals)) {
              a.vitals.forEach((v) => {
                allVitals.push({
                  ...v,
                  date: v.date || a.updatedAt || a.createdAt || new Date(),
                });
              });
            }
          });
        }
      });

      const unique = Array.from(new Map(merged.map((i) => [i._id, i])).values())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setPrescriptions(unique);

      allVitals.sort((a, b) => new Date(a.date) - new Date(b.date));
      setVitalsHistory(allVitals);
    } catch (error) {
      console.error("Prescriptions fetch error", error);
    }
  }, [id, clinicIdResolvedData]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Use userData.id (MongoDB ID) for fetching appointments as it's what's stored in appointment.patientId
        const res = await AxiosInstanceSecondryServer.get(
          `/user-appointment/get/${userData?.id}`,
        );
        if (res.data && res.data.data) {
          setAppointments(res.data.data);
        } else if (Array.isArray(res.data)) {
          setAppointments(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchVideoMeetings = async () => {
      try {
        if (!userData?.id) return;
        const res = await AxiosInstanceDependency.get(`video-meetings?patientId=${userData.id}`);
        if (res.data && res.data.success) {
          setVideoAppointments(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch video appointments", error);
      }
    };

    if (userData?.id) {
      fetchAppointments();
      fetchVideoMeetings();
    }
  }, [userData?.id, userP?.phone, userData?.phone]);

  useEffect(() => {
    if (userData?.id) {
      fetchPrescriptions();
    }
  }, [userData?.id, fetchPrescriptions]);

  const futureAppointments = appointments
    .filter((app) => {
      const isFuture =
        new Date(app.appointmentDate) >= new Date().setHours(0, 0, 0, 0);
      const status = (app.status || "").toLowerCase().trim();
      const isCheckedOut = status.includes("check") && status.includes("out");
      const isFinished =
        status === "completed" ||
        isCheckedOut ||
        status === "cancelled" ||
        status === "reject";
      return isFuture && !isFinished;
    })
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  const upcomingClinicAppointment = futureAppointments.find(
    (app) => !(app.appointmentMode === "Online" || app.videoConsult || app.isOnline)
  );
  
  // Future video appointments from the dedicated video meetings collection
  const futureVideoAppointments = videoAppointments
    .filter((app) => {
      const isFuture = new Date(app.date) >= new Date().setHours(0, 0, 0, 0);
      const isFinished = app.status === "Completed" || app.status === "Cancelled";
      return isFuture && !isFinished;
    })
    .map((app) => ({
      ...app,
      // Map to UI-expected properties
      appointmentDate: app.date,
      docName: app.doctorName,
      // time in video meeting is like "08:00 AM", so we can combine it with date for dayjs parsing in UI if needed
    }))
    .sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));
    
  let upcomingVideoAppointment = futureVideoAppointments[0];
  
  if (!upcomingVideoAppointment) {
    // fallback to old schema appointments
    upcomingVideoAppointment = futureAppointments.find(
      (app) => (app.appointmentMode === "Online" || app.videoConsult || app.isOnline)
    );
  }

  const recentGlucoseVitals = vitalsHistory
    .filter((v) => v.bloodSugarFasting || v.bloodSugarAfterFood)
    .slice(-7);
  const latestVitals =
    vitalsHistory.length > 0 ? vitalsHistory[vitalsHistory.length - 1] : null;
  const glucoseData = {
    labels:
      recentGlucoseVitals.length > 0
        ? recentGlucoseVitals.map((v) => dayjs(v.date).format("DD/MM"))
        : [],
    datasets: [
      {
        label: "Glucose",
        data:
          recentGlucoseVitals.length > 0
            ? recentGlucoseVitals.map(
                (v) => v.bloodSugarFasting || v.bloodSugarAfterFood || 0,
              )
            : [],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#f59e0b",
      },
    ],
  };

  const glucoseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
      },
      x: { grid: { display: false }, border: { display: false } },
    },
  };

  const recentBpVitals = vitalsHistory
    .filter((v) => v.bloodPressure && v.bloodPressure.includes("/"))
    .slice(-5);

  const bpData = {
    labels: recentBpVitals.length > 0 ? recentBpVitals.map((v) => dayjs(v.date).format("DD/MM")) : [],
    datasets: [
      {
        label: "Systolic",
        data: recentBpVitals.length > 0 ? recentBpVitals.map((v) => parseInt(v.bloodPressure.split("/")[0]) || 0) : [],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#ef4444",
      },
      {
        label: "Diastolic",
        data: recentBpVitals.length > 0 ? recentBpVitals.map((v) => parseInt(v.bloodPressure.split("/")[1]) || 0) : [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#3b82f6",
      }
    ],
  };

  const bpOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
    scales: {
      y: {
        beginAtZero: false,
        border: { display: false },
        ticks: { font: { size: 10 } }
      },
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 } } },
    },
  };

  const createGaugeData = (value, total, color) => ({
    datasets: [
      {
        data: [value, total - value],
        backgroundColor: [color, "#f1f5f9"],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
        cutout: "80%",
      },
    ],
  });

  const activeMeds = (() => {
    const rxList = prescriptions
      .filter((p) => p._type === "prescription")
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.updatedAt || new Date()) -
          new Date(a.createdAt || a.updatedAt || new Date())
      );

    const latestActive = rxList.find((p) => {
      const rxDate = new Date(p.createdAt || p.updatedAt || new Date());
      const isOld = new Date() - rxDate > 30 * 24 * 60 * 60 * 1000;
      return !isOld && !p.isRefillable;
    });

    const latestRefill = rxList.find((p) => p.isRefillable);

    const meds = [];
    if (latestActive?.medicinesData) meds.push(...latestActive.medicinesData);
    if (latestRefill?.medicinesData && latestRefill !== latestActive) {
      meds.push(...latestRefill.medicinesData);
    }
    return meds;
  })();
  const testResults = prescriptions
    .filter((p) => p._type === "lab" || p._type === "scan")
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-full">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Icon icon="solar:health-bold" className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Good Afternoon,{" "}
            {userData?.firstName || userData?.username || "User"}!{" "}
            <span role="img" aria-label="wave">
              👋
            </span>
          </h1>
          <p className="text-blue-100 mb-6 max-w-2xl text-sm leading-relaxed">
            Welcome to your health command center. Here you can track your
            appointments, chat with doctors, and view your digital records.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/")}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
            >
              BOOK APPOINTMENT
            </button>
            <button
              onClick={() => navigate("/dashboard/all-records")}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-bold text-sm backdrop-blur-sm transition-colors border border-white/30"
            >
              VIEW RECORDS
            </button>
          </div>
        </div>
      </div>

      {/* Second Row: BP, Sugar, and Appointments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Blood Pressure Card */}
        <div className="rounded-xl p-6 text-white bg-linear-to-r from-blue-500 to-teal-400 shadow-sm relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10 flex flex-col items-start gap-1">
            <span className="text-sm font-bold opacity-90">Blood Pressure</span>
            <span className="text-5xl font-black">
              {latestVitals?.bloodPressure || "--/--"}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
              <path d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" fill="currentColor"></path>
            </svg>
          </div>
        </div>

        {/* Glucose Level Card */}
        <div className="rounded-xl p-6 text-white bg-linear-to-r from-orange-400 to-amber-400 shadow-sm relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10 flex flex-col items-start gap-1">
            <span className="text-sm font-bold opacity-90">Glucose Level</span>
            <span className="text-5xl font-black">
              {recentGlucoseVitals.length > 0 
                ? (recentGlucoseVitals[recentGlucoseVitals.length - 1].bloodSugarFasting || recentGlucoseVitals[recentGlucoseVitals.length - 1].bloodSugarAfterFood)
                : "--"
              } <span className="text-2xl font-bold opacity-80">mg/dL</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full transform -scale-x-100">
              <path d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" fill="currentColor"></path>
            </svg>
          </div>
        </div>

        {/* Book Appointment Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h4 className="text-slate-600 font-bold text-sm">Book Appointment</h4>
            <Icon icon="solar:calendar-date-bold-duotone" className="text-teal-500" width="20" />
          </div>
          <div className="flex flex-col gap-4 mt-4 flex-1">
            {upcomingClinicAppointment ? (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex flex-col items-center justify-center text-teal-600 shrink-0 border border-teal-100/50">
                  <span className="text-xl font-black leading-none">{dayjs(upcomingClinicAppointment.appointmentDate).date()}</span>
                  <span className="text-[10px] font-bold mt-0.5 uppercase tracking-wider">{dayjs(upcomingClinicAppointment.appointmentDate).format("MMM")}</span>
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-600 uppercase tracking-wider">Clinic</span>
                    <span className="text-slate-400 text-[11px] font-bold">{dayjs(upcomingClinicAppointment.appointmentDate).format("h:mm A")}</span>
                  </div>
                  <span className="text-slate-700 font-bold text-sm truncate">Dr. {upcomingClinicAppointment.docName || "Physician"}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 opacity-60 flex-1 justify-center items-center py-2">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Icon icon="solar:calendar-add-bold" width="24" />
                </div>
                <span className="text-slate-500 text-xs font-bold text-center">No Clinic Visit</span>
              </div>
            )}
            <button onClick={() => navigate("/")} className="w-full mt-auto bg-teal-50 hover:bg-teal-100 text-teal-600 py-2.5 rounded-lg font-bold text-xs transition-colors border border-teal-100">
              BOOK NOW
            </button>
          </div>
        </div>

        {/* Book Videochat Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h4 className="text-slate-600 font-bold text-sm">Book Videochat</h4>
            <Icon icon="solar:videocamera-bold-duotone" className="text-indigo-500" width="20" />
          </div>
          <div className="flex flex-col gap-4 mt-4 flex-1">
            {upcomingVideoAppointment ? (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-indigo-600 shrink-0 border border-indigo-100/50">
                  <span className="text-xl font-black leading-none">{dayjs(upcomingVideoAppointment.appointmentDate).date()}</span>
                  <span className="text-[10px] font-bold mt-0.5 uppercase tracking-wider">{dayjs(upcomingVideoAppointment.appointmentDate).format("MMM")}</span>
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 uppercase tracking-wider">Video</span>
                    <span className="text-slate-400 text-[11px] font-bold">{upcomingVideoAppointment.time || dayjs(upcomingVideoAppointment.appointmentDate).format("h:mm A")}</span>
                  </div>
                  <span className="text-slate-700 font-bold text-sm truncate">Dr. {upcomingVideoAppointment.docName || "Physician"}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 opacity-60 flex-1 justify-center items-center py-2">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Icon icon="solar:videocamera-add-bold" width="24" />
                </div>
                <span className="text-slate-500 text-xs font-bold text-center">No Video Consult</span>
              </div>
            )}
            <button onClick={() => navigate("/")} className="w-full mt-auto bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2.5 rounded-lg font-bold text-xs transition-colors border border-indigo-100">
              BOOK NOW
            </button>
          </div>
        </div>
      </div>

      {/* Clinic Support Chat */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-slate-800 font-bold text-lg">
            Clinic support chat
          </h3>
          <Icon
            icon="solar:double-alt-arrow-right-bold-duotone"
            className="text-blue-500"
            width="20"
          />
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-slate-200 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:hospital-bold-duotone" width="16" />
                    Clinic Name
                  </div>
                </th>
                <th className="p-4 font-bold border-b border-slate-200 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:map-point-bold-duotone" width="16" />
                    Location
                  </div>
                </th>
                <th className="p-4 font-bold border-b border-slate-200 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <Icon icon="solar:phone-bold-duotone" width="16" />
                    Primary Contact No
                  </div>
                </th>
                <th className="p-4 font-bold border-b border-slate-200 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <Icon icon="ic:baseline-whatsapp" width="16" className="text-green-500" />
                    Primary Whatsapp No
                  </div>
                </th>
                <th className="p-4 font-bold border-b border-slate-200 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <Icon icon="solar:chat-round-dots-bold-duotone" width="16" />
                    Web Chat
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {clinicIdResolvedData.map((clinic, index) => (
                <React.Fragment key={clinic.cid || index}>
                  <tr 
                    className={`cursor-pointer transition-colors duration-200 hover:bg-blue-50/50 ${expandedClinicId === clinic.cid ? 'bg-blue-50/30' : ''}`}
                    onClick={() => setExpandedClinicId(expandedClinicId === clinic.cid ? null : clinic.cid)}
                  >
                    <td className="p-4 border-b border-slate-100 align-top font-bold text-slate-800">
                      {clinic.clinic_name}
                    </td>
                    <td className="p-4 border-b border-slate-100 align-top">
                      {clinic.address || "Location"}
                    </td>
                    <td className="p-4 border-b border-slate-100 align-top text-center">
                      {clinic.phone ? (
                        <a 
                          href={`tel:+91${clinic.phone}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center gap-2 text-blue-500 hover:text-blue-600 font-medium transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full"
                        >
                          <Icon icon="solar:phone-bold-duotone" width="16" />
                          +91 {clinic.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 font-medium">N/A</span>
                      )}
                    </td>
                    <td className="p-4 border-b border-slate-100 align-top text-center">
                      {clinic.phone ? (
                        <a 
                          href={`https://wa.me/91${clinic.phone}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full"
                        >
                          <Icon icon="ic:baseline-whatsapp" width="16" />
                          +91 {clinic.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 font-medium">N/A</span>
                      )}
                    </td>
                    <td className="p-4 border-b border-slate-100 align-middle text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/dashboard/chat', { state: { clinicName: clinic.clinic_name, openChat: true } });
                        }}
                        className="inline-flex items-center justify-center gap-2 font-medium transition-colors px-4 py-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                      >
                        <Icon icon="solar:chat-round-dots-bold-duotone" width="18" />
                        Chat
                      </button>
                    </td>
                  </tr>

                  {expandedClinicId === clinic.cid && (
                    <>
                      {[
                        "Customer service",
                        "Pharmacy",
                        "Blood Test center",
                        "Scan Center",
                      ].map((service) => (
                        <tr key={`${clinic.cid}-${service}`} className="bg-slate-50/80 border-b border-slate-100 last:border-b-slate-200 hover:bg-white transition-colors group">
                          <td colSpan={2} className="p-4 align-middle font-semibold text-slate-600 pl-8 relative">
                            <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-r-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                            {service}
                          </td>
                          <td colSpan={3} className="p-4 align-middle">
                            <div className="flex justify-end gap-2">
                              <button 
                                className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5" 
                                title="Phone"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (clinic.phone) window.location.href = `tel:+91${clinic.phone}`;
                                }}
                              >
                                <Icon icon="solar:phone-bold" width="18" />
                              </button>
                              <button 
                                className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5" 
                                title="WhatsApp"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (clinic.phone) window.open(`https://wa.me/91${clinic.phone}`, '_blank');
                                }}
                              >
                                <Icon icon="ic:baseline-whatsapp" width="18" />
                              </button>
                              <button 
                                className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5" 
                                title="Web Chat"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/dashboard/chat');
                                }}
                              >
                                <Icon icon="solar:chat-round-dots-bold" width="18" />
                              </button>
                              <button 
                                className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5" 
                                title="Video Chat"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/dashboard/video-consult');
                                }}
                              >
                                <Icon icon="solar:videocamera-bold" width="18" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-2">
        {/* Glucose Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="text-slate-600 font-bold text-sm">
              Glucose (Recent)
            </h4>
            <Icon
              icon="solar:alt-arrow-down-linear"
              className="text-slate-400"
            />
          </div>
          <div className="flex-1 min-h-[200px] w-full flex items-center justify-center">
            {recentGlucoseVitals.length > 0 ? (
              <Line data={glucoseData} options={glucoseOptions} />
            ) : (
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                No API Data
              </span>
            )}
          </div>
        </div>

        {/* Blood Pressure Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="text-slate-600 font-bold text-sm">
              Blood Pressure
            </h4>
            <Icon
              icon="solar:heart-pulse-bold-duotone"
              className="text-red-400"
            />
          </div>
          <div className="flex-1 min-h-[200px] w-full flex items-center justify-center">
            {recentBpVitals.length > 0 ? (
              <Line data={bpData} options={bpOptions} />
            ) : (
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                No API Data
              </span>
            )}
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-slate-600 font-bold text-sm">Blood test results</h4>
            <span
              className="text-blue-500 font-bold text-xs cursor-pointer"
              onClick={() => navigate("/dashboard/all-records")}
            >
              More
            </span>
          </div>
          {testResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="pb-2 font-bold">Date</th>
                    <th className="pb-2 font-bold">Test Name</th>
                    <th className="pb-2 font-bold">Status</th>
                    <th className="pb-2 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((test, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 pr-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                        {dayjs(test.createdAt).format("DD MMM YYYY")}
                      </td>
                      <td className="py-3 pr-4 text-sm font-bold text-slate-700">
                        {test.scanType || test.labType || "Test Report"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap ${
                            test.status === "Completed"
                              ? "bg-emerald-50 text-emerald-600"
                              : test.status === "Report Not Ready"
                                ? "bg-amber-50 text-amber-600"
                                : test.status === "Not Scheduled"
                                  ? "bg-slate-100 text-slate-500"
                                  : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {test.status || "Pending"}
                        </span>
                      </td>
                      <td className="py-3 pl-2 text-right">
                        {test.finalReportFileUrl ||
                        (test.finalReportFileUrls &&
                          test.finalReportFileUrls.length > 0) ? (
                          <button
                            onClick={() =>
                              window.open(
                                test.finalReportFileUrl ||
                                  test.finalReportFileUrls[0],
                                "_blank",
                              )
                            }
                            className="w-8 h-8 rounded-full border border-slate-200 inline-flex items-center justify-center text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            title="Download/View Report"
                          >
                            <Icon
                              icon="solar:download-minimalistic-bold-duotone"
                              width="16"
                            />
                          </button>
                        ) : (
                          <button
                            className="w-8 h-8 rounded-full border border-slate-100 inline-flex items-center justify-center text-slate-300 cursor-not-allowed"
                            title="Report not available"
                          >
                            <Icon
                              icon="solar:download-minimalistic-bold-duotone"
                              width="16"
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest py-8">
                No API Data
              </span>
            </div>
          )}
        </div>

        {/* Current Medicines */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-slate-600 font-bold text-sm">
              Current Prescriptions
            </h4>
            <span
              className="text-blue-500 font-bold text-xs cursor-pointer"
              onClick={() => navigate("/dashboard/prescriptions")}
            >
              More
            </span>
          </div>
          {activeMeds.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="pb-2 font-bold">Medicine</th>
                    <th className="pb-2 font-bold text-center">Timing</th>
                    <th className="pb-2 font-bold text-right">
                      Dosage (M-A-N)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeMeds.map((med, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <span className="text-sm font-bold text-slate-700">
                          {med.medication || "Medicine"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap ${med.af_bf === "Before Food" || med.af_bf === "BF" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
                        >
                          {med.af_bf || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="text-xs font-black text-slate-600 tracking-widest bg-slate-100 px-2 py-1 rounded">
                          {med.morning || 0}-{med.afternoon || 0}-
                          {med.night || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest py-8">
                No API Data
              </span>
            </div>
          )}
        </div>
      </div>

      <AIReportModal
        selectedReportNotes={selectedReportNotes}
        onClose={() => setSelectedReportNotes(null)}
      />
    </div>
  );
};

export default PatientDashboardOverview;
