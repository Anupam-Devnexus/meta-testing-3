import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RiAdminLine } from "react-icons/ri";
import { SiGoogleads } from "react-icons/si";
import { FiLogOut, FiChevronDown, FiUser, FiMenu, FiX } from "react-icons/fi";
import { MdOutlineFlightTakeoff } from "react-icons/md";
import { FaUsers } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedRole = localStorage.getItem("userRole") || "User";
  const storedName = localStorage.getItem("userName") || "";

  const adminNav = [
    { icon: <RiAdminLine />, label: "Admin Dashboard", path: "/admin-dashboard" },
    {
      icon: <SiGoogleads />,
      label: "Leads",
      path: "/admin-dashboard/leads",
      submenu: [
        {
          icon: <SiGoogleads />,
          sublabel: "Meta",
          path: "/admin-dashboard/meta",
          children: [
            { icon: <SiGoogleads />, sublabel: "Meta", path: "/admin-dashboard/meta" },
            { icon: <SiGoogleads />, sublabel: "Digital Marketing", path: "/admin-dashboard/meta/digital" },
            { icon: <SiGoogleads />, sublabel: "CA", path: "/admin-dashboard/meta/ca" },
            { icon: <SiGoogleads />, sublabel: "Web", path: "/admin-dashboard/meta/web" },
          ],
        },
        {
          icon: <SiGoogleads />,
          sublabel: "Third Party",
          path: "/admin-dashboard/third-party",
          children: [

            { icon: <SiGoogleads />, sublabel: "Manual", path: "/admin-dashboard/third-party/digital" },

            { icon: <SiGoogleads />, sublabel: "Web", path: "/admin-dashboard/third-party/web" },
          ],
        },
        {
          icon: <SiGoogleads />,
          sublabel: "Mannual Leads",
          path: "/admin-dashboard/mannual-leads",
        }
      ],
    },
    {
      icon: <FaUsers />,
      label: "Users",
      path: "/admin-dashboard/users",
      submenu: [
        { icon: <FaUsers />, sublabel: "All Users", path: "/admin-dashboard/users" },
      ],
    },
    {
      icon: <RiAdminLine />, label: "Stats", path: "/admin-dashboard/stats"
    },
    {
      icon:<FaUsers/>,label:"Contact",path:"/admin-dashboard/contact"
    }
  ];

  const userNav = [
    { icon: <MdOutlineFlightTakeoff />, label: "My Bookings", path: "/bookings" },
    { icon: <FiLogOut />, label: "Requests", path: "/requests" },
  ];

  const navdata = storedRole === "Admin" ? adminNav : userNav;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [openSubSubmenu, setOpenSubSubmenu] = useState(null);

  const handleNavigate = (path) => {
    navigate(path);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    setOpenSubmenu(null);
    setOpenSubSubmenu(null);
  };

  const handleLogOut = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="bg-[var(--primary-color)] text-white shadow-sm">
      <div className="flex justify-between items-center px-6 py-3">
        <h1 className="text-lg font-semibold">
          {storedRole === "Admin" ? "Admin Dashboard" : "User Dashboard"}
        </h1>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-4">
          {navdata.map((item, idx) => (
            <li key={idx} className="relative group">
              <div
                onClick={() => !item.submenu && handleNavigate(item.path)}
                className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded ${location.pathname.startsWith(item.path) ? "text-white" : "hover:text-[var(--primary-light)]"}`}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>

              {/* Desktop Submenu */}
              {item.submenu && (
                <ul className="absolute hidden group-hover:block z-50 bg-white text-[var(--primary-color)] rounded shadow-md  w-56">
                  {item.submenu.map((sub, subIdx) => (
                    <li key={subIdx} className="relative group/sub">
                      <div
                        onClick={() => !sub.children && handleNavigate(sub.path)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      >
                        {sub.icon}
                        {sub.sublabel}
                        {sub.children && <FiChevronDown className="ml-auto text-xs" />}
                      </div>

                      {/* Nested Submenu */}
                      {sub.children && (
                        <ul className="absolute left-full top-0 hidden group-hover/sub:block bg-white text-[var(--primary-color)] rounded shadow-md w-60">
                          {sub.children.map((child, cIdx) => (
                            <li
                              key={cIdx}
                              onClick={() => handleNavigate(child.path)}
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            >
                              {child.icon}
                              {child.sublabel}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-white text-[var(--primary-color)] px-3 py-1 rounded hover:bg-gray-100"
          >
            <FiUser />
            <span className="hidden sm:inline text-sm">Hi, {storedName}</span>
            <FiChevronDown />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 w-36 bg-white text-[var(--primary-color)] rounded shadow-sm z-50">
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

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <ul className="flex flex-col px-6 pb-4 gap-2 md:hidden bg-[var(--primary-color)]">
          {navdata.map((item, idx) => (
            <li key={idx}>
              <div
                onClick={() => item.submenu ? setOpenSubmenu(openSubmenu === item.label ? null : item.label) : handleNavigate(item.path)}
                className="flex items-center justify-between py-2 px-2 text-sm cursor-pointer hover:text-[var(--primary-light)]"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.submenu && <FiChevronDown className="text-xs" />}
              </div>

              {/* First Level Submenu */}
              {item.submenu && openSubmenu === item.label && (
                <ul className="pl-4">
                  {item.submenu.map((sub, subIdx) => (
                    <li key={subIdx}>
                      <div
                        onClick={() => sub.children ? setOpenSubSubmenu(openSubSubmenu === sub.sublabel ? null : sub.sublabel) : handleNavigate(sub.path)}
                        className="flex items-center justify-between py-2 px-2 text-sm hover:text-[var(--primary-light)] cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {sub.icon}
                          {sub.sublabel}
                        </div>
                        {sub.children && <FiChevronDown className="text-xs" />}
                      </div>

                      {/* Second Level Submenu */}
                      {sub.children && openSubSubmenu === sub.sublabel && (
                        <ul className="pl-6">
                          {sub.children.map((child, cIdx) => (
                            <li
                              key={cIdx}
                              onClick={() => handleNavigate(child.path)}
                              className="flex items-center gap-2 py-1 text-sm hover:text-[var(--primary-light)] cursor-pointer"
                            >
                              {child.icon}
                              {child.sublabel}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
