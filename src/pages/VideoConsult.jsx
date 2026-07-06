import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Icon } from "@iconify/react";
import { AxiosInstanceDependency, AxiosInstanceSecondryServer } from "../utilities/AxiosInstance";
import doctorsData from "../data/doctorsData.json";

const VideoConsult = () => {
  const [meetingJoined, setMeetingJoined] = useState(false);
  const [roomName, setRoomName] = useState(() => {
    return localStorage.getItem("jitsi_patient_room_code") || "";
  });
  
  // Scheduled consultations states
  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  // Doctors list states
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // New Booking UI States
  const [activeTab, setActiveTab] = useState("book"); // 'book' or 'consultations'
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [patientConcerns, setPatientConcerns] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Retrieve patient details from session storage
  const userStr = sessionStorage.getItem("userData");
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.name || "Patient";
  const userPhone = user?.phno || user?.phone || "";

  // Time slots
  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "12:30 PM", 
    "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM", "05:30 PM"
  ];

  // Calendar Helpers
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const fetchScheduledMeetings = async () => {
    if (!userPhone) return;
    try {
      setLoadingMeetings(true);
      const cleanPhone = userPhone.replace("+91", "").trim();
      const res = await AxiosInstanceDependency.get(`video-meetings?patientPhone=${cleanPhone}`);
      if (res.data && res.data.success) {
        setScheduledMeetings(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching patient scheduled meetings:", err);
    } finally {
      setLoadingMeetings(false);
    }
  };

  const fetchDoctors = () => {
    setLoadingDoctors(true);
    try {
      // Show all clinics' doctors to allow the patient to book a video consult with any available doctor
      let allDoctors = [];
      let seen = new Set();
      
      const patientClinicIds = user?.clinicIds || user?.patientClinicId || [];
      
      doctorsData.forEach(doc => {
        // If patientClinicIds is empty, we show all. If it has items, we can filter, but let's show all available doctors for now as requested by "show the all clinics dr".
        if (doc.doctor_name && doc.doctor_name.trim() !== "") {
          const cleanDocName = doc.doctor_name.startsWith("Dr") ? doc.doctor_name.replace(/Dr\.?\s*/i, "") : doc.doctor_name;
          const docKey = `${doc.clinic_name}-${cleanDocName}`;
          if (!seen.has(docKey)) {
            seen.add(docKey);
            allDoctors.push({
              _id: doc.cid, // using cid as id
              cid: doc.cid,
              subdomainName: doc.subdomain_name || doc.subdomainName || doc.clinic_name.toLowerCase().replace(/\s+/g, "-"),
              doctorName: cleanDocName,
              department: doc.specialization || "General Medicine",
              hospital: doc.clinic_name || "Unknown Clinic",
              number: doc.phone || "N/A",
              fee: doc.fee || 20,
              photo: doc.clinic_image || null,
            });
          }
        }
      });

      setDoctors(allDoctors);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    fetchScheduledMeetings();
    fetchDoctors();
  }, [userPhone]);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.roomName) {
      setRoomName(location.state.roomName);
      setMeetingJoined(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleJoinMeet = async (customRoom = null) => {
    let targetRoom = customRoom || roomName;
    if (!targetRoom.trim()) return;

    if (targetRoom.startsWith("http")) {
      const parts = targetRoom.split("/");
      targetRoom = parts[parts.length - 1];
    }

    setRoomName(targetRoom.trim());
    localStorage.setItem("jitsi_patient_room_code", targetRoom.trim());
    setMeetingJoined(true);
  };

  const handleLeaveRoom = () => {
    setMeetingJoined(false);
    fetchScheduledMeetings();
  };

  const formatSelectedDateForSubmit = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Convert 12h format to 24h format for backend if necessary, or just send as string
  const formatTimeForSubmit = (time12h) => {
    if(!time12h) return "";
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
  };

  const handleRequestSubmit = async () => {
    if (!selectedDoctor || !selectedTime) {
      setRequestError("Please select a doctor and a time slot.");
      setTimeout(() => setRequestError(""), 3000);
      return;
    }

    try {
      setRequestSubmitting(true);
      setRequestError("");
      
      const formattedDate = formatSelectedDateForSubmit();
      const formattedTime = formatTimeForSubmit(selectedTime);

      const payload = {
        patientId: user?.patientId || user?.id || "PATIENT-ID",
        patientName: userName,
        patientPhone: userPhone,
        patientEmail: user?.email || "",
        doctorId: selectedDoctor._id || selectedDoctor.cid || "DOCTOR-ID",
        doctorName: selectedDoctor.doctorName,
        date: formattedDate,
        time: selectedTime, // Send the 12h format (e.g., "08:00 AM") as expected by the UI
        duration: 30,
        status: "Requested",
        notes: patientConcerns,
      };

      const res = await AxiosInstanceDependency.post("video-meetings", payload);
      if (res.data) {
        setRequestSuccess(true);
        fetchScheduledMeetings();
        setTimeout(() => {
          setRequestSuccess(false);
          setActiveTab("consultations");
        }, 2000);
      } else {
        setRequestError(res.data?.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error("Error requesting meeting:", err);
      setRequestError("Server Error. Please try again later.");
    } finally {
      setRequestSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-[#f8f9fc] flex items-center justify-center p-2 sm:p-6">
      <div className="w-full bg-[#f5f7fa] rounded-[30px] shadow-sm border border-[#e0e0e0] overflow-hidden flex flex-col h-[85vh] sm:h-[800px]">
        
        {/* Top Header / Tab Bar */}
        {!meetingJoined && (
          <div className="bg-white p-4 px-6 border-b border-[#e0e0e0] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4338ca] text-white rounded-xl flex items-center justify-center shadow-md">
                <Icon icon="solar:videocamera-record-bold-duotone" className="text-xl" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 m-0">Video Consultation</h1>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab("book")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all border-none cursor-pointer ${
                  activeTab === "book" ? "bg-white shadow-sm text-[#4338ca]" : "bg-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Book Appointment
              </button>
              <button 
                onClick={() => setActiveTab("consultations")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all border-none cursor-pointer ${
                  activeTab === "consultations" ? "bg-white shadow-sm text-[#4338ca]" : "bg-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                My Consultations
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          
          {meetingJoined ? (
            <div className="w-full h-full bg-slate-900 relative">
              <button
                onClick={handleLeaveRoom}
                className="absolute top-4 right-4 z-50 px-4 py-2 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-md border-none text-sm cursor-pointer"
              >
                Leave Room
              </button>
              <JitsiMeeting
                domain="alpha.jitsi.net"
                roomName={roomName}
                configOverwrite={{
                  startWithAudioMuted: false,
                  startWithVideoMuted: false,
                  disableModeratorIndicator: true,
                  prejoinPageEnabled: false,
                }}
                interfaceConfigOverwrite={{
                  DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
                }}
                userInfo={{
                  displayName: userName
                }}
                onApiReady={(externalApi) => {
                  externalApi.addListener("videoConferenceLeft", () => {
                    handleLeaveRoom();
                  });
                }}
                getIFrameRef={(iframeRef) => {
                  iframeRef.style.height = '100%';
                  iframeRef.style.width = '100%';
                  iframeRef.style.border = 'none';
                }}
              />
            </div>
          ) : activeTab === "book" ? (
            <div className="w-full h-full flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
              
              {/* Left Column - Booking Appointment */}
              <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4">Booking Appointment</h2>
                  
                  {/* Calendar */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-sm">{monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</span>
                      <div className="flex gap-2">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer border-none bg-transparent">
                          <Icon icon="solar:alt-arrow-left-linear" className="text-lg" />
                        </button>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer border-none bg-transparent">
                          <Icon icon="solar:alt-arrow-right-linear" className="text-lg" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-[10px] font-bold text-slate-400">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="p-2"></div>
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const date = i + 1;
                        const isSelected = selectedDate.getDate() === date;
                        return (
                          <div 
                            key={date} 
                            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), date))}
                            className={`p-1.5 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                              isSelected ? 'bg-[#4338ca] text-white shadow-md shadow-indigo-500/30' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {date}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                    <span>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()]}, {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          selectedTime === time 
                            ? 'bg-[#4338ca] text-white border-[#4338ca] shadow-md shadow-indigo-500/20' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient Concerns */}
                <div className="mt-2">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">Patient Concerns</h3>
                  <div className="bg-white rounded-2xl p-1 border border-slate-200">
                    <textarea
                      value={patientConcerns}
                      onChange={(e) => setPatientConcerns(e.target.value)}
                      placeholder="Red, itchy skin for a week. Worse after sun.&#10;Symptoms:&#10;• Flaky patches&#10;• Mild burning"
                      className="w-full h-32 p-3 text-xs text-slate-600 border-none outline-none resize-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Middle Column - Doctor List */}
              <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-800 m-0">Available Doctors</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Icon icon="solar:magnifer-linear" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search Doctor"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-48 transition-all"
                      />
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                      Filter
                      <Icon icon="solar:tuning-square-2-linear" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {loadingDoctors ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <Icon icon="solar:spinner-bold animate-spin" className="text-3xl text-indigo-500 mb-2" />
                      <span className="text-xs font-bold">Loading Doctors...</span>
                    </div>
                  ) : filteredDoctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                      {filteredDoctors.map(doc => {
                        const isSelected = selectedDoctor?._id === doc._id;
                        return (
                          <div 
                            key={doc._id} 
                            onClick={() => setSelectedDoctor(doc)}
                            className={`bg-white rounded-2xl p-4 transition-all cursor-pointer border ${
                              isSelected ? 'border-[#4338ca] shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500' : 'border-slate-100 shadow-sm hover:shadow-md'
                            }`}
                          >
                            <div className="flex gap-3 mb-4">
                              <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                <img 
                                  src={doc.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(doc.doctorName) + "&background=random"} 
                                  alt={doc.doctorName} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex flex-col justify-center">
                                <h4 className="font-bold text-sm text-slate-800 m-0">Dr. {doc.doctorName}</h4>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                                  <Icon icon="solar:stethoscope-linear" />
                                  {doc.department || "Specialist"}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                                  <Icon icon="solar:hospital-linear" />
                                  {doc.hospital}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                                    <Icon icon="solar:wallet-money-linear" className="text-emerald-500" />
                                    {doc.fee ? `₹${doc.fee}/hour` : "$20/hour"}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDoctor(doc);
                                }}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors border-none cursor-pointer ${
                                  isSelected ? 'bg-[#4338ca] text-white' : 'bg-[#4338ca] text-white hover:bg-indigo-700'
                                }`}
                              >
                                Book Now
                              </button>
                              <button className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center justify-center">
                                Detail
                              </button>
                              <button className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center justify-center">
                                <Icon icon="solar:chat-round-dots-linear" className="text-sm" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <Icon icon="solar:users-group-two-rounded-linear" className="text-4xl text-indigo-300 mb-2" />
                      <span className="text-sm font-bold text-slate-500">No doctors available.</span>
                      <p className="text-xs text-center mt-1 px-4">There are currently no doctors available for video consultation.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Detail Doctor */}
              {selectedDoctor && (
                <div className="w-full lg:w-[320px] shrink-0 bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col relative overflow-y-auto custom-scrollbar">
                  <button 
                    onClick={() => setSelectedDoctor(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 border-none bg-transparent cursor-pointer"
                  >
                    <Icon icon="solar:close-circle-linear" className="text-xl" />
                  </button>
                  
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Detail Doctor</h3>
                  
                  <div className="w-full aspect-square rounded-2xl bg-slate-100 mb-4 overflow-hidden border border-slate-200 flex items-center justify-center">
                    <img 
                      src={selectedDoctor.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(selectedDoctor.doctorName) + "&background=random"} 
                      alt={selectedDoctor.doctorName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Dr. {selectedDoctor.doctorName}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 mb-6 pb-4 border-b border-slate-100">
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:stethoscope-bold" className="text-slate-400" />
                      {selectedDoctor.department || "Specialist"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:hospital-bold" className="text-slate-400" />
                      {selectedDoctor.hospital}
                    </span>
                    <span className="flex items-center gap-1 w-full mt-1">
                      <Icon icon="solar:phone-calling-bold" className="text-slate-400" />
                      {selectedDoctor.number}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                      <Icon icon="solar:diploma-verified-linear" /> Experience
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Over 10 years in clinical {selectedDoctor.department?.toLowerCase() || 'practice'}, treating a wide range of conditions. Dedicated to patient-centric care and advanced medical treatments.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                      <Icon icon="solar:star-fall-linear" /> Speciality
                    </h4>
                    <ul className="text-xs text-slate-500 space-y-1.5 pl-5 m-0">
                      <li>General {selectedDoctor.department || 'Consultation'}</li>
                      <li>Diagnostic Assessment</li>
                      <li>Personalized Treatment Plans</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">Reviews</h4>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                      <div className="flex text-amber-400 text-sm mb-1">
                        <Icon icon="solar:star-bold" /><Icon icon="solar:star-bold" /><Icon icon="solar:star-bold" /><Icon icon="solar:star-bold" /><Icon icon="solar:star-bold" />
                      </div>
                      <p className="text-[10px] text-slate-600 italic m-0">
                        "Dr. {selectedDoctor.doctorName?.split(' ')[0]} was clear, caring, and professional. My condition improved quickly thanks to their treatment plan. Highly recommended!"
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 flex gap-3">
                    <button 
                      onClick={handleRequestSubmit}
                      disabled={requestSubmitting || !selectedTime}
                      className="flex-1 py-3 bg-[#4338ca] hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {requestSubmitting ? <Icon icon="solar:spinner-bold animate-spin" /> : "Book Now"}
                    </button>
                    <button className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all border-none cursor-pointer">
                      Chat
                    </button>
                  </div>
                  
                  {requestError && <div className="mt-3 text-center text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg">{requestError}</div>}
                  {requestSuccess && <div className="mt-3 text-center text-xs font-bold text-emerald-500 bg-emerald-50 p-2 rounded-lg">Request submitted successfully!</div>}
                  
                </div>
              )}
            </div>
          ) : (
            /* My Consultations Tab */
            <div className="w-full h-full p-4 sm:p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 m-0">Your Consultations</h2>
                  <button 
                    onClick={fetchScheduledMeetings}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer flex items-center justify-center shadow-sm"
                  >
                    <Icon icon="solar:refresh-linear" className={loadingMeetings ? "animate-spin" : ""} />
                  </button>
                </div>
                
                {loadingMeetings ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Icon icon="solar:spinner-bold animate-spin" className="text-4xl text-indigo-500 mb-3" />
                    <span className="text-sm font-semibold">Loading your meetings...</span>
                  </div>
                ) : scheduledMeetings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scheduledMeetings.map((meet) => {
                      const isScheduled = meet.status === "Scheduled";
                      const isCompleted = meet.status === "Completed";
                      const isCancelled = meet.status === "Cancelled";
                      const isRequested = meet.status === "Requested";

                      return (
                        <div 
                          key={meet._id}
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-sm ${
                            isCancelled ? "bg-slate-50 border-slate-200 opacity-70" : 
                            isCompleted ? "bg-emerald-50/30 border-emerald-100" : 
                            isRequested ? "bg-amber-50/30 border-amber-100" : 
                            "bg-white border-slate-200 hover:shadow-md"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                                <Icon icon="solar:stethoscope-bold" className="text-indigo-500" />
                                Dr. {meet.doctorName}
                              </h4>
                              <p className="text-xs text-slate-500 font-medium m-0">
                                {isRequested ? "Requested Consultation" : "Scheduled Video Call"}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isCancelled ? "bg-red-50 text-red-600 border border-red-100" : 
                              isCompleted ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                              isRequested ? "bg-amber-50 text-amber-600 border border-amber-100" : 
                              "bg-indigo-50 text-indigo-600 border border-indigo-100"
                            }`}>
                              {meet.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                            <span className="flex items-center gap-1.5">
                              <Icon icon="solar:calendar-bold" className="text-slate-400 text-sm" />
                              {meet.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Icon icon="solar:clock-circle-bold" className="text-slate-400 text-sm" />
                              {meet.time}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-[11px] text-slate-400 font-medium italic truncate max-w-[50%]">
                              {meet.notes ? `"${meet.notes}"` : "No description"}
                            </span>

                            {isScheduled ? (
                              <button
                                onClick={() => handleJoinMeet(meet.roomName)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 border-none shadow-md shadow-indigo-500/30 transition-all cursor-pointer hover:scale-105"
                              >
                                <Icon icon="solar:videocamera-bold" className="text-sm" />
                                Join Call
                              </button>
                            ) : isRequested ? (
                              <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                <Icon icon="solar:clock-circle-bold" className="text-amber-500" />
                                Pending Approval
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Session ended</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <Icon icon="solar:calendar-add-linear" className="text-6xl mb-4 opacity-30 text-indigo-500" />
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No Consultations Yet</h3>
                    <p className="text-sm font-medium text-center max-w-sm mb-6">
                      You haven't booked any video consultations yet. Head over to the booking tab to schedule an appointment with a specialist.
                    </p>
                    <button 
                      onClick={() => setActiveTab("book")}
                      className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 border-none cursor-pointer hover:bg-indigo-700 transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Global styling for scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default VideoConsult;
