import React, { useState, useEffect, useMemo } from "react";
import { UploadRecordsModal } from "./UploadRecordsModal";
import { MedicalRecordDetails } from "./MedicalRecordDetails";
import { fetchDoctorsDataFromDb } from "../utilities/dataLoader.js";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import AIGaugeReport from "./AIGaugeReport";
import { AIReportModal } from "./AIReportModal";
import { PrescriptionsView } from "./PrescriptionsView";
import { AxiosInstanceDependency } from "../utilities/AxiosInstance";

export const MedicalRecords = ({
  filter = "all",
  selectedClinic,
  isNested = false,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedReportNotes, setSelectedReportNotes] = useState(null); // Will hold { notes, type }
  const [openGroup, setOpenGroup] = useState(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [externalOpen, setExternalOpen] = useState(false);

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const patientData = JSON.parse(sessionStorage.getItem("patientData") || "{}");

  const patientId = userData?.patientId || userData?.id;

  // FIX: stable reference
  const patientClinicId = useMemo(() => {
    const ids = patientData?.clinicId || patientData?.clinicIds || [];
    return Array.isArray(ids) ? ids : [ids];
  }, [patientData]);

  const [clinicIdResolvedData, setClinicIdResolvedData] = useState([]);
  const [dummyRecords, setDummyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsList, setDoctorsList] = useState([]);

  // Resolve subdomains (ONLY ONCE)
  useEffect(() => {
    if (!patientClinicId.length) return;
    const loadClinics = async () => {
      try {
        const doctorsData = await fetchDoctorsDataFromDb();
        setDoctorsList(doctorsData);
        const clinics = doctorsData.filter((d) => patientClinicId.includes(d.cid));

        const resolved = clinics.map((clinic) => ({
          cid: clinic.cid,
          clinic_name: clinic.clinic_name,
          subdomain:
            clinic.subdomain_name ||
            clinic.clinic_name.toLowerCase().replace(/\s+/g, "-"),
        }));

        setClinicIdResolvedData((prev) => {
          const isSame = JSON.stringify(prev) === JSON.stringify(resolved);
          return isSame ? prev : resolved;
        });
      } catch (err) {
        console.error(err);
      }
    };
    loadClinics();
  }, [patientClinicId]);

  // Fetch records (ONLY when needed)
  useEffect(() => {
    if (!patientId || clinicIdResolvedData.length === 0) return;

    const fetchRecords = async () => {
      try {
        setLoading(true);

        // Fetch patient documents from Dependency Server (Secondary Backend)
        let docs = [];
        try {
          const docRes = await AxiosInstanceDependency.get(
            `/patientdocuments/get-by-patient-id/${patientId}`,
          );
          if (docRes.data && docRes.data.documents) {
            docs = docRes.data.documents.map((r) => {
              let type = "out-of-network-data";
              if (r.documentType) {
                const dt = r.documentType.toLowerCase();
                if (dt.includes("scan")) type = "scan";
                else if (dt.includes("lab")) type = "lab";
                else if (dt.includes("prescription")) type = "prescription";
                else if (dt.includes("document")) type = "document";
              }
              return {
                ...r,
                _type: type,
                _originalType: "out-of-network-data",
                isExternal: true,
                _clinicName: r.clinicName || "",
                _subdomain: "",
              };
            });
          }
        } catch (error) {
          console.error("Error fetching patient documents", error);
        }

        const clinicPromises = clinicIdResolvedData.map(
          async ({ subdomain, clinic_name }) => {
            const isLocal =
              window?.location?.hostname === "localhost" ||
              window?.location?.hostname === "127.0.0.1";
            let baseUrl = `https://${subdomain}.physicianhealthnet.com/api`;
            if (isLocal) {
              baseUrl =
                subdomain === "demo2"
                  ? "http://localhost:4026"
                  : "http://localhost:3026";
            }

            const [scanRes, labRes, rxRes, billRes] = await Promise.all([
              fetch(`${baseUrl}/scan-prescription/by-patient/${patientId}`)
                .then((r) => r.json())
                .catch(() => ({ data: [] })),

              fetch(`${baseUrl}/lab-prescription/by-patient/${patientId}`)
                .then((r) => r.json())
                .catch(() => ({ data: [] })),

              fetch(`${baseUrl}/prescription/get-by-phn/${patientId}`)
                .then((r) => r.json())
                .catch(() => ({ data: [] })),

              // fetch(`${baseUrl}/treatment-bill/get-patient/${patientId}`)
              // fetch(`http://localhost:3026/treatment-bill/get-patient-phnid/${patientId}`)
              fetch(`${baseUrl}/treatment-bill/get-patient-phnid/${patientId}`)
                .then((r) => r.json())
                .catch(() => ({ data: [] })),
            ]);

            console.log(billRes);

            // Add type for easier identification
            const scans = (scanRes?.data || []).map((r) => ({
              ...r,
              _type: "scan",
              _clinicName: clinic_name,
              _subdomain: subdomain,
            }));
            const labs = (labRes?.data || []).map((r) => ({
              ...r,
              _type: "lab",
              _clinicName: clinic_name,
              _subdomain: subdomain,
            }));

            const prescriptions = (rxRes?.data || []).map((r) => ({
              ...r,
              _type: "prescription",
              _clinicName: clinic_name,
              _subdomain: subdomain,
            }));
            const bills = (billRes?.data || []).map((r) => ({
              ...r,
              _type: "bill",
              _clinicName: clinic_name,
              _subdomain: subdomain,
            }));
            console.log(bills, "test");

            return { scans, labs, prescriptions, bills };
          },
        );

        const results = await Promise.all(clinicPromises);

        let merged = [];
        results.forEach((res) => {
          merged.push(
            ...res.scans,
            ...res.labs,
            ...res.prescriptions,
            ...res.bills,
          );
        });

        // Add the globally fetched documents to merged array
        if (typeof docs !== "undefined") {
          merged.push(...docs);
        }

        // remove duplicates and sort by date (newest first)
        const unique = Array.from(
          new Map(merged.map((i) => [i._id, i])).values(),
        ).sort((a, b) => {
          const getValidDate = (item) => {
            if (item.createdAt && !isNaN(new Date(item.createdAt).getTime())) {
              return new Date(item.createdAt);
            }
            if (
              item.recordDate &&
              !isNaN(new Date(item.recordDate).getTime())
            ) {
              return new Date(item.recordDate);
            }
            if (
              item._id &&
              typeof item._id === "string" &&
              item._id.length === 24
            ) {
              return new Date(parseInt(item._id.substring(0, 8), 16) * 1000);
            }
            return new Date(0);
          };
          return getValidDate(b) - getValidDate(a);
        });

        setDummyRecords(unique);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [patientId, clinicIdResolvedData]);

  const getRecordContact = (record) => {
    const cName = record._clinicName || record.clinicName;
    if (cName) {
      const doc = doctorsList.find((d) => d.clinic_name === cName);
      if (doc && doc.phone) return doc.phone;
    }
    if (record.phone) return record.phone;
    return "N/A";
  };

  const getRecordIcon = (record) => {
    switch (record._type) {
      case "prescription":
        return {
          icon: "solar:pill-bold-duotone",
          color: "text-emerald-500",
          bg: "bg-emerald-50",
        };
      case "scan":
        return {
          icon: "solar:scanner-bold-duotone",
          color: "text-blue-500",
          bg: "bg-blue-50",
        };
      case "lab":
        return {
          icon: "solar:test-tube-bold-duotone",
          color: "text-purple-500",
          bg: "bg-purple-50",
        };
      case "document":
        return {
          icon: "solar:file-text-bold-duotone",
          color: "text-amber-500",
          bg: "bg-amber-50",
        };
      case "bill":
        return {
          icon: "solar:bill-list-bold-duotone",
          color: "text-orange-500",
          bg: "bg-orange-50",
        };
      default:
        return {
          icon: "solar:document-bold-duotone",
          color: "text-slate-500",
          bg: "bg-slate-50",
        };
    }
  };

  const getRecordTitle = (record) => {
    if (record._type === "bill")
      return record.treatmentBillId || "Treatment Bill";
    return (
      record.scanType ||
      record.labType ||
      record.documentName ||
      (record._type === "prescription"
        ? "Active prescriptions"
        : "Medical Record")
    );
  };

  const getRecordSubtitle = (record) => {
    if (record._type === "bill") {
      const count = record.treatments?.length || 0;
      return `${count} Treatment${count !== 1 ? "s" : ""} • Total: ${record.grandTotal ? "₹" + record.grandTotal : "N/A"}`;
    }
    if (record._type === "prescription") {
      const count = record.medicinesData?.length || 0;
      const firstMed = record.medicinesData?.[0]?.medication;
      return `${count} Medicine${count !== 1 ? "s" : ""}${firstMed ? ` • ${firstMed}` : ""} • AI report`;
    }
    if (record.isExternal || record._originalType === "out-of-network-data") {
      const docType = record.documentType
        ? record.documentType.charAt(0).toUpperCase() +
          record.documentType.slice(1)
        : "Document";
      return `External ${docType} • ${record.clinicName || record.doctorName || "Out of Network"}`;
    }
    if (record._type === "scan") {
      return `${record.scanCenter || "Internal"} Scan • ${record.priority || "Normal"}`;
    }
    if (record._type === "lab") {
      return `Lab report • Blood Test • AI report`;
    }
    if (record._type === "out-of-network-data") {
      return `External Document • ${record.clinicName || record.doctorName || "Out of Network"}`;
    }
    return record.category || "General";
  };

  // Compute analytics for prescriptions
  const prescriptionStats = useMemo(() => {
    if (filter !== "prescription") return null;

    const rxRecords = dummyRecords
      .filter((r) => r._type === "prescription")
      .filter(
        (r) => !selectedClinic || r._clinicName === selectedClinic.clinic_name,
      );

    const totalPrescriptions = rxRecords.length;
    let totalMedicines = 0;
    const medicineCounts = {};

    let activeCount = 0;
    let refillCount = 0;
    let pastCount = 0;
    const now = new Date();

    rxRecords.forEach((record) => {
      if (record.medicinesData && Array.isArray(record.medicinesData)) {
        totalMedicines += record.medicinesData.length;
        record.medicinesData.forEach((med) => {
          if (med.medication) {
            const name = med.medication.trim().toUpperCase();
            medicineCounts[name] = (medicineCounts[name] || 0) + 1;
          }
        });
      }

      // Calculate active, refill, past
      const rxDate = new Date(
        record.createdAt || record.recordDate || record._id,
      );
      const daysOld = (now - rxDate) / (1000 * 60 * 60 * 24);
      let needsRefill = false;
      if (record.medicinesData && Array.isArray(record.medicinesData)) {
        record.medicinesData.forEach((med) => {
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
        refillCount++;
      } else if (daysOld > 30) {
        pastCount++;
      } else {
        activeCount++;
      }
    });

    let topMedicinesList = [];
    if (Object.keys(medicineCounts).length > 0) {
      const sortedMedicines = Object.entries(medicineCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name.charAt(0) + name.slice(1).toLowerCase());

      topMedicinesList = sortedMedicines;
    }

    return [
      {
        label: "Total Prescriptions",
        value: totalPrescriptions,
        icon: "solar:document-medicine-bold-duotone",
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        label: "Total Tablets Consumed",
        value: totalMedicines,
        icon: "solar:pill-bold-duotone",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        label: "Most Prescribed",
        value: topMedicinesList.length > 0 ? topMedicinesList : "None",
        isList: topMedicinesList.length > 0,
        icon: "solar:health-bold-duotone",
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
      {
        label: "Active Prescriptions",
        value: activeCount,
        icon: "solar:pulse-bold-duotone",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        label: "Refill Prescriptions",
        value: refillCount,
        icon: "solar:history-bold-duotone",
        color: "text-orange-600",
        bg: "bg-orange-50",
      },
      {
        label: "Past Prescriptions",
        value: pastCount,
        icon: "solar:archive-bold-duotone",
        color: "text-slate-600",
        bg: "bg-slate-50",
      },
    ];
  }, [dummyRecords, filter, selectedClinic]);

  // UI
  if (selectedRecord) {
    return (
      <>
        <MedicalRecordDetails
          record={selectedRecord}
          onBack={() => setSelectedRecord(null)}
          onAddMore={() => setIsUploadModalOpen(true)}
        />
        <UploadRecordsModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          patientId={patientId}
          selectedClinic={selectedClinic}
          availableClinics={clinicIdResolvedData}
        />
      </>
    );
  }

  const renderTableRows = (records) => {
    return (
      <table className="w-full text-center border-collapse relative text-nowrap">
        <thead className="sticky top-0 bg-white/90 backdrop-blur-md z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <tr className="border-b border-slate-100">
            <th className="py-4 px-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Type
            </th>
            <th className="py-4 px-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Record Name
            </th>
            <th className="py-4 px-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Clinic / Doctor
            </th>
            {filter !== "out-of-network-data" && (
              <th className="py-4 px-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Contact
              </th>
            )}
            <th className="py-4 px-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              Created Date
            </th>
            <th className="py-4 px-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              AI Report
            </th>
            <th className="py-4 px-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              Report
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {records.map((record, idx) => {
            const { icon, color, bg } = getRecordIcon(record);
            const date = dayjs(
              record.createdAt || record.recordDate || record._id,
            );
            return (
              <tr
                key={record._id || idx}
                onClick={() => setSelectedRecord(record)}
                className="group hover:bg-slate-50/50 transition-colors cursor-pointer animate-fade-in-up"
                style={{
                  animationDelay: `${idx * 100}ms`,
                  opacity: 0,
                  animationFillMode: "forwards",
                }}
              >
                <td className="py-4 px-2 text-center">
                  <div
                    className={`w-10 h-10 mx-auto rounded-xl ${bg} flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon icon={icon} width={24} />
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-sm font-bold text-slate-800 group-hover:text-[#14bef0] transition-colors line-clamp-1">
                      {getRecordTitle(record)}
                    </span>
                    <span className="text-xs font-medium text-slate-500 line-clamp-1 mt-1">
                      {getRecordSubtitle(record)}
                    </span>
                    {dayjs().isSame(date, "day") && (
                      <span className="text-[9px] font-black text-orange-500 uppercase mt-0.5">
                        Today
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-sm font-bold text-slate-700 line-clamp-1">
                      {record._clinicName ||
                        record.clinicName ||
                        "Other / Internal"}
                    </span>
                    <span className="text-xs font-medium text-[#14bef0] line-clamp-1">
                      Dr. {record.doctorName || record.drName || "Consultant"}
                    </span>
                  </div>
                </td>
                {filter !== "out-of-network-data" && (
                  <td className="py-4 px-2 text-center text-center">
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
                )}
                <td className="py-4 px-2 text-center">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-sm font-bold text-slate-700">
                      {date.format("DD MMM, YYYY")}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {date.format("hh:mm A")}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {record.finalReportNotes &&
                      record.finalReportNotes !==
                        "Dynamically Generated PDF Report." && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReportNotes({
                              notes: record.finalReportNotes,
                              type: record._type,
                            });
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-100 font-bold text-[11px] uppercase tracking-widest"
                          title="View AI Report"
                        >
                          <Icon
                            icon="solar:magic-stick-3-bold-duotone"
                            width={16}
                          />{" "}
                          AI Report
                        </button>
                      )}
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#14bef0]/10 group-hover:text-[#14bef0] transition-all border border-slate-100 group-hover:border-[#14bef0]/20 font-bold text-[11px] uppercase tracking-widest">
                      <Icon icon="solar:eye-bold-duotone" width={16} /> View
                      Report
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {records.length === 0 && (
            <tr>
              <td
                colSpan={filter === "out-of-network-data" ? 5 : 6}
                className="px-6 py-8 text-center text-slate-400 text-sm font-medium"
              >
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  const renderScansGroups = (records) => {
    const grouped = Object.entries(
      records.reduce((acc, record) => {
        const groupTitle = getRecordTitle(record);
        if (!acc[groupTitle]) acc[groupTitle] = [];
        acc[groupTitle].push(record);
        return acc;
      }, {}),
    );

    return (
      <div className="flex flex-col items-center text-center">
        {grouped.map(([groupName, groupRecords], idx) => {
          const isOpen = openGroup === groupName;
          const isFirst = idx === 0;
          const isLast = idx === grouped.length - 1;

          return (
            <div
              key={groupName}
              className={`bg-white overflow-hidden ${!isFirst ? "border-t border-slate-100" : ""}`}
            >
              <button
                onClick={() =>
                  setOpenGroup(openGroup === groupName ? null : groupName)
                }
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded flex items-center justify-center bg-[#14bef0]/10 text-[#14bef0]">
                    <Icon icon="solar:scanner-bold-duotone" width={20} />
                  </div>
                  <div className="flex flex-col items-start">
                    <h2 className="text-sm font-black uppercase text-gray-700 tracking-wider text-left">
                      {groupName}
                    </h2>
                  </div>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                >
                  <Icon icon="solar:alt-arrow-down-linear" width={20} />
                </div>
              </button>
              {isOpen && (
                <div
                  className={`border-t border-slate-100 overflow-auto bg-white ${isLast ? "rounded-b-xl" : ""}`}
                >
                  {renderTableRows(groupRecords)}
                </div>
              )}
            </div>
          );
        })}
        {records.length === 0 && (
          <div className="p-4 text-center text-slate-400 text-sm font-medium">
            No scan records found.
          </div>
        )}
      </div>
    );
  };

  const renderMasterAccordion = (
    title,
    records,
    isOpen,
    toggleOpen,
    iconStr,
    colorClass,
    bgClass,
    { isFirst = false, isLast = false } = {},
  ) => {
    return (
      <div
        className={`border border-slate-200 bg-white overflow-hidden shadow-sm ${isFirst ? "rounded-t-xl" : ""} ${isLast && !isOpen ? "rounded-b-xl" : ""} ${!isFirst ? "border-t-0" : ""}`}
      >
        <button
          onClick={toggleOpen}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded flex items-center justify-center ${bgClass} ${colorClass}`}
            >
              <Icon icon={iconStr} width={20} />
            </div>
            <div className="flex flex-col items-start">
              <h2 className="text-sm font-black uppercase text-gray-700 tracking-wider">
                {title}{" "}
                <span className="text-slate-400 ml-2 text-xs font-bold">
                  ({records.length})
                </span>
              </h2>
            </div>
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          >
            <Icon icon="solar:alt-arrow-down-linear" width={20} />
          </div>
        </button>

        {isOpen && (
          <div
            className={`border-t border-slate-100 bg-white ${isLast ? "rounded-b-xl" : ""}`}
          >
            {filter === "scan"
              ? renderScansGroups(records)
              : renderTableRows(records)}
          </div>
        )}
      </div>
    );
  };

  const currentRecords = dummyRecords
    .filter(
      (r) =>
        filter === "all" ||
        r._type === filter ||
        (filter === "out-of-network-data" &&
          r._originalType === "out-of-network-data"),
    )
    .filter(
      (r) =>
        filter === "out-of-network-data" ||
        !selectedClinic ||
        r._clinicName === selectedClinic.clinic_name,
    );

  const internalRecords = currentRecords.filter((r) => !r.isExternal);
  const externalRecords = currentRecords.filter((r) => r.isExternal);

  return (
    <div
      className={`w-full ${isNested ? "bg-transparent" : "bg-[#f8f9fc] h-[calc(100vh-65px)]"} flex flex-col`}
    >
      {!isNested ? (
        <div className="sticky top-0 z-10 flex justify-between items-center px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-slate-800 font-black text-xl tracking-tight">
              {filter === "all"
                ? "Medical Records"
                : filter === "prescription"
                  ? "Prescriptions"
                  : filter === "scan"
                    ? "Scan Reports"
                    : filter === "lab"
                      ? "Lab Reports"
                      : filter === "bills"
                        ? "Bills & Invoices"
                        : "Medical Records"}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">
              {filter === "all"
                ? "Prescriptions & Reports"
                : filter === "prescription"
                  ? "Medical Prescriptions"
                  : filter === "scan"
                    ? "Imaging & Scans"
                    : filter === "lab"
                      ? "Laboratory Tests"
                      : filter === "bills"
                        ? "Treatment Receipts"
                        : "Prescriptions & Reports"}
            </p>
          </div>
          {(filter === "scan" || filter === "lab") && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-[#14bef0] hover:bg-[#0ba7d6] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-cyan-100 transition-all active:scale-95 flex items-center gap-2"
              title="Upload outside lab and scan data to PHN"
            >
              <Icon icon="solar:upload-minimalistic-bold" width={20} />
              Upload External Records
            </button>
          )}
        </div>
      ) : (
        (filter === "scan" || filter === "lab") && (
          <div className="sticky top-0 z-10 flex justify-center items-center px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-100 rounded-t-xl">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-[#14bef0] hover:bg-[#0ba7d6] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
              title="Upload outside lab and scan data to PHN"
            >
              <Icon icon="solar:upload-minimalistic-bold" width={20} />
              Upload External Records
            </button>
          </div>
        )
      )}

      <div
        className="flex-1 w-full flex flex-col min-h-0"
      >
        {filter === "prescription" && prescriptionStats && (
          <div className={`${isNested ? "" : "px-4 md:px-8 pt-6"} grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500`}>
            {prescriptionStats.map((stat, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow group"
              >
                <div
                  className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <Icon icon={stat.icon} width="28" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">
                    {stat.label}
                  </h4>
                  {stat.isList ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {stat.value.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p
                      className="text-2xl font-black text-slate-800 line-clamp-1"
                      title={stat.value.toString()}
                    >
                      {stat.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Icon
              icon="solar:spinner-linear"
              className="animate-spin text-[#14bef0] text-4xl"
            />
            <span className="text-slate-400 font-medium">
              Fetching your medical history...
            </span>
          </div>
        ) : currentRecords.length > 0 ? (
          filter === "prescription" ? (
            <div className={`flex-1 overflow-y-auto w-full animate-fade-in-up ${!isNested ? "px-4 md:px-8 pb-8" : ""}`}>
              <PrescriptionsView
                records={currentRecords}
                selectedClinic={selectedClinic}
                setSelectedRecord={setSelectedRecord}
                setSelectedReportNotes={setSelectedReportNotes}
              />
            </div>
          ) : (
            <div className={`overflow-auto flex-1 ${!isNested ? "px-4 md:px-8 pb-8" : ""}`}>
              {filter === "out-of-network-data" ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {renderTableRows(currentRecords)}
                </div>
              ) : (
                <div className="flex flex-col rounded-xl shadow-sm">
                  {renderMasterAccordion(
                    "Clinic in Network",
                    internalRecords,
                    internalOpen,
                    () => setInternalOpen(!internalOpen),
                    "solar:hospital-bold-duotone",
                    "text-blue-500",
                    "bg-blue-50",
                    { isFirst: true, isLast: externalRecords.length === 0 },
                  )}
                  {renderMasterAccordion(
                    "Out of network clinics",
                    externalRecords,
                    externalOpen,
                    () => setExternalOpen(!externalOpen),
                    "solar:folder-with-files-bold-duotone",
                    "text-amber-500",
                    "bg-amber-50",
                    { isFirst: internalRecords.length === 0, isLast: true },
                  )}
                </div>
              )}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <Icon icon="solar:folder-error-bold-duotone" width={48} />
            </div>
            <div className="text-center">
              <h3 className="text-slate-800 font-bold text-lg">
                No records found
              </h3>
              <p className="text-slate-400 text-sm font-medium">
                Your medical records and prescriptions will appear here.
              </p>
            </div>
          </div>
        )}
      </div>

      <UploadRecordsModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        patientId={patientId}
        selectedClinic={selectedClinic}
        availableClinics={clinicIdResolvedData}
      />

      {/* AI Report View Modal */}
      <AIReportModal
        selectedReportNotes={selectedReportNotes}
        onClose={() => setSelectedReportNotes(null)}
      />
    </div>
  );
};
