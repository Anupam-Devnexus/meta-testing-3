import { useEffect, useMemo } from "react";
import { useManualLeadsStore } from "../../Zustand/MannualLeads";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BudgetChart = () => {
  const { leads, loading, error, fetchLeads } = useManualLeadsStore();

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ✅ Convert API response → Chart format
  const chartData = useMemo(() => {
    if (!Array.isArray(leads)) return [];

    return leads.map((lead) => ({
      name: lead.name || "No Name",
      budget: Number(lead.budget?.replace(/,/g, "")) || 0,
      campaign: lead.campaign,
      city: lead.city,
      priority: lead.priority,
    }));
  }, [leads]);

  return (
    <div className="w-full h-[420px] p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">
        Lead Budget Analysis
      </h2>

      {loading && <p className="text-gray-500">Loading chart...</p>}
      {error && <p className="text-red-500">Error loading leads</p>}

      {!loading && chartData.length === 0 && (
        <p className="text-gray-500">No lead data available</p>
      )}

      {!loading && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => `₹ ${value.toLocaleString()}`}
              labelFormatter={(label) => `Lead: ${label}`}
            />
            <Legend />
            <Bar
              dataKey="budget"
              name="Budget (₹)"
              fill="#22c55e"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BudgetChart;
