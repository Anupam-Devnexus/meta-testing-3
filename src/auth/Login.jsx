import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext"; // Adjust path if necessary

const mockUsers = [
  { id: "admin1@example.com", password: "admin123", name: "Alice Admin", role: "Admin" },
  { id: "admin2@example.com", password: "admin456", name: "Bob Admin", role: "Admin" },
  { id: "user1@example.com", password: "user123", name: "Charlie User", role: "User" },
  { id: "user2@example.com", password: "user456", name: "Dana User", role: "User" },
];

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({ id: "", password: "", role: "Admin" }); // 🔧 Added role
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const user = mockUsers.find(
      (u) =>
        u.id === formData.id &&
        u.password === formData.password &&
        u.role === formData.role
    );

    if (user) {
      const tokenPayload = {
        email: user.id,
        role: user.role,
        timestamp: new Date().toISOString(),
      };

      const token = btoa(JSON.stringify(tokenPayload));

      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.id);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("token", token);

      setUser && setUser(user);

      const route = user.role.toLowerCase();
      navigate(`/${route}-dashboard`);
    } else {
      setErrors((prev) => ({
        ...prev,
        login: "Invalid credentials or role. Please try again.",
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

      {/* Test Credentials */}
      <div className="mt-6 w-full max-w-3xl px-6">
        <h3 className="text-md font-semibold mb-2">Test Credentials:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
          {mockUsers.map((user) => (
            <div key={user.id} className="bg-gray-100 p-3 rounded-lg">
              <p><strong>Email:</strong> {user.id}</p>
              <p><strong>Password:</strong> {user.password}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}