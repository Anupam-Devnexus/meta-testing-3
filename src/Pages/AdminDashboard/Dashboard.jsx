import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaUsers, FaChartLine, FaFacebook } from "react-icons/fa";

import useMetaLeads from "../../Zustand/MetaLeadsGet";
import useLeadStore from "../../Zustand/LeadsGet";
import useUserStore from "../../Zustand/UsersGet";

import IntegrationPage from "./Interagtion/IntegrationPage";
import StatCard from "../../Components/Cards/StatCard";
import SalesFunnel from "../../Components/Charts/SalesFunnel";
import SellHistoryChart from "../../Components/Charts/SalesChart";
import SupportTracker from "../../Components/SupportTracker";
import { useManualLeadsStore } from "../../Zustand/MannualLeads";
import useContactStore from "../../Zustand/Contact";
import { FaMeta } from "react-icons/fa6";
import { CiDatabase } from "react-icons/ci";




export default function Dashboard() {
  const navigate = useNavigate();
  const { leads, fetchLeads } = useManualLeadsStore();
  const { data: websiteData, loading: websiteloading, error, fetchContacts } = useContactStore();

  const { metaleads, fetchMetaLeads } = useMetaLeads();
  const { users, loading, fetchUser } = useUserStore();
  const { data, fetchData } = useLeadStore();

  const [view, setView] = useState("stats");

  const facebookConnected = useMemo(
    () => localStorage.getItem("fb_connected") === "true",
    []
  );

  // -----------------------------
  // Fetch Data
  // -----------------------------
  useEffect(() => {
    fetchUser();
    fetchData();
    fetchContacts();
    fetchLeads()
    fetchMetaLeads();

  }, []);

  // -----------------------------
  // Memoized Stats
  // -----------------------------
  const stats = useMemo(
    () => ({
      totalUsers: users?.users?.length || 0,
      totalLeads: data?.leads?.length || 0,
      totalMetaLeads: metaleads?.total || 0,
      totalmannualLeads: leads?.length || 0,
      totalWebsiteData: websiteData?.TotoalLeads || 0
    }),
    [users, data, metaleads]
  );

  // -----------------------------
  // Header
  // -----------------------------
  const Header = (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <FaFacebook className="text-2xl text-[#1877F2]" />
        <span
          className={`font-semibold ${facebookConnected ? "text-green-600" : "text-yellow-600"
            }`}
        >
          {facebookConnected
            ? "Facebook Connected (Live Sync)"
            : "Facebook Not Connected (Showing DB Data)"}
        </span>
      </div>

      <button
        onClick={() =>
          setView(view === "integration" ? "stats" : "integration")
        }
        className="px-6 py-2.5 bg-[#003d82] text-white rounded-xl shadow hover:bg-indigo-700 transition"
      >
        {view === "integration" ? "View Dashboard" : "Manage Integrations"}
      </button>
    </div>
  );

  // -----------------------------
  // Integration View
  // -----------------------------
  const IntegrationView = (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-[#003d82] flex items-center gap-2">
        <FaFacebook /> Facebook Integration
      </h2>
      <p className="text-gray-600">
        Connect Facebook to enable real-time Meta lead synchronization.
        Your existing data will remain visible even if not connected.
      </p>
      <IntegrationPage />
    </div>
  );

  // -----------------------------
  // Stats View (ALWAYS VISIBLE)
  // -----------------------------
  const StatsView = (
    <div className="space-y-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FaUser}
          title="Total Users"
          value={loading ? "..." : stats.totalUsers}
          bgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          onClick={() => navigate("/admin-dashboard/users")}
          hoverEffect
        />
        <StatCard
          icon={FaMeta}
          title="Meta Leads"
          value={stats.totalMetaLeads}
          bgColor="bg-green-100"
          iconColor="text-green-600"
          onClick={() => navigate("/admin-dashboard/meta")}
          hoverEffect
        />
        <StatCard
          icon={CiDatabase}
          title="Mannual Leads"
          value={stats.totalmannualLeads}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          onClick={() => navigate("/admin-dashboard/mannual-leads")}
          hoverEffect
        />
        <StatCard
          icon={FaChartLine}
          title="Website Leads"
          value={stats.totalWebsiteData}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          onClick={() => navigate("/admin-dashboard/website")}
          hoverEffect
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-[#003d82]">
            Sales Funnel
          </h3>
          <SalesFunnel />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-[#003d82]">
            Sales History
          </h3>
          <SellHistoryChart />
        </div>
      </div>

      {/* Support Tracker */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-[#003d82]">
          Support Tracker
        </h3>
        <SupportTracker />
      </div>
    </div>
  );

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {Header}
      {view === "integration" ? IntegrationView : StatsView}
    </div>
  );
}
