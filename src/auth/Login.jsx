import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ username: "", password: "", login: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", login: "" }));
  };

  const validate = () => {
    let valid = true;
    const tempErrors = { username: "", password: "", login: "" };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://dbbackend.devnexussolutions.com/auth/api/signin-users",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username.trim(),
            password: formData.password.trim(),
          }),
        }
      );

      const data = await response.json();
      console.log("Backend response:", data);

      if (response.ok && data.token && data.user) {
        const role = data.user.role || "User";
        const userDetails = {
          id: data.user._id,
          name: data.user.name || "Unknown",
          email: data.user.email || "",
          role: role,
          token: data.token,
        };

        localStorage.setItem("UserDetails", JSON.stringify(userDetails));
        setUser(userDetails);

        const normalizedRole = role.toLowerCase();
        if (normalizedRole === "admin") navigate("/admin-dashboard");
        else if (normalizedRole === "user") navigate("/user-dashboard");
        else navigate("/");
      } else {
        setErrors((prev) => ({
          ...prev,
          login: data.msg || data.message || "Invalid credentials",
        }));
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors((prev) => ({
        ...prev,
        login: "Something went wrong. Please try again later.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 px-4">
      <div className="flex flex-col md:flex-row items-center bg-white shadow-2xl rounded-3xl overflow-hidden w-full max-w-4xl">

        {/* Left Hero Section */}
        <div className="hidden md:flex flex-col justify-center bg-indigo-600 text-white w-1/2 p-12">
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-lg text-indigo-100">
            Connect your Facebook Pages, integrate with Google Calendar, and manage your leads all in one place.
          </p>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">Login</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Email or Phone</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your email or phone"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.username && <span className="text-red-500 text-sm">{errors.username}</span>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1 relative">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3 text-sm text-indigo-600 hover:underline cursor-pointer select-none"
              >
                {showPassword ? "Hide" : "Show"}
              </span>
              {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-transform transform hover:scale-105 ${
                loading ? "bg-gray-400 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Forgot Password */}
            <p className="text-sm text-center text-indigo-600 cursor-pointer hover:underline" onClick={() => navigate("/forgot-password")}>
              Forgot Password?
            </p>

            {/* Login Error */}
            {errors.login && <p className="text-red-500 text-center">{errors.login}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
