import { create } from "zustand";

export const useFacebookStore = create((set, get) => ({
  connected: false,
  loading: false,
  pages: [],
  adAccounts: [],
  campaigns: [],
  insights: [],

  setConnected: (val) => set({ connected: val }),
  setLoading: (val) => set({ loading: val }),
  setPages: (data) => set({ pages: data }),
  setAdAccounts: (data) => set({ adAccounts: data }),
  setCampaigns: (data) => set({ campaigns: data }),
  setInsights: (data) => set({ insights: data }),

  fetchPages: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/pages");
      const json = await res.json();
      set({ pages: json.pages || [], connected: true });
    } catch (err) {
      console.error("Fetch pages failed:", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchAdAccounts: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/ad-accounts");
      const json = await res.json();
      set({ adAccounts: json.accounts || [] });
    } catch (err) {
      console.error("Fetch ad accounts failed:", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchCampaigns: async (accountId) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/campaigns/${accountId}`);
      const json = await res.json();
      set({ campaigns: json.campaigns || [] });
    } catch (err) {
      console.error("Fetch campaigns failed:", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchInsights: async (adAccountId, level = "campaign") => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/insights?ad_account=${adAccountId}&level=${level}`);
      const json = await res.json();
      const data = json.data?.data || [];
      set({ insights: data });
    } catch (err) {
      console.error("Fetch insights failed:", err);
    } finally {
      set({ loading: false });
    }
  },
}));
