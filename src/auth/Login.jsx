import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({ id: "", password: "", role: "Admin" }); // 🔧 Added role
  const [errors, setErrors] = useState({ id: "", password: "", login: "", role: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // -----------------------
  // Handle Input Changes
  // -----------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", login: "" }));
  };

  // -----------------------
  // Validate Inputs
  // -----------------------
  const validate = () => {
    const tempErrors = { username: "", password: "", login: "" };
    let valid = true;

    if (!formData.username.trim()) {
      tempErrors.username = "Email or phone is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.username) && isNaN(formData.username)) {
      tempErrors.username = "Enter a valid email or phone number.";
      valid = false;
    }

    if (!formData.password.trim()) {
      tempErrors.password = "Password is required.";
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
        login: "Something went wrong. Please try again later.",
      }));
    }  {
      setLoading(false);
    }
  };

  // -----------------------
  // Render Component
  // -----------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="flex flex-col md:flex-row items-center gap-10 bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl">

        {/* Logo */}
        <div className="flex items-center justify-center w-full md:w-1/3">
          <img src="/vite.svg" alt="Logo" className="h-auto max-h-32 object-contain" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full md:w-2/3 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Login</h2>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Email or Phone
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your email or phone"
              className={`w-full px-4 py-2 border-b outline-none ${
                errors.username ? "border-red-500" : "border-yellow-400"
              }`}
            />
            {errors.username && <span className="text-red-500 text-sm">{errors.username}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 relative">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border-b outline-none ${
                errors.password ? "border-red-500" : "border-yellow-400"
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md transition duration-300 ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-yellow-400 hover:text-black"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Forgot Password */}
          <span
            className="text-blue-600 cursor-pointer hover:underline font-medium"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </span>

          {/* Login Error */}
          {errors.login && <div className="text-red-500 text-sm mt-2">{errors.login}</div>}

          {/* Links */}
          <div className="flex gap-4 mt-4">
            <span
              className="text-blue-600 font-semibold cursor-pointer hover:underline"
              onClick={() => navigate("/terms")}
            >
              Terms & Conditions
            </span>
            <span
              className="text-blue-600 font-semibold cursor-pointer hover:underline"
              onClick={() => navigate("/privacy")}
            >
              Privacy Policy
            </span>
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
