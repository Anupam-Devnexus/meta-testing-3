import { useState } from "react";
import { FaUsers } from "react-icons/fa";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { GrTableAdd, GrIntegration } from "react-icons/gr";
import { SlCalender } from "react-icons/sl";
import { MdLeaderboard } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";
import { SiGoogleads } from "react-icons/si";
import { IoLogoGoogleplus } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import { LuPartyPopper } from "react-icons/lu";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedRole = localStorage.getItem("userRole") || "User";
  const storedName = localStorage.getItem("userName") || "Guest";

  // Navigation Config
  const adminNav = [
    { icon: <RiAdminLine />, label: "Dashboard", path: "/admin-dashboard" },
    { icon: <LuPartyPopper />, label: "Oppurtunity", path: "/admin-dashboard/oppurtunity" },
    {
      icon: <FaUsers />,
      label: "Users",
      path: "/admin-dashboard/users",
      submenu: [
        { icon: <FaUsers />, sublabel: "All Users", path: "/admin-dashboard/users" },
      ],
    },
    {
      icon: <FaUsers />,
      label: "Leads",
      path: "/admin-dashboard/leads",
      submenu: [
        { icon: <FaUsers />, sublabel: "Create Lead", path: "/admin-dashboard/mannual-leads/add" },
        // { icon: <FaUsers />, sublabel: "All Leads", path: "/admin-dashboard/mannual-leads" },
      ],
    },
    { icon: <SiGoogleads />, label: "Manual Leads", path: "/admin-dashboard/mannual-leads" },
    { icon: <FaUsers />, label: "Website Leads", path: "/admin-dashboard/contact" },
    {
      icon: <FaUsers />,
      label: "Meta",
      path: "/admin-dashboard/meta",
      submenu: [
        { icon: <SiGoogleads />, sublabel: "Meta Leads", path: "/admin-dashboard/meta" },
        { icon: <FaUsers />, sublabel: "CA Leads", path: "/admin-dashboard/ca-leads" },
        { icon: <FaUsers />, sublabel: "Digital Leads", path: "/admin-dashboard/digital-leads" },
        { icon: <FaUsers />, sublabel: "Web Dev Leads", path: "/admin-dashboard/web-development-leads" },
        { icon: <FaUsers />, sublabel: "Travel Leads", path: "/admin-dashboard/travel-agency-leads" },
      ],
    },
    {
      icon: <IoLogoGoogleplus />,
      label: "Google",
      path: "/admin-dashboard/google",
      submenu: [
        { icon: <IoLogoGoogleplus />, sublabel: "Google Ads", path: "/admin-dashboard/google-ads" },
      ],
    },
    { icon: <RiAdminLine />, label: "Stats", path: "/admin-dashboard/stats" },
    { icon: <RiAdminLine />, label: "Blogs", path: "/admin-dashboard/blogs" },
    { icon: <SlCalender />, label: "Appointments", path: "/admin-dashboard/appointments" },
    { icon: <GrIntegration />, label: "Integrations", path: "/admin-dashboard/integrations" },
  ];

  const userNav = [
    { icon: <MdLeaderboard />, label: "My Leads", path: "/user-dashboard/leads" },
    { icon: <GrTableAdd />, label: "Follow Up", path: "/user-dashboard/follow-up" },
    { icon: <FiLogOut />, label: "Change Password", path: "/user-dashboard/change-password" },
  ];

  const navData = storedRole === "Admin" ? adminNav : userNav;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const handleNavigate = (path) => {
    navigate(path);
    setDropdownOpen(false);
    setOpenSubmenu(null);
  };

  const handleLogOut = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="w-64 h-screen bg-[var(--primary-color)]/95 backdrop-blur-lg text-white fixed top-0 left-0 shadow-xl flex flex-col border-r border-white/10">

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-wide">
          {storedRole === "Admin" ? "Admin Panel" : "User Panel"}
        </h1>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-white/20">
        <ul className="flex flex-col gap-2">
          {navData.map((item, idx) => {
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
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${isParentActive
                      ? "bg-white/20 font-semibold"
                      : "hover:bg-white/10"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.submenu && (
                    <FiChevronDown
                      className={`text-xs transition-transform ${openSubmenu === item.label ? "rotate-180" : ""
                        }`}
                    />
                  )}
                </div>

                {/* Submenu */}
                {item.submenu && openSubmenu === item.label && (
                  <ul className="pl-6 mt-1 space-y-1 border-l border-white/10">
                    {item.submenu.map((sub, subIdx) => {
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <li key={subIdx}>
                          <div
                            onClick={() => handleNavigate(sub.path)}
                            className={`flex items-center gap-2 py-2 px-2 text-sm rounded-md cursor-pointer transition-all duration-200 ${isSubActive
                                ? "text-[var(--primary-light)] font-semibold"
                                : "hover:text-[var(--primary-light)]"
                              }`}
                          >
                            {sub.icon}
                            <span>{sub.sublabel}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Profile Dropdown */}
      <div className="px-4 py-4 border-t border-white/10 relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center gap-2 bg-white text-[var(--primary-color)] px-3 py-2 rounded-lg shadow-md hover:bg-gray-100 transition"
        >
          <FiUser />
          <span className="text-sm truncate">Hi, {storedName}</span>
          <FiChevronDown className={`ml-auto transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute bottom-16 left-4 right-4 bg-white text-[var(--primary-color)] rounded-lg shadow-lg overflow-hidden animate-fade-in">
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
