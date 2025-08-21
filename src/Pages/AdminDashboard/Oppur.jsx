import React, { useState } from "react";

export const Oppur = () => {
  const [remarkOptions1] = useState([
    "New Lead",
    "Appointment Scheduled",
    "Called",
    "Hot Leads",
    "Converted",
    "Other",
  ]);

  // Mock leads
  const mockLeads = [
    { id: 1, name: "Rahul Sharma", source: "Facebook Ads", status: "New Lead", userRemark: "Interested in product A" },
    { id: 2, name: "Priya Singh", source: "Instagram Ads", status: "Appointment Scheduled", userRemark: "Meeting scheduled for Friday" },
    { id: 3, name: "Amit Patel", source: "LinkedIn Ads", status: "Called", userRemark: "Asked for pricing details" },
    { id: 4, name: "Sneha Verma", source: "Twitter Ads", status: "Hot Leads", userRemark: "Very keen, wants follow-up" },
    { id: 5, name: "Rohit Gupta", source: "Facebook Ads", status: "Converted", userRemark: "Closed deal successfully" },
    { id: 6, name: "Anjali Mehta", source: "Instagram Ads", status: "Other", userRemark: "Needs more time to decide" },
  ];

  // Color mapping
  const remarkColors = {
    "New Lead": "bg-blue-100 text-blue-700 border border-blue-300",
    "Appointment Scheduled": "bg-purple-100 text-purple-700 border border-purple-300",
    "Called": "bg-yellow-100 text-yellow-700 border border-yellow-300",
    "Hot Leads": "bg-red-100 text-red-700 border border-red-300",
    "Converted": "bg-green-100 text-green-700 border border-green-300",
    "Other": "bg-gray-100 text-gray-700 border border-gray-300",
  };

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
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">User Remark</th>
            </tr>
          </thead>
          <tbody>
            {mockLeads.map((lead) => (
              <tr key={lead.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-3">{lead.name}</td>
                <td className="px-4 py-3">{lead.source}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${remarkColors[lead.status]}`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    defaultValue={lead.userRemark}
                    className="w-full px-2 py-1 border rounded-md text-sm focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
