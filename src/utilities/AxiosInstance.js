import axios from "axios";

const AxiosInstanceSecondryServer = axios.create({
  // baseURL: "https://phnappointment.physicianhealthnet.com/api/"
  baseURL: "http://localhost:3027/"
});

const isLocal = window?.location?.hostname === "localhost" || window?.location?.hostname === "127.0.0.1";

const AxiosInstanceDependency = axios.create({
  baseURL: isLocal
    ? "http://localhost:3028/"
    // ? "https://dependencyforphn.physicianhealthnet.com/api/"
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
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export { AxiosInstanceSecondryServer, AxiosInstanceDependency };
