import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import FindDoctorModal from "./FindDoctorModal";

const SubMenuForUser = ({ point, setOpenSubMenu }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("patientData");
    localStorage.removeItem("userData");
    Cookies.remove("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <ul
      className="flex flex-col gap-[12px] text-left bg-white p-4 w-[200px] fixed shadow-lg border border-gray-100 rounded-md z-50 py-3"
      style={{ top: `${point.y + 10}px`, left: `${point.x - 100}px` }}
    >
      <li
        onClick={() => {
          navigate("/dashboard");
          setOpenSubMenu(false);
        }}
        className="cursor-pointer hover:text-[#14bef0] text-[#2d2d32] text-[14px] font-medium transition-colors border-b border-gray-50 pb-2 flex items-center gap-2"
      >
        <Icon icon="mdi:view-dashboard" className="text-gray-400" /> My
        Dashboard
      </li>
      <li
        onClick={handleLogout}
        className="cursor-pointer hover:text-red-500 text-[#2d2d32] text-[14px] font-medium transition-colors pt-1 flex items-center gap-2"
      >
        <Icon icon="mdi:logout" className="text-gray-400" /> Logout
      </li>
    </ul>
  );
};

export const DashboardNavbar = () => {
  const navigate = useNavigate();
  const [openSubMenu, setOpenSubMenu] = useState(false);
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [showFindDoctorModal, setShowFindDoctorModal] = useState(false);

  const userStr = sessionStorage.getItem("userData");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleOpenUserMenu = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPoint({ x: rect.left, y: rect.bottom });
    setOpenSubMenu(!openSubMenu);
  };

  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-sm z-50 sticky top-0">
      <div className="max-w-7xl px-8 py-3 mx-auto flex flex-row justify-between items-center">
        <div className="flex flex-row gap-[50px] items-center">
          <div
            className="flex flex-row gap-[10px] items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Icon
              icon="material-symbols-light:dehaze-rounded"
              className="hidden max-lg:block"
              width="24"
              height="24"
            />
            <h1 className="font-bold text-[28px] text-[#28328c] tracking-tight">
              PHN
            </h1>
          </div>
          <ul className="flex flex-row gap-[20px] text-center max-lg:hidden">
            <li
              onClick={() => navigate("/")}
              className="cursor-pointer font-bold text-[#2d2d32] text-[16px] hover:text-[#14bef0] duration-200 ease-in-out"
            >
              Home
            </li>
            <li
              onClick={() => setShowFindDoctorModal(true)}
              className="cursor-pointer font-bold text-[#2d2d32] text-[16px] hover:text-[#14bef0] duration-200 ease-in-out"
            >
              Find Clinic
            </li>
          </ul>
        </div>
        <div className="flex flex-row gap-[30px] text-[#4b4b4b]">
          {user ? (
            <div
              className="cursor-pointer flex items-center gap-2 bg-[#f4f4f5] hover:bg-[#e4e4e7] px-3 py-1.5 rounded-full transition-colors group"
              onClick={handleOpenUserMenu}
            >
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                {user.fullName?.charAt(0) || user.name?.charAt(0) || "U"}
              </div>
              <span className="font-medium text-[15px] text-[#2d2d32] max-w-[120px] truncate hidden md:block">
                {user.fullName || user.name || "User"}
              </span>
              <Icon icon="material-symbols-light:keyboard-arrow-down-rounded" className="text-gray-500 group-hover:text-gray-700 transition-colors" width="20" />
            </div>
          ) : (
            <div
              className="flex flex-row items-center gap-1 cursor-pointer hover:text-[#14bef0] transition-colors text-[14px]"
              onClick={handleOpenUserMenu}
            >
              <span className="truncate max-w-[100px] font-medium">User</span>
              <Icon
                icon="material-symbols-light:keyboard-arrow-down-rounded"
                width="20"
                height="20"
              />
            </div>
          )}
        </div>
      </div>
      {openSubMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpenSubMenu(false)}
          ></div>
          <div onClick={() => setOpenSubMenu(false)}>
            <SubMenuForUser point={point} setOpenSubMenu={setOpenSubMenu} />
          </div>
        </>
      )}
      <FindDoctorModal isOpen={showFindDoctorModal} onClose={() => setShowFindDoctorModal(false)} />
    </div>
  );
};
