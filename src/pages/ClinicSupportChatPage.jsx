import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { fetchDoctorsDataFromDb } from "../utilities/dataLoader.js";

const ClinicSupportChatPage = () => {
  const navigate = useNavigate();
  const [userData] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData"));
    } catch (e) {
      return null;
    }
  });

  const [userP] = useState(() => {
    if (userData?.patientId) return userData;
    try {
      return JSON.parse(sessionStorage.getItem("patientData"));
    } catch (e) {
      return null;
    }
  });

  const patientClinicId = React.useMemo(() => userP?.clinicIds || [], [userP]);
  const [clinicIdResolvedData, setClinicIdResolvedData] = useState([]);
  const [expandedClinicId, setExpandedClinicId] = useState(null);

  // Resolve subdomains
  useEffect(() => {
    if (!patientClinicId.length) return;
    const loadClinics = async () => {
      try {
        const doctorsData = await fetchDoctorsDataFromDb();
        const clinics = doctorsData.filter((d) => patientClinicId.includes(d.cid));
        const resolvedMap = new Map();
        clinics.forEach((clinic) => {
          if (!resolvedMap.has(clinic.cid)) {
            resolvedMap.set(clinic.cid, {
              cid: clinic.cid,
              clinic_name: clinic.clinic_name,
              subdomain: clinic.subdomain_name || clinic.clinic_name.toLowerCase().replace(/\s+/g, "-"),
              address: clinic.address || "",
              phone: clinic.phone || "",
            });
          }
        });
        const resolved = Array.from(resolvedMap.values());
        setClinicIdResolvedData((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(resolved)) return prev;
          return resolved;
        });
      } catch (err) {
        console.error(err);
      }
    };
    loadClinics();
  }, [patientClinicId]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-full">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-4">
          <Icon icon="solar:chat-round-line-bold-duotone" className="text-blue-500" width="24" />
          <h3 className="text-slate-800 font-bold text-lg">
            Clinic Support Chat
          </h3>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-500 tracking-widest border-b border-slate-100">
                <th className="p-4">Clinic Name</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-center">Primary Contact No</th>
                <th className="p-4 text-center">Primary Whatsapp No</th>
                <th className="p-4 text-center">Web Chat</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {clinicIdResolvedData.length > 0 ? clinicIdResolvedData.map((clinic, index) => (
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
                          <td className="p-4 align-middle">
                            <div className="flex justify-center">
                              <button 
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 font-medium text-sm w-max justify-center" 
                                title="Phone"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (clinic.phone) window.location.href = `tel:+91${clinic.phone}`;
                                }}
                              >
                                <Icon icon="solar:phone-bold" width="18" />
                                {clinic.phone ? `+91 ${clinic.phone}` : "N/A"}
                              </button>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex justify-center">
                              <button 
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 font-medium text-sm w-max justify-center" 
                                title="WhatsApp"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (clinic.phone) window.open(`https://wa.me/91${clinic.phone}`, '_blank');
                                }}
                              >
                                <Icon icon="ic:baseline-whatsapp" width="18" />
                                {clinic.phone ? `+91 ${clinic.phone}` : "N/A"}
                              </button>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex justify-center gap-2">
                              <button 
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 font-medium text-sm" 
                                title="Web Chat"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/dashboard/chat', { state: { clinicName: clinic.clinic_name, openChat: true } });
                                }}
                              >
                                <Icon icon="solar:chat-round-dots-bold" width="18" />
                                Web Chat
                              </button>
                              <button 
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 font-medium text-sm" 
                                title="Video Consult"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/dashboard/video-consult', { state: { clinicName: clinic.clinic_name, openConsult: true } });
                                }}
                              >
                                <Icon icon="solar:videocamera-bold" width="18" />
                                Video Consult
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                    No Clinics Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClinicSupportChatPage;
