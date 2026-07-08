import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import loginIllustration from "../assets/login_illustration.png";
import { AxiosInstanceDependency } from "../utilities/AxiosInstance";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { sendWhatsAppNotification } from "../utilities/whatsappNotify.js";

function Auth({ initialTab = "login" }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showOtp, setShowOtp] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [regData, setRegData] = useState(null);

  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  const handleLogin = async (submitData) => {
    setLoginLoading(true);
    setPasswordError("");
    const { remember, ...apiData } = submitData;
    
    try {
      const res = await AxiosInstanceDependency.post(
        "auth/patient-login",
        apiData,
      );
      console.log("Patient Login response:", res.data);

      const token = res.data?.token;
      if (token) {
        sessionStorage.setItem("token", token);
        if (remember) {
          Cookies.set("token", token, { expires: 30 });
        }
        
        try {
          const decodedUser = jwtDecode(token);
          sessionStorage.setItem("user", JSON.stringify(decodedUser));
          if (remember) localStorage.setItem("user", JSON.stringify(decodedUser));
        } catch (error) {
          console.error("Failed to decode token:", error);
        }

        // Store patient-specific data separately
        if (res.data.patient) {
          sessionStorage.setItem("patientData", JSON.stringify(res.data.patient));
          if (remember) localStorage.setItem("patientData", JSON.stringify(res.data.patient));
        }
        if (res.data.user) {
          sessionStorage.setItem("userData", JSON.stringify(res.data.user));
          if (remember) localStorage.setItem("userData", JSON.stringify(res.data.user));
        }

        navigate("/dashboard/attend-clinics");
      } else {
        setPasswordError("Authentication failed: No token received.");
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid credentials. Please try again.";
      setPasswordError(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (submitData) => {
    setRegisterLoading(true);
    setPasswordError("");
    try {
      const data = await AxiosInstanceDependency.post(
        "auth/patient-register",
        submitData,
      );
      console.log("Registration response:", data.data);
      const identifier = submitData.email || submitData.mobileNumber;
      if (identifier) {
        setRegisteredEmail(identifier);
      }
      setRegData(submitData);
      setShowOtp(true);
      setPasswordError("");
    } catch (error) {
      console.error(
        "Registration Error:",
        error.response?.data || error.message,
      );
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";
      setPasswordError(errorMessage);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleVerifyOtp = async (submitData) => {
    setVerifyOtpLoading(true);
    setPasswordError("");
    try {
      const res = await AxiosInstanceDependency.post(
        "auth/patient-verify-otp",
        submitData,
      );
      console.log("OTP Verification Success:", res.data);

      // Send WhatsApp registration notification
      if (regData && regData.phno) {
        await sendWhatsAppNotification("phn_patient_register", regData.phno, [
          regData.name || "User",
        ]);
      }

      alert("Account verified successfully! You can now login.");
      setShowOtp(false);
      setActiveTab("login");
    } catch (error) {
      console.error(
        "OTP Verification Error:",
        error.response?.data || error.message,
      );
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid OTP. Please try again.";
      setPasswordError(errorMessage);
    } finally {
      setVerifyOtpLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setPasswordError("");
    const credential = e.target.credential.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const res = await AxiosInstanceDependency.post("auth/reset-password", {
        email: credential,
        newPassword
      });
      alert(res.data.message);
      setIsForgotPassword(false);
    } catch (error) {
      console.error("Reset Password Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Failed to reset password.";
      setPasswordError(errorMessage);
    } finally {
      setForgotPasswordLoading(false);
    }
  };


  return (
    <div className="w-full min-h-[calc(100vh-100px)] flex flex-col items-center pt-8 bg-[#f9f9f9]">
      {/* Tabs */}
      <div className="flex gap-16 border-b border-gray-200 mb-12 w-full max-w-4xl justify-center">
        <button
          onClick={() => setActiveTab("login")}
          className={`pb-4 px-2 text-[15px] font-semibold transition-colors ${activeTab === "login" ? "text-[#14bef0] border-b-2 border-[#14bef0]" : "text-gray-500 hover:text-gray-800"}`}
        >
          Login
        </button>
        <button
          onClick={() => {
            setActiveTab("register");
            setShowOtp(false);
          }}
          className={`pb-4 px-2 text-[15px] font-semibold transition-colors ${activeTab === "register" ? "text-[#14bef0] border-b-2 border-[#14bef0]" : "text-gray-500 hover:text-gray-800"}`}
        >
          Register
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 px-5">
        {/* Left: PHN Info + Illustration */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-end gap-6">
          <div className="max-w-[400px] w-full">
            <h2 className="text-2xl font-bold text-[#28328c] mb-2 tracking-tight">
              Welcome to <span className="text-[#14bef0]">PHN</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Physician Health Net — your trusted platform to find clinics, book
              appointments, and manage your health journey, all in one place.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { icon: "mdi:magnify", text: "Find verified clinics near you" },
                {
                  icon: "mdi:calendar-check",
                  text: "Book appointments instantly — no fees",
                },
                {
                  icon: "solar:chat-round-dots-bold",
                  text: "Chat directly with your clinic",
                },
                {
                  icon: "mdi:folder-heart-outline",
                  text: "Store & access medical records securely",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#14bef0]/10 flex items-center justify-center shrink-0">
                    <Icon
                      icon={item.icon}
                      className="text-[#14bef0] text-base"
                    />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* <img
            src={loginIllustration}
            alt="PHN Illustration"
            className="w-full max-w-[350px] object-contain"
          /> */}
        </div>

        {/* Right Form Container */}
        <div className="w-full md:w-[450px] bg-white border border-gray-200 rounded-sm p-8 shadow-sm">
          {isForgotPassword ? (
            <div className="fade-in flex flex-col gap-6">
              <div className="text-center mb-2">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Reset Password
                </h3>
                <p className="text-[13px] text-gray-500">
                  Enter your Mobile Number or Email and your new password.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] text-gray-500 font-semibold">Mobile Number / Email ID</label>
                  <input
                    type="text"
                    name="credential"
                    placeholder="Enter Mobile Number or Email"
                    required
                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:outline-none focus:border-[#14bef0] transition-colors font-medium text-gray-700"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] text-gray-500 font-semibold">New Password</label>
                  <div className="relative">
                    <input
                      type={showResetPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="New Password"
                      required
                      className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:outline-none focus:border-[#14bef0] transition-colors font-medium text-gray-700 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Icon icon={showResetPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} width={20} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] text-gray-500 font-semibold">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showResetConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      required
                      className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:outline-none focus:border-[#14bef0] transition-colors font-medium text-gray-700 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Icon icon={showResetConfirmPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} width={20} />
                    </button>
                  </div>
                </div>
                {passwordError && <p className="text-red-500 text-xs font-medium -mt-2">{passwordError}</p>}
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="w-full bg-[#14bef0] hover:bg-[#11a9d6] text-white font-semibold py-3 rounded-sm transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {forgotPasswordLoading ? "Resetting Password..." : "Reset Password"}
                </button>
              </form>
              
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setPasswordError("");
                }}
                className="text-xs text-gray-500 hover:text-[#14bef0] text-center transition-colors font-medium"
              >
                Back to Login
              </button>
            </div>
          ) : activeTab === "login" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPasswordError("");
                const formData = new FormData(e.target);
                const rawData = Object.fromEntries(formData.entries());

                const submitData = {
                  credential: rawData.email,
                  password: rawData.password,
                  remember: e.target.remember.checked,
                };

                handleLogin(submitData);
              }}
              className="fade-in flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-gray-500 font-semibold">
                  Mobile Number / Email ID
                </label>
                <input
                  type="text"
                  name="email"
                  placeholder="Mobile Number / Email ID"
                  className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:outline-none focus:border-[#14bef0] transition-colors font-medium text-gray-700"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-gray-500 font-semibold">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:outline-none focus:border-[#14bef0] transition-colors font-medium text-gray-700 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} width={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    className="w-4 h-4 accent-[#14bef0] cursor-pointer"
                    defaultChecked
                  />
                  <label
                    htmlFor="remember"
                    className="text-[13px] text-gray-500 cursor-pointer"
                  >
                    Remember me for 30 days
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setResetStep(1);
                    setPasswordError("");
                  }}
                  className="text-[13px] text-[#14bef0] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {passwordError && (
                <p className="text-red-500 text-xs font-medium -mt-2">
                  {passwordError}
                </p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#14bef0] hover:bg-[#11a9d6] text-white font-semibold py-3 rounded-sm transition-colors mt-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loginLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : showOtp ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const otp = formData.get("otp");

                // Restoring consistent identifier key (email) for OTP verification
                const submitData = {
                  email: registeredEmail,
                  otp,
                };

                handleVerifyOtp(submitData);
              }}
              className="fade-in flex flex-col gap-6"
            >
              <div className="text-center mb-2">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Verify OTP
                </h3>
                <p className="text-[13px] text-gray-500">
                  We've sent an OTP to{" "}
                  <span className="font-semibold text-gray-700">
                    {registeredEmail || "your email"}
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-gray-500 font-semibold">
                  Enter OTP
                </label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-sm p-2.5 focus:outline-none focus:border-[#14bef0] transition-colors font-medium text-gray-700 text-center tracking-widest text-lg"
                />
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <button
                  type="submit"
                  disabled={verifyOtpLoading}
                  className="w-full bg-[#14bef0] hover:bg-[#11a9d6] text-white font-semibold py-3 rounded-sm transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {verifyOtpLoading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtp(false)}
                  className="text-xs text-gray-500 hover:text-[#14bef0] text-center transition-colors font-medium"
                >
                  Back to Register
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPasswordError("");
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());

                if (data.password !== data.confirmPassword) {
                  setPasswordError("Passwords do not match");
                  return;
                }

                const { confirmPassword, ...submitData } = data;
                console.log(data);

                handleRegister(data);
              }}
              className="fade-in flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-gray-500 font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:outline-none focus:border-[#14bef0] transition-colors font-medium text-gray-700"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-gray-500 font-semibold">
                  Mobile Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phno"
                    placeholder="Mobile Number"
                    className="w-full border border-gray-300 rounded-r-sm p-2.5 text-sm focus:outline-none focus:border-[#14bef0] transition-colors font-medium text-gray-700"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-gray-500 font-semibold">
                  Email ID{" "}
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email ID"
                  className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:outline-none focus:border-[#14bef0] transition-colors font-medium text-gray-700"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-gray-500 font-semibold">
                  Address{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:outline-none focus:border-[#14bef0] transition-colors font-medium text-gray-700"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-gray-500 font-semibold">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create Password"
                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:outline-none focus:border-[#14bef0] transition-colors font-medium text-gray-700 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon icon={showRegPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} width={20} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-gray-500 font-semibold">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className={`w-full border ${passwordError ? "border-red-500" : "border-gray-300"} rounded-sm p-2.5 text-sm focus:outline-none focus:border-[#14bef0] transition-colors font-medium text-gray-700 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon icon={showRegConfirmPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} width={20} />
                  </button>
                </div>
                {passwordError && (
                  <span className="text-red-500 text-xs mt-1">{passwordError}</span>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center mt-2 leading-relaxed">
                By registering, you agree to our{" "}
                <a href="#" className="text-[#14bef0]">
                  Terms and Conditions
                </a>{" "}
                &{" "}
                <a href="#" className="text-[#14bef0]">
                  Privacy Policy
                </a>
              </p>

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full bg-[#14bef0] hover:bg-[#11a9d6] text-white font-semibold py-3 rounded-sm transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {registerLoading ? "Registering..." : "Register"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;
