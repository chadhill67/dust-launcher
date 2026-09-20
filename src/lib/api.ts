import { endpoints } from "./http/routes";
import { request } from "./http/request";
import { ContentPagesResult } from "../types";

export const api = {
  getContentPages: () =>
    request<ContentPagesResult>({ url: endpoints.contentPages }),

  getShopCatalog: () => request<any>({ url: endpoints.shopCatalog }),

  getCaldera: (accountId: string, version: string = "12.41") =>
    request<any>({
      url: endpoints.launcherCaldera,
      params: { accountId, version },
      timeout: 10000,
    }),

  login: (email: string, password: string) =>
    request<any>({
      url: "/h/d/v1/launcher/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ email, password }),
      timeout: 10000,
    }),

  postQueryProfile: (
    accountId: string,
    profileId: "athena" | "common_core",
    token: string,
    rvn: number = -1,
  ) =>
    request<any>({
      url: `${endpoints.queryProfile}/${accountId}/client/QueryProfile`,
      method: "POST",
      params: { profileId, rvn },
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }),

  getStatsV2Leaderboard: (leaderboardName: string, maxSize: number = 100) =>
    request<{
      maxSize: number;
      entries: {
        displayName: string;
        account: string;
        value: number;
      }[];
    }>({
      url: `${endpoints.statsV2Leaderboard}/${leaderboardName}`,
      params: { maxSize },
    }),

  postGlobalLeaderboard: (
    leaderboardName: string,
    window: "alltime" | "weekly" | "daily" = "alltime",
  ) =>
    request<{
      statName: string;
      statWindow: string;
      entries: {
        accountId: string;
        displayName: string;
        rank: number;
        value: number;
      }[];
    }>({
      url: `${endpoints.globalLeaderboard}/${leaderboardName}/window/${window}`,
      method: "POST",
    }),

  getPaks: () =>
    request<
      {
        name: string;
        size: number;
      }[]
    >({ url: endpoints.paks }),
};
