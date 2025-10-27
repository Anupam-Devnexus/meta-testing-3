import useUserStore from "../../../Zustand/UsersGet";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🔹 Simple Spinner Component
const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

export default function AllUsers() {
  const { users, loading, error, fetchUser } = useUserStore();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false); // For delete actions

  // Fetch users on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const confirmData = users?.users || [];

  // 🔹 Delete user function
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this user?")) return;

    setActionLoading(true);
    try {
      const tokenData = localStorage.getItem("User");
      const authToken = tokenData ? JSON.parse(tokenData).token : null;
      if (!authToken) throw new Error("No auth token found. Please login first.");

      const res = await fetch(
        `https://dbbackend.devnexussolutions.com/auth/api/delete-user/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete user");

      fetchUser(); // Refresh list
      toast.success("✅ User deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("❌ Error deleting user.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-semibold text-gray-800">All Users</h2>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin-dashboard/users/add")}
            disabled={actionLoading}
            className={`px-4 py-2 bg-[#002b5b] text-white font-medium rounded-full hover:bg-blue-700 transition duration-200 ${
              actionLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Add New
          </button>
          <button
            onClick={() => navigate("/admin-dashboard/upload-excel")}
            disabled={actionLoading}
            className={`px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition ${
              actionLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Upload Excel File
          </button>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && <Spinner />}

      {/* Error */}
      {error && <p className="text-red-500 font-medium">Error: {error}</p>}

      {/* Users Table */}
      {!loading && !error && confirmData.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-[#002b5b] text-white">
              <tr>
                <th className="py-2 px-4 border text-left">ID</th>
                <th className="py-2 px-4 border text-left">Name</th>
                <th className="py-2 px-4 border text-left">Email</th>
                <th className="py-2 px-4 border text-left">Last Login</th>
                <th className="py-2 px-4 border text-left">Role</th>
                <th className="py-2 px-4 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {confirmData.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border text-sm">{user._id}</td>
                  <td className="py-2 px-4 border">{user.EmpUsername}</td>
                  <td className="py-2 px-4 border">{user.email}</td>
                  <td className="py-2 px-4 border">{user.lastLogin}</td>
                  <td className="py-2 px-4 border capitalize">{user.role}</td>
                  <td className="py-2 px-2 border flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/admin-dashboard/users/edit/${user._id}`)
                      }
                      disabled={actionLoading}
                      className={`bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition ${
                        actionLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={actionLoading}
                      className={`bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition ${
                        actionLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {actionLoading ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Users */}
      {!loading && !error && confirmData.length === 0 && (
        <p className="text-gray-500 font-medium">No users found.</p>
      )}

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
