import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaUsers,
  FaChartLine,
  FaFacebook,
} from "react-icons/fa";
import CountUp from "react-countup"; // ✅ Animated numbers

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

  const [facebookConnected, setFacebookConnected] = useState(() => {
    return localStorage.getItem("fb_connected") === "true";
  });

  const [view, setView] = useState("integration"); // 'integration' or 'stats'

  // -----------------------------
  // Data fetching
  // -----------------------------
  useEffect(() => {
    fetchUser();
    fetchData();
    if (facebookConnected) fetchMetaLeads();
  }, [facebookConnected, fetchData, fetchMetaLeads, fetchUser]);

  // -----------------------------
  // Memoized counts
  // -----------------------------
  const totalLeads = useMemo(() => data?.leads?.length || 0, [data]);
  const totalMetaLeads = useMemo(
    () => metaleads?.leads?.length || 0,
    [metaleads]
  );
  const totalUsers = useMemo(() => users?.users?.length || 0, [users]);

  // -----------------------------
  // Component UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 via-white to-indigo-300 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <FaFacebook className="text-blue-600 text-2xl" />
          <span
            className={`font-semibold ${
              facebookConnected ? "text-green-600" : "text-red-600"
            }`}
          >
            {facebookConnected ? "Facebook Connected ✅" : "Not Connected ❌"}
          </span>
        </div>

        <button
          onClick={() =>
            setView((prev) => (prev === "integration" ? "stats" : "integration"))
          }
          className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl shadow hover:bg-indigo-700 transition-all"
        >
          {view === "integration" ? "View Dashboard Stats" : "Back to Integrations"}
        </button>
      </div>

      {/* Main Section */}
      {view === "integration" ? (
        // -----------------------------
        // Facebook Integration
        // -----------------------------
        <div className="bg-white rounded-2xl shadow-lg p-8 transition-all hover:shadow-xl">
          <h2 className="text-2xl font-bold text-indigo-700 flex items-center gap-2 mb-6">
            <FaFacebook /> Facebook Integration
          </h2>

          <p className="text-lg mb-4">
            Connection Status:{" "}
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
        <>
          {facebookConnected ? (
            // -----------------------------
            // Stats Dashboard
            // -----------------------------
            <div className="space-y-10">
              {/* Stat Cards Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={FaUser}
                  title="Total Users"
                  value={<CountUp end={totalUsers} duration={1.5} />}
                  bgColor="bg-indigo-100"
                  iconColor="text-indigo-600"
                  onClick={() => navigate("/admin-dashboard/users")}
                  hoverEffect
                />
                <StatCard
                  icon={FaUsers}
                  title="Total Meta Leads"
                  value={<CountUp end={totalMetaLeads} duration={1.5} />}
                  bgColor="bg-green-100"
                  iconColor="text-green-600"
                  onClick={() => navigate("/admin-dashboard/meta")}
                  hoverEffect
                />
                <StatCard
                  icon={FaChartLine}
                  title="Total Leads"
                  value={<CountUp end={totalLeads} duration={1.5} />}
                  bgColor="bg-yellow-100"
                  iconColor="text-yellow-600"
                  onClick={() => navigate("/admin-dashboard/leads")}
                  hoverEffect
                />
                <StatCard
                  icon={FaFacebook}
                  title="Facebook Integration"
                  value={facebookConnected ? "Active" : "Inactive"}
                  bgColor="bg-blue-100"
                  iconColor="text-blue-600"
                  onClick={() => setView("integration")}
                  hoverEffect
                />
              </div>

              {/* Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <h2 className="text-2xl font-bold mb-4 text-indigo-700">
                    Sales Funnel
                  </h2>
                  <SalesFunnel />
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <h2 className="text-2xl font-bold mb-4 text-indigo-700">
                    Sales History
                  </h2>
                  <SellHistoryChart />
                </div>
              </div>

              {/* Support Tracker */}
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <h2 className="text-2xl font-bold mb-4 text-indigo-700">
                  Support Tracker
                </h2>
                <SupportTracker />
              </div>
            </div>
          ) : (
            // -----------------------------
            // Not Connected Notice
            // -----------------------------
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-red-600 text-center">
                Please connect Facebook to view dashboard stats.
              </h2>
              <button
                onClick={() => setView("integration")}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
              >
                Go to Facebook Integration
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
