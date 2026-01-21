import { create } from "zustand";

export const useManualLeadsStore = create((set) => ({
  leads: [],
  loading: false,
  error: null,

  // Action to fetch leads
  fetchLeads: async () => {
    const token = JSON.parse(localStorage.getItem("UserDetails"))?.token;

    if (!token) {
      set({ error: "User not authenticated. Please log in.", leads: [] });
      return;
    }

    set({ loading: true, error: null });

    try {
      const res = await fetch(
        "https://dbbackend.devnexussolutions.com/auth/api/get-all-leads",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        // Handle HTTP errors
        const errorText = await res.text();
        set({ leads: [], loading: false, error: `HTTP Error: ${res.status} - ${errorText}` });
        return;
      }

      const data = await res.json();

      // Ensure leads is always assigned from data?.leads if available
      const leadsData = data?.leads || [];
      set({ leads: leadsData, loading: false, error: null });

    } catch (err) {
      console.error("Fetch error:", err);
      set({ leads: [], loading: false, error: "An error occurred while fetching leads" });
    }
  },

}));
