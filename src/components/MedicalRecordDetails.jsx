import React, { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import FileViewerModal from "./FileViewerModal";
import { useReactToPrint } from "react-to-print";

import dayjs from "dayjs";

export const MedicalRecordDetails = ({ record, onBack, onAddMore }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const billRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: billRef,
    documentTitle: `${record?.treatmentBillId || "invoice"}`,
  });

  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  
  const getRecordTitle = (record) => {
    return record.scanType || record.labType || record.documentName || (record._type === 'prescription' ? 'Active prescriptions' : 'Medical Record');
  };

  const getRecordSubtitle = (record) => {
    if (record._type === 'prescription') {
      const count = record.medicinesData?.length || 0;
      return `${count} Medicine${count !== 1 ? 's' : ''} prescribed • AI report`;
    }
    if (record._type === 'scan') return `${record.scanCenter || 'Internal'} Scan • ${record.priority || 'Normal'} Priority`;
    if (record._type === 'lab') return `Lab report • Blood Test • AI report`;
    return record.category || 'General Document';
  };

  // Handle both dummy files and real API response fields
  const files = record?.files || [];
  
  // If it's a real record from API, it might have these fields instead of a files array
  if (record.finalReportFileUrls && record.finalReportFileUrls.length > 0) {
    record.finalReportFileUrls.forEach((rawUrl, index) => {
      const formattedPath = rawUrl.replace(/^\/upload\//, '/uploads/');
      const isLocal = window?.location?.hostname === "localhost" || window?.location?.hostname === "127.0.0.1";
      const baseUrl = isLocal 
        ? (record._subdomain === 'demo2' ? 'http://localhost:4026' : 'http://localhost:3026') 
        : `https://${record._subdomain || 'demo'}.physicianhealthnet.com/api`;
      const url = formattedPath.startsWith('http') ? formattedPath : `${baseUrl}${formattedPath}`;
      
      files.push({
        id: `${record._id}-${index}`,
        type: `${record.scanType || record.labType || record.documentName || "Medical Report"} ${index + 1}`,
        image: url,
        isNew: false
      });
    });
  } else if (record.finalReportFileUrl || record.fileUrl || record.documentPath) {
    const rawUrl = record.finalReportFileUrl || record.fileUrl || record.documentPath;
    const formattedPath = rawUrl.replace(/^\/upload\//, '/uploads/');
    const isLocal = window?.location?.hostname === "localhost" || window?.location?.hostname === "127.0.0.1";
    const baseUrl = isLocal 
      ? (record._subdomain === 'demo2' ? 'http://localhost:4026' : 'http://localhost:3026') 
      : `https://${record._subdomain || 'demo'}.physicianhealthnet.com/api`;
    const url = formattedPath.startsWith('http') ? formattedPath : `${baseUrl}${formattedPath}`;
    
    files.push({
      id: record._id,
      type: record.scanType || record.labType || record.documentName || "Medical Report",
      image: url,
      isNew: false
    });
  }

  const date = dayjs(record.createdAt);

  return (
    <div className="w-full flex flex-col bg-[#f8f9fc] min-h-screen">
      {/* Top Navigation Bar for Inner View */}
      <div className="flex flex-row justify-between p-6 border-b border-slate-200/60 bg-white sticky top-0 z-20 backdrop-blur-md bg-white/80">
        {/* Left Side: Back button and details */}
        <div className="flex flex-row items-center gap-5">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-[#14bef0] transition-all p-2.5 rounded-2xl bg-slate-50 hover:bg-[#14bef0]/10 flex items-center justify-center border border-slate-100 active:scale-95"
          >
            <Icon icon="solar:alt-arrow-left-linear" width="24" height="24" />
          </button>

          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">
              {date.format('DD MMMM, YYYY')}
            </span>
            <h2 className="text-slate-800 font-black text-xl leading-tight tracking-tight">
              {getRecordTitle(record)}
            </h2>
            <span className="text-slate-500 text-sm font-medium">
              {getRecordSubtitle(record)}
            </span>
          </div>
        </div>

        {/* Right Side: Add More button and Context Menu */}
        <div className="flex flex-row items-center gap-4">
          <button
            onClick={onAddMore}
            className="bg-[#14bef0] hover:bg-[#0ba7d6] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-100 active:scale-95 flex items-center gap-2"
          >
            <Icon icon="solar:add-circle-bold" width={20} />
            Add more records
          </button>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-400 hover:text-slate-800 transition-colors p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100"
            >
              <Icon icon="solar:menu-dots-bold" width="24" height="24" />
            </button>

            {/* Dropdown Menu - Edit details */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 animate-fade-in">
                  <button
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon icon="solar:pen-new-square-bold-duotone" className="text-slate-400" width={18} />
                    Edit details
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 text-sm text-red-500 font-medium hover:bg-red-50 transition-colors flex items-center gap-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon icon="solar:trash-bin-trash-bold-duotone" width={18} />
                    Delete record
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Prescription details if it's a prescription */}
      {record._type === 'prescription' && record.medicinesData?.length > 0 && (
        <div className="p-6 max-w-7xl mx-auto w-full">
           <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-slate-800 font-black text-lg mb-6 flex items-center gap-2">
                <Icon icon="solar:pill-bold-duotone" className="text-emerald-500" />
                Medication Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {record.medicinesData.map((med, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
                    <span className="font-bold text-slate-800">{med.medication}</span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-600 font-bold">
                        {med.morning}-{med.afternoon}-{med.night}
                      </span>
                      <span className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-600 font-bold">
                        {med.dosage} Unit
                      </span>
                      <span className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-600 font-bold uppercase">
                        {med.af_bf}
                      </span>
                      <span className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-600 font-bold">
                        {med.days} Days
                      </span>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* Bill details if it's a bill */}
      {record._type === 'bill' && record.treatments?.length > 0 && (
        <div className="p-6 max-w-7xl mx-auto w-full">
           <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden" ref={billRef}>
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-slate-800 font-black text-lg flex items-center gap-2">
                  <Icon icon="solar:bill-list-bold-duotone" className="text-orange-500" />
                  Invoice Breakdown
                </h3>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors border border-orange-100"
                >
                  <Icon icon="solar:download-square-bold-duotone" />
                  Download PDF
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50">
                    <tr className="border-b border-slate-100">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Treatment</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {record.treatments.map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <span className="text-sm font-bold text-slate-800">{t.name}</span>
                          {t.notes && <span className="block text-xs font-medium text-slate-500 mt-1">{t.notes}</span>}
                        </td>
                        <td className="px-8 py-4 text-center">
                          <span className="text-sm font-bold text-slate-600">{t.quantity}</span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <span className="text-sm font-medium text-slate-500">₹{t.price}</span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <span className="text-sm font-bold text-slate-800">₹{t.total}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50/50 p-8 flex flex-col md:flex-row justify-between items-end gap-6 border-t border-slate-100">
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Payment Mode</span>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 w-max">
                    <Icon icon="solar:card-2-bold-duotone" className="text-blue-500" />
                    <span className="text-sm font-bold text-slate-700 capitalize">{record.modeOfPayment || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-64">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500">Subtotal</span>
                    <span className="font-black text-slate-800">₹{record.totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500">Discount</span>
                    <span className="font-black text-emerald-600">-₹{record.discount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg pt-3 border-t border-slate-200">
                    <span className="font-black text-slate-800">Grand Total</span>
                    <span className="font-black text-[#14bef0]">₹{record.grandTotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-3">
                    <span className="font-bold text-slate-500">Amount Paid</span>
                    <span className="font-black text-slate-800">₹{record.amountReceived || record.paidAmount || 0}</span>
                  </div>
                  {(record.balanceAmount > 0) && (
                    <div className="flex justify-between items-center text-sm py-2 px-3 mt-2 bg-rose-50 rounded-lg border border-rose-100">
                      <span className="font-black text-rose-600 uppercase text-[10px] tracking-widest">Balance Due</span>
                      <span className="font-black text-rose-600">₹{record.balanceAmount}</span>
                    </div>
                  )}
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Grid Container for Files */}
      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <div
              key={file.id}
              className="group bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-row items-center justify-between p-5 border-b border-slate-50">
                <div className="flex flex-row items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                    <Icon icon="solar:document-bold-duotone" width={20} />
                  </div>
                  <span className="text-slate-800 font-bold text-sm truncate max-w-[150px]">
                    {file.type}
                  </span>
                  {file.isNew && (
                    <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      New
                    </span>
                  )}
                </div>
                <button className="text-slate-300 hover:text-slate-600 transition-colors">
                  <Icon icon="solar:menu-dots-bold" width={20} height={20} />
                </button>
              </div>

              {/* Card Body (Image Thumbnail Area) */}
              <div className="bg-slate-50 h-[240px] flex items-center justify-center p-8 relative group/btn">
                {file.image ? (
                  <>
                    <div className="absolute inset-0 bg-slate-900/0 group-hover/btn:bg-slate-900/5 transition-colors duration-300"></div>
                    <button 
                      onClick={() => setPreviewUrl(file.image)}
                      className="relative z-10 flex items-center gap-2 bg-white text-[#14bef0] font-black px-6 py-3 rounded-2xl shadow-xl shadow-slate-200/50 hover:scale-105 transition-all border border-slate-100"
                    >
                       <Icon icon="solar:eye-bold-duotone" width={20} />
                       View Report
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#14bef0] animate-spin"></div>
                    <span className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">{file.status || 'Processing'}</span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="bg-white p-4 border-t border-slate-50"></div>
            </div>
          ))}
        </div>
      </div>

      {/* File Viewer Modal */}
      {previewUrl && (
        <FileViewerModal 
          fileUrl={previewUrl} 
          onClose={() => setPreviewUrl(null)} 
        />
      )}
    </div>
  );
};
