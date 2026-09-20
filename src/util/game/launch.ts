"use client";

import { invoke } from "@tauri-apps/api/core";
import { sendNotification } from "@tauri-apps/plugin-notification";

import { Window } from "@tauri-apps/api/window";
import { useLibraryStore } from "../../stores/library";
import { useConfigStore } from "../../stores/settings";
import { Config } from "../../config";
import { useUserStore } from "../../stores/user";
import { showToast } from "../../app/components/toaster";

const window = new Window("Main");

const SHIPPING_EXE = "FortniteClient-Win64-Shipping.exe";

async function resolveShippingExe(buildPath: string): Promise<string | null> {
  const norm = buildPath.replace(/\//g, "\\").replace(/\\+$/, "");
  const candidates: string[] = [];

  const addLayouts = (base: string) => {
    if (!base || candidates.includes(base)) return;
    candidates.push(`${base}\\Binaries\\Win64\\${SHIPPING_EXE}`);
    candidates.push(`${base}\\FortniteGame\\Binaries\\Win64\\${SHIPPING_EXE}`);
    candidates.push(`${base}\\${SHIPPING_EXE}`);
  };

  addLayouts(norm);

  // If the stored path is the FortniteGame dir or Win64/bin dir, also try its parent
  if (/\\FortniteGame$/i.test(norm) || /\\Binaries\\Win64$/i.test(norm)) {
    addLayouts(norm.slice(0, norm.lastIndexOf("\\")));
  }

  // Walk up the remaining ancestors
  const parts = norm.split("\\").filter(Boolean);
  for (let i = parts.length - 1; i > 1; i--) {
    addLayouts("\\" + parts.slice(0, i).join("\\"));
  }

  for (const candidate of candidates) {
    try {
      if (await invoke<boolean>("check_file_exists", { path: candidate })) {
        return candidate;
      }
    } catch {
      // ignore and continue
    }
  }

  // Fallback: deep filesystem search for the shipping executable
  try {
    return await invoke<string | null>("find_shipping_exe", { root: buildPath });
  } catch {
    return null;
  }
}

export const start = async (
  buildPath: string,
  isValidSession: () => boolean,
): Promise<boolean> => {
  const build = useLibraryStore.getState().entries.get(buildPath);
  const { email, password } = useUserStore.getState();
  const { minimizeOnLaunch, eorEnabled, rorEnabled, highPriorityLaunch, adminLaunch, mobileBuilds } =
    useConfigStore.getState();

  if (!build) {
    showToast.error(`No build found at path: ${buildPath}`);
    return false;
  }

  if (!isValidSession()) {
    showToast.error(`User is not authenticated.`);
    return false;
  }

  try {
    const fn = await resolveShippingExe(buildPath);

    if (!fn) {
      console.warn(
        `[Invalid Build] Executable missing for version ${build.version}: ${buildPath}`,
      );
      showToast.error(
        `Could not find ${SHIPPING_EXE} for this build.\n\nSearched under:\n${buildPath}\n\nMake sure the file exists at ${buildPath}\\FortniteGame\\Binaries\\Win64\\${SHIPPING_EXE}`,
      );
      return false;
    }

    const extraDllOptions: Record<string, string>[] = [];
    const customPaksLinks: string[] = [];

    if (Config.LAUNCH_OPTIONS.PAK_LINKS) {
      customPaksLinks.push(...Config.LAUNCH_OPTIONS.PAK_LINKS);
    }

    if (Config.LAUNCH_OPTIONS.MOBILE_BUILDS != null && mobileBuilds) {
      customPaksLinks.push(...Config.LAUNCH_OPTIONS.MOBILE_BUILDS);
    }

    if (Config.LAUNCH_OPTIONS.EOR_ENABLED != null && eorEnabled) {
      customPaksLinks.push(...Config.LAUNCH_OPTIONS.EOR_ENABLED);
    }

    if (Config.LAUNCH_OPTIONS.ROR_ENABLED != null && rorEnabled) {
      customPaksLinks.push(...Config.LAUNCH_OPTIONS.ROR_ENABLED);
    }

    const backendUrl = Config.BACKEND_URL.replace("http://", "").replace(
      "https://",
      "",
    );

    await invoke("launch_game", {
      filePath: fn,
      email: email,
      password: password,
      redirectLink: Config.LAUNCH_OPTIONS.REDIRECT_DOWNLOAD || "",
      backend: backendUrl,
      injectExtraDlls: Config.LAUNCH_OPTIONS.DOWNLOAD_EXTRA_DLLS || false,
      extraDllLinks: Config.LAUNCH_OPTIONS.DLL_LINKS || [],
      useCustomPaks: Config.LAUNCH_OPTIONS.DOWNLOAD_PAKS || false,
      customPaksLinks: customPaksLinks,
      extraDllOptions: extraDllOptions,
      highPriority: highPriorityLaunch,
      adminLaunch: adminLaunch,
    });

    if (minimizeOnLaunch) {
      await window.minimize();
    }

    sendNotification({
      title: `Launching ${Config.CURRENT_VERSION}`,
      body: "Game launched successfully!",
    });

    return true;
  } catch (error) {
    console.error("Launch error:", error);
    const detail =
      typeof error === "string"
        ? error
        : error instanceof Error
          ? error.message
          : "";
    showToast.error(
      detail
        ? `Failed to launch game: ${detail}`
        : "Failed to launch game.",
    );
    return false;
  }
};
