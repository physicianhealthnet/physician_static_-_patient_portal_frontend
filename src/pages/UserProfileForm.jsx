import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useParams } from "react-router-dom";
import { AxiosInstanceSecondryServer } from "../utilities/AxiosInstance";

function UserProfileForm({
  setUserProfileEditMode,
  userProfileEditMode,
  setUserProfileViewMode,
  userProfileViewMode,
}) {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phno: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const res = await AxiosInstanceSecondryServer.get(`/user/get/${id}`);
        if (res.data && res.data.data) {
          const d = res.data.data;
          setFormData({
            name: d.name || "",
            age: d.age || "",
            gender: d.gender || "",
            phno: d.phno || "",
            email: d.email || "",
            address: d.address || "",
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (userProfileEditMode) {
        e.preventDefault();
        e.returnValue = '';
        return 'Are you sure you want to leave? Unsaved changes may be lost!';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userProfileEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AxiosInstanceSecondryServer.put(`/user/update/${id}`, formData);
      if (res.status === 200) {
        alert("Profile updated successfully!");
        setUserProfileEditMode(false);
        setUserProfileViewMode(true);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
            <p className="text-gray-500 text-sm">Update your personal information</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setUserProfileEditMode(false);
              setUserProfileViewMode(true);
            }}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <Icon icon="tabler:x" width="24" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput name="name" label="Full Name" value={formData.name} onChange={handleChange} icon="tabler:user" />
            <FormInput name="phno" label="Phone Number" value={formData.phno} onChange={handleChange} icon="tabler:phone" type="tel" />

            <FormInput name="email" label="Email Address" value={formData.email} onChange={handleChange} icon="tabler:mail" type="email" />
            <FormInput name="age" label="Age" value={formData.age} onChange={handleChange} icon="tabler:cake" type="number" />

            <div className="col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
              <div className="relative">
                <Icon icon="tabler:gender-male-female" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="20" />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-700 font-medium appearance-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <Icon icon="tabler:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="20" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Address</label>
            <div className="relative">
              <Icon icon="tabler:map-pin" className="absolute left-4 top-3.5 text-gray-400" width="20" />
              <textarea
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-700 font-medium resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setUserProfileEditMode(false);
                setUserProfileViewMode(true);
              }}
              className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {loading && <Icon icon="svg-spinners:ring-resize" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormInput({ label, icon, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
          <Icon icon={icon} width="20" height="20" />
        </div>
        <input
          {...props}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-700 font-medium placeholder:text-gray-400"
        />
      </div>
    </div>
  )
}

export default UserProfileForm;