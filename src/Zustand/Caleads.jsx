import { create } from "zustand";
import axios from "axios";

const api =
  "https://dbbackend.devnexussolutions.com/all-leads-via-webhook";

const useCaleads = create((set) => ({
  data: [],
  loading: false,
  error: null,

  fetchCaleads: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(api);
      set({ data: res.data.leads, loading: false });
    } catch (err) {
      set({ error: err.message || "Something went wrong", loading: false });
    }
  },
}));

export default useCaleads;
