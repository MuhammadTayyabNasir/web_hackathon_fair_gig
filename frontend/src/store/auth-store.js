import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  firebaseUid: null,
  dashboardSeed: null,
  setSession: (payload) =>
    set({
      user: payload.user,
      accessToken: payload.accessToken,
      firebaseUid: payload.firebaseUid,
      dashboardSeed: payload.dashboardSeed ?? null,
    }),
  setDashboardSeed: (dashboardSeed) => set({ dashboardSeed }),
  clearSession: () => set({ user: null, accessToken: null, firebaseUid: null, dashboardSeed: null }),
}));
