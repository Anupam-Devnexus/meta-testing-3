import { create } from 'zustand';

const useUserStore = create((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUser: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(
        'http://ec2-15-206-164-254.ap-south-1.compute.amazonaws.com:3000/auth/api/get-all-users'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      set({ users: result, loading: false });
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch data',
        loading: false,
      });
    }
  },
}));

export default useUserStore;
