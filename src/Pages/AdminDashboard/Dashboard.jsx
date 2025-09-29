import { useEffect, useState } from "react";
import { FaUser, FaUsers, FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


import useMetaLeads from "../../Zustand/MetaLeadsGet";
import useLeadStore from "../../Zustand/LeadsGet";

import StatCard from "../../Components/Cards/StatCard";
import SalesFunnel from "../../Components/Charts/SalesFunnel";
import SellHistoryChart from "../../Components/SellHistoryChart";
import SupportTracker from "../../Components/SupportTracker";

export default function Dashboard() {
  const { metaleads, fetchMetaLeads } = useMetaLeads();
  const { data, fetchData } = useLeadStore();
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    token: "",
  });

  const navigate = useNavigate();

  // 🔹 Facebook OAuth Handler
  const handleFacebook = async () => {
    try {
      if (!userInfo.token) throw new Error("No token found. Please login first.");

      const res = await fetch(
        "https://dbbackend.devnexussolutions.com/facebook/config",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch config: ${errorText}`);
      }

      const { appId, redirectUri } = await res.json();
      if (!appId || !redirectUri)
        throw new Error("Invalid Facebook config (missing appId or redirectUri)");

      const fbAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=pages_show_list,pages_read_engagement,leads_retrieval&response_type=code`;

      window.open(fbAuthUrl, "fbLogin", "width=600,height=700");
    } catch (err) {
      console.error("Facebook Login Error:", err.message);
    }
  };

  // 🔹 Fetch Data on Mount
  useEffect(() => {
    const userName = localStorage.getItem("userName") || "User";
    const userEmail = localStorage.getItem("userEmail") || "email@example.com";
    const userRole = localStorage.getItem("userRole") || "Role";

    setUserInfo({ userName, userEmail, userRole });


    fetchMetaLeads();
    fetchData();
    fetchUser();
  }, []);

  const metadata = metaleads.leads;
  const totalLeads = data?.leads?.length;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50 via-white to-indigo-50 p-6">
      {/* Header Section */}
      <div className="mb-12 bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-indigo-700">
            Welcome back, <span className="text-indigo-900">{userInfo.userName}!</span>
          </h1>
          <p className="mt-2 text-lg text-indigo-600 font-medium">Role: {userInfo.userRole}</p>
        </div>
        <div className="flex gap-4 items-center">
          <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition duration-300">
            Connect Facebook
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            icon={FaUser}
            title="Total Users"
            value={loading ? "..." : totalUsers}
            bgColor="bg-indigo-100"
            iconColor="text-indigo-600"
            onClick={() => navigate("/admin-dashboard/users")}
            hoverEffect
            
          />
          <StatCard
            icon={FaUsers}
            title="Total Meta Leads"
            value={totalMetaLeads}
            bgColor="bg-green-100"
            iconColor="text-green-600"
            onClick={() => navigate("/admin-dashboard/meta")}
            hoverEffect
            
          />
          <StatCard
            icon={FaChartLine}
            title="Total Leads"
            value={totalLeads}
            bgColor="bg-yellow-100"
            iconColor="text-yellow-600"
            onClick={() => navigate("/admin-dashboard/stats")}
            hoverEffect
            
          />
        </div>

        {/* Sales & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Sales Funnel */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">Sales Funnel</h2>
            <SalesFunnel />
          </div>

          {/* Sales History Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">Sales History</h2>
            <SellHistoryChart />
          </div>
        </div>

        {/* Support Tracker */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">Support Tracker</h2>
          <SupportTracker />
        </div>
      </div>
    </div>
  );
}
