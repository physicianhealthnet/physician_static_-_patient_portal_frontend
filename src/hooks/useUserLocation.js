import { useEffect, useState } from "react";

const useUserLocation = () => {

  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLocation = async () => {
    try {

      const res = await fetch("https://www.physicianhealthnet.com/api/api/user-location");
      const data = await res.json();

      setCity(data.city);

    } catch (error) {
      console.error("Location detection error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { city, loading };
};

export default useUserLocation;