import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/api";

type FortniteProfile = {
  rvn: number;
  commandRevision: number;
  stats: any;
  items: Record<string, any>;
};

type ProfileStore = {
  hydrated: boolean;
  profiles: Record<string, FortniteProfile>;

  setHydrated: () => void;
  setProfile: (profileId: string, profile: FortniteProfile) => void;
  clearProfiles: () => void;

  fetchProfile: (
    accountId: string,
    profileId: "athena" | "common_core",
    token: string,
  ) => Promise<void>;

  loadMockProfile: (accountId: string) => void;

  getFavoriteCharacter: () => string | null;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      profiles: {},

      setHydrated: () => set({ hydrated: true }),

      setProfile: (profileId, profile) =>
        set((state) => ({
          profiles: {
            ...state.profiles,
            [profileId]: profile,
          },
        })),

      clearProfiles: () => set({ profiles: {} }),

      loadMockProfile: (accountId) => {
        if (accountId.startsWith("mock-")) {
          set((state) => ({
            profiles: {
              ...state.profiles,
              athena: {
                rvn: 1,
                commandRevision: 1,
                stats: {
                  attributes: {
                    level: 100,
                    favorite_character: "AthenaCharacter:cid_001_athena_commando_f_default",
                    loadouts: [],
                  },
                },
                items: {
                  "AthenaCharacter:cid_001_athena_commando_f_default": {
                    templateId: "AthenaCharacter:cid_001_athena_commando_f_default",
                  },
                },
              },
              common_core: {
                rvn: 1,
                commandRevision: 1,
                stats: {},
                items: {
                  "Currency:MtxPurchased": {
                    quantity: 1500,
                    templateId: "Currency:MtxPurchased",
                  },
                },
              },
            },
          }));
        }
      },

      fetchProfile: async (accountId, profileId, token) => {
        if (!accountId || !profileId || !token) return;

        const res = await api.postQueryProfile(accountId, profileId, token);

        if (!res.success) throw new Error(res.error);

        const fullUpdate = res.data.profileChanges?.find(
          (c: any) => c.changeType === "fullProfileUpdate",
        );

        if (!fullUpdate?.profile) return;

        set((state) => ({
          profiles: {
            ...state.profiles,
            [profileId]: fullUpdate.profile,
          },
        }));
      },

      getFavoriteCharacter: () => {
        const athena = get().profiles["athena"];
        if (!athena) return null;

        // 1. Check favorite_character attribute
        const fav = athena?.stats?.attributes?.favorite_character;
        if (fav && typeof fav === "string") {
          const cid = fav.includes(":") ? fav.split(":")[1] : fav;
          if (cid && cid.toLowerCase().startsWith("cid_")) return cid;

          if (athena.items && athena.items[fav]) {
            const item = athena.items[fav];
            const templateId = item?.templateId || item?.template_id;
            if (templateId && typeof templateId === "string") {
              const itemCid = templateId.split(":")[1] || templateId;
              if (itemCid) return itemCid;
            }
          }
        }

        // 2. Check loadouts
        const loadouts = athena?.stats?.attributes?.loadouts;
        if (Array.isArray(loadouts) && loadouts.length > 0) {
          const charId = loadouts[0]?.favoriteCharacter;
          if (charId && typeof charId === "string") {
            const cid = charId.includes(":") ? charId.split(":")[1] : charId;
            if (cid) return cid;
          }
        }

        // 3. Check equipped item in items
        if (athena.items) {
          for (const key in athena.items) {
            const item = athena.items[key];
            const templateId = item?.templateId || item?.template_id || "";
            if (
              typeof templateId === "string" &&
              templateId.toLowerCase().includes("athenacharacter:cid_")
            ) {
              return templateId.split(":")[1] || templateId;
            }
          }
        }

        return null;
      },
    }),
    {
      name: "storage:profiles",
      partialize: (state) => ({
        profiles: state.profiles,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
