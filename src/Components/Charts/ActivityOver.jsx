import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useManualLeadsStore } from "../../Zustand/MannualLeads";
import useContactStore from "../../Zustand/Contact";
import useLeadStore from "../../Zustand/LeadsGet";
import useUserStore from "../../Zustand/UsersGet";
import useMetaLeads from "../../Zustand/MetaLeadsGet";


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#00357a",
          padding: "8px 12px",
          borderRadius: "8px",
          color: "#fff",
        }}
      >
        <p style={{ margin: 0, fontWeight: "bold" }}>{label}</p>
        <p style={{ margin: 0 }}>Count: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const ActivityOver = () => {
  const { leads: manualLeads, fetchLeads } = useManualLeadsStore();
  const { users, fetchUser } = useUserStore();
  const { data: contactsData, fetchContacts } = useContactStore();
  const { data: leadsData, fetchData: fetchLeadsData } = useLeadStore();
  const { metaleads, fetchMetaLeads } = useMetaLeads();


  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchLeads();
    fetchUser();
    fetchContacts();
    fetchMetaLeads()
    fetchLeadsData();
  }, []);

  useEffect(() => {
    const dataForChart = [
      { name: "Manual Leads", count: manualLeads?.length || 0 },
      { name: "Users", count: users?.users?.length || 0 },
      { name: "Contacts", count: contactsData?.TotoalLeads || 0 },
      { name: "Leads Store", count: leadsData?.leads?.length || 0 },
      {name:"Meta Leads" , count:metaleads?.total || 0}
    ];
    setChartData(dataForChart);
  }, [manualLeads, users, contactsData, leadsData]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Response Length Overview
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" stroke="#00357a" />
          <YAxis stroke="#00357a" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="count"
            fill="#00357a"
            barSize={50}
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityOver;
