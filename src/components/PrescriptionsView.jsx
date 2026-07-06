import React, { useState } from "react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import doctorsData from "../data/doctorsData.json";

const getRecordContact = (record) => {
  const cName = record._clinicName || record.clinicName;
  if (cName) {
    const doc = doctorsData.find((d) => d.clinic_name === cName);
    if (doc && doc.phone) return doc.phone;
  }
  if (record.phone) return record.phone;
  return "N/A";
};

export const PrescriptionsView = ({ 
  records, 
  selectedClinic, 
  setSelectedRecord, 
  setSelectedReportNotes 
}) => {
  const now = new Date();
  const [activeOpen, setActiveOpen] = useState(false);
  const [refillOpen, setRefillOpen] = useState(false);
  const [oldOpen, setOldOpen] = useState(false);

  const [internalOpen, setInternalOpen] = useState(false);
  const [externalOpen, setExternalOpen] = useState(false);

  // Group records
  const internalRecords = records.filter(r => !r.isExternal);
  const externalRecords = records.filter(r => r.isExternal);

  const partitionRecords = (data) => {
    const activePrescriptions = [];
    const oldPrescriptions = [];
    const refillPrescriptions = [];

    data.forEach(r => {
      const rxDate = new Date(r.createdAt);
      const daysOld = (now - rxDate) / (1000 * 60 * 60 * 24);
      
      let needsRefill = false;
      if (r.medicinesData && Array.isArray(r.medicinesData)) {
          r.medicinesData.forEach(med => {
              const days = Number(med.days) || 0;
              if (days > 0) {
                  const refillDate = new Date(rxDate);
                  refillDate.setDate(refillDate.getDate() + days);
                  const daysToRefill = (refillDate - now) / (1000 * 60 * 60 * 24);
                  if (daysToRefill >= -7 && daysToRefill <= 14) {
                      needsRefill = true;
                  }
              }
          });
      }
      
      if (needsRefill) {
          refillPrescriptions.push(r);
      } else if (daysOld > 30) {
          oldPrescriptions.push(r);
      } else {
          activePrescriptions.push(r);
      }
    });
    return { activePrescriptions, refillPrescriptions, oldPrescriptions };
  };

const renderTable = (title, data, isRefillTable = false, isOpen, toggleOpen, { isFirst = false, isLast = false } = {}) => {

    return (
      <div className={`bg-white overflow-hidden ${!isFirst ? 'border-t border-slate-100' : ''}`}>
        <button
          onClick={toggleOpen}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded flex items-center justify-center ${isRefillTable ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'}`}>
              <Icon icon={isRefillTable ? "solar:history-bold-duotone" : "solar:document-medicine-bold-duotone"} width={20} />
            </div>
            <div className="flex flex-col items-start">
              <h2 className="text-sm font-black uppercase text-gray-700 tracking-wider">
                {title}
              </h2>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
            <Icon icon="solar:alt-arrow-down-linear" width={20} />
          </div>
        </button>
        {isOpen && (
          <div className={`border-t border-slate-100 bg-white ${isLast ? 'rounded-b-xl' : ''}`}>
            <div className="overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Record name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Clinic / Doctor</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Created Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">View Presc</th>
                  {!isRefillTable && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">AI report</th>}
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Refill Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((record, idx) => {
                  const date = dayjs(record.createdAt);
                  const count = record.medicinesData?.length || 0;
                  const firstMed = record.medicinesData?.[0]?.medication;
                  const subtitle = `${count} Medicine${count !== 1 ? "s" : ""}${firstMed ? ` • ${firstMed}` : ""}`;
                  
                  let refillDateStr = "NO";
                  if (record.medicinesData && Array.isArray(record.medicinesData)) {
                      let maxDays = 0;
                      record.medicinesData.forEach(med => {
                          const d = Number(med.days) || 0;
                          if (d > maxDays) maxDays = d;
                      });
                      if (maxDays > 0) {
                          refillDateStr = dayjs(record.createdAt).add(maxDays, 'day').format("DD MMM, YYYY");
                      }
                  }

                  return (
                    <tr
                      key={record._id || idx}
                      onClick={() => setSelectedRecord(record)}
                      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className={`w-10 h-10 rounded ${isRefillTable ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon icon={isRefillTable ? "solar:history-bold-duotone" : "solar:pill-bold-duotone"} width={20} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col max-w-[150px]">
                          <span className="text-sm font-bold text-slate-800 group-hover:text-[#14bef0] transition-colors truncate">
                            {isRefillTable ? "Refill prescriptions" : "Active prescriptions"}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                            {subtitle}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col max-w-[150px]">
                          <span className="text-sm font-bold text-slate-700 truncate">
                            {record._clinicName || "Other / Internal"}
                          </span>
                          <span className="text-[11px] font-medium text-[#14bef0] truncate">
                            Dr. {record.doctorName || record.drName || "Consultant"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(() => {
                          const contact = getRecordContact(record);
                          if (contact && contact !== "N/A") {
                            return (
                              <div className="flex items-center justify-center gap-2">
                                <a 
                                  href={`https://wa.me/${contact.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all border border-green-100 font-bold text-[11px] uppercase tracking-widest"
                                  onClick={(e) => e.stopPropagation()}
                                  title="WhatsApp"
                                >
                                  <Icon icon="logos:whatsapp-icon" width={20} />
                                  {contact}
                                </a>
                                <a
                                  href={`tel:${contact.replace(/[^0-9+]/g, '')}`}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-100"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Call Clinic"
                                >
                                  <Icon icon="solar:phone-calling-bold-duotone" width={20} />
                                </a>
                              </div>
                            );
                          }
                          return <span className="text-slate-300">-</span>;
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">
                            {date.format("DD MMM, YYYY")}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {date.format("hh:mm A")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="inline-flex items-center justify-center w-8 h-8 rounded bg-slate-50 text-slate-500 group-hover:bg-[#14bef0]/10 group-hover:text-[#14bef0] transition-all border border-slate-100 group-hover:border-[#14bef0]/20" title="View Report">
                          <Icon icon="solar:eye-bold-duotone" width={18} />
                        </button>
                      </td>
                      {!isRefillTable && (
                        <td className="px-6 py-4 text-center">
                          {record.aiPharmacyReport || (record.finalReportNotes && record.finalReportNotes !== "Dynamically Generated PDF Report.") ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const aiNotes = record.aiPharmacyReport || record.finalReportNotes;
                                
                                setSelectedReportNotes({
                                  notes: aiNotes,
                                  type: record._type || "pharmacy",
                                });
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-100 font-bold text-[11px] uppercase tracking-widest mx-auto"
                              title="View AI Report"
                            >
                              <Icon icon="solar:magic-stick-3-bold-duotone" width={16} />
                              AI Report
                            </button>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded ${refillDateStr === "NO" ? "bg-slate-100 text-slate-500" : "bg-orange-50 text-orange-600 border border-orange-100"}`}>
                          {refillDateStr}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={isRefillTable ? 6 : 7} className="px-6 py-8 text-center text-slate-400 text-sm font-medium">
                      No prescriptions found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    );
  };

  const renderMasterAccordion = (title, data, isOpen, toggleOpen, iconStr, colorClass, bgClass, { isFirst = false, isLast = false } = {}) => {
    const { activePrescriptions, refillPrescriptions, oldPrescriptions } = partitionRecords(data);
    
    return (
      <div className={`border border-slate-200 bg-white overflow-hidden shadow-sm ${isFirst ? 'rounded-t-xl' : ''} ${isLast && !isOpen ? 'rounded-b-xl' : ''} ${!isFirst ? 'border-t-0' : ''}`}>
        <button
          onClick={toggleOpen}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded flex items-center justify-center ${bgClass} ${colorClass}`}>
              <Icon icon={iconStr} width={20} />
            </div>
            <div className="flex flex-col items-start">
              <h2 className="text-sm font-black uppercase text-gray-700 tracking-wider">
                {title} <span className="text-slate-400 ml-2 text-xs font-bold">({data.length})</span>
              </h2>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
            <Icon icon="solar:alt-arrow-down-linear" width={20} />
          </div>
        </button>
        
        {isOpen && (
          <div className={`border-t border-slate-100 bg-white ${isLast ? 'rounded-b-xl' : ''}`}>
            <div className="flex flex-col">
              {renderTable("One time prescription", activePrescriptions, false, activeOpen, () => setActiveOpen(!activeOpen), { isFirst: true })}
              {renderTable("Refill Prescription", refillPrescriptions, true, refillOpen, () => setRefillOpen(!refillOpen))}
              {renderTable("Past prescriptions", oldPrescriptions, false, oldOpen, () => setOldOpen(!oldOpen), { isLast: true })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full p-4">
      <div className="flex flex-col rounded-xl shadow-sm">
        {renderMasterAccordion("Clinic in Network", internalRecords, internalOpen, () => setInternalOpen(!internalOpen), "solar:hospital-bold-duotone", "text-blue-500", "bg-blue-50", { isFirst: true })}
        {renderMasterAccordion("Out of network clinics", externalRecords, externalOpen, () => setExternalOpen(!externalOpen), "solar:folder-with-files-bold-duotone", "text-amber-500", "bg-amber-50", { isLast: true })}
      </div>
    </div>
  );
};
