import { create } from "zustand";
import axios from "axios";

const API_URL = "https://dbbackend.devnexussolutions.com/user/leads";

const useCaleads = create((set, get) => ({
  caleads: [],             // all leads
  campaignNames: [],       // all campaign names
  campaignData: [],        // campaign-wise data [{ campaignName, leads }]
  loading: false,
  error: null,

  // 🔹 Fetch CA Leads
  fetchCaleads: async () => {
    set({ loading: true, error: null });

    try {
      // ✅ Fetch token from localStorage
      const userDetails =
        JSON.parse(localStorage.getItem("UserDetails")) ||
        JSON.parse(localStorage.getItem("User")) ||
        null;

      if (!userDetails?.token) {
        throw new Error("No token found. Please login again.");
      }

      // ✅ API request
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${userDetails.token}` },
      });

      const leadsData = res.data?.leads || [];

      // ✅ Extract unique campaign names
      const uniqueCampaigns = [
        ...new Set(leadsData.map((lead) => lead.campaign_name).filter(Boolean)),
      ];

      // ✅ Build structured campaign data
      const campaignData = uniqueCampaigns.map((name) => ({
        campaignName: name,
        leads: leadsData.filter((lead) => lead.campaign_name === name),
      }));

      // ✅ Update Zustand store
      set({
        caleads: leadsData,
        campaignNames: uniqueCampaigns,
        campaignData,
        loading: false,
      });

      console.log("✅ All CA Leads:", leadsData);
      console.log("✅ Campaign Names:", uniqueCampaigns);
      console.log("✅ Campaign Data:", campaignData);
    } catch (err) {
      console.error("❌ Error fetching CA Leads:", err);
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch CA leads",
        loading: false,
      });
    }
  },

  // 🔹 Get all campaign names
  getAllCampaignNames: () => get().campaignNames,

  // 🔹 Get all leads
  getAllLeads: () => get().caleads,

  // 🔹 Get leads by campaign
  getLeadsByCampaign: (campaignName) => {
    const { campaignData } = get();
    const campaign = campaignData.find((c) => c.campaignName === campaignName);
    return campaign ? campaign.leads : [];
  },

  // 🔹 Get full campaign data
  getAllCampaignData: () => get().campaignData,
}));

export default useCaleads;
