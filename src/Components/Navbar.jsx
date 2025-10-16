import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useCaleads from "../Zustand/Caleads";

// Icons
import {
  FaUsers,
  FaChevronDown,
  FaChartLine,
  FaFacebook,
} from "react-icons/fa";
import {
  FiChevronDown,
  FiUser,
} from "react-icons/fi";
import {
  RiAdminLine,
} from "react-icons/ri";
import {
  SiGoogleads,
} from "react-icons/si";
import {
  LuPartyPopper,
} from "react-icons/lu";
import {
  MdLeaderboard,
} from "react-icons/md";
import {
  SlCalender,
} from "react-icons/sl";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Zustand store for CA leads
  const { fetchCaleads, loading, campaignNames } = useCaleads();

  // Facebook connection
  const fb_connect = localStorage.getItem("fb_connect") === "true";

  // Fetch Meta Campaigns only if connected
  useEffect(() => {
    if (fb_connect) fetchCaleads();
  }, [fb_connect, fetchCaleads]);

  // User info
  const storedUser = JSON.parse(localStorage.getItem("UserDetails") || "{}");
  const { role = "user", name = "Guest", permissions = [] } = storedUser;

  // UI state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  // Navigation handler
  const handleNavigate = (path) => {
    navigate(path);
    setDropdownOpen(false);
    setOpenSubmenu(null);
  };

  // Logout
  const handleLogOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ---------------------------
  // Admin Navigation
  // ---------------------------
  const adminNav = useMemo(() => {
    const baseNav = [
      { icon: <RiAdminLine />, label: "Dashboard", path: "/admin-dashboard" },
      { icon: <LuPartyPopper />, label: "Opportunities", path: "/admin-dashboard/oppurtunity" },
      { icon: <FaUsers />, label: "Users", path: "/admin-dashboard/users" },
      {
        icon: <FaUsers />,
        label: "Leads",
        path: "/admin-dashboard/leads",
        submenu: [
          { icon: <FaUsers />, sublabel: "Create Lead", path: "/admin-dashboard/mannual-leads/add" },
        ],
      },
      { icon: <SiGoogleads />, label: "Manual Leads", path: "/admin-dashboard/mannual-leads" },
      { icon: <FaUsers />, label: "Website Leads", path: "/admin-dashboard/website" },
    ];

    // Add Meta menu only if FB connected
    if (fb_connect) {
      baseNav.push({
        icon: <FaFacebook />,
        label: "Meta",
        path: "/admin-dashboard/meta",
        submenu: loading
          ? Array(3)
            .fill(null)
            .map((_, i) => ({
              icon: <FaUsers />,
              sublabel: `Loading ${i + 1}...`,
              loading: true,
              path: "#",
            }))
          : campaignNames?.length > 0
            ? campaignNames.map((campaign) => ({
              icon: <FaUsers />,
              sublabel: campaign,
              path: `/admin-dashboard/meta/${encodeURIComponent(campaign)}`,
            }))
            : [
              {
                icon: <FaChevronDown />,
                sublabel: "No Campaigns Found",
                path: "#",
              },
            ],
      });
    } else {
      baseNav.push({
        icon: <FaFacebook />,
        label: "Meta (Connect FB)",
        path: "#",
        // submenu: [
        //   {
        //     icon: <FaChevronDown />,
        //     sublabel: "Connect Facebook to view",
        //     path: "#",
        //   },
        // ],
      });
    }


    // Remaining nav items
    baseNav.push(
      { icon: <FaChartLine />, label: "Stats", path: "/admin-dashboard/stats" },
      { icon: <SlCalender />, label: "Appointments", path: "/admin-dashboard/appointments" },
      { icon: <SiGoogleads />, label: "Google", path: "/admin-dashboard/google" }

    );

    return baseNav;
  }, [loading, campaignNames, fb_connect]);

  // ---------------------------
  // 🧭 User Navigation
  // ---------------------------
  const userNav = useMemo(
    () =>
      permissions.map((perm) => ({
        icon: <MdLeaderboard />,
        label: perm.label,
        path: perm.path,
      })),
    [permissions]
  );

  const navData = role === "admin" ? adminNav : userNav;

  // ---------------------------
  //  Render UI
  // ---------------------------
  return (
    <nav className="h-screen bg-gradient-to-b from-[#0743c4] to-[#0e237e] text-white fixed top-0 left-0 shadow-xl flex flex-col border-r border-white/10 w-64 transition-all duration-300">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-wide">
          {role === "admin" ? "Admin Panel" : "User Panel"}
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-white/20">
        <ul className="flex flex-col gap-2">
          {navData.map((item) => {
            const isParentActive =
              location.pathname === item.path ||
              (item.submenu &&
                item.submenu.some((sub) => location.pathname === sub.path));

            return (
              <li key={item.label}>
                {/* Parent item */}
                <div
                  onClick={() =>
                    item.submenu
                      ? setOpenSubmenu(
                        openSubmenu === item.label ? null : item.label
                      )
                      : handleNavigate(item.path)
                  }
                  className={`flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${isParentActive
                      ? "bg-white/20 font-semibold"
                      : "hover:bg-white/10"
                    }`}
                >
                  <div className="flex items-center gap-3 text-sm md:text-base">
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
                    {item.submenu.map((sub) => {
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <li key={sub.sublabel}>
                          <div
                            onClick={() => !sub.loading && handleNavigate(sub.path)}
                            className={`flex items-center gap-2 py-2 px-2 text-sm rounded-md cursor-pointer transition-all duration-200 ${sub.loading
                                ? "bg-white/10 animate-pulse opacity-70"
                                : isSubActive
                                  ? "text-[#dcdc3c] font-semibold"
                                  : "hover:text-[#dcdc3c]"
                              }`}
                          >
                            {sub.icon}
                            <span className="truncate">
                              {sub.loading ? (
                                <span className="bg-white/30 w-28 h-3 rounded-md animate-pulse inline-block"></span>
                              ) : (
                                sub.sublabel
                              )}
                            </span>
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
          className="w-full flex items-center gap-2 bg-white text-[#141414] px-3 py-2 rounded-lg shadow-md hover:bg-gray-100 transition"
        >
          <FiUser />
          <span className="text-sm truncate">Hi, {name}</span>
          <FiChevronDown
            className={`ml-auto transition-transform ${dropdownOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute bottom-16 left-4 right-4 bg-white text-[#141414] rounded-lg shadow-lg overflow-hidden animate-fade-in z-50">
            <button
              onClick={() =>
                handleNavigate(
                  role === "admin" ? "/admin-profile" : "/user-profile"
                )
              }
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
