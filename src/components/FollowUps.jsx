import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import { AxiosInstanceSecondryServer } from "../utilities/AxiosInstance";

export const FollowUps = ({ selectedClinic }) => {
  const [loading, setLoading] = useState(true);
  const [followUpItems, setFollowUpItems] = useState([]);

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const id = userData?.id;
  const patientId = userData?.patientId || userData?.id;

  useEffect(() => {
    if (!id || !selectedClinic) return;

    const fetchFollowUps = async () => {
      setLoading(true);
      try {
        // 1. Fetch appointments
        const aptRes = await AxiosInstanceSecondryServer.get(`/user-appointment/get/${id}`);
        let appointments = aptRes.data?.data || aptRes.data || [];
        
        // Filter upcoming appointments for selected clinic
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const upcomingApts = appointments
          .filter(app => {
             // check if not past
             if (new Date(app.appointmentDate) < now) return false;
             if (!app.status) return true;
             const s = app.status.toLowerCase().trim();
             const isCheckedOut = s.includes("check") && s.includes("out");
             if (s === "completed" || isCheckedOut || s === "cancelled" || s === "reject") return false;
             
             // match clinic name
             if (selectedClinic && app.clinicName !== selectedClinic.clinic_name) return false;
             
             return true;
          })
          .map(app => ({
             _id: app._id || Math.random().toString(),
             type: 'appointment',
             title: 'Next Doctors visit',
             date: new Date(app.appointmentDate),
             description: `Dr. ${app.docName || 'Doctor'} - ${app.selectedSlot}`,
             icon: 'solar:calendar-bold-duotone',
             color: 'text-blue-500',
             bg: 'bg-blue-50',
             status: app.status || 'Pending'
          }));

        // 2. Fetch prescriptions for medicine refills
        let refillItems = [];
        if (selectedClinic.subdomain_name || selectedClinic.clinic_name) {
          const subdomain = selectedClinic.subdomain_name || selectedClinic.clinic_name.toLowerCase().replace(/\s+/g, "-");
          const baseUrl = `https://${subdomain}.physicianhealthnet.com/api`;
          const rxRes = await fetch(`${baseUrl}/prescription/get-by-phn/${patientId}`).then(r => r.json()).catch(() => ({ data: [] }));
          const prescriptions = rxRes.data || [];
          
          prescriptions.forEach(rx => {
            if (rx.medicinesData && Array.isArray(rx.medicinesData)) {
              rx.medicinesData.forEach(med => {
                 // Check if days is provided
                 const days = Number(med.days) || 0;
                 if (days > 0) {
                   const rxDate = new Date(rx.createdAt);
                   const refillDate = new Date(rxDate);
                   refillDate.setDate(refillDate.getDate() + days);
                   
                   // Check if refill is upcoming within next 14 days or past due recently (e.g. 7 days)
                   const daysToRefill = (refillDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                   
                   if (daysToRefill >= -7 && daysToRefill <= 14) {
                     refillItems.push({
                       _id: rx._id + '-' + med.medication,
                       type: 'refill',
                       title: 'Prescription Refill',
                       date: refillDate,
                       description: `${med.medication} (${days} days supply)`,
                       icon: 'solar:pill-bold-duotone',
                       color: 'text-emerald-500',
                       bg: 'bg-emerald-50',
                       status: daysToRefill < 0 ? 'Overdue' : 'Upcoming'
                     });
                   }
                 }
              });
            }
          });
        }

        const mockBloodTest = {
           _id: 'mock-blood-1',
           type: 'blood-test',
           title: 'Routine Blood Test',
           date: new Date(now.getTime() + 86400000 * 2), // in 2 days
           description: `Pending lab test`,
           icon: 'solar:test-tube-bold-duotone',
           color: 'text-purple-500',
           bg: 'bg-purple-50',
           status: 'Upcoming'
        };
        const mockScan = {
           _id: 'mock-scan-1',
           type: 'scan',
           title: 'Scan Appointments',
           date: new Date(now.getTime() + 86400000 * 5), // in 5 days
           description: `Upcoming Imaging`,
           icon: 'solar:scanner-bold-duotone',
           color: 'text-orange-500',
           bg: 'bg-orange-50',
           status: 'Upcoming'
        };

        const consolidated = [...upcomingApts, ...refillItems, mockBloodTest, mockScan].sort((a, b) => a.date - b.date);
        setFollowUpItems(consolidated);

      } catch (err) {
        console.error("Failed to fetch follow-ups", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, [id, patientId, selectedClinic]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-white rounded-xl border border-slate-200">
        <Icon icon="solar:spinner-linear" width={40} className="animate-spin text-[#14bef0] mb-4" />
        <p className="font-medium">Loading upcoming visits...</p>
      </div>
    );
  }

  if (followUpItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-white rounded-xl border border-slate-200">
         <Icon icon="solar:chat-round-bold-duotone" width={64} className="text-slate-200 mb-4" />
         <h3 className="text-xl font-bold text-slate-600">No Upcoming Follow-ups</h3>
         <p className="mt-2 text-center max-w-md">You do not have any scheduled upcoming appointments or medicine refills for this clinic.</p>
         <button className="mt-6 bg-[#14bef0] hover:bg-[#0ba7d6] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-cyan-200 transition-all">
            Schedule Appointment
         </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-slate-200">
       <div className="flex items-center gap-2 mb-2">
         <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
         <h2 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">
           Upcoming Action Items
         </h2>
       </div>
       
       <div className="flex flex-col gap-3">
         {followUpItems.map((item, idx) => {
           const isOverdue = item.status === 'Overdue';
           
           return (
             <div key={item._id || idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group bg-slate-50/50">
               <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white shadow-sm ${item.bg} ${item.color}`}>
                   <Icon icon={item.icon} width={24} />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-black text-slate-800 tracking-tight group-hover:text-[#14bef0] transition-colors">{item.title}</span>
                   <span className="text-xs font-medium text-slate-500 mt-0.5">{item.description}</span>
                 </div>
               </div>
               
               <div className="flex items-center gap-6">
                 <div className="flex flex-col items-end">
                   <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md mb-1 ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                     {item.status === 'approve' ? 'Approved' : item.status}
                   </span>
                   <span className="text-xs font-bold text-slate-700">
                     {dayjs(item.date).format("DD MMM, YYYY")}
                   </span>
                 </div>
                 
                 <button className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:bg-[#14bef0] hover:text-white hover:border-[#14bef0] transition-all shadow-sm">
                   <Icon icon="solar:alt-arrow-right-linear" width={18} />
                 </button>
               </div>
             </div>
           );
         })}
       </div>
    </div>
  );
};
