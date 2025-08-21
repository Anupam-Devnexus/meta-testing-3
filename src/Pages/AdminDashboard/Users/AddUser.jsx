import { useState, useCallback, useMemo } from "react";

// Backend-friendly navigation (no icons, consistent labels)
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

// Recursive Access Checkbox Component
const AccessCheckbox = ({ item, formData, handleChange }) => {
  const isChecked = formData.access.some((a) => a.path === item.path);

  const areChildrenChecked =
    item.submenu &&
    item.submenu.every((sub) => formData.access.some((a) => a.path === sub.path));
  // console.log(formData.role)
  return (
    <div className="mb-3">
      <label
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${isChecked ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-100"
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
import { useState } from "react";
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
<<<<<<< HEAD
  const initialFormState = useMemo(
    () => ({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "",
      adminId: "", // NEW FIELD
      access: [],
    }),
    []
  );
=======
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
>>>>>>> 390aa61 (mukti changes in UI)

  const [formData, setFormData] = useState(initialFormState);
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

  // Recursive helper to collect all submenu paths
  const collectChildren = (item) => {
    let paths = [{ label: item.label, path: item.path }];
    if (item.submenu) {
      item.submenu.forEach((sub) => {
        paths = [...paths, ...collectChildren(sub)];
      });
    }
    return paths;
  };

  // Handle input changes
  const handleChange = useCallback((e, item) => {
    const { name, value, checked } = e.target;

<<<<<<< HEAD
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
=======
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
>>>>>>> 390aa61 (mukti changes in UI)
    }
  }, []);

  // Handle form submission
  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  const { name, email, phone, password, confirmPassword, role, access } = formData;
  const handleChange = (e) => {
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

<<<<<<< HEAD
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

  // 🔑 Get logged-in user
  const loggedInUser = JSON.parse(localStorage.getItem("User"));
console.log(loggedInUser.id)
  // Fetch adminId if logged-in user is admin
  let adminId = null;
  if (loggedInUser?.role === "admin") {
    adminId = loggedInUser.id; // Or loggedInUser.adminId depending on backend schema
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
    setError("");
    console.log("Form Data:", formData);
    try {
      const response = await fetch(
        "https://dbbackend.devnexussolutions.com/auth/api/signup-users",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

    const result = await response.json();
    if (response.ok) {
      setSuccess("User added successfully!");
      setFormData(initialFormState);
    } else {
      setError(result.message || "Something went wrong!");
=======
    try {
      const response = await fetch(
        "https://dbbackend.devnexussolutions.com/auth/api/signup-users",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      console.log("API Response:", result);

      if (response.ok) {
        setSuccess("User added successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          role: "",
        });
      } else {
        setError(result.message || "Something went wrong!");
      }
    } catch (err) {
      console.error("Error posting user:", err);
      setError("Network or server error");
>>>>>>> 390aa61 (mukti changes in UI)
    }
  } catch (err) {
    console.error(err);
    setError("Network or server error");
  }
};


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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Add New User</h2>
    <div className="min-h-screen bg-white flex items-center justify-center p-1">
      <div className="w-full max-w-5xl  p-6 sm:p-4 ">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
          Add New User
        </h2>

<<<<<<< HEAD
        {error && <p className="mb-4 text-center text-red-600 font-medium">{error}</p>}
        {success && <p className="mb-4 text-center text-green-600 font-medium">{success}</p>}
=======
        {error && (
          <p className="mb-4 text-center text-red-600 font-medium">{error}</p>
        )}
        {success && (
          <p className="mb-4 text-center text-green-600 font-medium">
            {success}
          </p>
        )}
>>>>>>> 390aa61 (mukti changes in UI)

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Name */}
<<<<<<< HEAD
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
=======
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-2 text-gray-700 font-medium">
              Name
            </label>
>>>>>>> 390aa61 (mukti changes in UI)
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
<<<<<<< HEAD
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
=======
              className="input-style"
>>>>>>> 390aa61 (mukti changes in UI)
              required
            />
          </div>

          {/* Email */}
<<<<<<< HEAD
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
=======
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-2 text-gray-700 font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="input-style"
>>>>>>> 390aa61 (mukti changes in UI)
              required
            />
          </div>

          {/* Phone */}
<<<<<<< HEAD
          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              className="input-style"
              required
            />
          </div>

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

     


          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
=======
          <div className="flex flex-col">
            <label htmlFor="phone" className="mb-2 text-gray-700 font-medium">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="input-style"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label htmlFor="password" className="mb-2 text-gray-700 font-medium">
              Password
            </label>
>>>>>>> 390aa61 (mukti changes in UI)
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
<<<<<<< HEAD
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
=======
              className="input-style"
>>>>>>> 390aa61 (mukti changes in UI)
              required
            />
          </div>

          {/* Confirm Password */}
<<<<<<< HEAD
          <div>
            <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
=======
          <div className="flex flex-col">
            <label
              htmlFor="confirmPassword"
              className="mb-2 text-gray-700 font-medium"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className="input-style"
>>>>>>> 390aa61 (mukti changes in UI)
              required
            />
          </div>

<<<<<<< HEAD
          {/* Page Access */}
          <div className="sm:col-span-2">
            <label className="block text-gray-700 font-medium mb-2">Page Access</label>
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
=======
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

          {/* Submit Button */}
>>>>>>> 390aa61 (mukti changes in UI)
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
