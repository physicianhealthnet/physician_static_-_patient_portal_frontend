import { AxiosInstanceDependency } from "./AxiosInstance";

export const fetchDoctorsDataFromDb = async () => {
  try {
    const response = await AxiosInstanceDependency.get("clinic-registration/get-enabled-clinic-list");
    const clinics = response.data?.data || [];
    
    const mapped = [];
    clinics.forEach(clinic => {
      // If the clinic has doctors, map each doctor to a row
      if (clinic.doctors && clinic.doctors.length > 0) {
        clinic.doctors.forEach(doc => {
          mapped.push({
            cid: clinic.cid,
            subdomain_name: clinic.subdomainName,
            clinic_name: clinic.clinicName,
            doctor_name: doc.name.startsWith("Dr") ? doc.name : `Dr. ${doc.name}`,
            specialization: doc.department || "General Medicine",
            phone: doc.phone || clinic.phno,
            address: clinic.address,
            clinic_image: clinic.clinic_image || "https://tse1.mm.bing.net/th/id/OIP.7j0RGabJJglbnB_VL6caHwAAAA?w=176&h=180&c=7&r=0&o=7&pid=1.7&rm=3",
            clinic_location: clinic.clinic_location || ""
          });
        });
      } else {
        // If no doctors, map a row with empty doctor name
        mapped.push({
          cid: clinic.cid,
          subdomain_name: clinic.subdomainName,
          clinic_name: clinic.clinicName,
          doctor_name: "",
          specialization: clinic.specialization || "General Medicine",
          phone: clinic.phno,
          address: clinic.address,
          clinic_image: clinic.clinic_image || "https://tse1.mm.bing.net/th/id/OIP.7j0RGabJJglbnB_VL6caHwAAAA?w=176&h=180&c=7&r=0&o=7&pid=1.7&rm=3",
          clinic_location: clinic.clinic_location || ""
        });
      }
    });
    return mapped;
  } catch (error) {
    console.error("Error fetching clinic data from DB:", error);
    return [];
  }
};
