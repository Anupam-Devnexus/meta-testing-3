import React, { useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useManualLeadsStore } from "../../Zustand/MannualLeads";

/* -------------------- Helpers -------------------- */
const parseBudget = (value) => {
  if (!value) return 0;
  return Number(value.replace(/,/g, "")) || 0;
};

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

/* -------------------- Tooltip -------------------- */
const SalesTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const { cumulativeRevenue, leads } = payload[0].payload;

  return (
    <div className="bg-white border rounded-lg shadow-xl p-3 w-72">
      <p className="font-semibold text-gray-800 mb-1">📅 {label}</p>
      <p className="text-sm text-gray-600 mb-2">
        Cumulative Revenue:{" "}
        <strong>₹{cumulativeRevenue.toLocaleString()}</strong>
      </p>

      <div className="max-h-60 overflow-y-scroll space-y-2">
        {leads.map((lead, idx) => (
          <div key={idx} className="text-xs border-b pb-1 last:border-0">
            <p><strong>Name:</strong> {lead.name}</p>
            <p><strong>Campaign:</strong> {lead.campaign}</p>
            <p><strong>City:</strong> {lead.city}</p>
            <p className="text-gray-500">
              Amount: ₹{lead.amount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------- Component -------------------- */
const SalesChart = () => {
  const { leads, fetchLeads } = useManualLeadsStore();

  /* fetch once (NO infinite loop) */
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  /* -------------------- Cumulative Revenue Logic -------------------- */
  const cumulativeData = useMemo(() => {
    if (!leads?.length) return [];

    const dailyMap = {};

    leads
      .filter((lead) =>
        ["closed", "converted"].includes(lead.status)
      )
      .forEach((lead) => {
        const dateKey = formatDate(lead.createdAt || lead.date);
        const amount = parseBudget(lead.budget);

        if (!dailyMap[dateKey]) {
          dailyMap[dateKey] = {
            date: dateKey,
            dailyRevenue: 0,
            leads: [],
          };
        }

        dailyMap[dateKey].dailyRevenue += amount;
        dailyMap[dateKey].leads.push({
          name: lead.name || "—",
          campaign: lead.Campaign || "N/A",
          city: lead.city || "N/A",
          amount,
        });
      });

    let cumulativeRevenue = 0;

    return Object.values(dailyMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((day) => {
        cumulativeRevenue += day.dailyRevenue;
        return {
          date: day.date,
          cumulativeRevenue,
          leads: day.leads,
        };
      });
  }, [leads]);

  /* -------------------- UI -------------------- */
  return (
    <div className="bg-white p-5 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        📈 Cumulative Revenue
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={cumulativeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<SalesTooltip />} />
          <Line
            type="monotone"
            dataKey="cumulativeRevenue"
            stroke="#00357a"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
