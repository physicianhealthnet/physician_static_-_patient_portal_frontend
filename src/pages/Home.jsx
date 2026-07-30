import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { DualSearchInput } from "../components/DualSearchInput";
import FindDoctorModal from "../components/FindDoctorModal";
import useUserLocation from "../hooks/useUserLocation";
import appointmentImg from "../assets/appointment.jpg";
import chatImg from "../assets/chat.webp";
import doctorImg from "../assets/find_doctor.jpg";
import generalPhysicianImg from "../assets/general_physician.png";
import dermatologistImg from "../assets/dermatologist.png";
import pediatricianImg from "../assets/pediatrician.png";
import gynecologistImg from "../assets/gynecologist.png";
import entSpecialistImg from "../assets/ent.png";
import ophthalmologistImg from "../assets/ophthalmologist.png";
import orthopedistImg from "../assets/orthopedist.png";
import cardiologistImg from "../assets/cardiologist.png";
import neurologistImg from "../assets/neurologist.png";
import gastroenterologistImg from "../assets/gastroenterologist.png";
import psychiatristImg from "../assets/psychiatrist.png";
import dentistImg from "../assets/dentist.png";
import diabetologistImg from "../assets/diabetologist.png";
import stomachPainImg from "../assets/stomach_pain.png";
import migraineImg from "../assets/migraine.png";
import toothPainImg from "../assets/tooth_pain.png";
import periodPregnancyV2 from "../assets/period_pregnancy_v2.png";
import acneSkinV2 from "../assets/acne_skin_v2.png";
import performanceIssuesV2 from "../assets/performance_issues_v2.png";
import coldCoughV2 from "../assets/cold_cough_v2.png";
import childHealthV2 from "../assets/child_health_v2.png";
import hairLossV2 from "../assets/hair_loss_v2.png";
import weightLossV2 from "../assets/weight_loss_v2.png";
import pilesV2 from "../assets/piles_v2.png";
import diabetesV2 from "../assets/diabetes_v2.png";
import heartV2 from "../assets/heart_v2.png";
import depressionV2 from "../assets/depression_v2.png";
import clinicFallbackImg from "../assets/clinic.png";
import { scroll } from "../functions/Scroll.js";
import { fetchDoctorsDataFromDb } from "../utilities/dataLoader.js";

// Clinic images removed — using API data now
const homeData = [
  {
    title: "Find Clinics",
    img: doctorImg,
    description: "Search and find the best clinics near you",
    link: "/find-clinics",
  },
  {
    title: "Chat with Clinic",
    img: chatImg,
    description: "Chat with the best clinics near you",
    link: "/dashboard",
  },
  {
    title: "Book Appointment",
    img: appointmentImg,
    description: "Book appointments with the best clinics near you",
    link: "/dashboard",
  },
];

const coughData = [
  {
    title: "Cold, Cough or fever",
    specialty: "General Physician",
    link: "dummy",
    img: coldCoughV2,
  },
  {
    title: "Child not feeling well",
    specialty: "Pediatrician",
    link: "dummy",
    img: childHealthV2,
  },
  {
    title: "Hair loss",
    specialty: "Dermatologist",
    link: "dummy",
    img: hairLossV2,
  },
  {
    title: "Weight loss",
    specialty: "General Physician",
    link: "dummy",
    img: weightLossV2,
  },
  {
    title: "Piles",
    specialty: "General Physician",
    link: "dummy",
    img: pilesV2,
  },
  {
    title: "Skin problems",
    specialty: "Dermatologist",
    link: "dummy",
    img: acneSkinV2,
  },
  {
    title: "Depression or anxiety",
    specialty: "Psychiatrist",
    link: "dummy",
    img: depressionV2,
  },
  {
    title: "Diabetes",
    specialty: "Diabetology",
    link: "dummy",
    img: diabetesV2,
  },
  {
    title: "Stomach pain",
    specialty: "Gastroenterologist",
    link: "dummy",
    img: stomachPainImg,
  },
  {
    title: "Migraine or Headaches",
    specialty: "Neurology",
    link: "dummy",
    img: migraineImg,
  },
  {
    title: "Tooth pain",
    specialty: "Dentistry",
    link: "dummy",
    img: toothPainImg,
  },
  {
    title: "Anxiety or Stress",
    specialty: "Psychiatrist",
    link: "dummy",
    img: depressionV2,
  },
  {
    title: "Heart concerns",
    specialty: "Cardiology",
    link: "dummy",
    img: heartV2,
  },
  {
    title: "Period doubts or Pregnancy",
    specialty: "Gynecologist",
    link: "dummy",
    img: periodPregnancyV2,
  },
  {
    title: "Performance issues in bed",
    specialty: "Sexologist",
    link: "dummy",
    img: performanceIssuesV2,
  },
];

