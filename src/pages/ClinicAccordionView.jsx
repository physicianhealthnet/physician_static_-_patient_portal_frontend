import React, { useState } from "react";
import { Icon } from "@iconify/react";
import UserAppointmentDetails from "./UserAppointmentDetails";
import { MedicalRecords } from "../components/MedicalRecords";
import { FollowUps } from "../components/FollowUps";
import EmergencyCare from "./EmergencyCare";

const AccordionItem = ({ title, subtitle, icon, colorClass, isOpen, onToggle, children, isFirst, isLast }) => {
  return (
    <div className={`border border-slate-200 bg-white overflow-hidden shadow-sm ${isFirst ? 'rounded-t-xl' : ''} ${isLast && !isOpen ? 'rounded-b-xl' : ''} ${!isFirst ? 'border-t-0' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded flex items-center justify-center bg-slate-50 ${colorClass}`}>
            <Icon icon={icon} width={20} />
          </div>
          <div className="flex flex-col items-start">
            <h2 className="text-sm font-black uppercase text-gray-700 tracking-wider">{title}</h2>
            {subtitle && subtitle}
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <Icon icon="solar:alt-arrow-down-linear" width={20} />
        </div>
      </button>
      {isOpen && (
        <div className={`border-t border-slate-100 bg-white ${isLast ? 'rounded-b-xl' : ''}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export const ClinicAccordionView = ({ selectedClinic }) => {
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  if (!selectedClinic) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Icon icon="solar:hospital-bold-duotone" width={64} className="text-slate-200 mb-4" />
        <h2 className="text-xl font-bold text-slate-600">No Clinic Selected</h2>
        <p className="mt-2 text-sm">Please select a clinic from the sidebar to view details.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-12 p-8">
      {/* Header Banner */}
      <div className="bg-white rounded p-8 mb-8 flex items-center gap-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#14bef0]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="w-24 h-24 rounded overflow-hidden border-2 border-slate-100 shadow-sm shrink-0 bg-slate-50 flex items-center justify-center">
          {selectedClinic.clinic_image ? (
            <img src={selectedClinic.clinic_image} alt={selectedClinic.clinic_name} className="w-full h-full object-cover" />
          ) : (
            <Icon icon="solar:hospital-bold-duotone" className="text-slate-300" width={48} />
          )}
        </div>
        <div className="flex flex-col z-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{selectedClinic.clinic_name}</h1>
          <p className="text-lg font-bold text-[#14bef0] mt-1">{selectedClinic.doctor_name ? `Dr. ${selectedClinic.doctor_name}` : ''}</p>
          <div className="flex items-center gap-6 mt-3 text-sm font-medium text-slate-500">
            {selectedClinic.phone && <span className="flex items-center gap-2"><Icon icon="solar:phone-bold-duotone" width={18} className="text-slate-400" /> {selectedClinic.phone}</span>}
            {selectedClinic.address && <span className="flex items-center gap-2"><Icon icon="solar:map-point-bold-duotone" width={18} className="text-slate-400" /> {selectedClinic.address}</span>}
          </div>
        </div>
      </div>

      {/* Accordions */}
      <div className="flex flex-col rounded-xl shadow-sm">
        <AccordionItem 
          isFirst={true}
          title="Doctors contacts & Emergency care" 
          subtitle={
            <div className="flex flex-wrap items-center gap-2 mt-1.5 max-md:hidden">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2.5 py-1 rounded"><Icon icon="solar:phone-bold-duotone" className="text-[14px]" /> Hospital contacts</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2.5 py-1 rounded"><Icon icon="solar:siren-bold-duotone" className="text-[14px]" /> Emergency care</span>
            </div>
          }
          icon="solar:siren-bold-duotone" 
          colorClass="text-red-500"
          isOpen={openAccordion === "emergency"}
          onToggle={() => toggleAccordion("emergency")}
        >
          <div className="h-[600px] overflow-y-auto p-4">
             <EmergencyCare selectedClinic={selectedClinic} />
          </div>
        </AccordionItem>

        <AccordionItem 
          title="Appointments" 
          subtitle={
            <div className="flex flex-wrap items-center gap-2 mt-1.5 max-md:hidden">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2.5 py-1 rounded"><Icon icon="solar:calendar-date-bold-duotone" className="text-[14px]" /> Up Coming</span>
            </div>
          }
          icon="solar:calendar-bold-duotone" 
          colorClass="text-blue-500"
          isOpen={openAccordion === "appointments"}
          onToggle={() => toggleAccordion("appointments")}
        >
          <div className="h-[600px] overflow-y-auto p-4">
             <UserAppointmentDetails selectedClinic={selectedClinic} isNested={true} />
          </div>
        </AccordionItem>

        <AccordionItem 
          title="Prescriptions" 
          subtitle={
            <div className="flex flex-wrap items-center gap-2 mt-1.5 max-md:hidden">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded"><Icon icon="solar:document-text-bold-duotone" className="text-[14px]" /> Active prescriptions</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-50 px-2.5 py-1 rounded"><Icon icon="solar:history-bold-duotone" className="text-[14px]" /> Refill</span>
            </div>
          }
          icon="solar:pill-bold-duotone" 
          colorClass="text-emerald-500"
          isOpen={openAccordion === "pharmacy"}
          onToggle={() => toggleAccordion("pharmacy")}
        >
          <div className="h-[600px] overflow-y-auto p-4">
             <MedicalRecords filter="prescription" selectedClinic={selectedClinic} isNested={true} />
          </div>
        </AccordionItem>

        <AccordionItem 
          title="Lab Reports" 
          subtitle={
            <div className="flex flex-wrap items-center gap-2 mt-1.5 max-md:hidden">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-500 bg-purple-50 px-2.5 py-1 rounded"><Icon icon="solar:test-tube-bold-duotone" className="text-[14px]" /> Blood Test</span>
            </div>
          }
          icon="solar:test-tube-bold-duotone" 
          colorClass="text-purple-500"
          isOpen={openAccordion === "labs"}
          onToggle={() => toggleAccordion("labs")}
        >
          <div className="h-[600px] overflow-y-auto p-4">
             <MedicalRecords filter="lab" selectedClinic={selectedClinic} isNested={true} />
          </div>
        </AccordionItem>

        <AccordionItem 
          title="Scan Reports" 
          subtitle={
            <div className="flex flex-wrap items-center gap-2 mt-1.5 max-md:hidden">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 px-2.5 py-1 rounded"><Icon icon="solar:bone-bold-duotone" className="text-[14px]" /> X-Ray</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 px-2.5 py-1 rounded"><Icon icon="solar:medical-kit-bold-duotone" className="text-[14px]" /> Ultrasound</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 px-2.5 py-1 rounded"><Icon icon="solar:scanner-bold-duotone" className="text-[14px]" /> CT scan</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 px-2.5 py-1 rounded"><Icon icon="solar:radiation-bold-duotone" className="text-[14px]" /> MRI scan</span>
            </div>
          }
          icon="solar:scanner-bold-duotone" 
          colorClass="text-amber-500"
          isOpen={openAccordion === "scans"}
          onToggle={() => toggleAccordion("scans")}
        >
          <div className="h-[600px] overflow-y-auto p-4">
             <MedicalRecords filter="scan" selectedClinic={selectedClinic} isNested={true} />
          </div>
        </AccordionItem>

        <AccordionItem 
          title="Follow ups" 
          subtitle={
            <div className="flex flex-wrap items-center gap-2 mt-1.5 max-md:hidden">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2.5 py-1 rounded"><Icon icon="solar:calendar-bold-duotone" className="text-[14px]" /> Next Doctors visit</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded"><Icon icon="solar:pill-bold-duotone" className="text-[14px]" /> Prescription Refill</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-500 bg-purple-50 px-2.5 py-1 rounded"><Icon icon="solar:test-tube-bold-duotone" className="text-[14px]" /> Routine Blood Test</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-50 px-2.5 py-1 rounded"><Icon icon="solar:scanner-bold-duotone" className="text-[14px]" /> Scan Appointments</span>
            </div>
          }
          icon="solar:chat-round-bold-duotone" 
          colorClass="text-teal-500"
          isOpen={openAccordion === "followups"}
          onToggle={() => toggleAccordion("followups")}
        >
          <div className="h-[600px] overflow-y-auto p-4">
             <FollowUps selectedClinic={selectedClinic} />
          </div>
        </AccordionItem>

        <AccordionItem 
          isLast={true}
          title="Billing & Payments" 
          icon="solar:bill-list-bold-duotone" 
          colorClass="text-orange-500"
          isOpen={openAccordion === "billing"}
          onToggle={() => toggleAccordion("billing")}
        >
          <div className="h-[600px] overflow-y-auto p-4">
             <MedicalRecords filter="bill" selectedClinic={selectedClinic} isNested={true} />
          </div>
        </AccordionItem>
      </div>
    </div>
  );
};
