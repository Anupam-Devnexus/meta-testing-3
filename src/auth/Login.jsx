import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  // ✅ useCallback to prevent unnecessary re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", login: "" }));
  }, []);

  // ✅ Fast, single-pass validation
  const validate = useCallback(() => {
    const tempErrors = {};
    const { username, password } = formData;
    let valid = true;

    if (!username.trim()) {
      tempErrors.username = "Email or phone is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(username) && isNaN(username)) {
      tempErrors.username = "Enter a valid email or phone number.";
      valid = false;
    }

    if (!password.trim()) {
      tempErrors.password = "Password is required.";
      valid = false;
    }

    setErrors(tempErrors);
    return valid;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) return;

      setLoading(true);

      // Cancel any ongoing request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

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
            signal: abortRef.current.signal,
          }
        );

        const data = await response.json();
        if (response.ok && data.token && data.user) {
          const userDetails = {
            id: data.user._id,
            name: data.user.name || "Unknown",
            email: data.user.email || "",
            role: data.user.role || "User",
            token: data.token,
          };

          localStorage.setItem("UserDetails", JSON.stringify(userDetails));
          setUser(userDetails);

          const role = (data.user.role || "").toLowerCase();
          navigate(
            role === "admin" ? "/admin-dashboard" :
            role === "user" ? "/user-dashboard" : "/"
          );
        } else {
          setErrors({ login: data.msg || data.message || "Invalid credentials" });
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setErrors({ login: "Something went wrong. Please try again later." });
        }
      } finally {
        setLoading(false);
      }
    },
    [formData, setUser, navigate, validate]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 px-4">
      <div className="flex flex-col md:flex-row items-center bg-white shadow-2xl rounded-3xl overflow-hidden w-full max-w-4xl">

        {/* Left Hero Section */}
        <div className="hidden md:flex flex-col justify-center bg-[#00357a] text-white w-1/2 p-12">
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-lg text-indigo-100">
            Manage your leads, calendar, and integrations seamlessly.
          </p>
        </div>

        {/* Right Form Section */}
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
                disabled={loading}
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
                disabled={loading}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-10 text-sm text-[#00357a] hover:underline cursor-pointer select-none"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-transform transform hover:scale-105 ${
                loading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#00357a] text-white"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Forgot Password */}
            <p
              className="text-sm text-center text-[#00357a] cursor-pointer hover:underline"
              onClick={() => navigate("/forgot-password")}
            >
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
