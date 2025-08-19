import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({ id: "", password: "", role: "Admin" });
  const [errors, setErrors] = useState({ id: "", password: "", login: "", role: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", login: "" }));
  };

  const validate = () => {
    let valid = true;
    const tempErrors = { id: "", password: "", login: "", role: "" };

    if (!formData.id.trim()) {
      tempErrors.id = "Email is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.id)) {
      tempErrors.id = "Enter a valid email.";
      valid = false;
    }

    if (!formData.password.trim()) {
      tempErrors.password = "Password is required.";
      valid = false;
    }

    if (!formData.role) {
      tempErrors.role = "Select a role.";
      valid = false;
    }

    setErrors(tempErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch("https://dbbackend.devnexussolutions.com/auth/api/signin-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.id,
          password: formData.password,
        }),
        // Uncomment below if backend requires cookies (only if CORS is properly configured)
        // credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Save user and token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", formData.id);
        localStorage.setItem("userRole", formData.role);
        localStorage.setItem("userName", data.name || formData.id);

        setUser &&
          setUser({
            id: formData.id,
            role: formData.role,
            name: data.name || formData.id,
          });

        const route = formData.role.toLowerCase();
        navigate(`/${route}-dashboard`);
      } else {
        setErrors((prev) => ({
          ...prev,
          login: data.message || "Invalid credentials. Please try again.",
        }));
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors((prev) => ({
        ...prev,
        login: "Something went wrong. Please try again later.",
      }));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f0f0] px-4">
      <div className="flex flex-col md:flex-row items-center gap-10 bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl">

        {/* Logo Section */}
        <div className="flex items-center justify-center w-full md:w-1/3">
          <img src="/logo.png" alt="logo" className="h-auto max-h-32 object-contain" />
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="w-full md:w-2/3 space-y-6">
          <h2 className="text-2xl font-semibold text-[#141414]">Login to Dashboard</h2>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="id" className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              name="id"
              id="id"
              value={formData.id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border-b outline-none ${
                errors.id ? "border-red-500" : "border-[#dcdc3c]"
              }`}
            />
            {errors.id && <span className="text-red-500 text-sm">{errors.id}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 relative">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border-b outline-none ${
                errors.password ? "border-red-500" : "border-[#dcdc3c]"
              }`}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-sm text-blue-600 hover:underline cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
            {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password}</span>}
          </div>

          {/* Role Dropdown */}
          <div className="flex flex-col gap-1">
            <label htmlFor="role" className="text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-4 py-2 border-b outline-none ${
                errors.role ? "border-red-500" : "border-[#dcdc3c]"
              }`}
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
            {errors.role && <span className="text-red-500 text-sm">{errors.role}</span>}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-[#141414] text-white py-2 rounded-md hover:bg-[#dcdc3c] hover:text-black transition duration-300"
            >
              Login
            </button>
          </div>
        </form>
      </div>

      {/* Login error message */}
      {errors.login && (
        <div className="text-red-500 text-sm mt-4">{errors.login}</div>
      )}
    </div>
  );
}
