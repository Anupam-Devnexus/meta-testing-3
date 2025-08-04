// src/store/useLeadStore.js
import { create } from 'zustand';

const useLeadStore = create((set) => ({
  data: [],
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(
        'http://ec2-15-206-164-254.ap-south-1.compute.amazonaws.com:3000/auth/api/get-all-leads'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      set({ data: result, loading: false });
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch data',
        loading: false,
      });
    }
  },
}));

export default useLeadStore;
