import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useParams } from "react-router-dom";
import { AxiosInstanceSecondryServer } from "../utilities/AxiosInstance";

function UserProfileView({
  setUserProfileEditMode,
  setUserProfileViewMode,
}) {
  const { id } = useParams();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  const handleGetUserData = async () => {
    try {
      const response = await AxiosInstanceSecondryServer.get(`/user/get/${id}`);
      if (response.data && response.data.data) {
        setUserData(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetUserData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Icon icon="svg-spinners:3-dots-fade" className="text-gray-400" width="40" height="40" />
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">

        {/* Header / Cover */}
        <div className="h-32 bg-linear-to-r from-teal-500 to-blue-600 relative">
          <div className="absolute top-4 left-4">
            <button
              onClick={() => setUserProfileViewMode(false)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl font-medium transition-all text-sm"
            >
              <Icon icon="tabler:arrow-left" width="18" />
              Back
            </button>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => {
                setUserProfileEditMode(true);
                setUserProfileViewMode(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl font-medium transition-all text-sm"
            >
              <Icon icon="tabler:edit" width="18" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex flex-col md:flex-row items-end md:items-end gap-4">
            <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-lg">
              <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center text-4xl font-bold text-gray-400">
                {userData.name ? userData.name.charAt(0).toUpperCase() : <Icon icon="tabler:user" />}
              </div>
            </div>

            <div className="flex-1 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{userData.name}</h1>
              <p className="text-gray-500 font-medium">Patient ID: <span className="uppercase">{userData._id?.slice(-6) || "N/A"}</span></p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <InfoItem icon="tabler:mail" label="Email Address" value={userData.email} />
            <InfoItem icon="tabler:phone" label="Phone Number" value={userData.phno} />
            <InfoItem icon="tabler:cake" label="Age" value={userData.age ? `${userData.age} years` : "Not set"} />
            <InfoItem icon="tabler:gender-male-female" label="Gender" value={userData.gender} capitalize />

            <div className="md:col-span-2">
              <InfoItem icon="tabler:map-pin" label="Address" value={userData.address} />
            </div>
          </div>

          {userData.isVerified && (
            <div className="mt-8 p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3 text-green-700">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon icon="mdi:check-decagram" width="24" />
              </div>
              <div>
                <p className="font-bold">Verified Member</p>
                <p className="text-sm opacity-80">This account is verified via Physician Health Net.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, capitalize }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
        <Icon icon={icon} width="20" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-gray-900 font-medium ${capitalize ? 'capitalize' : ''}`}>{value || "—"}</p>
      </div>
    </div>
  )
}

export default UserProfileView;
