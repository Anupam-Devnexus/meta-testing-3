import { useEffect, useState, useMemo, useCallback } from "react";
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
  const navigate = useNavigate();
  const { metaleads, fetchMetaLeads } = useMetaLeads();
  const { users, loading, fetchUser } = useUserStore();
  const { data, fetchData } = useLeadStore();

  // ✅ Correctly load FB status from localStorage
  const [facebookConnected, setFacebookConnected] = useState(() => {
    return localStorage.getItem("fb_connected") === "true";
  });
console.log("Facebook Connected:", facebookConnected);
  const [view, setView] = useState("integration"); // 'integration' or 'stats'

  // -----------------------------
  // ✅ Fetch Data when Connected
  // -----------------------------
  useEffect(() => {
    fetchUser();
    fetchData();

    if (facebookConnected) {
      fetchMetaLeads();
    }
  }, [facebookConnected, fetchData, fetchMetaLeads, fetchUser]);

  // -----------------------------
  // Derived Data (Memoized)
  // -----------------------------
  const totalLeads = useMemo(() => data?.leads?.length || 0, [data]);
  const totalMetaLeads = useMemo(
    () => metaleads?.leads?.length || 0,
    [metaleads]
  );
  const totalUsers = useMemo(() => users?.users?.length || 0, [users]);

  // -----------------------------
  // UI Render
  // -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-200 via-white to-indigo-400 p-4">
      {/* Top Bar */}
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
            setView((prev) => (prev === "integration" ? "stats" : "integration"))
          }
        >
          {view === "integration" ? "Go to Dashboard Stats" : "Back to Integrations"}
        </button>
      </div>

      {/* Main View */}
      {view === "integration" ? (
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 space-y-6">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700 flex items-center gap-2">
            <FaFacebook /> Facebook Integration
          </h2>

          <p className="text-lg">
            Status:{" "}
            <span
              className={`font-semibold ${
                facebookConnected ? "text-green-600" : "text-red-600"
              }`}
            >
              {facebookConnected ? "Connected ✅" : "Not Connected ❌"}
            </span>
          </p>

          <IntegrationPage onConnectSuccess={() => setFacebookConnected(true)} />
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
              value={
                facebookConnected
                  ? totalMetaLeads
                  : "⚠️ Connect Facebook to view"
              }
              bgColor="bg-green-100"
              iconColor="text-green-600"
              onClick={() =>
                facebookConnected
                  ? navigate("/admin-dashboard/meta")
                  : alert("Please connect Facebook first!")
              }
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
              <h2 className="text-2xl font-bold mb-4 text-indigo-700">
                Sales Funnel
              </h2>
              <SalesFunnel />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-bold mb-4 text-indigo-700">
                Sales History
              </h2>
              <SellHistoryChart />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">
              Support Tracker
            </h2>
            <SupportTracker />
          </div>
        </div>
      )}
    </div>
  );
}
