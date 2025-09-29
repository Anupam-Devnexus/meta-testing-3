import React, { useState, useEffect } from "react";
import useLeadStore from "../../Zustand/LeadsGet";

export const Oppur = () => {
  const { data, loading, error, fetchData } = useLeadStore();

  useEffect(() => {
    fetchData();
  }, []);

  const leads = data?.leads || [];
  console.log(leads)

  const remarkColors = {
    new: "bg-blue-100 text-blue-700 border border-blue-300",
    "appointment scheduled": "bg-purple-100 text-purple-700 border border-purple-300",
    called: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    "hot leads": "bg-red-100 text-red-700 border border-red-300",
    converted: "bg-green-100 text-green-700 border border-green-300",
    other: "bg-gray-100 text-gray-700 border border-gray-300",
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4">
        Opportunities (Leads from Social Media Ads)
      </h2>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-[var(--primary-color)] text-white">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3">Extra Fields</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">{lead.name || "—"}</td>
                <td className="px-4 py-3">{lead.email || "—"}</td>
                <td className="px-4 py-3">{lead.phone || "—"}</td>
                <td className="px-4 py-3">{lead.campaign_name || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      remarkColors[lead.status?.toLowerCase()] ||
                      remarkColors["other"]
                    }`}
                  >
                    {lead.status || "Other"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    defaultValue={lead.remarks1 || ""}
                    className="w-full px-2 py-1 border rounded-md text-sm focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                  />
                </td>
                <td className="px-4 py-3">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {lead.field_data?.map((f, i) => (
                    <div key={i}>
                      <span className="font-medium">{f.name}:</span>{" "}
                      {f.values?.[0] || "—"}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-4 text-gray-500"
                >
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
