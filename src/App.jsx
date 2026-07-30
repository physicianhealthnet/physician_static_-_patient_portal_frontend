import {
  Route,
  Routes,
  BrowserRouter as Router,
  useLocation,
  Navigate,
} from "react-router-dom";
import Cookies from "js-cookie";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import { HomeNavBar } from "./components/Navbar";
import { DashboardNavbar } from "./components/DashboardNavbar";
import Footer from "./components/Footer";

// Initialize auth from persistent storage (Remember me functionality)
const initializeAuth = () => {
  const persistentToken = Cookies.get("token");
  if (persistentToken && !sessionStorage.getItem("token")) {
    sessionStorage.setItem("token", persistentToken);
    
    const user = localStorage.getItem("user");
    const patientData = localStorage.getItem("patientData");
    const userData = localStorage.getItem("userData");
    
    if (user) sessionStorage.setItem("user", user);
    if (patientData) sessionStorage.setItem("patientData", patientData);
    if (userData) sessionStorage.setItem("userData", userData);
  }
};
initializeAuth();

import Security from "./pages/Security";
import Help from "./pages/Help";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import UserDashboard from "./pages/UserDashboard";
import DoctorAppointmentDetail from "./pages/DoctorAppointmentDetail";
import FindClinics from "./pages/FindClinics";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function AppContainer() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin");

  return (
    <div className={isDashboard ? "bg-[#f8f9fa] min-h-screen" : ""}>
      {!isDashboard && <HomeNavBar />}
      {isDashboard && <DashboardNavbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth initialTab="login" />} />
        <Route path="/register" element={<Auth initialTab="register" />} />

        <Route path="/find-clinics" element={<FindClinics />} />
        <Route path="/security" element={<Security />} />
        <Route path="/help" element={<Help />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Navigate to="/dashboard/appointments" replace />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/:tab"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />

        <Route path="/doctor/:cid" element={<DoctorAppointmentDetail />} />

        {/* Admin Portal Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>

      {!isDashboard && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContainer />
    </Router>
  );
}

export default App;
