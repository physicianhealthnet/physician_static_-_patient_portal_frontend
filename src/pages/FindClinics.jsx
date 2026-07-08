import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import doctorsDataJson from "../data/doctorsData.json";
import SEO from "../components/SEO";

function FindClinics() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const specialty = searchParams.get("specialty");
  const location = searchParams.get("location");
  const search = searchParams.get("search");

  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);

  useEffect(() => {
    const fetchClinics = async () => {
      setLoading(true);
      try {
        const data = doctorsDataJson || [];

        const filtered = data
          .map((doc) => {
            const docAddress = doc.address?.toLowerCase() || "";
            const clinicName = (doc.clinic_name || "").toLowerCase();
            const doctorName = (doc.doctor_name || "").toLowerCase();
            const docSpec = (doc.specialization || "").toLowerCase();

            const locQuery = (location || "").toLowerCase().trim();
            const searchQuery = (search || "").toLowerCase().trim();
            const specQuery = (specialty || "").toLowerCase().trim();

            const locMatch = locQuery ? docAddress.includes(locQuery) : true;

            const nameMatch = searchQuery
              ? clinicName.includes(searchQuery) ||
                doctorName.includes(searchQuery)
              : false;
            const textSpecMatch = searchQuery
              ? docSpec.includes(searchQuery)
              : false;
            const paramSpecMatch = specQuery
              ? docSpec.includes(specQuery.substring(0, 5)) ||
                specQuery.includes(docSpec.substring(0, 5))
              : false;

            let score = 0;
            const isRelated = searchQuery || specQuery;
            const hasKeywordMatch = isRelated
              ? nameMatch || textSpecMatch || paramSpecMatch
              : true;

            if (!hasKeywordMatch) return null;

            // Scoring for prioritization
            // Tier 1: Accurate (Name match or Parameter Specialty) + Location match
            if ((nameMatch || paramSpecMatch) && locMatch) score = 3;
            // Tier 2: Related (Text matching) + Location match
            else if (locMatch) score = 2;
            // Tier 3: Match but different location
            else score = 1;

            return { ...doc, searchScore: score };
          })
          .filter(Boolean)
          .sort((a, b) => b.searchScore - a.searchScore);

        // group by clinicId
        const grouped = Object.values(
          filtered.reduce((acc, doc) => {
            const cId = doc.cid;
            if (!acc[cId]) {
              acc[cId] = {
                clinicId: cId,
                clinicName: doc.clinic_name,
                clinicAddress: doc.address,
                clinicImage: doc.clinic_image,
                phone: doc.phone,
                doctors: [],
              };
            }

            acc[cId].doctors.push({
              doctorId: doc.cid,
              doctorName: doc.doctor_name,
              department: doc.specialization,
            });

            return acc;
          }, {}),
        );

        setClinics(grouped);
      } catch (error) {
        console.error("Failed to load clinics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, [specialty, location, search]);

  return (
    <div className="min-h-screen bg-[#f0f0f5] py-8">
      <SEO 
        title={`${clinics.length > 0 ? clinics.length : 'Find'} Clinics & Hospitals | Physician Health Net`}
        description="Find and book appointments with the best clinics and hospitals near you."
        keywords="find clinics, book hospital appointment, clinics near me"
        url="/find-clinics"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Breadcrumb / Title area */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-[#14bef0] transition-colors mb-4"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-[#414146]">
            {clinics.length} {clinics.length === 1 ? "Clinic" : "Clinics"} found{" "}
            {search ? `for "${search}"` : ""}{" "}
            {specialty && !search ? `for ${specialty}` : ""}{" "}
            {location && `in ${location}`}
          </h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
            <Icon icon="mdi:check-decagram" className="text-[#14bef0]" />
            Book appointments with the best clinics
          </p>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <Icon
              icon="mdi:loading"
              className="text-5xl text-[#14bef0] animate-spin mb-4"
            />
            <span className="text-lg text-gray-600 font-medium">
              Fetching clinics...
            </span>
          </div>
        ) : clinics.length === 0 ? (
          <div className="bg-white rounded p-12 text-center shadow-sm border border-gray-200 mt-4">
            <div className="bg-[#14bef0]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon
                icon="mdi:hospital-marker"
                className="text-4xl text-[#14bef0]"
              />
            </div>
            <h2 className="text-xl font-bold text-[#414146] mb-2">
              No matching clinics found
            </h2>
            <p className="text-gray-500 mb-6">
              We couldn't find clinics matching your current search. Try
              modifying your criteria.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-[#14bef0] hover:bg-[#12a9d6] text-white font-semibold py-2.5 px-6 rounded transition-colors duration-200"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {clinics.map((clinic) => (
              <div
                key={clinic.clinicId}
                className="bg-white rounded-md border border-gray-200 p-0 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row overflow-hidden"
              >
                {/* Left/Main Section */}
                <div className="grow p-6 flex flex-col sm:flex-row gap-5">
                  {/* Clinic Icon/Image Placeholder */}
                  <div className="shrink-0 flex justify-center sm:justify-start">
                    <div
                      onClick={() => navigate(`/doctor/${clinic.clinicId}`)}
                      className="w-40 h-40 bg-[#14bef0]/10 text-[#14bef0] rounded-lg shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden"
                    >
                      {clinic.clinicImage ? (
                        <img
                          src={clinic.clinicImage}
                          alt={clinic.clinicName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon
                          icon="mdi:hospital-building"
                          className="text-4xl"
                        />
                      )}
                    </div>
                  </div>

                  {/* Clinic Details */}
                  <div className="grow">
                    <h2
                      onClick={() => navigate(`/doctor/${clinic.clinicId}`)}
                      className="text-[#14bef0] hover:text-[#12a9d6] text-xl font-bold cursor-pointer transition-colors duration-200 mb-1"
                    >
                      {clinic.clinicName}
                    </h2>

                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {clinic.doctors.length > 1 || clinic.doctors[0]?.department?.includes(",")
                        ? "Multi-Specialty Clinic"
                        : clinic.doctors[0]?.department}
                    </p>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClinic(clinic);
                        setShowContactModal(true);
                      }}
                      className="cursor-pointer"
                    >
                      <p className="text-xs text-[#787887] flex items-center gap-1">
                        <Icon
                          icon="mdi:phone"
                          className="w-3 h-3 text-[#14bef0]"
                        />
                        +91 {clinic.phone}
                      </p>
                    </div>
                    <a href={clinic.clinic_location} target="_blank">
                      <p className="text-sm text-[#14bef0] flex items-start gap-1 line-clamp-1 mt-1">
                        <Icon
                          icon="mdi:map-marker"
                          className="w-3 h-3 mt-0.5 shrink-0"
                        />
                        {clinic.clinicAddress}
                      </p>
                    </a>
                  </div>
                </div>

                {/* Right/CTA Section */}
                <div className="md:w-64 bg-white md:bg-gray-50/50 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-200 shrink-0">
                  <p className="text-[#414146] font-bold text-lg mb-1 flex items-center">
                    <Icon
                      icon="mdi:check-circle"
                      className="text-green-500 mr-1.5"
                    />
                    Available
                  </p>
                  <p className="text-xs text-center text-gray-500 mb-4">
                    Book visit to view timings
                  </p>

                  <button
                    onClick={() => navigate(`/doctor/${clinic.clinicId}`)}
                    className="w-full bg-[#14bef0] hover:bg-[#12a9d6] text-white font-bold py-2.5 rounded transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Contact Options Modal */}
      {showContactModal && selectedClinic && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Contact Options
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <a
                href={`tel:${selectedClinic?.phone}`}
                className="flex items-center justify-center gap-3 bg-[#14bef0] text-white py-3 rounded-xl font-semibold hover:bg-[#12abd8] transition-all shadow-md active:scale-95"
                onClick={() => setShowContactModal(false)}
              >
                <Icon icon="mdi:phone" className="w-5 h-5" />
                Call Now
              </a>
              <a
                href={`https://wa.me/91${selectedClinic?.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white py-3 rounded-xl font-semibold hover:bg-[#20bd5a] transition-all shadow-md active:scale-95"
                onClick={() => setShowContactModal(false)}
              >
                <Icon icon="mdi:whatsapp" className="w-5 h-5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FindClinics;
