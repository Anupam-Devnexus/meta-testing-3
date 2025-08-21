import { useEffect, useState } from "react";
import UserData from "../../Datastore/Allusers.json";
import { FaUser, FaUsers, FaChartLine } from "react-icons/fa";
import StatCard from "../../Components/Cards/StatCard";
import { useNavigate } from "react-router-dom";
import useMetaLeads from "../../Zustand/MetaLeadsGet";
import useLeadStore from "../../Zustand/LeadsGet";
import SellHistoryChart from "../../Components/SellHistoryChart";
import SupportTracker from "../../Components/SupportTracker";

export default function Dashboard() {
  const {metaleads , fetchMetaLeads} = useMetaLeads();
  const {data , fetchData} = useLeadStore();
  const [userInfo, setUserInfo] = useState({
    userName: "",
    userEmail: "",
    userRole: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    
    const userName = localStorage.getItem("userName") || "User";
    const userEmail = localStorage.getItem("userEmail") || "email@example.com";
    const userRole = localStorage.getItem("userRole") || "Role";

    setUserInfo({ userName, userEmail, userRole });

    fetchMetaLeads();
    fetchData();
  }, []);
  const metadata = metaleads.leads

const totalLeads = data?.leads?.length;
  

  return (
    <div className="p-3 bg-gradient-to-tr from-indigo-50 via-white to-indigo-50 min-h-screen">
      {/* User greeting */}
      <div className="mb-12 p-8 bg-white rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-700">
            Welcome back,{" "}
            <span className="text-indigo-900">{userInfo.userName}!</span>
          </h1>
          <p className="mt-1 text-lg text-indigo-600 font-semibold">
            Role: {userInfo.userRole}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 text-indigo-500 text-base font-medium select-text">
        <button className="px-3 py-1 bg-blue-600 text-white font-semibold rounded-2xl cursor-pointer">Connect Facebook</button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <StatCard
          icon={FaUser}
          title="Total Users"
          value={totalLeads}
          bgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          onClick={() => navigate("/admin-dashboard/users")}
          hoverEffect={true}
        />
        <StatCard
          icon={FaUsers}
          title="Total Meta Leads"
          value={metadata?.length}
          bgColor="bg-green-100"
          iconColor="text-green-600"
          onClick={() => navigate("/admin-dashboard/meta")}
          hoverEffect={true}
        />
        <StatCard
          icon={FaChartLine}
          title="Statistics"
          value=""
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          onClick={() => navigate("/admin-dashboard/stats")}
          hoverEffect={true}
        />
      </div>
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 pt-20">
        <SellHistoryChart />
        <SupportTracker />
      </div>
    </div>
  );
}
