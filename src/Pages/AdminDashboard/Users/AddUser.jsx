import { useState, useCallback, useMemo } from "react";
import { RiAdminLine } from "react-icons/ri";
import { FaUsers } from "react-icons/fa";
import { SiGoogleads } from "react-icons/si";
import { IoLogoGoogleplus } from "react-icons/io";
import { SlCalender } from "react-icons/sl";
import { GrIntegration } from "react-icons/gr";

// Navigation structure for page access
const adminNav = [
  { label: "Dashboard", path: "/admin-dashboard" },
  { label: "Opportunity", path: "/admin-dashboard/oppurtunity" },
  {
    label: "Users",
    path: "/admin-dashboard/users",
    submenu: [{ label: "All Users", path: "/admin-dashboard/users" }],
  },
  {
    label: "Leads",
    path: "/admin-dashboard/leads",
    submenu: [{ label: "Create Lead", path: "/admin-dashboard/mannual-leads/add" }],
  },
  { label: "Manual Leads", path: "/admin-dashboard/mannual-leads" },
  { label: "Website Leads", path: "/admin-dashboard/contact" },
  {
    label: "Meta",
    path: "/admin-dashboard/meta",
    submenu: [
      { label: "Meta Leads", path: "/admin-dashboard/meta" },
      { label: "CA Leads", path: "/admin-dashboard/ca-leads" },
      { label: "Digital Leads", path: "/admin-dashboard/digital-leads" },
      { label: "Web Dev Leads", path: "/admin-dashboard/web-development-leads" },
      { label: "Travel Leads", path: "/admin-dashboard/travel-agency-leads" },
    ],
  },
  {
    label: "Google",
    path: "/admin-dashboard/google",
    submenu: [{ label: "Google Ads", path: "/admin-dashboard/google-ads" }],
  },
  { label: "Stats", path: "/admin-dashboard/stats" },
  { label: "Appointments", path: "/admin-dashboard/appointments" },
  { label: "Integrations", path: "/admin-dashboard/integrations" },
];

// Recursive checkbox for submenu support
const AccessCheckbox = ({ item, formData, handleChange }) => {
  const isChecked = formData.access.some((a) => a.path === item.path);

  const areChildrenChecked =
    item.submenu &&
    item.submenu.every((sub) => formData.access.some((a) => a.path === sub.path));

  return (
    <div className="mb-3">
      <label
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
          isChecked ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-100"
        }`}
      >
        <input
          type="checkbox"
          name="access"
          value={item.path}
          checked={isChecked || areChildrenChecked}
          onChange={(e) => handleChange(e, item)}
          className="h-4 w-4 accent-blue-600"
        />
        {item.label}
      </label>

      {item.submenu && (
        <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
          {item.submenu.map((sub, subIdx) => (
            <AccessCheckbox
              key={subIdx}
              item={sub}
              formData={formData}
              handleChange={handleChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Reusable input component
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
  const initialFormState = useMemo(
    () => ({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "",
      adminId: "",
      access: [],
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Recursive helper to collect submenu paths
  const collectChildren = (item) => {
    let paths = [{ label: item.label, path: item.path }];
    if (item.submenu) {
      item.submenu.forEach((sub) => {
        paths = [...paths, ...collectChildren(sub)];
      });
    }
    return paths;
  };

  // Handle input + checkbox changes
  const handleChange = useCallback((e, item) => {
    const { name, value, checked } = e.target;

    if (name === "access") {
      const allPaths = collectChildren(item);
      setFormData((prev) => {
        let updatedAccess = [...prev.access];
        if (checked) {
          allPaths.forEach((p) => {
            if (!updatedAccess.some((a) => a.path === p.path)) {
              updatedAccess.push(p);
            }
          });
        } else {
          updatedAccess = updatedAccess.filter(
            (a) => !allPaths.some((p) => p.path === a.path)
          );
        }
        return { ...prev, access: updatedAccess };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword, role, access } = formData;

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

    // 🔑 Get logged-in user for adminId
    const loggedInUser = JSON.parse(localStorage.getItem("User"));
    let adminId = null;
    if (loggedInUser?.role === "admin") {
      adminId = loggedInUser.id;
    }

    const payload = {
      EmpUsername: name,
      email,
      phone,
      password,
      confirmPassword,
      role,
      adminId,
      isActive: true,
      permissions: access,
      lastLogin: null,
    };

    try {
      const response = await fetch(
        "https://dbbackend.devnexussolutions.com/auth/api/signup-users",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setSuccess("User added successfully!");
        setFormData(initialFormState);
        setError("");
      } else {
        setError(result.message || "Something went wrong!");
        setSuccess("");
      }
    } catch (err) {
      console.error(err);
      setError("Network or server error");
      setSuccess("");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Add New User
        </h2>

        {error && <p className="mb-4 text-center text-red-600 font-medium">{error}</p>}
        {success && (
          <p className="mb-4 text-center text-green-600 font-medium">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
          />

          <InputField
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />

          {/* Role */}
          <div className="flex flex-col">
            <label htmlFor="role" className="mb-2 text-gray-700 font-medium">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-style"
              required
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <InputField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />

          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
          />

          {/* Page Access */}
          <div className="sm:col-span-2">
            <label className="block text-gray-700 font-medium mb-2">
              Page Access
            </label>
            <div className="bg-gray-50 rounded-xl p-4 max-h-[400px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adminNav.map((item, idx) => (
                <AccessCheckbox
                  key={idx}
                  item={item}
                  formData={formData}
                  handleChange={handleChange}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
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
