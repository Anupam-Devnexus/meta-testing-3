import { useEffect, useState } from "react";
import useLeadStore from "../../../Zustand/LeadsGet";
import useUserStore from "../../../Zustand/UsersGet";
import useMetaLeads from "../../../Zustand/MetaLeadsGet";
import { FaUsers, FaUserCheck, FaChartBar } from "react-icons/fa";
import MetaChart from "../../../Components/Charts/MetaChart";
import MannualChart from "../../../Components/Charts/MannualChart";
import UserPieChart from "../../../Components/Charts/UserChart";

export default function Stats() {
  const { metaleads, loading: metaLoading, error: metaError, fetchMetaLeads } = useMetaLeads();
  const { data: manualLeads, loading: leadLoading, error: leadError, fetchData } = useLeadStore();
  const { users, loading: userLoading, error: userError, fetchUser } = useUserStore();

  // State to keep track of active chart: 'meta', 'manual', or 'users'
  const [activeChart, setActiveChart] = useState("meta");

  useEffect(() => {
    fetchMetaLeads();
    fetchData();
    fetchUser();
  }, []);

  const totalMetaLeads = metaleads?.leads?.length || 0;
  const totalManualLeads = manualLeads?.leads?.length || 0;
  const totalUsers = users?.users?.length || 0;

  // Handler when clicking card
  const handleCardClick = (chart) => {
    setActiveChart(chart);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Statistics Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Meta Leads"
          value={totalMetaLeads}
          icon={<FaChartBar className="text-blue-500" />}
          active={activeChart === "meta"}
          onClick={() => handleCardClick("meta")}
        />
        <StatCard
          title="Manual Leads"
          value={totalManualLeads}
          icon={<FaUserCheck className="text-green-500" />}
          active={activeChart === "manual"}
          onClick={() => handleCardClick("manual")}
        />
        <StatCard
          title="Users"
          value={totalUsers}
          icon={<FaUsers className="text-purple-500" />}
          active={activeChart === "users"}
          onClick={() => handleCardClick("users")}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        {activeChart === "meta" && <MetaChart />}
        {activeChart === "manual" && <MannualChart />}
        {activeChart === "users" && <UserPieChart />}
      </div>
    </div>
  );
}

// StatCard Component
function StatCard({ title, value, icon, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white shadow-md rounded-xl p-6 flex items-center gap-4 cursor-pointer transition
        ${active ? "shadow-lg ring-2 ring-blue-400" : "hover:shadow-lg"}`}
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
