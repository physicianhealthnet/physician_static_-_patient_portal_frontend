import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { AxiosInstanceDependency } from "../utilities/AxiosInstance";
import SEO from "../components/SEO";

function AdminLogin() {
  const navigate = useNavigate();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await AxiosInstanceDependency.post("auth/login", {
        credential,
        password,
      });

      const { token, user } = res.data;

      if (user && user.role === "admin") {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("adminUser", JSON.stringify(user));
        navigate("/admin/dashboard");
      } else {
        setError("Access denied: You do not have administrative privileges.");
      }
    } catch (err) {
      console.error("Admin Login Error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-100px)] flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Admin Login | Physician Health Net"
        description="Access the administrative dashboard of Physician Health Net to manage clinics and medical teams."
        url="/admin/login"
      />

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100 transition-all duration-300">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-50 text-[#28328c] rounded-2xl flex items-center justify-center shadow-inner">
            <Icon icon="solar:shield-keyhole-bold-duotone" className="text-4xl" />
          </div>
          <h2 className="mt-6 text-3xl font-black text-[#28328c] tracking-tight">
            Administrator Portal
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Sign in to manage clinics, rosters, and generate system credentials.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 animate-pulse">
            <Icon icon="solar:danger-bold-duotone" className="text-red-500 text-xl shrink-0" />
            <span className="text-xs text-red-700 font-bold">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Admin Email or Phone
              </label>
              <div className="relative mt-1 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Icon icon="solar:user-bold-duotone" className="text-lg" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin@phn.com"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-blue-500/30 focus:bg-white rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative mt-1 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Icon icon="solar:lock-keyhole-bold-duotone" className="text-lg" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 focus:border-blue-500/30 focus:bg-white rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Icon
                    icon={showPassword ? "solar:eye-bold-duotone" : "solar:eye-closed-bold-duotone"}
                    className="text-lg"
                  />
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white bg-[#28328c] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-lg shadow-blue-900/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Icon icon="solar:spinner-linear" className="animate-spin text-xl" />
              ) : (
                "Authenticate Admin"
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Demo Credentials:
          </p>
          <p className="text-xs text-[#14bef0] font-bold mt-1">
            admin@phn.com / adminPassword123
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