const testimonialData = [
  {
    name: "Arun Kumar",
    location: "Chennai",
    feedback:
      "Booking an appointment was very easy and the doctor consultation was smooth. Highly recommended!",
  },
  {
    name: "Priya Sharma",
    location: "Coimbatore",
    feedback:
      "The pediatrician was very kind and explained everything clearly. Great experience.",
  },
  {
    name: "Rahul Verma",
    location: "Bangalore",
    feedback:
      "Quick response and professional doctors. The platform is very user friendly.",
  },
  {
    name: "Meena Lakshmi",
    location: "Madurai",
    feedback:
      "Dermatologist consultation helped me a lot. Online appointment saved my time.",
  },
];

const doctorData = [
  {
    title: "General Physician",
    specialty: "General Medicine",
    img: generalPhysicianImg,
    description: "Provides primary healthcare and treats common illnesses.",
  },
  {
    title: "Dermatologist",
    specialty: "Dermatology",
    img: dermatologistImg,
    description: "Specialist in skin, hair, and nail related conditions.",
  },
  {
    title: "Pediatrician",
    specialty: "Pediatrics",
    img: pediatricianImg,
    description: "Medical expert for infants, children, and adolescents.",
  },
  {
    title: "Gynecologist",
    specialty: "Gynecology",
    img: gynecologistImg,
    description: "Focuses on women's reproductive health and wellness.",
  },
  {
    title: "ENT Specialist",
    specialty: "ENT",
    img: entSpecialistImg,
    description: "Treats ear, nose, and throat related problems.",
  },
  {
    title: "Ophthalmologist",
    specialty: "Ophthalmology",
    img: ophthalmologistImg,
    description: "Specialist in eye care, vision testing, and surgery.",
  },
  {
    title: "Orthopedist",
    specialty: "Orthopedics",
    img: orthopedistImg,
    description: "Treats bone, joint, and musculoskeletal conditions.",
  },
  {
    title: "Cardiologist",
    specialty: "Cardiology",
    img: cardiologistImg,
    description: "Expert in heart health and cardiovascular diseases.",
  },
  {
    title: "Neurologist",
    specialty: "Neurology",
    img: neurologistImg,
    description: "Specialist in brain, spinal cord, and nerve disorders.",
  },
  {
    title: "Gastroenterologist",
    specialty: "Gastroenterology",
    img: gastroenterologistImg,
    description: "Expert in digestive system and liver health.",
  },
  {
    title: "Psychiatrist",
    specialty: "Psychiatry",
    img: psychiatristImg,
    description: "Specialist in mental health and behavioral disorders.",
  },
  {
    title: "Dentist",
    specialty: "Dentistry",
    img: dentistImg,
    description: "Expert in oral hygiene, teeth, and gum care.",
  },
  {
    title: "Diabetologist",
    specialty: "Diabetology",
    img: diabetologistImg,
    description: "Specialist in diabetes management and endocrinology.",
  },
];

