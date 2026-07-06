import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
// import BackButton from "../../components/buttons/BackButton";
import { AxiosInstanceSecondryServer, AxiosInstanceDependency } from "../utilities/AxiosInstance";
import { useParams } from "react-router-dom";
import RescheduleModal from "../components/RescheduleModal";
import { sendWhatsAppNotification } from "../utilities/whatsappNotify";

const UserAppointmentDetails = ({ selectedClinic, isNested = false }) => {
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const id = userData?.id;
  console.log(id, "id");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [isUpcomingOpen, setIsUpcomingOpen] = useState(false);
  const [isPastOpen, setIsPastOpen] = useState(false);

  const handleReschedule = (apt) => {
    setSelectedApt(apt);
    setShowReschedule(true);
  };

  const handleCancel = async (apt) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;
    try {
      await AxiosInstanceSecondryServer.patch(
        `/user-appointment/${apt._id}/cancel`,
      );
      alert("Appointment cancelled successfully");

      // WhatsApp Notification to Doctor
      sendWhatsAppNotification("patient_cancelled", apt.clinicNumber, [
        apt.docName || "Doctor",
        userData?.name || "Patient",
        apt.appointmentDate,
        apt.selectedSlot,
        apt.clinicLocation,
      ]);

      // Update local state to reflect change immediately
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === apt._id ? { ...a, status: "cancelled" } : a,
        ),
      );
    } catch (error) {
      console.error("Cancellation failed", error);
      alert("Failed to cancel appointment");
    }
  };

  const handleApprove = async (apt) => {
    try {
      await AxiosInstanceSecondryServer.patch(
        `/user-appointment/${apt._id}/approve`,
      );
      alert("Appointment approved successfully");

      // WhatsApp Notification to Doctor
      sendWhatsAppNotification("patient_approved", apt.clinicNumber, [
        apt.docName || "Doctor",
        userData?.name || "Patient",
        apt.appointmentDate,
        apt.selectedSlot,
        apt.clinicLocation,
      ]);

      setAppointments((prev) =>
        prev.map((a) => (a._id === apt._id ? { ...a, status: "approve" } : a)),
      );
    } catch (error) {
      console.error("Approval failed", error);
      alert("Failed to approve appointment");
    }
  };

  const handleReject = async (apt) => {
    if (
      !window.confirm(
        "Are you sure you want to reject this rescheduled appointment?",
      )
    )
      return;
    try {
      await AxiosInstanceSecondryServer.patch(
        `/user-appointment/${apt._id}/reject`,
      );
      alert("Appointment rejected successfully");
      setAppointments((prev) =>
        prev.map((a) => (a._id === apt._id ? { ...a, status: "reject" } : a)),
      );
    } catch (error) {
      console.error("Rejection failed", error);
      alert("Failed to reject appointment");
    }
  };

  const handleRescheduleSuccess = (updatedApt) => {
    setAppointments((prev) =>
      prev.map((a) => (a._id === updatedApt._id ? updatedApt : a)),
    );

    // WhatsApp Notification to Doctor (Reschedule Request)
    sendWhatsAppNotification("patient_reschedule", updatedApt.clinicNumber, [
      updatedApt.docName || "Doctor",
      userData?.name || "Patient",
      updatedApt.appointmentDate,
      updatedApt.selectedSlot,
    ]);

    setShowReschedule(false);
    setSelectedApt(null);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const [aptRes, videoRes] = await Promise.allSettled([
          AxiosInstanceSecondryServer.get(`/user-appointment/get/${id}`),
          (async () => {
            const userPhone = userData?.phno || userData?.phone || "";
            if (!userPhone) return { data: { success: false, data: [] } };
            const cleanPhone = userPhone.replace("+91", "").trim();
            return AxiosInstanceDependency.get(`video-meetings?patientPhone=${cleanPhone}`);
          })()
        ]);

        let combinedAppointments = [];

        if (aptRes.status === "fulfilled" && aptRes.value.data) {
          const data = aptRes.value.data;
          if (data.data) {
            combinedAppointments = [...data.data];
          } else if (Array.isArray(data)) {
            combinedAppointments = [...data];
          }
        }

        if (videoRes.status === "fulfilled" && videoRes.value.data && videoRes.value.data.success) {
          const videoMeetings = videoRes.value.data.data.map(vm => ({
            _id: vm._id,
            id: vm._id,
            appointmentDate: vm.date,
            selectedSlot: vm.time,
            docName: vm.doctorName,
            clinicName: "Online Consultation",
            clinicLocation: "Video Call",
            clinicNumber: "-",
            status: vm.status,
            isOnline: true,
            isCancelled: vm.status === "Cancelled",
            roomName: vm.roomName
          }));
          combinedAppointments = [...combinedAppointments, ...videoMeetings];
        }

        setAppointments(combinedAppointments);
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAppointments();
  }, [id]);

  const isPastOrFinished = (app) => {
    if (new Date(app.appointmentDate) < new Date().setHours(0, 0, 0, 0))
      return true;
    if (!app.status) return false;
    const s = app.status.toLowerCase().trim();
    const isCheckedOut = s.includes("check") && s.includes("out");
    return (
      s === "completed" || isCheckedOut || s === "cancelled" || s === "reject"
    );
  };

  const filteredAppointments = selectedClinic
    ? appointments.filter(
        (app) =>
          app.clinicName?.trim().toLowerCase() ===
            selectedClinic.clinic_name?.trim().toLowerCase() ||
          app.clinicId === selectedClinic.cid,
      )
    : appointments;

  const upcomingAppointments = filteredAppointments
    .filter((app) => !isPastOrFinished(app))
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  const pastAppointments = filteredAppointments
    .filter((app) => isPastOrFinished(app))
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  return (
    <div className={`w-full h-full overflow-y-auto ${isNested ? "bg-transparent p-0" : "bg-gray-50/50 p-4 md:p-8"}`}>
      <div className="w-full">
        {!isNested && (
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  My Appointments
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                  Track your physician visits and history
                </p>
              </div>
            </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Icon icon="svg-spinners:3-dots-fade" width="40" height="40" />
            <p className="mt-4 text-sm font-medium">Loading records...</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* UPCOMING */}
            <section>
              <div
                className={`flex items-center justify-between p-4 border border-gray-200 rounded-xl rounded-b-none bg-white cursor-pointer hover:bg-gray-50 transition-colors shadow-sm`}
                onClick={() => setIsUpcomingOpen(!isUpcomingOpen)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  </div>
                  <h2 className="text-sm font-black uppercase text-gray-700 tracking-wider">
                    Upcoming Appointments
                  </h2>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform duration-300 ${isUpcomingOpen ? "rotate-180" : ""}`}
                >
                  <Icon icon="solar:alt-arrow-down-linear" width="20" />
                </div>
              </div>

              {isUpcomingOpen && (
                <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                  {upcomingAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                              Date & Time
                            </th>
                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                              Clinic / Doctor
                            </th>
                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                              Location
                            </th>
                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                              Status
                            </th>
                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {upcomingAppointments.map((apt) => (
                            <AppointmentRow
                              key={apt._id || apt.id}
                              apt={apt}
                              type="upcoming"
                              onReschedule={() => handleReschedule(apt)}
                              onCancel={() => handleCancel(apt)}
                              onApprove={() => handleApprove(apt)}
                              onReject={() => handleReject(apt)}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Icon
                          icon="solar:calendar-minimalistic-linear"
                          width="32"
                        />
                      </div>
                      <p className="text-gray-500 font-bold">
                        No upcoming appointments scheduled.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* PAST */}
            <section>
              <div
                className={`flex items-center justify-between p-4 border border-gray-200  ${isPastOpen ? "rounded-none" : "rounded-xl rounded-t-none"}  bg-white cursor-pointer hover:bg-gray-50 transition-colors shadow-sm`}
                onClick={() => setIsPastOpen(!isPastOpen)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                  </div>
                  <h2 className="text-sm font-black uppercase text-gray-700 tracking-wider">
                    Past History
                  </h2>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform duration-300 ${isPastOpen ? "rotate-180" : ""}`}
                >
                  <Icon icon="solar:alt-arrow-down-linear" width="20" />
                </div>
              </div>

              {isPastOpen && (
                <div className={`bg-white border ${isPastOpen? "rounded-b-xl": ""} border-gray-100 shadow-sm overflow-hidden`}>
                  {pastAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                              Date & Time
                            </th>
                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                              Clinic / Doctor
                            </th>
                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                              Location
                            </th>
                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {pastAppointments.map((apt) => (
                            <AppointmentRow
                              key={apt._id || apt.id}
                              apt={apt}
                              type="past"
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-gray-400 font-bold">
                      No past appointments found.
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {showReschedule && selectedApt && (
        <RescheduleModal
          appointment={selectedApt}
          onClose={() => setShowReschedule(false)}
          onSuccess={handleRescheduleSuccess}
        />
      )}
    </div>
  );
};

const AppointmentRow = ({
  apt,
  type,
  onReschedule,
  onCancel,
  onApprove,
  onReject,
}) => {
  const isUpcoming = type === "upcoming";

  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 border 
            ${isUpcoming ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-gray-50 border-gray-100 text-gray-400"}`}
          >
            <span className="text-[10px] font-black uppercase leading-none mb-0.5">
              {new Date(apt.appointmentDate).toLocaleDateString("en-US", {
                month: "short",
              })}
            </span>
            <span className="text-base font-bold leading-none">
              {new Date(apt.appointmentDate).getDate()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-700">
              {apt.selectedSlot}
            </span>
            <span className="text-[11px] font-medium text-gray-400">
              {new Date(apt.appointmentDate).getFullYear()}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex flex-col">
          <span className="text-sm font-black text-gray-900 flex items-center gap-2">
            {apt.docName || "Specialist"}
            {apt.isOnline && (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center gap-1">
                <Icon icon="solar:videocamera-bold" /> Online
              </span>
            )}
          </span>
          <span className="text-xs font-bold text-blue-500">
            {apt.clinicName}
          </span>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-600 truncate max-w-[150px]">
            {apt.clinicLocation}
          </span>
          <span className="text-xs font-medium text-gray-400">
            {apt.clinicNumber}
          </span>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex justify-center">
          <span
            className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider
            ${
              apt.status === "cancelled" || apt.status === "reject"
                ? "bg-red-50 text-red-500"
                : !isUpcoming
                  ? apt.status === "pending"
                    ? "bg-red-50 text-red-400"
                    : "bg-gray-100 text-gray-500"
                  : apt.status === "pending"
                    ? "bg-amber-50 text-amber-600"
                    : apt.status === "doctor_rescheduled"
                      ? "bg-purple-50 text-purple-600"
                      : apt.status === "approve"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
            }
          `}
          >
            {apt.status === "cancelled" || apt.status === "reject"
              ? "Cancelled"
              : !isUpcoming
                ? apt.status === "pending"
                  ? "Expired"
                  : "Finished"
                : apt.status === "doctor_rescheduled"
                  ? "Rescheduled"
                  : apt.status === "approve"
                    ? "Approved"
                    : apt.status || "Pending"}
          </span>
        </div>
      </td>
      {isUpcoming && (
        <td className="px-6 py-5">
          <div className="flex items-center justify-end gap-2">
            {apt.status === "approve" && (apt.isOnline || apt.clinicLocation === "Video Call") && (
              <button
                onClick={() => navigate('/dashboard/video-consult', { state: { roomName: `PHN-Consultation-${apt._id}` } })}
                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-100"
                title="Join Video Call"
              >
                <Icon icon="solar:videocamera-bold" width={18} />
              </button>
            )}
            {apt.status !== "cancelled" && apt.status !== "reject" && (
              <>
                {apt.status === "doctor_rescheduled" && (
                  <div className="flex gap-1">
                    <button
                      onClick={onApprove}
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                      title="Approve Reschedule"
                    >
                      <Icon icon="solar:check-read-linear" width={18} />
                    </button>
                    <button
                      onClick={onReject}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                      title="Reject"
                    >
                      <Icon icon="solar:close-circle-linear" width={18} />
                    </button>
                  </div>
                )}
                <button
                  onClick={onReschedule}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="Reschedule"
                >
                  <Icon icon="solar:calendar-edit-linear" width={18} />
                </button>
                <button
                  onClick={onCancel}
                  className="p-2 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Cancel"
                >
                  <Icon icon="solar:trash-bin-trash-linear" width={18} />
                </button>
              </>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

export default UserAppointmentDetails;
