import { useState } from "react";
import { FaUsers } from "react-icons/fa";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { GrTableAdd } from "react-icons/gr";
import { SlCalender } from "react-icons/sl";
import { MdLeaderboard } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";
import { GrIntegration } from "react-icons/gr";
import { SiGoogleads } from "react-icons/si";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedRole = localStorage.getItem("userRole") || "User";
  const storedName = localStorage.getItem("userName") || "";

  const adminNav = [
    { icon: <RiAdminLine />, label: "Admin Dashboard", path: "/admin-dashboard" },
    {
      icon: <FaUsers />,
      label: "Create Users",
      path: "/admin-dashboard/users",
      submenu: [{ icon: <FaUsers />, sublabel: "All Users", path: "/admin-dashboard/users" }],
    },
    {
      icon: <FaUsers />,
      label: "Leads",
      path: "/admin-dashboard/users",
      submenu: [
        { icon: <FaUsers />, sublabel: "Create Leads", path: "/admin-dashboard/mannual-leads/add" },
        { icon: <FaUsers />, sublabel: "All New Leads", path: "/admin-dashboard/mannual-leads" },
      ],
    },
    {
      icon: <SiGoogleads />,
      label: "Lead Source",
      path: "/admin-dashboard/leads",
      submenu: [
        { icon: <SiGoogleads />, sublabel: "Meta Leads", path: "/admin-dashboard/meta" },
        { icon: <SiGoogleads />, sublabel: "Mannual Leads", path: "/admin-dashboard/mannual-leads" },
        { icon: <FaUsers />, sublabel: "Company Website Leads", path: "/admin-dashboard/contact" },
      ],
    },
    {
      icon: <FaUsers />,
      label: "All Leads",
      path: "/admin-dashboard/all-leads",
      submenu: [
        { icon: <FaUsers />, sublabel: "CA Leads", path: "/admin-dashboard/ca-leads" },
        { icon: <FaUsers />, sublabel: "Digital Leads", path: "/admin-dashboard/digital-leads" },
        { icon: <FaUsers />, sublabel: "Web Development Leads", path: "/admin-dashboard/web-development-leads" },
        { icon: <FaUsers />, sublabel: "Travel Agency Leads", path: "/admin-dashboard/travel-agency-leads" },
      ],
    },
    {
      icon: <RiAdminLine />,
      label: "Stats",
      path: "/admin-dashboard/stats",
    },
    {
      icon: <FaUsers />,
      label: "Contact",
      path: "/admin-dashboard/contact",
    },
        {
      icon: <RiAdminLine />,
      label: "Blogs",
      path: "/admin-dashboard/blogs",
    },
    {
      icon: <SlCalender />,
      label: "Appointments",
      path:"/admin-dashboard/appointments"
    },
    {
      icon: <GrIntegration />,
      label: "Integrations",
      path: "/admin-dashboard/integrations",
    }
  ];

  const userNav = [
    { icon: <MdLeaderboard />, label: "My Leads", path: "/user-dashboard/leads" },
    { icon: <GrTableAdd />, label: "Follow Up", path: "/user-dashboard/follow-up" },
    { icon: <FiLogOut />, label: "Change Password", path: "/user-dashboard/change-password" },
  ];

  const navdata = storedRole === "Admin" ? adminNav : userNav;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [openSubSubmenu, setOpenSubSubmenu] = useState(null);

  const handleNavigate = (path) => {
    navigate(path);
    setDropdownOpen(false);
    setOpenSubmenu(null);
    setOpenSubSubmenu(null);
  };

  const handleLogOut = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="w-64 min-h-screen bg-[var(--primary-color)] text-white fixed top-0 left-0 shadow-md z-50">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/20">
        <h1 className="text-lg font-bold">
          {storedRole === "Admin" ? "Admin Panel" : "User Panel"}
        </h1>
      </div>

      {/* Navigation Links */}
      <ul className="flex flex-col px-4 py-4 gap-2">
        {navdata.map((item, idx) => {
          const isParentActive =
            location.pathname === item.path ||
            (item.submenu && item.submenu.some((sub) => location.pathname === sub.path));

          return (
            <li key={idx}>
              <div
                onClick={() =>
                  item.submenu
                    ? setOpenSubmenu(openSubmenu === item.label ? null : item.label)
                    : handleNavigate(item.path)
                }
                className={`flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-white/10 ${
                  isParentActive ? "bg-white/20" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.submenu && <FiChevronDown className="text-xs" />}
              </div>

              {/* Submenu */}
              {item.submenu && openSubmenu === item.label && (
                <ul className="pl-4 mt-1">
                  {item.submenu.map((sub, subIdx) => {
                    const isSubActive = location.pathname === sub.path;
                    return (
                      <li key={subIdx}>
                        <div
                          onClick={() =>
                            sub.children
                              ? setOpenSubSubmenu(
                                  openSubSubmenu === sub.sublabel ? null : sub.sublabel
                                )
                              : handleNavigate(sub.path)
                          }
                          className={`flex items-center justify-between py-2 px-2 text-sm cursor-pointer hover:text-[var(--primary-light)] ${
                            isSubActive ? "text-[var(--primary-light)] font-semibold" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {sub.icon}
                            <span>{sub.sublabel}</span>
                          </div>
                          {sub.children && <FiChevronDown className="text-xs" />}
                        </div>

                        {/* Nested submenu */}
                        {sub.children && openSubSubmenu === sub.sublabel && (
                          <ul className="pl-4">
                            {sub.children.map((child, cIdx) => (
                              <li
                                key={cIdx}
                                onClick={() => handleNavigate(child.path)}
                                className={`flex items-center gap-2 py-1 text-sm hover:text-[var(--primary-light)] cursor-pointer ${
                                  location.pathname === child.path
                                    ? "text-[var(--primary-light)] font-semibold"
                                    : ""
                                }`}
                              >
                                {child.icon}
                                {child.sublabel}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {/* Profile Dropdown */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center gap-2 bg-white text-[var(--primary-color)] px-3 py-2 rounded hover:bg-gray-100"
        >
          <FiUser />
          <span className="text-sm">Hi, {storedName}</span>
          <FiChevronDown className="ml-auto" />
        </button>
        {dropdownOpen && (
          <div className="bg-white text-[var(--primary-color)] mt-1 rounded shadow-sm z-50">
            <button
              onClick={() => alert("View Profile")}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              View Profile
            </button>
            <button
              onClick={handleLogOut}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-t"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