function Home() {
  const navigate = useNavigate();
  const scrollContainerRefs = useRef([]);
  const [isHovered, setIsHovered] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [marqueeHovered, setMarqueeHovered] = useState(false);
  const [coughHovered, setCoughHovered] = useState(false);
  const [specialtyHovered, setSpecialtyHovered] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const { city: detectedCity, loading: locationLoading } = useUserLocation();

  // Modal State for Location Selection
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFindDoctorModal, setShowFindDoctorModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [pendingRoute, setPendingRoute] = useState(null);

  const handleCategoryClick = (basePath, specialty) => {
    setPendingRoute(`${basePath}?specialty=${encodeURIComponent(specialty)}`);
    setShowLocationModal(true);
  };

  // Fetch clinics from API
  useEffect(() => {
    const loadClinics = async () => {
      try {
        const data = await fetchDoctorsDataFromDb();
        setClinics(data);
      } catch (error) {
        console.error("Error loading clinics:", error);
      }
    };
    loadClinics();
  }, []);

  // Auto-scroll nearby clinics carousel at constant speed with seamless loop
  useEffect(() => {
    if (marqueeHovered) return;
    const interval = setInterval(() => {
      const container = scrollContainerRefs.current[2];
      if (container) {
        // When it reaches middle of the duplicated content, reset to start seamlessly
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += 1;
        }
      }
    }, 20); // 1px every 20ms = 50px/s
    return () => clearInterval(interval);
  }, [marqueeHovered]);

  // Auto-scroll Consult Top Doctors carousel
  useEffect(() => {
    if (coughHovered) return;
    const interval = setInterval(() => {
      const container = scrollContainerRefs.current[0];
      if (container) {
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += 1;
        }
      }
    }, 25);
    return () => clearInterval(interval);
  }, [coughHovered]);

  // Auto-scroll Book Appointment carousel
  useEffect(() => {
    if (specialtyHovered) return;
    const interval = setInterval(() => {
      const container = scrollContainerRefs.current[1];
      if (container) {
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += 1;
        }
      }
    }, 30);
    return () => clearInterval(interval);
  }, [specialtyHovered]);

  const filteredClinics = clinics.filter((clinic) => {
    const matchCity = detectedCity
      ? clinic?.address?.toLowerCase().includes(detectedCity.toLowerCase())
      : true;

    const matchSpecialty = selectedSpecialty
      ? clinic?.specialization
          ?.toLowerCase()
          .includes(selectedSpecialty.toLowerCase())
      : true;

    return matchCity && matchSpecialty;
  });

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
  const dynamicLocations = Array.from(
    new Set(
      clinics
        .map((doc) => doc.address?.split(",").pop()?.trim())
        .filter(Boolean),
    ),
  );
  const allLocations = Array.from(
    new Set([...baseLocations, ...dynamicLocations]),
  ).sort();

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonialData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div className="p-5 pt-8 bg-[#f8f9fa]">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 items-center justify-center">
        <div className="w-full">
          <h1 className="w-full font-bold text-2xl">
            Find Clinic Nearby you...!
          </h1>
          <p className="w-full text-[#787887]">
            Search for clinics by specialization, location, or clinic name
          </p>
        </div>
        <DualSearchInput />
      </div>
      <div className="max-w-6xl mx-auto w-full mt-16">
        <div className="flex flex-col items-start w-full mb-5">
          <div className="flex items-center gap-3 w-full">
            <h2 className="text-2xl font-semibold">Nearby Clinics</h2>
            {locationLoading && (
              <span className="flex items-center gap-1.5 text-xs text-[#14bef0] bg-[#e8f7fd] px-3 py-1 rounded-full">
                <Icon icon="mdi:loading" className="w-3 h-3 animate-spin" />
                Detecting location...
              </span>
            )}
            {detectedCity && !locationLoading && (
              <span className="flex items-center gap-1.5 text-xs text-[#14bef0] bg-[#e8f7fd] px-3 py-1 rounded-full">
                <Icon icon="mdi:map-marker" className="w-3 h-3" />
                {detectedCity}
              </span>
            )}
          </div>
          <p className="text-sm text-[#787887] w-full">
            {detectedCity
              ? `Showing clinics near ${detectedCity}`
              : "Find the best clinics near you and book appointments instantly"}
          </p>
        </div>
        {/* Nearby Clinics Carousel */}
        {(() => {
          const nearbyClinics = detectedCity
            ? clinics.filter((c) =>
                c?.address?.toLowerCase().includes(detectedCity.toLowerCase()),
              )
            : clinics;
          const displayClinics =
            nearbyClinics.length > 0 ? nearbyClinics : clinics.slice(0, 8);

          return displayClinics.length > 0 ? (
            <div
              className="w-full relative group"
              onMouseEnter={() => setMarqueeHovered(true)}
              onMouseLeave={() => setMarqueeHovered(false)}
            >
              <button
                onClick={() => scroll("left", 2, scrollContainerRefs)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-3 rounded-full text-[#14bef0] hover:bg-[#14bef0] hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
              >
                <Icon icon="mdi:chevron-left" className="w-8 h-8" />
              </button>

              <div
                ref={(el) => (scrollContainerRefs.current[2] = el)}
                className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <div className="grid grid-rows-2 grid-flow-col gap-6 py-6 w-max px-4">
                  {[...displayClinics, ...displayClinics].map((data, index) => (
                    <div
                      key={index}
                      onClick={() => navigate(`/doctor/${data.cid}`)}
                      className="flex-none w-80 flex flex-col cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white pb-2 hover:-translate-y-1 group animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
                    >
                      <div className="w-full h-40 flex items-center justify-center bg-sky-50 overflow-hidden">
                        <img
                          src={data?.clinic_image || clinicFallbackImg}
                          alt={data.clinic_name || "Hospital"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = clinicFallbackImg;
                          }}
                        />
                      </div>
                      <div className="p-4 flex flex-col gap-1">
                        <h2 className="text-lg font-semibold truncate text-[#252527] group-hover:text-[#14bef0] transition-colors">
                          {data?.clinic_name}
                        </h2>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClinic(data);
                            setShowContactModal(true);
                          }}
                          className="cursor-pointer"
                        >
                          <p className="text-xs text-[#787887] flex items-center gap-1">
                            <Icon
                              icon="mdi:phone"
                              className="w-3 h-3 text-[#14bef0]"
                            />
                            +91 {data?.phone}
                          </p>
                        </div>
                        <a href={data?.clinic_location} target="_blank">
                          <p className="text-xs text-[#14bef0] flex items-start gap-1 line-clamp-1 mt-1">
                            <Icon
                              icon="mdi:map-marker"
                              className="w-3 h-3 mt-0.5 shrink-0"
                            />
                            {data?.address}
                          </p>
                        </a>
                      </div>
                      <div className="px-4 pb-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/doctor/${data.cid}`);
                          }}
                          className="w-full bg-[#14bef0]/10 text-[#14bef0] hover:bg-[#14bef0] hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => scroll("right", 2, scrollContainerRefs)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-3 rounded-full text-[#14bef0] hover:bg-[#14bef0] hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
              >
                <Icon icon="mdi:chevron-right" className="w-8 h-8" />
              </button>
            </div>
          ) : (
            <div className="w-full py-10 flex flex-col items-center text-gray-400">
              <Icon
                icon="mdi:map-marker-off-outline"
                className="w-16 h-16 mb-3"
              />
              <p className="text-sm">No clinics found nearby</p>
            </div>
          );
        })()}
      </div>
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center mt-5 py-10">
        <div className="flex flex-wrap justify-center gap-8">
          {homeData?.map((data, index) => (
            <div
              key={index}
              onClick={() => {
                if (data?.title === "Find Clinics") {
                  setShowFindDoctorModal(true);
                } else {
                  data?.link.includes("http")
                    ? window.open(data?.link)
                    : navigate(data?.link);
                }
              }}
              className="group/item flex flex-col items-center gap-2 cursor-pointer w-60 rounded-2xl overflow-hidden shadow-lg"
            >
              <img
                src={data?.img}
                className="w-full h-40 object-cover"
                alt={data?.title}
              />
              <h2 className="text-xl font-semibold px-4 pt-4 w-full group-hover/item:text-[#14bef0] transition-all duration-300">
                {data?.title}
              </h2>
              <p className="text-sm text-[#787887] px-4 pb-4 w-full">
                {data?.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full flex flex-col items-center justify-between mt-20 gap-12 px-5">
        <div className="flex flex-col items-start w-full">
          <h2 className="text-2xl md:text-3xl font-bold w-full text-gray-800">
            Consult top doctors online for any health concern
          </h2>
          <p className="text-base text-[#787887] w-full mt-2">
            Private online consultations with verified doctors in all
            specialists
          </p>
        </div>
        <div
          className="w-full relative group"
          onMouseEnter={() => setCoughHovered(true)}
          onMouseLeave={() => setCoughHovered(false)}
        >
          <button
            onClick={() => scroll("left", 0, scrollContainerRefs)}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-2 rounded-full text-[#14bef0] hover:bg-[#14bef0] hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
          >
            <Icon icon="mdi:chevron-left" className="w-8 h-8" />
          </button>
          <div
            ref={(el) => (scrollContainerRefs.current[0] = el)}
            className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="grid grid-rows-2 grid-flow-col gap-x-6 gap-y-10 py-6 w-max px-4">
              {[...coughData, ...coughData].map((data, index) => (
                <div
                  key={index}
                  onClick={() =>
                    handleCategoryClick("/find-clinics", data.specialty)
                  }
                  className="flex-none flex flex-col items-center gap-4 cursor-pointer group/item w-44 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
                >
                  <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center overflow-hidden group-hover/item:shadow-xl transition-all duration-300 pointer-events-none">
                    {data?.isComposite ? (
                      <div
                        className="w-full h-full bg-no-repeat group-hover/item:scale-110 transition-transform duration-500"
                        style={{
                          backgroundImage: `url(${data.img})`,
                          backgroundPosition: data.pos,
                          backgroundSize: "360% auto",
                        }}
                      />
                    ) : (
                      <img
                        src={data?.img}
                        className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                        alt={data?.title}
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-center text-center gap-1">
                    <p className="text-sm md:text-base text-[#252527] font-semibold transition-all duration-300">
                      {data?.title}
                    </p>
                    <span className="text-xs md:text-sm text-[#14bef0] font-bold tracking-wider hover:underline uppercase">
                      CONSULT NOW
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => scroll("right", 0, scrollContainerRefs)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-2 rounded-full text-[#14bef0] hover:bg-[#14bef0] hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
          >
            <Icon icon="mdi:chevron-right" className="w-8 h-8" />
          </button>
        </div>
      </div>
      <hr className="max-w-6xl mx-auto w-full border-gray-200 mt-20" />
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center justify-between mt-20 gap-12 px-5">
        <div className="flex flex-col items-start w-full">
          <h2 className="text-2xl md:text-3xl font-bold w-full text-gray-800">
            Book an appointment for an in-clinic consultation
          </h2>
          <p className="text-base text-[#787887] w-full mt-2">
            Find experienced doctors across all specialties
          </p>
        </div>
        <div
          className="w-full relative group"
          onMouseEnter={() => setSpecialtyHovered(true)}
          onMouseLeave={() => setSpecialtyHovered(false)}
        >
          <button
            onClick={() => scroll("left", 1, scrollContainerRefs)}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-2 rounded-full text-[#14bef0] hover:bg-[#14bef0] hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
          >
            <Icon icon="mdi:chevron-left" className="w-8 h-8" />
          </button>
          <div
            ref={(el) => (scrollContainerRefs.current[1] = el)}
            className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="grid grid-rows-2 grid-flow-col gap-x-6 gap-y-10 py-6 w-max px-4">
              {[...doctorData, ...doctorData].map((data, index) => (
                <div
                  key={index}
                  onClick={() =>
                    handleCategoryClick("/find-clinics", data.title)
                  }
                  className="flex-none flex flex-col items-center gap-4 cursor-pointer group/item w-44 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
                >
                  <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center overflow-hidden group-hover/item:shadow-xl transition-all duration-300 pointer-events-none">
                    {data?.isComposite ? (
                      <div
                        className="w-full h-full bg-no-repeat group-hover/item:scale-110 transition-transform duration-500"
                        style={{
                          backgroundImage: `url(${data.img})`,
                          backgroundPosition: data.pos,
                          backgroundSize: "360% auto",
                        }}
                      />
                    ) : (
                      <img
                        src={data?.img}
                        className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                        alt={data?.title}
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-center text-center gap-1">
                    <p className="text-sm md:text-base text-[#252527] font-semibold transition-all duration-300">
                      {data?.title}
                    </p>
                    <p className="text-xs text-[#787887] line-clamp-2 px-2">
                      {data?.description}
                    </p>
                    <span className="text-xs md:text-sm text-[#14bef0] font-bold tracking-wider hover:underline mt-1">
                      BOOK NOW
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => scroll("right", 1, scrollContainerRefs)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-2 rounded-full text-[#14bef0] hover:bg-[#14bef0] hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
          >
            <Icon icon="mdi:chevron-right" className="w-8 h-8" />
          </button>
        </div>
      </div>
      <hr className="max-w-6xl mx-auto w-full border-gray-200 mt-20" />
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center mt-20 mb-20 gap-10 px-5">
        <div className="flex flex-col items-start w-full">
          <h2 className="text-2xl font-semibold w-full">
            Our specialized services
          </h2>
          <p className="text-sm text-[#787887] w-full">
            Comprehensive healthcare solutions tailored for you
          </p>
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Clinics & Hospitals",
              description:
                "Book confirmed appointments with top clinics, specialists, and nearby hospitals with real-time availability.",
              icon: "mdi:stethoscope",
              features: [
                "Search clinics by location and specialization",
                "View clinic profiles with experience and qualifications",
                "Instant appointment booking with slot selection",
                "Online and in-person consultation support",
                "Appointment reminders and notifications",
              ],
            },
            {
              name: "Medicines & Pharmacy",
              description:
                "Order genuine medicines online with fast delivery and trusted pharmacy partners.",
              icon: "mdi:pill",
              features: [
                "Upload prescription and order medicines easily",
                "Access to branded and generic medicines",
                "Automatic refill reminders for regular medicines",
                "Verified pharmacies ensuring authenticity",
              ],
            },
            {
              name: "Lab Tests & Checkups",
              description:
                "Book lab tests and health checkups with free home sample collection and accurate reports.",
              icon: "mdi:flask-outline",
              features: [
                "Wide range of lab tests and health packages",
                "Certified labs with accurate results",
                "Download digital reports anytime",
                "Preventive health checkup plans",
              ],
            },
          ].map((data, index) => (
            <div
              key={index}
              className="flex flex-col items-start p-8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-300"
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-[#e2f5fb]`}
              >
                <Icon icon={data.icon} className={`w-8 h-8 text-[#14bef0]`} />
              </div>
              <h3 className="text-xl font-bold text-[#252527] mb-3">
                {data.name}
              </h3>
              <p className="text-[#787887] text-sm leading-relaxed mb-8 grow">
                {data.description}
              </p>
              <ul className="space-y-2">
                {data.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-sm text-[#4a4a4a]"
                  >
                    <Icon
                      icon="mdi:check-circle"
                      className="w-4 h-4 text-[#14bef0] mr-2 mt-0.5 shrink-0"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Select Location
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-4">
                Please select your preferred city to view the clinics available.
              </p>
              <div className="relative">
                <Icon
                  icon="mdi:map-marker"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none"
                />
                <select
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value !== undefined) {
                      setShowLocationModal(false);
                      if (value === "all") {
                        navigate(pendingRoute);
                      } else {
                        navigate(
                          `${pendingRoute}&location=${encodeURIComponent(value)}`,
                        );
                      }
                    }
                  }}
                  defaultValue=""
                  className="w-full appearance-none border border-gray-300 rounded-lg pl-10 pr-10 py-3 outline-none focus:border-[#14bef0] focus:ring-2 focus:ring-[#14bef0]/20 text-gray-700 transition-all font-medium bg-white"
                >
                  <option value="" disabled>
                    Select an Area...
                  </option>
                  <option value="all" className="text-[#14bef0] font-bold">
                    All Areas
                  </option>
                  {allLocations.map((loc, idx) => (
                    <option
                      key={idx}
                      value={loc}
                      className="text-gray-700 font-medium"
                    >
                      {loc}
                    </option>
                  ))}
                </select>
                <Icon
                  icon="mdi:chevron-down"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Find Doctor Modal */}
      <FindDoctorModal
        isOpen={showFindDoctorModal}
        onClose={() => setShowFindDoctorModal(false)}
      />

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

export default Home;
