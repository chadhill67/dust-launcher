import { create } from "zustand";
import { api } from "../lib/api";

export type LeaderboardEntry = {
  displayName: string;
  account: string;
  value: number;
};

type LeaderboardState = {
  entries: LeaderboardEntry[];
  loading: boolean;
  error?: string;

  fetchLeaderboard: (
    playlist: "solo" | "duo" | "squad",
    stat: "wins" | "kills" | "score",
    input: "keyboardmouse" | "pc",
  ) => Promise<void>;
};

const STAT_MAP = {
  wins: "placetop1",
  kills: "kills",
  score: "score",
};

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  entries: [],
  loading: false,

  fetchLeaderboard: async (playlist, stat, input) => {
    set({ loading: true, error: undefined });

    const leaderboardName = `br_${STAT_MAP[stat]}_${input}_m0_playlist_default${playlist}`;

    const res = await api.getStatsV2Leaderboard(leaderboardName);

    if (!res.success || !res.data) {
      set({ loading: false, error: res.error || "Failed to load leaderboard" });
      return;
    }

    set({
      entries: res.data.entries,
      loading: false,
    });
  },
}));
