import { useEffect, useState, useMemo } from "react";
import { FaUser, FaUsers, FaChartLine, FaFacebook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import useMetaLeads from "../../Zustand/MetaLeadsGet";
import useLeadStore from "../../Zustand/LeadsGet";
import useUserStore from "../../Zustand/UsersGet";
import IntegrationPage from "./Interagtion/IntegrationPage";

import StatCard from "../../Components/Cards/StatCard";
import SalesFunnel from "../../Components/Charts/SalesFunnel";
import SellHistoryChart from "../../Components/SellHistoryChart";
import SupportTracker from "../../Components/SupportTracker";

export default function Dashboard() {
  const { metaleads, fetchMetaLeads } = useMetaLeads();
  const { users, loading, fetchUser } = useUserStore();
  const { data, fetchData } = useLeadStore();

  // -----------------------------
  // State Definitions
  // -----------------------------
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    token: "",
  });

  // Initialize Facebook state from localStorage
  const [facebookConnected, setFacebookConnected] = useState(
    localStorage.getItem("facebookConnected") === "true"
  );

  const [view, setView] = useState("integration"); // 'integration' or 'stats'
  const navigate = useNavigate();

  // -----------------------------
  // Handle Facebook OAuth Login
  // -----------------------------
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

      const fbWindow = window.open(fbAuthUrl, "fbLogin", "width=600,height=700");

      // Polling to detect when popup closes
      const interval = setInterval(() => {
        if (fbWindow.closed) {
          clearInterval(interval);
          // Update state & persist to localStorage
          setFacebookConnected(true);
          localStorage.setItem("facebookConnected", "true");
        }
      }, 1000);
    } catch (err) {
      console.error("Facebook Login Error:", err.message);
      setFacebookConnected(false);
      localStorage.setItem("facebookConnected", "false");
    }
  };

  // -----------------------------
  // Fetch Initial Data on Mount
  // -----------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("User");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserInfo((prev) => ({ ...prev, ...user }));
      } catch (err) {
        console.error("Failed to parse user info:", err);
      }
    }

    fetchMetaLeads();
    fetchData();
    fetchUser();
  }, []);

  // -----------------------------
  // Derived Memoized Data
  // -----------------------------
  const totalLeads = useMemo(() => data?.leads?.length || 0, [data]);
  const totalMetaLeads = useMemo(() => metaleads?.leads?.length || 0, [metaleads]);
  const totalUsers = useMemo(() => users?.users?.length || 0, [users]);

  // -----------------------------
  // Render Component
  // -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-200 via-white to-indigo-400 p-4">
      {/* Top Bar: Persistent FB Badge + Toggle Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FaFacebook className="text-blue-600 text-xl" />
          <span
            className={`font-semibold ${
              facebookConnected ? "text-green-600" : "text-red-600"
            }`}
          >
            {facebookConnected ? "Facebook Connected ✅" : "Not Connected ❌"}
          </span>
        </div>

        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          onClick={() =>
            setView(view === "integration" ? "stats" : "integration")
          }
        >
          {view === "integration" ? "Go to Dashboard Stats" : "Back to Integrations"}
        </button>
      </div>

      {/* Main Panel */}
      {view === "integration" ? (
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 space-y-6">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700 flex items-center gap-2">
            <FaFacebook /> Facebook Integration
          </h2>

          <p className="text-lg">
            Status:{" "}
            <span
              className={
                facebookConnected ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
              }
            >
              {facebookConnected ? "Connected ✅" : "Not Connected ❌"}
            </span>
          </p>

          <button
            onClick={handleFacebook}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            {facebookConnected ? "Reconnect Facebook" : "Connect Facebook"}
          </button>

          <IntegrationPage />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-bold mb-4 text-indigo-700">Sales Funnel</h2>
              <SalesFunnel />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-bold mb-4 text-indigo-700">Sales History</h2>
              <SellHistoryChart />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">Support Tracker</h2>
            <SupportTracker />
          </div>
        </div>
      )}
    </div>
  );
}
