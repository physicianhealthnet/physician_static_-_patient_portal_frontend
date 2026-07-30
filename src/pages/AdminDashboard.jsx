import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { AxiosInstanceDependency } from "../utilities/AxiosInstance";
import SEO from "../components/SEO";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("clinics"); // "clinics" | "roster"
  const [clinics, setClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);

  // New Clinic Form states
  const [showAddClinicModal, setShowAddClinicModal] = useState(false);
  const [clinicForm, setClinicForm] = useState({
    clinicName: "",
    phno: "",
    address: "",
    subdomainName: "",
    email: "",
    doctorName: "",
  });
  const [clinicFormDoctors, setClinicFormDoctors] = useState([
    { name: "", department: "General", email: "", phone: "", password: "password123" }
  ]);
  const [clinicFormStaffs, setClinicFormStaffs] = useState([]);

  // Roster Tab edit states
  const [rosterDoctors, setRosterDoctors] = useState([]);
  const [rosterStaffs, setRosterStaffs] = useState([]);
  const [updatingRoster, setUpdatingRoster] = useState(false);

  // Enable/Approve Modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveClinicId, setApproveClinicId] = useState("");
  const [baseUri, setBaseUri] = useState("http://localhost:3026");
  const [approving, setApproving] = useState(false);

  const [notification, setNotification] = useState(null);

  // Authentication check
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const admin = sessionStorage.getItem("adminUser");
    if (!token || !admin) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchClinics = async () => {
    setLoadingClinics(true);
    try {
      const res = await AxiosInstanceDependency.get("clinic-registration/get-all-req");
      setClinics(res.data.data || []);
    } catch (err) {
      console.error("Error fetching clinics:", err);
      showNotification("Failed to retrieve clinics list.", "error");
    } finally {
      setLoadingClinics(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  // Add Clinic Request Submit
  const handleAddClinic = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...clinicForm,
        doctors: clinicFormDoctors.filter(d => d.name.trim() !== ""),
        staffs: clinicFormStaffs.filter(s => s.name.trim() !== ""),
      };

      if (payload.doctors.length === 0) {
        showNotification("At least one primary doctor is required to register a clinic.", "error");
        return;
      }

      await AxiosInstanceDependency.post("clinic-registration/create", payload);
      showNotification("Clinic registered and doctors initialized successfully!");
      setShowAddClinicModal(false);
      
      // Reset form
      setClinicForm({
        clinicName: "",
        phno: "",
        address: "",
        subdomainName: "",
        email: "",
        doctorName: "",
      });
      setClinicFormDoctors([{ name: "", department: "General", email: "", phone: "", password: "password123" }]);
      setClinicFormStaffs([]);
      
      fetchClinics();
    } catch (err) {
      console.error("Add Clinic Error:", err);
      showNotification(err.response?.data?.message || "Failed to register clinic.", "error");
    }
  };

  // Enable/Approve Clinic
  const handleApproveClinic = async () => {
    setApproving(true);
    try {
      await AxiosInstanceDependency.patch(`clinic-registration/clinic-enable/${approveClinicId}`, {
        baseuri: baseUri,
      });
      showNotification("Clinic approved and enabled successfully! System IDs generated.");
      setShowApproveModal(false);
      fetchClinics();
    } catch (err) {
      console.error("Approve Clinic Error:", err);
      showNotification(err.response?.data?.message || "Failed to enable clinic.", "error");
    } finally {
      setApproving(false);
    }
  };

  // Load clinic roster for selected clinic
  const handleSelectClinicRoster = (clinic) => {
    setSelectedClinic(clinic);
    setRosterDoctors(clinic.doctors || []);
    setRosterStaffs(clinic.staffs || []);
    setActiveTab("roster");
  };

  // Update Roster
  const handleUpdateRoster = async () => {
    if (!selectedClinic) return;
    setUpdatingRoster(true);
    try {
      const payload = {
        clinicName: selectedClinic.clinicName,
        doctorName: selectedClinic.doctorName || (rosterDoctors[0]?.name || ""),
        subdomainName: selectedClinic.subdomainName,
        phno: selectedClinic.phno,
        address: selectedClinic.address,
        doctors: rosterDoctors.filter(d => d.name.trim() !== ""),
        staffs: rosterStaffs.filter(s => s.name.trim() !== ""),
      };

      const res = await AxiosInstanceDependency.put(
        `clinic-registration/update/${selectedClinic._id}`,
        payload
      );

      showNotification("Roster updated successfully! New credentials and IDs synchronized.");
      
      // Update selected clinic object in list
      setClinics(prev => prev.map(c => c._id === selectedClinic._id ? res.data.data : c));
      setSelectedClinic(res.data.data);
      setRosterDoctors(res.data.data.doctors || []);
      setRosterStaffs(res.data.data.staffs || []);
    } catch (err) {
      console.error("Roster update error:", err);
      showNotification("Failed to update clinic roster.", "error");
    } finally {
      setUpdatingRoster(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-700 font-sans pb-16">
      <SEO title="System Admin Dashboard | Physician Health Net" />

      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-50 text-[#28328c] rounded-xl flex items-center justify-center border border-blue-100 shadow-inner">
              <Icon icon="solar:shield-network-bold-duotone" className="text-2xl" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">
                PHN Administration
              </h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                Centralized Clinic Console
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Icon icon="solar:logout-linear" className="text-base" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        {notification && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 shadow-xs animate-in fade-in slide-in-from-top-4 duration-300 ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <Icon
              icon={notification.type === "success" ? "solar:check-circle-bold-duotone" : "solar:danger-bold-duotone"}
              className="text-2xl shrink-0"
            />
            <span className="text-sm font-bold">{notification.message}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab("clinics")}
            className={`pb-4 px-4 text-sm font-black uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "clinics"
                ? "text-[#28328c] border-[#28328c]"
                : "text-slate-400 border-transparent hover:text-slate-600"
            }`}
          >
            Manage Clinics
          </button>
          <button
            onClick={() => {
              if (!selectedClinic && clinics.length > 0) {
                handleSelectClinicRoster(clinics[0]);
              } else {
                setActiveTab("roster");
              }
            }}
            className={`pb-4 px-4 text-sm font-black uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "roster"
                ? "text-[#28328c] border-[#28328c]"
                : "text-slate-400 border-transparent hover:text-slate-600"
            }`}
          >
            Clinic Rosters
          </button>
        </div>

        {/* Tab 1: Clinics Management */}
        {activeTab === "clinics" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Registered Clinics</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Review, register, or approve clinic networks</p>
              </div>
              <button
                onClick={() => setShowAddClinicModal(true)}
                className="flex items-center gap-2 px-6 py-3.5 bg-[#28328c] hover:bg-blue-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-blue-900/10"
              >
                <Icon icon="solar:add-circle-bold" className="text-lg" />
                Register New Clinic
              </button>
            </div>

            {/* Clinics Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinic ID / Name</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subdomain</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Roster Size</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {loadingClinics ? (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-slate-400">
                          <Icon icon="solar:spinner-linear" className="animate-spin text-3xl mx-auto mb-2 text-blue-500" />
                          <span className="text-xs font-bold uppercase tracking-wider">Fetching clinical registries...</span>
                        </td>
                      </tr>
                    ) : clinics.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-slate-400">
                          No clinics registered yet.
                        </td>
                      </tr>
                    ) : (
                      clinics.map((clinic) => (
                        <tr key={clinic._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{clinic.clinicName}</div>
                            <div className="text-[10px] text-[#14bef0] font-black tracking-wider uppercase mt-1">
                              {clinic.cid || "PENDING APPROVAL"}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                            {clinic.subdomainName}.physicianhealthnet.com
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-600 font-medium">{clinic.phno}</div>
                            <div className="text-xs text-slate-400">{clinic.address}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-3 text-xs font-bold">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
                                {clinic.doctors?.length || 0} Doctors
                              </span>
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                                {clinic.staffs?.length || 0} Staff
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                                clinic.status === "enabled"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : "bg-amber-50 text-amber-600 border border-amber-200"
                              }`}
                            >
                              {clinic.status || "pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {clinic.status !== "enabled" && (
                                <button
                                  onClick={() => {
                                    setApproveClinicId(clinic._id);
                                    setShowApproveModal(true);
                                  }}
                                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                  title="Approve Clinic"
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => handleSelectClinicRoster(clinic)}
                                className="px-3 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                title="Manage Roster"
                              >
                                Manage Roster
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Roster Management */}
        {activeTab === "roster" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Roster Console</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Manage doctor credentials and staff details</p>
              </div>

              {/* Clinic Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Clinic:</span>
                <select
                  value={selectedClinic?._id || ""}
                  onChange={(e) => {
                    const c = clinics.find(cl => cl._id === e.target.value);
                    if (c) handleSelectClinicRoster(c);
                  }}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="" disabled>Select a clinic...</option>
                  {clinics.map(c => (
                    <option key={c._id} value={c._id}>{c.clinicName} ({c.cid || "Pending"})</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedClinic ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Doctors List */}
                <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-black text-[#28328c] uppercase tracking-wider text-xs">Medical Officers (Doctors)</h3>
                    <button
                      onClick={() =>
                        setRosterDoctors([
                          ...rosterDoctors,
                          { name: "", department: "General", email: "", phone: "", password: "password123" },
                        ])
                      }
                      className="text-xs font-bold text-[#14bef0] flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <Icon icon="solar:add-circle-linear" className="text-base" /> Add Doctor
                    </button>
                  </div>

                  <div className="space-y-4">
                    {rosterDoctors.map((doc, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                            {doc.id || "NEW DOCTOR"}
                          </span>
                          <button
                            onClick={() => setRosterDoctors(rosterDoctors.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Icon icon="solar:trash-bin-trash-linear" className="text-lg" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Doctor Name</label>
                            <input
                              type="text"
                              value={doc.name}
                              onChange={(e) => {
                                const copy = [...rosterDoctors];
                                copy[idx].name = e.target.value;
                                setRosterDoctors(copy);
                              }}
                              placeholder="Dr. John"
                              className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Department</label>
                            <input
                              type="text"
                              value={doc.department}
                              onChange={(e) => {
                                const copy = [...rosterDoctors];
                                copy[idx].department = e.target.value;
                                setRosterDoctors(copy);
                              }}
                              placeholder="Dentist"
                              className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Email</label>
                            <input
                              type="email"
                              value={doc.email}
                              onChange={(e) => {
                                const copy = [...rosterDoctors];
                                copy[idx].email = e.target.value;
                                setRosterDoctors(copy);
                              }}
                              placeholder="doc@clinic.com"
                              className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Phone</label>
                            <input
                              type="text"
                              value={doc.phone || ""}
                              onChange={(e) => {
                                const copy = [...rosterDoctors];
                                copy[idx].phone = e.target.value;
                                setRosterDoctors(copy);
                              }}
                              placeholder="9876543210"
                              className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Staffs List */}
                <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-black text-[#28328c] uppercase tracking-wider text-xs">Clinic Staffs (Receptionists, GM etc.)</h3>
                    <button
                      onClick={() =>
                        setRosterStaffs([
                          ...rosterStaffs,
                          { name: "", role: "Receptionist", email: "", phone: "", password: "password123" },
                        ])
                      }
                      className="text-xs font-bold text-[#14bef0] flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <Icon icon="solar:add-circle-linear" className="text-base" /> Add Staff
                    </button>
                  </div>

                  <div className="space-y-4">
                    {rosterStaffs.map((staff, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-600 bg-slate-200 px-2.5 py-1 rounded-lg">
                            {staff.id || "NEW STAFF"}
                          </span>
                          <button
                            onClick={() => setRosterStaffs(rosterStaffs.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Icon icon="solar:trash-bin-trash-linear" className="text-lg" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Staff Name</label>
                            <input
                              type="text"
                              value={staff.name}
                              onChange={(e) => {
                                const copy = [...rosterStaffs];
                                copy[idx].name = e.target.value;
                                setRosterStaffs(copy);
                              }}
                              placeholder="Alice"
                              className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Role</label>
                            <select
                              value={staff.role}
                              onChange={(e) => {
                                const copy = [...rosterStaffs];
                                copy[idx].role = e.target.value;
                                setRosterStaffs(copy);
                              }}
                              className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                            >
                              <option value="receptionist">Receptionist</option>
                              <option value="accountant">Accountant</option>
                              <option value="generalManager">General Manager</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Email</label>
                            <input
                              type="email"
                              value={staff.email || ""}
                              onChange={(e) => {
                                const copy = [...rosterStaffs];
                                copy[idx].email = e.target.value;
                                setRosterStaffs(copy);
                              }}
                              placeholder="staff@clinic.com"
                              className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Phone</label>
                            <input
                              type="text"
                              value={staff.phone || ""}
                              onChange={(e) => {
                                const copy = [...rosterStaffs];
                                copy[idx].phone = e.target.value;
                                setRosterStaffs(copy);
                              }}
                              placeholder="9876543211"
                              className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Save Button */}
                <div className="lg:col-span-12 flex justify-end">
                  <button
                    onClick={handleUpdateRoster}
                    disabled={updatingRoster}
                    className="px-8 py-3.5 bg-[#28328c] hover:bg-blue-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {updatingRoster ? (
                      <Icon icon="solar:spinner-linear" className="animate-spin text-lg" />
                    ) : (
                      "Save & Sync Roster Changes"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl text-slate-400 shadow-xs">
                Select a clinic to manage its doctor and staff rosters.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Clinic Modal */}
      {showAddClinicModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <h2 className="text-xl font-black text-[#28328c] tracking-tight">Register New Clinic Request</h2>
              <button onClick={() => setShowAddClinicModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <Icon icon="solar:close-square-linear" className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleAddClinic} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clinic Name</label>
                  <input
                    type="text"
                    required
                    value={clinicForm.clinicName}
                    onChange={(e) => setClinicForm({ ...clinicForm, clinicName: e.target.value })}
                    placeholder="PHN Dental Clinic"
                    className="w-full mt-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Subdomain Name</label>
                  <div className="flex items-center mt-1">
                    <input
                      type="text"
                      required
                      value={clinicForm.subdomainName}
                      onChange={(e) => setClinicForm({ ...clinicForm, subdomainName: e.target.value })}
                      placeholder="phndental"
                      className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-l-2xl text-sm font-bold outline-none"
                    />
                    <span className="px-3 py-3.5 bg-slate-100 border border-l-0 border-slate-200 rounded-r-2xl text-xs font-bold text-slate-500">
                      .phn.com
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clinic Phone</label>
                  <input
                    type="text"
                    required
                    value={clinicForm.phno}
                    onChange={(e) => setClinicForm({ ...clinicForm, phno: e.target.value })}
                    placeholder="9876543210"
                    className="w-full mt-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clinic Email</label>
                  <input
                    type="email"
                    required
                    value={clinicForm.email}
                    onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                    placeholder="contact@phndental.com"
                    className="w-full mt-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Address</label>
                  <input
                    type="text"
                    required
                    value={clinicForm.address}
                    onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                    placeholder="123 Health Street, City"
                    className="w-full mt-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                  />
                </div>
              </div>

              {/* Roster initialization */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-[#28328c] uppercase tracking-wider text-[10px]">Add Primary Doctors</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setClinicFormDoctors([
                        ...clinicFormDoctors,
                        { name: "", department: "General", email: "", phone: "", password: "password123" },
                      ])
                    }
                    className="text-xs font-bold text-[#14bef0] flex items-center gap-1 cursor-pointer"
                  >
                    <Icon icon="solar:add-circle-linear" className="text-base" /> Add Another Doctor
                  </button>
                </div>

                {clinicFormDoctors.map((doc, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Doctor #{idx + 1}</span>
                      {clinicFormDoctors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setClinicFormDoctors(clinicFormDoctors.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Icon icon="solar:trash-bin-trash-linear" className="text-lg" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Doctor Name</label>
                        <input
                          type="text"
                          required
                          value={doc.name}
                          onChange={(e) => {
                            const copy = [...clinicFormDoctors];
                            copy[idx].name = e.target.value;
                            setClinicFormDoctors(copy);
                          }}
                          placeholder="Dr. John"
                          className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Department</label>
                        <input
                          type="text"
                          required
                          value={doc.department}
                          onChange={(e) => {
                            const copy = [...clinicFormDoctors];
                            copy[idx].department = e.target.value;
                            setClinicFormDoctors(copy);
                          }}
                          placeholder="General"
                          className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Email</label>
                        <input
                          type="email"
                          required
                          value={doc.email}
                          onChange={(e) => {
                            const copy = [...clinicFormDoctors];
                            copy[idx].email = e.target.value;
                            setClinicFormDoctors(copy);
                          }}
                          placeholder="doc@phn.com"
                          className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Phone</label>
                        <input
                          type="text"
                          required
                          value={doc.phone}
                          onChange={(e) => {
                            const copy = [...clinicFormDoctors];
                            copy[idx].phone = e.target.value;
                            setClinicFormDoctors(copy);
                          }}
                          placeholder="9876543210"
                          className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Staff initialization */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-[#28328c] uppercase tracking-wider text-[10px]">Add Primary Staff</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setClinicFormStaffs([
                        ...clinicFormStaffs,
                        { name: "", role: "receptionist", email: "", phone: "", password: "password123" },
                      ])
                    }
                    className="text-xs font-bold text-[#14bef0] flex items-center gap-1 cursor-pointer"
                  >
                    <Icon icon="solar:add-circle-linear" className="text-base" /> Add Staff Member
                  </button>
                </div>

                {clinicFormStaffs.map((staff, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Staff #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setClinicFormStaffs(clinicFormStaffs.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Icon icon="solar:trash-bin-trash-linear" className="text-lg" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Staff Name</label>
                        <input
                          type="text"
                          required
                          value={staff.name}
                          onChange={(e) => {
                            const copy = [...clinicFormStaffs];
                            copy[idx].name = e.target.value;
                            setClinicFormStaffs(copy);
                          }}
                          placeholder="Staff Name"
                          className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Role</label>
                        <select
                          value={staff.role}
                          onChange={(e) => {
                            const copy = [...clinicFormStaffs];
                            copy[idx].role = e.target.value;
                            setClinicFormStaffs(copy);
                          }}
                          className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                        >
                          <option value="receptionist">Receptionist</option>
                          <option value="accountant">Accountant</option>
                          <option value="generalManager">General Manager</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Email</label>
                        <input
                          type="email"
                          required
                          value={staff.email}
                          onChange={(e) => {
                            const copy = [...clinicFormStaffs];
                            copy[idx].email = e.target.value;
                            setClinicFormStaffs(copy);
                          }}
                          placeholder="staff@phn.com"
                          className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Phone</label>
                        <input
                          type="text"
                          required
                          value={staff.phone}
                          onChange={(e) => {
                            const copy = [...clinicFormStaffs];
                            copy[idx].phone = e.target.value;
                            setClinicFormStaffs(copy);
                          }}
                          placeholder="9876543211"
                          className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddClinicModal(false)}
                  className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#28328c] hover:bg-blue-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
                >
                  Register Clinic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enable/Approve Clinic Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl border border-slate-100 space-y-4">
            <h2 className="text-xl font-black text-[#28328c] tracking-tight">Approve Clinic Request</h2>
            <p className="text-sm text-slate-500 font-medium">
              Approving this clinic request will verify their registration, generate system credentials, and assign them a Clinic ID (`PHN-C-XXXX`).
            </p>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Base API URI</label>
              <input
                type="text"
                value={baseUri}
                onChange={(e) => setBaseUri(e.target.value)}
                placeholder="http://localhost:3026"
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveClinic}
                disabled={approving}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
              >
                {approving ? <Icon icon="solar:spinner-linear" className="animate-spin text-lg" /> : "Verify & Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
