import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useUserStore from "../../../Zustand/UsersGet";

export default function EditUser() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { users, loading, error, fetchUser } = useUserStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    lastLogin: "",
    loginHistory: [],
  });

  // 🧩 Fetch users once
  useEffect(() => {
    fetchUser();
  }, []);

  // 🎯 Populate form when user data is available
  useEffect(() => {
    if (users?.users && userId) {
      const user = users.users.find((u) => u._id === userId);
      if (user) {
        setFormData({
          name: user.EmpUsername || "",
          email: user.email || "",
          role: user.role || "",
          lastLogin: user.lastLogin || "",
          loginHistory: user.loginHistory || [],
        });
      }
    }
  }, [users, userId]);

  // 🖊️ Handle field input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 💾 Submit updated user data
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const tokenData = JSON.parse(localStorage.getItem("UserDetails"))?.token;
      if (!tokenData) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const res = await fetch(
        `https://dbbackend.devnexussolutions.com/auth/api/update-user/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenData}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error(`Failed to update user (${res.status})`);

      toast.success("✅ User updated successfully!");
      setTimeout(() => navigate("/admin-dashboard/users"), 1000);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("❌ Error updating user. Check console for details.");
    }
  };

  // 📅 Date formatter
  const formatDate = (isoString) =>
    isoString ? new Date(isoString).toLocaleString() : "";

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading user data...</p>;
  if (error)
    return (
      <p className="text-center mt-10 text-red-600">
        Error loading user data: {error}
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Edit User: <span className="text-blue-600">{formData.name}</span>
      </h1>

      {/* 🧾 User Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block font-semibold text-gray-700">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block font-semibold text-gray-700">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Last Login */}
        <div>
          <label className="block font-semibold text-gray-700">Last Login</label>
          <input
            type="text"
            name="lastLogin"
            value={formatDate(formData.lastLogin)}
            disabled
            className="mt-1 w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full bg-[#00357a] text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </form>

      {/* 🕓 Login History */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Login History
        </h2>

        {formData.loginHistory.length === 0 ? (
          <p className="text-gray-500">No login history available.</p>
        ) : (
          <div className="overflow-x-auto border rounded-xl shadow-sm">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="border px-4 py-2 text-left">Login At</th>
                  <th className="border px-4 py-2 text-left">IP Address</th>
                  <th className="border px-4 py-2 text-left">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {formData.loginHistory.map((login) => (
                  <tr key={login._id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{formatDate(login.loginAt)}</td>
                    <td className="border px-4 py-2">{login.ip}</td>
                    <td className="border px-4 py-2">{login.userAgent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
