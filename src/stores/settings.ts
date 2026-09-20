import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ConfigState, SidebarPosition } from "../types";
import { invoke } from "@tauri-apps/api/core";

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      minimizeOnLaunch: false,
      minimizeSidebar: true,
      theme: "obsidian",
      sidebarPosition: "left",
      sidebarSize: 208,
      frameHeight: 32,
      highPriorityLaunch: true,
      adminLaunch: true,
      closeGameOnLauncherExit: true,

      editOnRelease: false,
      editAndRelease: false,
      resetOnRelease: false,
      alwaysOnTop: false,
      eorEnabled: false,
      rorEnabled: false,
      lowUsageMode: false,
      snowParticles: true,
      mobileBuilds: false,

      setEorEnabled: (value: boolean) => set({ eorEnabled: value }),
      setRorEnabled: (value: boolean) => set({ rorEnabled: value }),
      setLowUsageMode: (value: boolean) => set({ lowUsageMode: value }),
      setResetOnRelease: (value: boolean) => set({ resetOnRelease: value }),
      setEditAndRelease: (value: boolean) => set({ editAndRelease: value }),
      setEditOnRelease: (value: boolean) => set({ editOnRelease: value }),
      setSnowParticles: (value: boolean) => set({ snowParticles: value }),
      setMobileBuilds: (value: boolean) => set({ mobileBuilds: value }),
      setMinimizeSidebar: (value: boolean) => set({ minimizeSidebar: value }),
      setMinimizeOnLaunch: (value: boolean) => set({ minimizeOnLaunch: value }),
      setSidebarPosition: (pos: SidebarPosition) =>
        set({ sidebarPosition: pos }),
      setSidebarSize: (size: number) => set({ sidebarSize: size }),
      setFrameHeight: (height: number) => set({ frameHeight: height }),
      setHighPriorityLaunch: (value: boolean) => set({ highPriorityLaunch: value }),
      setAdminLaunch: (value: boolean) => set({ adminLaunch: value }),
      setCloseGameOnLauncherExit: (value: boolean) =>
        set({ closeGameOnLauncherExit: value }),

      setAlwaysOnTop: async (value) => {
        await invoke("set_always_on_top", { alwaysOnTop: value });
        set({ alwaysOnTop: value });
      },

      toggleMinimizeOnLaunch: () =>
        set((state) => ({ minimizeOnLaunch: !state.minimizeOnLaunch })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "settings",
    },
  ),
);