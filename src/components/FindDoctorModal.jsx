import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import doctorsDataJson from "../data/doctorsData.json";

export default function FindDoctorModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("General Physician");
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    if (doctorsDataJson) {
      const dynamicLocations = Array.from(
        new Set(
          doctorsDataJson
            .map((doc) => doc.address?.split(",").pop()?.trim())
            .filter(Boolean),
        ),
      );
      const baseLocations = ["Coimbatore", "Erode", "Karur", "Namakkal"];
      setLocations(
        Array.from(new Set([...baseLocations, ...dynamicLocations])).sort(),
      );

      const specs = Array.from(
        new Set(
          doctorsDataJson
            .flatMap((doc) => doc.specialization?.split(",") || [])
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      );
      setSpecialties(specs.sort());
    }
  }, []);

  if (!isOpen) return null;

  const handleSearch = () => {
    let query = "/find-clinics?";
    const params = new URLSearchParams();
    if (selectedLocation) params.append("location", selectedLocation);
    if (selectedSpecialty) params.append("specialty", selectedSpecialty);

    navigate(query + params.toString());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeSlideIn_0.3s_ease-out]">
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Icon icon="mdi:user-search" className="text-[#14bef0] text-3xl" />
            Find a Clinic
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 hover:text-gray-600 p-1.5 rounded-full transition-colors"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5 bg-white">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Icon icon="mdi:map-marker" className="text-gray-400 text-lg" />
              Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 outline-none focus:border-[#14bef0] focus:ring-2 focus:ring-[#14bef0]/20 text-gray-700 transition-all font-medium"
            >
              <option value="">Any where in Tamil Nadu</option>
              {locations.map((loc, idx) => (
                <option key={idx} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Icon icon="mdi:stethoscope" className="text-gray-400 text-lg" />
              Specialty
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 outline-none focus:border-[#14bef0] focus:ring-2 focus:ring-[#14bef0]/20 text-gray-700 transition-all font-medium"
            >
              <option value="">Any Specialty</option>
              {specialties.map((spec, idx) => (
                <option key={idx} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-[#14bef0] hover:bg-[#0ba8d6] text-white font-bold py-3.5 rounded-lg shadow-sm transition-colors mt-4 text-[15px]"
          >
            Search Clinics
          </button>
        </div>
      </div>
    </div>
  );
}
