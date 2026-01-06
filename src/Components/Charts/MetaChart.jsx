import { useEffect, useMemo } from "react";
import useLeadStore from "../../Zustand/LeadsGet";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ------------------ Helpers ------------------ */

const normalizeMetaFields = (fieldData = []) =>
  fieldData.reduce((acc, field) => {
    acc[field.name] = field.values?.[0] || "";
    return acc;
  }, {});

const parseBudget = (budgetStr) => {
  if (!budgetStr) return 0;

  const cleaned = budgetStr
    .replace(/[₹,_]/g, "")
    .replace("–", "-")
    .split("-")
    .map((n) => parseInt(n.trim()));

  if (cleaned.length === 2 && !isNaN(cleaned[0]) && !isNaN(cleaned[1])) {
    return Math.round((cleaned[0] + cleaned[1]) / 2);
  }

  return !isNaN(cleaned[0]) ? cleaned[0] : 0;
};

/* ------------------ Component ------------------ */

export default function MetaChart() {
  const { data, fetchData, loading, error } = useLeadStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = useMemo(() => {
    if (!data?.leads) return [];

    return data.leads.map((lead, index) => {
      const fields = normalizeMetaFields(lead.field_data);

      return {
        name: fields.full_name || lead.name || `Lead ${index + 1}`,
        budget: parseBudget(
          fields["what_is_your_monthly_marketing_budget?"]
        ),
        city: fields.city || "Unknown",
        campaign: lead.campaign_name,
      };
    });
  }, [data]);

  /* ------------------ UI ------------------ */

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        Meta Leads – Budget Overview
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading chart...</p>
      ) : error ? (
        <p className="text-red-500">Failed to load Meta leads</p>
      ) : chartData.length === 0 ? (
        <p className="text-gray-400">No leads available</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-30}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="budget" name="Estimated Budget (₹)" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
