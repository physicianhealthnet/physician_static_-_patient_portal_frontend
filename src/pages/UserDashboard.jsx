import React from "react";
import { UserSidebar } from "../components/UserSidebar";
import { Icon } from "@iconify/react";
import { useParams, useNavigate } from "react-router-dom";
import { MedicalRecords } from "../components/MedicalRecords";
import UserAppointmentDetails from "./UserAppointmentDetails";
import Chat from "./Chat";
import PatientDashboardOverview from "./PatientDashboardOverview";
import VideoConsult from "./VideoConsult";
import { ClinicAccordionView } from "./ClinicAccordionView";

export const UserDashboard = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "dashboard";

  const userStr = sessionStorage.getItem("userData");
  const user = userStr ? JSON.parse(userStr) : null;

  console.log(user);

  const [selectedClinic, setSelectedClinic] = React.useState(null);

  const setActiveTab = (newTab) => {
    setSelectedClinic(null); // Reset clinic filter when changing tabs
    navigate(`/dashboard/${newTab}`);
  };

  return (
    <div className="flex flex-row w-full mx-auto h-[calc(100vh-65px)] overflow-hidden font-sans">
      <UserSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedClinic={selectedClinic}
        setSelectedClinic={setSelectedClinic}
      />

      {/* Container for Main Area - Switch padding based on tab type */}
      <div
        className={`flex-1 bg-[#f8f9fa] ${activeTab === "medical-records" || activeTab === "scans" || activeTab === "lab-tests" || activeTab === "prescriptions" || activeTab === "bills" || activeTab === "chat" || selectedClinic ? "p-0" : "p-8"} overflow-y-auto`}
      >
        {selectedClinic ? (
          <div className="pt-8 min-h-full">
            <ClinicAccordionView selectedClinic={selectedClinic} />
          </div>
        ) : (
          <>
            {/* Only show User Info Header (Avatar, Name, Phone Number) for non-medical-records tabs right now */}
            {activeTab !== "medical-records" &&
              activeTab !== "scans" &&
              activeTab !== "lab-tests" &&
              activeTab !== "prescriptions" &&
              activeTab !== "bills" &&
              activeTab !== "video-consult" &&
              activeTab !== "chat" &&
              activeTab !== "dashboard" && (
                <div className="flex flex-row items-center gap-[15px] mb-12">
                  <div className="w-[50px] h-[50px] bg-[#e6e6e6] rounded-sm flex items-center justify-center text-gray-400">
                    <Icon icon="material-symbols:person" width="40" height="40" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[#333] font-bold text-[16px] leading-tight">
                      {user?.name || "User"}
                    </h3>
                    <span className="text-[#999] text-[13px]">
                      {user?.phno || "+91XXXXXXXXXX"}
                    </span>
                  </div>
                </div>
              )}

            {/* Tab content switching */}
            {activeTab === "medical-records" && (
              <MedicalRecords filter="all" selectedClinic={selectedClinic} />
            )}
            {activeTab === "prescriptions" && (
              <MedicalRecords
                filter="prescription"
                selectedClinic={selectedClinic}
              />
            )}
            {activeTab === "scans" && (
              <MedicalRecords filter="scan" selectedClinic={selectedClinic} />
            )}
            {activeTab === "lab-tests" && (
              <MedicalRecords filter="lab" selectedClinic={selectedClinic} />
            )}
            {activeTab === "bills" && (
              <MedicalRecords filter="bill" selectedClinic={selectedClinic} />
            )}
            {activeTab === "out-of-network-data" && (
              <MedicalRecords filter="out-of-network-data" selectedClinic={selectedClinic} />
            )}

            {activeTab === "dashboard" && <PatientDashboardOverview />}

            {activeTab === "appointments" && <UserAppointmentDetails />}

            {activeTab === "chat" && <Chat />}

            {activeTab === "video-consult" && <VideoConsult />}

            {activeTab === "attend-clinics" && !selectedClinic && (
              <div className="flex flex-col items-center justify-center mt-[100px] text-slate-400">
                <Icon icon="solar:hospital-bold-duotone" width={64} className="text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-600">Select a Clinic</h3>
                <p className="mt-2 text-sm text-center">Please select a clinic from the sidebar dropdown to view its details.</p>
              </div>
            )}

            {activeTab !== "dashboard" &&
              activeTab !== "appointments" &&
              activeTab !== "medical-records" &&
              activeTab !== "out-of-network-data" &&
              activeTab !== "prescriptions" &&
              activeTab !== "scans" &&
              activeTab !== "lab-tests" &&
              activeTab !== "bills" &&
              activeTab !== "chat" &&
              activeTab !== "video-consult" &&
              activeTab !== "attend-clinics" && (
                <div className="flex flex-col items-center justify-center mt-[100px]">
                  <p className="text-[#666] text-[15px]">
                    You have no new updates in{" "}
                    {activeTab
                      .replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                    .
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
