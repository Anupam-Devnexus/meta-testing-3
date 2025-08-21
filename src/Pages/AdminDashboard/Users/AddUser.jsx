import { useState, useEffect, useCallback } from "react";
import { RiAdminLine } from "react-icons/ri";
import { FaUsers } from "react-icons/fa";
import { SiGoogleads } from "react-icons/si";
import { IoLogoGoogleplus } from "react-icons/io";
import { SlCalender } from "react-icons/sl";
import { GrIntegration } from "react-icons/gr";

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
  { icon: <IoLogoGoogleplus />, label: "Google Ads", path: "/admin-dashboard/google-ads" },
  { icon: <RiAdminLine />, label: "Stats", path: "/admin-dashboard/stats" },
  { icon: <FaUsers />, label: "Contact", path: "/admin-dashboard/contact" },
  { icon: <RiAdminLine />, label: "Blogs", path: "/admin-dashboard/blogs" },
  { icon: <SlCalender />, label: "Appointments", path: "/admin-dashboard/appointments" },
  { icon: <GrIntegration />, label: "Integrations", path: "/admin-dashboard/integrations" },
];

const InputField = ({ label, name, type = "text", value, onChange, placeholder }) => (
  <div className="flex flex-col">
    <label className="mb-2 text-gray-700 font-medium">{label}</label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="input-style"
      required
    />
  </div>
);

export default function AddUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    access: [],
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // console.log("Admin Nav Routes:");
    adminNav.forEach(item => {
      // console.log(item.path, item.label);
      // item.submenu?.forEach(sub => console.log(sub.path, sub.sublabel));
    });
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      if (name === "access") {
        return {
          ...prev,
          access: checked ? [...prev.access, value] : prev.access.filter(p => p !== value),
        };
      }
      return { ...prev, [name]: value };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword, role } = formData;

    if (!name || !email || !phone || !password || !confirmPassword || !role) {
      setError("All fields are required!");
      setSuccess("");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setSuccess("");
      return;
    }

    setError("");
    console.log("Form Data:", formData);
    try {
      const response = await fetch("https://dbbackend.devnexussolutions.com/auth/api/signup-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccess("User added successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          role: "",
          access: [],
        });
      } else {
        setError(result.message || "Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      setError("Network or server error");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl p-6 bg-gray-50 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Add New User</h2>

        {error && <p className="mb-4 text-center text-red-600 font-medium">{error}</p>}
        {success && <p className="mb-4 text-center text-green-600 font-medium">{success}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField label="Name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" />
          <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter email" />
          <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" />

          <div className="flex flex-col">
            <label className="mb-2 text-gray-700 font-medium">Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="input-style" required>
              <option value="" disabled>Select Role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter password" />
          <InputField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />

          {/* Page Access */}
          <div className="flex flex-col sm:col-span-2">
            <label className="mb-2 text-gray-700 font-medium">Page Access</label>
            <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {adminNav.map((item, idx) => (
                <div key={idx} className="border-b pb-2">
                  <label className="flex items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      name="access"
                      value={item.path}
                      checked={formData.access.includes(item.path)}
                      onChange={handleChange}
                    />
                    {item.label}
                  </label>
                  {item.submenu && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.submenu.map((sub, subIdx) => (
                        <label key={subIdx} className="flex items-center gap-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            name="access"
                            value={sub.path}
                            checked={formData.access.includes(sub.path)}
                            onChange={handleChange}
                          />
                          {sub.sublabel}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="sm:col-span-2 w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition duration-200"
          >
            Submit
          </button>
        </form>
      </div>

      <style jsx>{`
        .input-style {
          border: 1px solid #d1d5db;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          outline: none;
          transition: border 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .input-style:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
}
