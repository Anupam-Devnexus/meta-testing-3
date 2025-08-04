import { create } from "zustand";
import axios from "axios";

const useContactStore = create((set) => ({
  data: [],
  loading: false,
  error: null,

  fetchContacts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        "http://ec2-15-206-164-254.ap-south-1.compute.amazonaws.com:3000/auth/api/contact"
      );
      set({ data: response.data, loading: false });
    } catch (error) {
      set({ error: error.message || "Failed to fetch contacts", loading: false });
    }
  },
}));

export default useContactStore;
