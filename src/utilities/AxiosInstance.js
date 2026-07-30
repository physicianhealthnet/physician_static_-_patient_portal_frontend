import axios from "axios";
import Cookies from "js-cookie";

const isLocal = window?.location?.hostname === "localhost" || window?.location?.hostname === "127.0.0.1";

const AxiosInstanceSecondryServer = axios.create({
  baseURL: isLocal
    ? "http://localhost:3028/"
    : "https://phnappointment.physicianhealthnet.com/api/"
});

const AxiosInstanceDependency = axios.create({
  baseURL: isLocal
    // ? "http://localhost:3028/"
    ? "https://dependencyforphn.physicianhealthnet.com/api/"
    : "https://dependencyforphn.physicianhealthnet.com/api/"
})


AxiosInstanceSecondryServer.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    const isAuthRoute = config.url.includes("/auth/login") || 
                       config.url.includes("/auth/register") || 
                       config.url.includes("/auth/verify-otp");

    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

AxiosInstanceSecondryServer.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes("/auth/login") || 
                       error.config?.url?.includes("/auth/register") ||
                       error.config?.url?.includes("/auth/verify-otp");

    if (error.response?.status === 401 && !isAuthRoute) {
      console.warn("Unauthorized access detected, redirecting to login...");
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("patientData");
      localStorage.removeItem("userData");
      Cookies.remove("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export { AxiosInstanceSecondryServer, AxiosInstanceDependency };
