import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import useUserLocation from "../hooks/useUserLocation";
import { fetchDoctorsDataFromDb } from "../utilities/dataLoader.js";

export function DualSearchInput() {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [doctors, setDoctors] = useState([]);
  const searchContainerRef = useRef(null);

  const {
    city: detectedCity,
    loading: locationLoading,
    error: locationError,
    requestLocation,
  } = useUserLocation();

  useEffect(() => {
    if (detectedCity) {
      setLocationText(detectedCity);
      setActiveDropdown("search");
    }
  }, [detectedCity]);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await fetchDoctorsDataFromDb();
        setDoctors(data);
      } catch (error) {
        console.error("Error loading doctors data:", error);
      }
    };
    loadDoctors();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const baseLocations = [
    "Coimbatore",
    "Erode",
    "Karur",
    "Namakkal",
    "kodumudi",
    "Velayuthampalayam",
    "Velur",
    "Vellakoil",
    "Muthur",
    "Kangayam",
  ];

  const symptomSpeciality = [
    {
      symptoms: ["Fever", "Cold", "Cough", "Body Pain", "Headache"],
      specialty: "General Physician",
    },
    {
      symptoms: ["Tooth Pain", "Gum Bleeding", "Cavity", "Bad Breath"],
      specialty: "Dentist",
    },
    {
      symptoms: ["Skin Rash", "Acne", "Pimples", "Hair Loss", "Itching"],
      specialty: "Dermatologist",
    },
    {
      symptoms: ["Ear Pain", "Nose Block", "Throat Pain", "Sinus"],
      specialty: "ENT Specialist",
    },
    {
      symptoms: ["Eye Pain", "Blurred Vision", "Eye Redness"],
      specialty: "Ophthalmologist",
    },
    {
      symptoms: ["Chest Pain", "High BP", "Heart Pain"],
      specialty: "Cardiologist",
    },
    {
      symptoms: ["Joint Pain", "Back Pain", "Fracture", "Knee Pain"],
      specialty: "Orthopedic",
    },
    {
      symptoms: ["Pregnancy", "Periods Problem", "PCOS", "Infertility"],
      specialty: "Gynecologist",
    },
    {
      symptoms: ["Child Fever", "Child Cold", "Child Vaccination"],
      specialty: "Pediatrician",
    },
    {
      symptoms: ["Diabetes", "Thyroid", "Hormone Issues"],
      specialty: "Endocrinologist",
    },
    {
      symptoms: ["Depression", "Anxiety", "Stress"],
      specialty: "Psychiatrist",
    },
    {
      symptoms: ["Headache", "Memory Loss", "Seizure", "Tremors"],
      specialty: "Neurologist",
    },
    {
      symptoms: ["Stomach Pain", "Acid Reflux", "Indigestion", "Diarrhea"],
      specialty: "Gastroenterologist",
    },
    {
      symptoms: ["Kidney Stones", "Urinary Tract Infection", "Prostate Issues"],
      specialty: "Urologist",
    },
    {
      symptoms: ["Kidney Failure", "High Creatinine", "Swelling"],
      specialty: "Nephrologist",
    },
    {
      symptoms: ["Asthma", "Breathing Issues", "COPD", "Tuberculosis"],
      specialty: "Pulmonologist",
    },
    {
      symptoms: ["Arthritis", "Lupus", "Joint Stiffness", "Autoimmune"],
      specialty: "Rheumatologist",
    },
    {
      symptoms: ["Cancer", "Tumor", "Chemotherapy"],
      specialty: "Oncologist",
    },
    {
      symptoms: ["Weight Loss", "Diet Plan", "Nutrition", "Obesity"],
      specialty: "Dietitian/Nutritionist",
    },
    {
      symptoms: ["Muscle Strain", "Post-Surgery Rehab", "Sports Injury"],
      specialty: "Physiotherapist",
    },
    {
      symptoms: ["Cosmetic Surgery", "Reconstructive Surgery", "Burns"],
      specialty: "Plastic Surgeon",
    },
    {
      symptoms: ["Appendix", "Gallbladder", "Hernia Surgery"],
      specialty: "General Surgeon",
    },
    {
      symptoms: ["Anemia", "Blood Cancer", "Bone Marrow"],
      specialty: "Hematologist",
    },
    {
      symptoms: ["Allergies", "Immune Deficiency", "Asthma"],
      specialty: "Allergist/Immunologist",
    },
    {
      symptoms: ["Male Infertility", "Erectile Dysfunction", "Sexual Health"],
      specialty: "Andrologist",
    },
  ];

  const dynamicLocations = Array.from(
    new Set(
      doctors
        .map((doc) => doc.address?.split(",").pop()?.trim())
        .filter(Boolean),
    ),
  );

  const sortedLocations = Array.from(
    new Set([...baseLocations, ...dynamicLocations]),
  ).sort();

  const allLocations = ["All", ...sortedLocations];

  const filteredLocations = locationText.trim()
    ? allLocations.filter((loc) =>
        loc.toLowerCase().includes(locationText.toLowerCase()),
      )
    : allLocations;

  const filteredDoctors = doctors
    .map((doc) => {
      const search = searchText.toLowerCase().trim();
      const loc = locationText.toLowerCase().trim();

      // If no search text, but there is location, prioritize doctors in that location
      if (!search) {
        const locMatch =
          loc && loc !== "all"
            ? doc?.address?.toLowerCase().includes(loc)
            : true;
        return locMatch ? { ...doc, score: 1 } : { ...doc, score: 0 };
      }

      const nameMatch =
        doc?.clinic_name?.toLowerCase().includes(search) ||
        doc?.doctor_name?.toLowerCase().includes(search);
      const specMatch = doc?.specialization?.toLowerCase().includes(search);
      const addrMatch = doc?.address?.toLowerCase().includes(search);
      const locMatch =
        loc && loc !== "all" ? doc?.address?.toLowerCase().includes(loc) : true;

      let score = 0;
      const hasSearchMatch = nameMatch || specMatch || addrMatch;

      if (!hasSearchMatch) return null;

      // Tier 1: Accurate (Name match) + Location match
      if (nameMatch && locMatch) score = 3;
      // Tier 2: Related (Specialty/Address match) + Location match
      else if ((specMatch || addrMatch) && locMatch) score = 2;
      // Tier 3: Match but different location
      else score = 1;

      return { ...doc, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const filteredSpecialties = symptomSpeciality.filter((item) => {
    if (!locationText.trim() || locationText.toLowerCase().trim() === "all")
      return true;
    return filteredDoctors.some((doc) => {
      const docSpec = doc?.specialization?.toLowerCase() || "";
      const itemSpec = item?.specialty?.toLowerCase() || "";
      return (
        docSpec.includes(itemSpec.substring(0, 5)) ||
        itemSpec.includes(docSpec.substring(0, 5))
      );
    });
  });

  return (
    <div
      ref={searchContainerRef}
      className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg shadow-lg relative mx-auto border border-gray-200"
    >
      {/* LOCATION INPUT */}
      <div className="relative flex flex-col flex-1 border-b md:border-b-0 md:border-r border-gray-300">
        <div className="flex items-center w-full px-4 py-3 md:py-4">
          <Icon
            icon="mdi:map-marker-outline"
            className="w-6 h-6 text-gray-400 mr-2"
          />

          <input
            type="text"
            placeholder="Select Location"
            value={locationText}
            onChange={(e) => {
              setActiveDropdown("location");
              setLocationText(e.target.value);
            }}
            onClick={() => {
              setActiveDropdown("location");
              setLocationText("");
            }}
            onFocus={() => setActiveDropdown("location")}
            className="w-full outline-none text-gray-700"
          />
        </div>

        {activeDropdown === "location" && (
          <div className="absolute top-[105%] left-0 w-full bg-white shadow-xl border rounded-md z-50 max-h-[350px] overflow-y-auto">
            <div className="py-2">
              <div
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center text-[#14bef0]"
                onClick={() => {
                  if (!locationLoading) requestLocation();
                }}
              >
                {locationLoading ? (
                  <Icon
                    icon="mdi:loading"
                    className="w-5 h-5 mr-3 animate-spin"
                  />
                ) : (
                  <Icon icon="mdi:crosshairs-gps" className="w-5 h-5 mr-3" />
                )}

                <span className="font-medium text-sm">
                  {locationLoading
                    ? "Detecting your location..."
                    : locationError
                      ? locationError
                      : "Use my location"}
                </span>
              </div>

              <div className="h-px bg-gray-100 my-2"></div>

              {filteredLocations.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setLocationText(loc);
                    setActiveDropdown("search");
                  }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                >
                  <Icon icon="mdi:magnify" className="w-4 h-4 mr-2" />
                  {loc}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SEARCH INPUT */}
      <div className="relative flex flex-col flex-2">
        <div className="flex items-center w-full px-4 py-3 md:py-4">
          <Icon icon="mdi:magnify" className="w-6 h-6 text-gray-400 mr-2" />

          <input
            type="text"
            placeholder="Search clinics..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchText.trim() !== "") {
                navigate(
                  `/find-clinics?search=${encodeURIComponent(searchText)}&location=${encodeURIComponent(locationText)}`,
                );
                setActiveDropdown(null);
              }
            }}
            onFocus={() => {
              if (!locationText) {
                setActiveDropdown("location");
              } else {
                setActiveDropdown("search");
              }
            }}
            className="w-full outline-none text-gray-700"
          />
        </div>

        {activeDropdown === "search" && (
          <div className="absolute top-[105%] left-0 w-full bg-white shadow-xl border rounded-md z-50 max-h-[350px] overflow-y-auto">
            <div className="p-4">
              {!searchText ? (
                <>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">
                    Common Symptoms{" "}
                    {locationText && locationText.toLowerCase() !== "all"
                      ? `in ${locationText}`
                      : ""}
                  </h3>

                  <div
                    onClick={() => {
                      navigate(
                        `/find-clinics?location=${encodeURIComponent(
                          locationText,
                        )}`,
                      );
                      setActiveDropdown(null);
                    }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-100 mb-2"
                  >
                    <div className="bg-[#14bef0]/10 p-2.5 rounded-full text-[#14bef0] shrink-0 mr-3">
                      <Icon icon="mdi:hospital-building" className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-gray-700">
                        All Clinics
                      </span>
                      <span className="text-[11px] text-gray-400 mt-0.5">
                        Explore all clinics{" "}
                        {locationText && locationText.toLowerCase() !== "all"
                          ? `in ${locationText}`
                          : ""}
                      </span>
                    </div>
                  </div>

                  {filteredSpecialties.length > 0 ? (
                    filteredSpecialties.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          navigate(
                            `/find-clinics?specialty=${encodeURIComponent(
                              item.specialty,
                            )}&location=${encodeURIComponent(locationText)}`,
                          );
                        }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-50 last:border-b-0"
                      >
                        <div className="bg-[#14bef0]/10 p-2.5 rounded-full text-[#14bef0] shrink-0 mr-3">
                          <Icon icon="mdi:stethoscope" className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col flex-1 truncate">
                          <span className="text-[13px] font-bold text-gray-700">
                            {item.specialty}
                          </span>
                          <span className="text-[11px] text-gray-400 mt-0.5 truncate">
                            {item.symptoms.join(", ")}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 py-4 text-center">
                      No departments found{" "}
                      {locationText ? `in ${locationText}` : ""}
                    </div>
                  )}
                </>
              ) : filteredDoctors.length === 0 ? (
                <div className="text-sm text-gray-500 py-4 text-center">
                  No clinics found {locationText ? `in ${locationText}` : ""}
                </div>
              ) : (
                filteredDoctors.slice(0, 10).map((doc, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/find-clinics?search=${doc.clinic_name}&location=${locationText}`,
                      )
                    }
                  >
                    <div className="text-sm font-medium">{doc.clinic_name}</div>
                    <div className="text-xs text-gray-500">
                      {doc.specialization} • {doc.address}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
