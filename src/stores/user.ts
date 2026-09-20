import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Profile } from "../types";

export const useUserStore = create<Profile>()(
  persist(
    (set) => ({
      accountId: null,
      accessToken: "",
      displayName: null,
      email: null,
      password: null,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      setProfile: (user) => set((state) => ({ ...state, ...user })),

      clearProfile: () =>
        set({
          accountId: null,
          displayName: null,
          accessToken: "",
          email: null,
          password: null,
        }),

      login: (user) =>
        set({
          accountId: user.accountId,
          accessToken: user.accessToken,
          displayName: user.displayName,
          email: user.email,
          password: user.password,
        }),

      logout: () =>
        set({
          accountId: null,
          displayName: null,
          accessToken: "",
          email: null,
          password: null,
        }),
    }),
    {
      name: "storage:user",
      partialize: (state) => ({
        accountId: state.accountId,
        accessToken: state.accessToken,
        displayName: state.displayName,
        email: state.email,
        password: state.password,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
