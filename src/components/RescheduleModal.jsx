import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { AxiosInstanceSecondryServer } from "../utilities/AxiosInstance";

const getFilteredDates = (filter) => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate = new Date(today);
  let endDate = new Date(today);

  if (filter === "this_week") {
    const dayOfWeek = startDate.getDay();
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    endDate.setDate(startDate.getDate() + daysToSunday);
  } else if (filter === "next_week") {
    const dayOfWeek = startDate.getDay();
    const daysToNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    startDate.setDate(startDate.getDate() + daysToNextMonday);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  } else if (filter === "this_month") {
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  } else if (filter === "next_month") {
    startDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  } else if (filter === "all") {
    endDate.setDate(startDate.getDate() + 30); // Capped at 30 days for modal
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
      label = "Today";
    } else {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      if (currentDate.getTime() === tomorrow.getTime()) {
        label = "Tomorrow";
      } else {
        label = `${dayNames[currentDate.getDay()]}, ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`;
      }
    }

    dates.push({
      label,
      fullDate,
      slots: `${20 + (currentDate.getDate() % 5)} Slots Available`,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const RescheduleModal = ({ appointment, onClose, onSuccess }) => {
  const [selectedFilter, setSelectedFilter] = useState("this_week");
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedFullDate, setSelectedFullDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const dateScrollRef = useRef(null);

  useEffect(() => {
    const newTabs = getFilteredDates(selectedFilter);
    setTabs(newTabs);
    if (newTabs.length > 0) {
      setActiveTab(newTabs[0].label);
      // Don't auto-select date to allow user to pick
    }
  }, [selectedFilter]);

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
  };

  const scrollLeft = () => {
    if (dateScrollRef.current) {
      dateScrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (dateScrollRef.current) {
      dateScrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleTimeSlotClick = (time) => {
    const selectedTabData = tabs.find((t) => t.label === activeTab);
    setSelectedTime(time);
    setSelectedFullDate(selectedTabData?.fullDate || activeTab);
  };

  const handleConfirm = async () => {
    if (!selectedFullDate || !selectedTime) return;

    setLoading(true);
    try {
      const id = appointment._id || appointment.id;
      const res = await AxiosInstanceSecondryServer.patch(
        `/user-appointment/${id}/reschedule`,
        {
          appointmentDate: selectedFullDate,
          selectedSlot: selectedTime,
          rescheduledBy: "Patient",
        },
      );

      if (res.status === 200) {
        onSuccess(res.data.data);
        onClose();
      }
    } catch (error) {
      console.error("Reschedule failed", error);
      alert("Failed to reschedule. Please try again.");
    } finally {
      setLoading(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 shadow-2xl backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-[fadeSlideIn_0.3s_ease-out]">
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Reschedule Appointment
            </h2>
            <p className="text-sm text-gray-500">
              Pick a new date and time for your visit
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon icon="mdi:close" width="24" className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Current Selection Summary */}
          <div className="mx-5 my-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                <Icon icon="mdi:calendar-clock" width="22" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                  Current Schedule
                </p>
                <p className="text-sm font-bold text-gray-700">
                  {appointment.appointmentDate}{" "}
                  <span className="text-gray-300 mx-1">|</span>{" "}
                  {appointment.selectedSlot}
                </p>
              </div>
            </div>
            <div className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
              To be Rescheduled
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 p-4 border-b border-gray-100 overflow-x-auto whitespace-nowrap bg-gray-50/50 no-scrollbar">
            {["this_week", "next_week", "this_month", "next_month", "all"].map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedFilter === filter ? "bg-[#14bef0] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:border-[#14bef0] hover:text-[#14bef0]"}`}
                >
                  {filter
                    .split("_")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </button>
              ),
            )}
          </div>

          {/* Date Selector */}
          <div className="flex items-center border-b border-gray-100 relative bg-white">
            <button
              onClick={scrollLeft}
              className="p-3 text-gray-400 hover:text-[#14bef0] bg-white z-10 border-r border-gray-50 shrink-0 h-full flex items-center justify-center"
            >
              <Icon icon="mdi:chevron-left" className="w-5 h-5" />
            </button>

            <div
              ref={dateScrollRef}
              className="flex gap-2 overflow-x-auto whitespace-nowrap w-full no-scrollbar scroll-smooth flex-1 h-full"
            >
              {tabs.length > 0 ? (
                tabs.map((tab) => (
                  <div
                    key={tab.label}
                    onClick={() => setActiveTab(tab.label)}
                    className={`px-4 py-1 rounded-full text-sm font-bold transition-all ${activeTab === tab.label ? "bg-[#14bef0] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:border-[#14bef0] hover:text-[#14bef0]"} group`}
                  >
                    <span
                      className={`text-[12px] font-bold ${activeTab === tab.label ? "text-white" : "text-gray-700 group-hover:text-[#14bef0]"}`}
                    >
                      {tab.label}
                    </span>
                    {/* <span className="text-[11px] font-bold text-green-600 mt-1">
                          {tab.slots}
                        </span> */}
                  </div>
                ))
              ) : (
                <div className="py-6 w-full text-center text-gray-400 text-sm">
                  No slots available
                </div>
              )}
            </div>

            <button
              onClick={scrollRight}
              className="p-3 text-gray-400 hover:text-[#14bef0] bg-white z-10 border-l border-gray-50 shrink-0 h-full flex items-center justify-center"
            >
              <Icon icon="mdi:chevron-right" className="w-5 h-5" />
            </button>
          </div>

          {/* Time Slots */}
          <div className="p-6 space-y-8">
            {/* Morning */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="sm:w-32 flex items-center gap-2 text-sm font-bold text-gray-800 pt-1.5 shrink-0">
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
                    className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${selectedTime === time && selectedFullDate === tabs.find((t) => t.label === activeTab)?.fullDate ? "bg-[#14bef0] text-white border-[#14bef0]" : "bg-white text-[#14bef0] border-[#14bef0] hover:bg-[#14bef0]/10"}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Afternoon */}
            <div className="flex flex-col sm:flex-row items-start gap-4 border-t border-gray-50 pt-6">
              <div className="sm:w-32 flex items-center gap-2 text-sm font-bold text-gray-800 pt-1.5 shrink-0">
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
                    className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${selectedTime === time && selectedFullDate === tabs.find((t) => t.label === activeTab)?.fullDate ? "bg-[#14bef0] text-white border-[#14bef0]" : "bg-white text-[#14bef0] border-[#14bef0] hover:bg-[#14bef0]/10"}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Evening */}
            <div className="flex flex-col sm:flex-row items-start gap-4 border-t border-gray-50 pt-6">
              <div className="sm:w-32 flex items-center gap-2 text-sm font-bold text-gray-800 pt-1.5 shrink-0">
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
                    className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${selectedTime === time && selectedFullDate === tabs.find((t) => t.label === activeTab)?.fullDate ? "bg-[#14bef0] text-white border-[#14bef0]" : "bg-white text-[#14bef0] border-[#14bef0] hover:bg-[#14bef0]/10"}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 flex items-center justify-between sticky bottom-0 z-10">
          <div className="flex flex-col">
            {selectedFullDate && selectedTime ? (
              <>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  New Schedule
                </span>
                <span className="text-sm font-bold text-gray-800">
                  {activeTab} at {selectedTime}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-400 italic">
                Select date and time
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !selectedFullDate || !selectedTime}
              className="px-8 py-2.5 bg-[#14bef0] hover:bg-[#0ba8d6] text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {loading ? (
                <Icon icon="mdi:loading" className="animate-spin text-lg" />
              ) : (
                <Icon icon="mdi:check" className="text-lg" />
              )}
              Reschedule
            </button>
          </div>
        </div>
      </div>

      <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
    </div>
  );
};

export default RescheduleModal;
