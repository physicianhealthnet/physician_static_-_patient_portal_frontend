import React, { useMemo, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import doctorsData from "../data/doctorsData.json";
import { AxiosInstanceSecondryServer } from "../utilities/AxiosInstance";

export const UserSidebar = ({
  activeTab,
  setActiveTab,
  selectedClinic,
  setSelectedClinic,
}) => {
  const patientData = JSON.parse(sessionStorage.getItem("patientData") || "{}");
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const id = userData?.id;

  const [appointmentClinics, setAppointmentClinics] = useState([]);

  useEffect(() => {
    if (id) {
      AxiosInstanceSecondryServer.get(`/user-appointment/get/${id}`)
        .then((res) => {
          const unique = [
            ...new Set(res.data.data.map((item) => item.clinicName)),
          ];
          setAppointmentClinics(unique);
        })
        .catch((err) => console.error("Failed to fetch sidebar clinics:", err));
    }
  }, [id]);

  const patientClinicId = useMemo(() => {
    const ids = patientData?.clinicId || patientData?.clinicIds || [];
    return Array.isArray(ids) ? ids : [ids];
  }, [patientData]);

  const clinics = useMemo(() => {
    return doctorsData.filter(
      (d) =>
        patientClinicId.includes(d.cid) ||
        appointmentClinics.includes(d.clinic_name)
    );
  }, [patientClinicId, appointmentClinics]);

  useEffect(() => {
    if (activeTab === "attend-clinics" && clinics.length > 0 && !selectedClinic) {
      setSelectedClinic(clinics[0]);
    }
  }, [activeTab, clinics]); // Remove selectedClinic from dependencies to avoid race condition when nullified

  const expandableTabs = ["attend-clinics"];
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "lucide:layout-dashboard" },
    { id: "attend-clinics", label: "Attend Clinics", icon: "lucide:building-2" },
    { id: "appointments", label: "Appointments - Up Coming", icon: "lucide:calendar-days" },
    { id: "chat", label: "Chat", icon: "lucide:message-circle" },
    { id: "prescriptions", label: "Prescriptions - Active prescriptions", icon: "lucide:pill" },
    { id: "scans", label: "Scan Reports", icon: "lucide:scan" },
    { id: "lab-tests", label: "Lab Reports", icon: "lucide:flask-conical" },
    { id: "medical-records", label: "All Records", icon: "lucide:folder-open" },
    { id: "out-of-network-data", label: "Out of Network Data", icon: "lucide:alert-triangle" },
    { id: "bills", label: "Bills & Invoices", icon: "lucide:receipt" },
    { id: "video-consult", label: "Video Consult", icon: "lucide:video" },
    { id: "post-care", label: "Post Care & After Discharge", icon: "lucide:heart-handshake" },
  ];

  return (
    <div className="w-[280px] bg-white border-r border-[#e0e0e0] shrink-0 h-[calc(100vh-65px)] sticky top-[65px] overflow-y-auto custom-scrollbar">
      <div className="p-6">
        <h2 className="text-[#333] font-bold text-[18px]">Your Drive</h2>
      </div>

      <ul className="flex flex-col mt-2">
        {tabs.map((tab) => {
          const isExpanded =
            expandableTabs.includes(tab.id) && activeTab === tab.id;
          return (
            <React.Fragment key={tab.id}>
              <li
                onClick={() => {
                  if (tab.id === "attend-clinics") {
                     // Toggle expandable behavior
                     if (activeTab === "attend-clinics") {
                       setActiveTab("dashboard");
                     } else {
                       setActiveTab("attend-clinics");
                     }
                  } else {
                     setActiveTab(tab.id);
                  }
                }}
                className={`
                                relative px-6 py-[18px] cursor-pointer flex justify-between items-center transition-all duration-200 border-b border-[#f0f0f0]
                                ${activeTab === tab.id ? "bg-[#f0f0f5]" : "hover:bg-gray-50 bg-white"}
                            `}
              >
                {/* Active Tab Blue Indicator */}
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#14bef0]" />
                )}

                <div className="flex items-center gap-3">
                  {tab.icon && (
                    <Icon 
                      icon={tab.icon} 
                      className={`text-[20px] transition-colors ${activeTab === tab.id ? "text-[#14bef0]" : "text-[#999]"}`} 
                    />
                  )}
                  <span
                    className={`text-[15px] ${activeTab === tab.id ? "text-[#333] font-medium" : "text-[#666]"}`}
                  >
                    {tab.label}
                  </span>
                </div>

                {tab.badge ? (
                  <span className="bg-[#14bef0] text-white text-[12px] font-bold px-[8px] py-[2px] rounded-sm">
                    {tab.badge}
                  </span>
                ) : expandableTabs.includes(tab.id) ? (
                  <Icon
                    icon={
                      isExpanded
                        ? "solar:alt-arrow-up-linear"
                        : "solar:alt-arrow-down-linear"
                    }
                    className={`text-[#999] transition-transform ${activeTab === tab.id ? "text-[#14bef0]" : ""}`}
                  />
                ) : null}
              </li>

              {/* Sub Menu for Clinics */}
              {isExpanded && clinics.length > 0 && (
                <div className="bg-[#f8f9fa] border-b border-[#f0f0f0] animate-in slide-in-from-top-2 fade-in duration-200">
                  <ul className="flex flex-col py-2">
                    <li className="px-10 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Your Clinics
                    </li>
                    {clinics.map((clinic) => {
                      const isSelected = selectedClinic?.cid === clinic.cid;
                      return (
                        <li
                          key={clinic.cid}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClinic(isSelected ? null : clinic);
                          }}
                          className={`px-10 py-2.5 cursor-pointer text-[13px] transition-colors flex items-center gap-2 font-medium
                               ${isSelected ? "text-[#14bef0] bg-white border-r-2 border-[#14bef0]" : "text-gray-600 hover:text-[#14bef0] hover:bg-white"}
                             `}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-[#14bef0]" : "bg-[#14bef0]/50"}`}
                          />
                          <span className="line-clamp-1">
                            {clinic.clinic_name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};
