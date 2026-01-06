import { useEffect, useState } from "react";
import useLeadStore from "../../../Zustand/LeadsGet";
import useUserStore from "../../../Zustand/UsersGet";
import useMetaLeads from "../../../Zustand/MetaLeadsGet";
import { FaUsers, FaUserCheck, FaChartBar } from "react-icons/fa";

import MetaChart from "../../../Components/Charts/MetaChart";
import MannualChart from "../../../Components/Charts/MannualChart";
import UserPieChart from "../../../Components/Charts/UserChart";
import SalesChart from "../../../Components/Charts/SalesChart";
import ActivityOver from "../../../Components/Charts/ActivityOver";

import { useManualLeadsStore } from "../../../Zustand/MannualLeads";



export default function Stats() {
  const { metaleads, fetchMetaLeads } = useMetaLeads();
  const { data: manualLeads, fetchData } = useLeadStore();
  const { users, fetchUser } = useUserStore();
  const { leads, loading, error, fetchLeads } = useManualLeadsStore();


  // Facebook connection flag
  const fb_connect = localStorage.getItem("fb_connect") === "true";

  // Default chart is "meta" if connected, otherwise "manual"
  const [activeChart, setActiveChart] = useState(fb_connect ? "meta" : "manual");

  useEffect(() => {
    if (fb_connect) fetchMetaLeads();
    fetchData();
    fetchLeads();

    fetchUser();
  }, [fb_connect]);

  // console.log("Mannual leads Page",leads)

  const totalMetaLeads = metaleads?.total || 0;
  const totalManualLeads = leads?.length || 0;
  const totalUsers = users?.users?.length || 0;

  // console.log(manualLeads)

  const handleCardClick = (chart) => setActiveChart(chart);

  return (
    <div className="p-8 space-y-3">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Statistics Overview For You</h1>

      {/* Stats Cards */}
      <div
        className={`grid gap-6 ${fb_connect ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
          }`}
      >
        {/* Meta Leads only if connected */}

        {/* <StatCard
            title="Meta Leads"
            value={totalMetaLeads}
            icon={<FaChartBar className="text-[#00357a]" />}
            active={activeChart === "meta"}
            onClick={() => handleCardClick("meta")}
          /> */}


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

      {/* Dynamic Charts */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          {fb_connect ? (
            <>
              {activeChart === "meta" && <MetaChart />}
              {activeChart === "manual" && <MannualChart />}
              {activeChart === "users" && <UserPieChart />}
            </>
          ) : (
            <>
              {activeChart === "manual" && <MannualChart />}
              {activeChart === "users" && <UserPieChart />}
            </>
          )}
        </div>

        {/* Sales and Activity Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SalesChart  />
          <ActivityOver />
        </div>
      </div>
    </div>
  );
}

// ===================
// StatCard Component
// ===================
function StatCard({ title, value, icon, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white shadow-md rounded-xl p-6 flex items-center gap-4 cursor-pointer transition-all duration-300 border
        ${active ? "shadow-xl ring-2 ring-[#00357a]" : "hover:shadow-lg "}`}
    >
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value.toString()}</p>
      </div>
    </div>
  );
}
