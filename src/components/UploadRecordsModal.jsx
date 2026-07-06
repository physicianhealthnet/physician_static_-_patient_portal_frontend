import React, { useState, useRef } from "react";
import { AxiosInstanceDependency } from "../utilities/AxiosInstance";
import { Icon } from "@iconify/react";

export const UploadRecordsModal = ({ isOpen, onClose, patientId: propPatientId, selectedClinic, availableClinics }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [file, setFile] = useState(null);
  const [recordName, setRecordName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const patientId = propPatientId || user?._id || user?.id || "";

  if (!isOpen) return null;

  const recordTypes = [
    { id: "scan", label: "Scan Report", icon: "solar:scanner-bold-duotone" },
    { id: "lab", label: "Lab Report", icon: "solar:test-tube-bold-duotone" },
  ];

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !recordName || !patientId) {
      alert("Please provide a file, record name, and ensure you are logged in.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("patientId", patientId);
      formData.append("documentName", recordName);
      formData.append("clinicName", clinicName);
      formData.append("doctorName", doctorName);
      formData.append("recordDate", recordDate);
      formData.append("documentType", selectedType || "");
      formData.append("documentFile", file);

      await AxiosInstanceDependency.post(`/patientdocuments/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Record uploaded successfully!");
      onClose();
    } catch (error) {
      console.error("Error uploading record:", error);
      alert(error.response?.data?.message || "Failed to upload record");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#00000080] z-[100] flex items-center justify-center font-sans">
      <div className="bg-white rounded-[4px] shadow-xl w-full max-w-[550px] flex flex-row overflow-hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[50%]">
        {/* Left Side: Upload Area */}
        <div className="w-[140px] bg-[#f7f7f7] border-r border-[#ececec] flex flex-col items-center pt-8 px-4 relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.dcm"
          />
          <div
            onClick={handleFileClick}
            className="w-[80px] h-[80px] bg-[#828c9b] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#14bef0] transition-colors text-white shadow-sm mb-4"
          >
            {file ? (
              <Icon icon="solar:document-bold" width="32" height="32" />
            ) : (
              <Icon icon="solar:upload-minimalistic-bold" width="32" height="32" />
            )}
          </div>
          <span className="text-[11px] font-bold text-center text-slate-500 uppercase tracking-widest leading-relaxed">
            {file ? "File Selected" : "Upload External File"}
          </span>
          <span className="text-[9px] text-slate-400 mt-2 text-center text-wrap break-all px-1">
            {file ? file.name : "PDF, JPG, PNG, DCM"}
          </span>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 flex flex-col">
          <h2 className="text-xl font-black text-slate-800 mb-6 tracking-tight">Record Details</h2>
          
          {/* Record Name Input */}
          <div className="mb-5">
            <label className="block text-slate-500 text-[10px] font-black mb-1.5 uppercase tracking-widest">Record Name</label>
            <input
              type="text"
              value={recordName}
              onChange={(e) => setRecordName(e.target.value)}
              placeholder="e.g., MRI Brain or Blood Test"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 focus:outline-none focus:border-[#14bef0] focus:ring-2 focus:ring-[#14bef0]/20 placeholder-slate-300 transition-all font-medium"
            />
          </div>

          {/* Clinic & Doctor Inputs */}
          <div className="flex flex-row gap-4 mb-5">
            <div className="flex-1">
              <label className="block text-slate-500 text-[10px] font-black mb-1.5 uppercase tracking-widest">Clinic / Hospital</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="e.g., PHN Clinic"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 focus:outline-none focus:border-[#14bef0] focus:ring-2 focus:ring-[#14bef0]/20 placeholder-slate-300 transition-all font-medium"
              />
            </div>
            <div className="flex-1">
              <label className="block text-slate-500 text-[10px] font-black mb-1.5 uppercase tracking-widest">Doctor Name</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g., Dr. Deepak"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 focus:outline-none focus:border-[#14bef0] focus:ring-2 focus:ring-[#14bef0]/20 placeholder-slate-300 transition-all font-medium"
              />
            </div>
          </div>

          {/* Date */}
          <div className="mb-6 w-1/2 pr-2">
              <label className="block text-slate-500 text-[10px] font-black mb-1.5 uppercase tracking-widest">Created Date</label>
              <input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 focus:outline-none focus:border-[#14bef0] focus:ring-2 focus:ring-[#14bef0]/20 transition-all font-medium"
              />
          </div>

          {/* Type of Record Section */}
          <div className="mb-8">
            <label className="block text-slate-500 text-[10px] font-black mb-2.5 uppercase tracking-widest">Type</label>
            <div className="flex flex-row gap-3 justify-start">
              {recordTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 w-[110px] transition-all
                                        ${selectedType === type.id ? "border-[#14bef0] bg-[#f0fbff] text-[#14bef0]" : "border-slate-100 bg-white text-slate-500 hover:border-[#14bef0]/50 hover:text-[#14bef0]"}`}
                >
                  <Icon icon={type.icon} width="28" height="28" />
                  <span
                    className={`text-[12px] ${selectedType === type.id ? "font-bold" : "font-semibold"}`}
                  >
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-row justify-end gap-3 mt-auto border-t border-slate-100 pt-5">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-6 py-2 rounded-xl bg-slate-100 text-slate-500 text-[14px] font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-6 py-2 rounded-xl bg-[#14bef0] text-white text-[14px] font-bold hover:bg-[#0ba7d6] shadow-md shadow-cyan-100 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 min-w-[90px]"
            >
              {isUploading ? (
                <Icon icon="line-md:loading-twotone-loop" width="20" height="20" />
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
