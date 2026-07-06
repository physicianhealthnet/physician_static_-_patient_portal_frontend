import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { AxiosInstanceSecondryServer } from "../utilities/AxiosInstance";
import doctorsData from "../data/doctorsData.json";

const EmergencyCare = ({ selectedClinic }) => {
  const [visitedOpen, setVisitedOpen] = useState(false);
  const [allDoctorsOpen, setAllDoctorsOpen] = useState(false);
  const [customerCareOpen, setCustomerCareOpen] = useState(false);

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const patientId = userData?.patientId || userData?.id || "N/A";

  const id = userData?.id;

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (id) {
      AxiosInstanceSecondryServer.get(`/user-appointment/get/${id}`)
        .then((res) => {
          setAppointments(res.data.data || res.data || []);
        })
        .catch(err => console.error("Failed to fetch appointments for emergency view", err));
    }
  }, [id]);

  const visitedDoctors = useMemo(() => {
    const visited = [];
    const seen = new Set();
    appointments.forEach(app => {
      if (selectedClinic && app.clinicName?.trim().toLowerCase() !== selectedClinic.clinic_name?.trim().toLowerCase() && app.clinicId !== selectedClinic.cid) return;
      
      const docKey = `${app.clinicName}-${app.docName}`;
      if (!seen.has(docKey)) {
        seen.add(docKey);
        visited.push({
          id: app._id || visited.length,
          hospital: app.clinicName || "Unknown Clinic",
          name: app.docName ? (app.docName.startsWith("Dr") ? app.docName : `Dr. ${app.docName}`) : "Doctor",
          dept: app.department || selectedClinic?.specialization || "General Medicine",
          number: app.clinicNumber || selectedClinic?.phone || "N/A"
        });
      }
    });
    return visited;
  }, [appointments, selectedClinic]);

  const allDoctors = useMemo(() => {
    if (!selectedClinic) return [];
    return doctorsData
      .filter(d => d.clinic_name === selectedClinic.clinic_name)
      .map((d, i) => ({
        id: i,
        hospital: d.clinic_name,
        name: d.doctor_name ? (d.doctor_name.startsWith("Dr") ? d.doctor_name : `Dr. ${d.doctor_name}`) : "Doctor",
        dept: d.specialization || "General Medicine",
        number: d.phone || "N/A"
      }));
  }, [selectedClinic]);

  const customerCare = useMemo(() => {
    return [
      { id: 1, service: "Clinic Reception / Support", number: selectedClinic?.phone || "N/A" },
      { id: 2, service: "24/7 Emergency Hotline", number: "108" }
    ];
  }, [selectedClinic]);

  return (
    <div className="w-full flex flex-col min-h-0">
      <div className="flex flex-col rounded-xl shadow-sm">
        
        {/* Visited Doctors Collapse */}
        <div className={`border border-slate-200 bg-white overflow-hidden shadow-sm rounded-t-xl`}>
          <button 
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
            onClick={() => setVisitedOpen(!visitedOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded flex items-center justify-center bg-blue-50 text-blue-600">
                <Icon icon="solar:users-group-rounded-bold-duotone" width={20} />
              </div>
              <h2 className="text-sm font-black uppercase text-gray-700 tracking-wider">Visited Doctors</h2>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform duration-300 ${visitedOpen ? "rotate-180" : ""}`}>
              <Icon icon="solar:alt-arrow-down-linear" width={20} />
            </div>
          </button>
          
          {visitedOpen && (
            <div className="border-t border-slate-100 overflow-x-auto bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hospital Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor Name & Department</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctors Number</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {visitedDoctors.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">{patientId}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{doc.hospital}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{doc.name}</span>
                          <span className="text-[11px] font-medium text-blue-500 mt-0.5">{doc.dept}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">{doc.number}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors border border-green-100" title="WhatsApp Chat">
                            <Icon icon="ic:baseline-whatsapp" width={16} />
                          </button>
                          <button className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors border border-blue-100" title="Video Chat">
                            <Icon icon="solar:videocamera-bold-duotone" width={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visitedDoctors.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-sm font-medium">
                        No visited doctors found for this clinic.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* All Doctors Collapse */}
        <div className={`border border-slate-200 bg-white overflow-hidden shadow-sm border-t-0`}>
          <button 
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
            onClick={() => setAllDoctorsOpen(!allDoctorsOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded flex items-center justify-center bg-purple-50 text-purple-600">
                <Icon icon="solar:hospital-bold-duotone" width={20} />
              </div>
              <h2 className="text-sm font-black uppercase text-gray-700 tracking-wider">All Doctors and Departments</h2>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform duration-300 ${allDoctorsOpen ? "rotate-180" : ""}`}>
              <Icon icon="solar:alt-arrow-down-linear" width={20} />
            </div>
          </button>
          
          {allDoctorsOpen && (
            <div className="border-t border-slate-100 overflow-x-auto bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hospital Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor Name & Department</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctors Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allDoctors.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{doc.hospital}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{doc.name}</span>
                          <span className="text-[11px] font-medium text-purple-500 mt-0.5">{doc.dept}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">{doc.number}</td>
                    </tr>
                  ))}
                  {allDoctors.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-slate-400 text-sm font-medium">
                        No doctors found for this clinic.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Care Collapse */}
        <div className={`border border-slate-200 bg-white overflow-hidden shadow-sm border-t-0 ${!customerCareOpen ? 'rounded-b-xl' : ''}`}>
          <button 
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
            onClick={() => setCustomerCareOpen(!customerCareOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded flex items-center justify-center bg-orange-50 text-orange-600">
                <Icon icon="solar:phone-calling-bold-duotone" width={20} />
              </div>
              <h2 className="text-sm font-black uppercase text-gray-700 tracking-wider">Customer Care and Emergency Care</h2>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform duration-300 ${customerCareOpen ? "rotate-180" : ""}`}>
              <Icon icon="solar:alt-arrow-down-linear" width={20} />
            </div>
          </button>
          
          {customerCareOpen && (
            <div className="border-t border-slate-100 overflow-x-auto bg-white rounded-b-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {customerCare.map(care => (
                    <tr key={care.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{care.service}</td>
                      <td className="px-6 py-4 text-sm font-bold text-orange-600">{care.number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EmergencyCare;
