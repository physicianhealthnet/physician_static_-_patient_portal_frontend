import { Icon } from "@iconify/react";
import { LoginButton } from "./Buttons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FindDoctorModal from "./FindDoctorModal";

export const HomeNavBar = () => {
  const [openSubMenu, setOpenSubMenu] = useState(false);
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [type, setType] = useState("");
  const [showFindDoctorModal, setShowFindDoctorModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenSubMenu = (e, menuType) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Set point to the center bottom of the clicked item
    setPoint({ x: rect.left + rect.width / 2, y: rect.bottom });
    
    if (openSubMenu && type === menuType) {
      setOpenSubMenu(false);
      setType("");
    } else {
      setOpenSubMenu(true);
      setType(menuType);
    }
  };

  const userStr = sessionStorage.getItem("userData");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-sm z-50 sticky top-0">
      <div className="max-w-7xl px-8 py-4 mx-auto flex flex-row justify-between items-center">
        <div className="flex flex-row gap-12 items-center">
          <div className="flex flex-row gap-2 items-center">
            <button 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(true);
              }}
            >
              <Icon
                icon="material-symbols-light:dehaze-rounded"
                className="text-gray-800"
                width="24"
              />
            </button>
            <h1
              className="font-bold text-3xl text-[#28328c] cursor-pointer tracking-tight"
              onClick={() => navigate("/")}
            >
              PHN
            </h1>
          </div>
          <ul className="flex flex-row gap-6 items-center max-lg:hidden">
            <li
              onClick={() => setShowFindDoctorModal(true)}
              className="cursor-pointer font-medium text-[#2d2d32] text-[15px] hover:text-[#14bef0] transition-colors"
            >
              Find a Clinic
            </li>
            <li
              onClick={() => navigate("/dashboard/appointments")}
              className="cursor-pointer font-medium text-[#2d2d32] text-[15px] hover:text-[#14bef0] transition-colors"
            >
              Chat
            </li>
            <li
              onClick={() => setShowFindDoctorModal(true)}
              className="cursor-pointer font-medium text-[#2d2d32] text-[15px] hover:text-[#14bef0] transition-colors"
            >
              Appointments
            </li>
          </ul>
        </div>

        <div className="flex flex-row gap-8 items-center max-md:gap-4">
          {user && (
            <ul className="flex flex-row gap-6 items-center max-lg:hidden">
              <li
                onClick={() => navigate("/dashboard")}
                className="cursor-pointer font-medium text-[#4b4b4b] text-[15px] hover:text-[#14bef0] transition-colors"
              >
                My Dashboard
              </li>
              <li
                onClick={() => navigate("/dashboard/appointments")}
                className="cursor-pointer font-medium text-[#4b4b4b] text-[15px] hover:text-[#14bef0] transition-colors"
              >
                My Appointments
              </li>
              <li
                onClick={() => navigate("/dashboard/attend-clinics")}
                className="cursor-pointer font-medium text-[#4b4b4b] text-[15px] hover:text-[#14bef0] transition-colors"
              >
                My Hospitals
              </li>
              <li
                onClick={() => navigate("/dashboard/attend-clinics")}
                className="cursor-pointer font-medium text-[#4b4b4b] text-[15px] hover:text-[#14bef0] transition-colors"
              >
                My Prescriptions
              </li>
            </ul>
          )}
          
          {user ? (
            <div className="flex items-center gap-6">
              <div
                className="cursor-pointer flex items-center gap-2 bg-[#f4f4f5] hover:bg-[#e4e4e7] px-3 py-1.5 rounded-full transition-colors group"
                onClick={(e) => handleOpenSubMenu(e, "user")}
              >
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                  {user.fullName?.charAt(0) || user.name?.charAt(0) || "U"}
                </div>
                <span className="font-medium text-[15px] text-[#2d2d32] max-w-[120px] truncate hidden md:block">
                  {user.fullName || user.name || "User"}
                </span>
                <Icon icon="material-symbols-light:keyboard-arrow-down-rounded" className="text-gray-500 group-hover:text-gray-700 transition-colors" width="20" />
              </div>
            </div>
          ) : (
            <button 
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-[#14bef0] hover:bg-[#12abd8] text-white rounded-md text-[15px] font-medium shadow-sm transition-colors"
            >
              Login / Signup
            </button>
          )}
        </div>
      </div>

      {openSubMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpenSubMenu(false)}
          ></div>
          <SubMenu point={point} type={type} onClose={() => setOpenSubMenu(false)} />
        </>
      )}

      <FindDoctorModal
        isOpen={showFindDoctorModal}
        onClose={() => setShowFindDoctorModal(false)}
      />

      {/* Mobile Menu Slider */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-[101] transform transition-transform duration-300 ease-out">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h1 className="font-black text-2xl text-blue-600 tracking-tighter">PHN Menu</h1>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Icon icon="solar:close-circle-linear" className="text-slate-500" width="24" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Navigation</p>
                <ul className="space-y-2">
                  {[
                    { label: "Find a Clinic", onClick: () => setShowFindDoctorModal(true) },
                    { label: "Chat", onClick: () => navigate("/dashboard/appointments") },
                    { label: "Appointments", onClick: () => setShowFindDoctorModal(true) }
                  ].map((item) => (
                    <li
                      key={item.label}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        item.onClick();
                      }}
                      className="cursor-pointer font-bold text-slate-700 text-lg py-3 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              {user && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My Account</p>
                  <ul className="space-y-1">
                    {[
                      { label: "My Dashboard", path: "/dashboard" },
                      { label: "My Appointments", path: "/dashboard/appointments" },
                      { label: "My Hospitals", path: "/dashboard/attend-clinics" },
                      { label: "My Prescriptions", path: "/dashboard/attend-clinics" }
                    ].map((item) => (
                      <li
                        key={item.label}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate(item.path);
                        }}
                        className="cursor-pointer text-slate-600 font-bold text-sm py-2 px-4 rounded-lg hover:bg-slate-50 transition-all"
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {user && (
              <div className="p-6 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all"
                >
                  <Icon icon="solar:logout-linear" width="18" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MenuWrapper = ({ children, point, width = "200px", align = "center" }) => (
  <div
    className="fixed z-50 animate-in fade-in zoom-in-95 duration-200"
    style={{ 
      top: `${point.y + 12}px`, 
      left: `${point.x}px`,
      transform: align === "center" ? "translateX(-50%)" : align === "right" ? "translateX(-90%)" : "none"
    }}
  >
    <div 
      className="bg-white/90 backdrop-blur-2xl border border-slate-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl p-2 overflow-hidden"
      style={{ width }}
    >
      {children}
    </div>
  </div>
);

const MenuItem = ({ label, icon, onClick, variant = "default" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-bold
      ${variant === "danger" 
        ? "text-red-600 hover:bg-red-50" 
        : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
      }`}
  >
    {icon && <Icon icon={icon} width="18" className={variant === "danger" ? "text-red-500" : "text-slate-400 group-hover:text-blue-500"} />}
    {label}
  </button>
);

const SubMenu = ({ point, type, onClose }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
    window.location.reload();
  };

  switch (type) {
    case "user":
      return (
        <MenuWrapper point={point} width="220px" align="right">
          <MenuItem label="My Dashboard" icon="solar:widget-bold-duotone" onClick={() => { navigate("/dashboard"); onClose(); }} />
          <MenuItem label="Profile Settings" icon="solar:settings-linear" onClick={() => { navigate("/settings"); onClose(); }} />
          <div className="h-px bg-slate-100 my-1 mx-2" />
          <MenuItem label="Logout" icon="solar:logout-linear" variant="danger" onClick={handleLogout} />
        </MenuWrapper>
      );
    default:
      return null;
  }
};
