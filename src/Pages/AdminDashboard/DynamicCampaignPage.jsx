import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useCaleads from "../../Zustand/Caleads";
import DynamicDataTable from "../../Components/Tables/DynamicDataTable";

const DynamicCampaignPage = () => {
  const { campaignName } = useParams(); // get campaign name from URL
  const { fetchCaleads, loading, caleads, getLeadsByCampaign } = useCaleads();

  // Fetch all leads on mount
  useEffect(() => {
    fetchCaleads();
  }, []);

  // Get leads for this specific campaign
  const leads = getLeadsByCampaign(campaignName);

  if (loading)
    return (
      <div className="p-6 text-lg text-gray-600">Loading campaign data...</div>
    );

  if (!leads.length)
    return (
      <div className="p-6 text-lg text-gray-600">
        No leads found for campaign:{" "}
        <strong className="text-gray-800">
          {decodeURIComponent(campaignName)}
        </strong>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">
          {decodeURIComponent(campaignName)}
        </h2>
        <p className="text-gray-500">
          Total Leads: <span className="font-semibold">{leads.length}</span>
        </p>
      </header>

      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        {/* Dynamic table with all functionality */}
        <DynamicDataTable
          apiData={leads}
          patchApi="/api/leads/update" // Replace with your real PATCH API
        />
      </div>
    </div>
  );
};

export default DynamicCampaignPage;
