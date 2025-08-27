import { create } from "zustand";

const useMetaLeads = create((set) => ({
  metaleads: [],
  loading: false,
  error: null,

  fetchMetaLeads: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('https://dbbackend.devnexussolutions.com/user/leads',{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // 🔑 token storage
          // "Cookie": "connect.sid=...",  // rarely needed in SPA if using JWT
        },
        credentials: "include", // needed if backend uses cookies/sessions
      });
   // replace with your API URL
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      set({ metaleads: data, loading: false });
    } catch (error) {
      set({ error: error.message || "Failed to fetch meta leads", loading: false });
    }
  },
}));

export default useMetaLeads;
