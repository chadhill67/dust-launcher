import { message, open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { useLibraryStore } from "../../stores/library";
import { Config } from "../../config";
import {
  formatBytes,
  getBuildSize,
  getChapterAndSeason,
  parseVersionInfo,
  validateBuildPath,
} from "./buildUtils";

const supportedVersions = ["12.41"];

export const IMPORT_BUILD_NETCL =
  "++Fortnite+Release-12.41-CL-12905909-Windows";

export interface ImportResult {
  path: string;
  version: string;
  netcl: string;
  title: string;
  size: string;
  season: string;
  isSupported: boolean;
  shipping: string;
}

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").toLowerCase().replace(/\/+$/, "");
}

export const importBuild = async (): Promise<ImportResult | null> => {
  try {
    const buildStore = useLibraryStore.getState();

    const selectedPath = await open({
      multiple: false,
      directory: true,
      title: "Select Fortnite Installation Folder",
    });

    if (!selectedPath) {
      return null;
    }

    if (typeof selectedPath !== "string" || selectedPath.trim() === "") {
      await message(
        "Invalid path selected. Please select a valid Fortnite installation folder.",
        { title: "Invalid Path" }
      );
      return null;
    }

    let validationResult;
    try {
      validationResult = await validateBuildPath(selectedPath);
    } catch (error) {
      await message(
        `Unable to access the selected folder: ${selectedPath}\n\nPlease ensure you have permission to read this directory and try again.`,
        { title: "Access Error" }
      );
      return null;
    }

    const { isValid, shippingPath } = validationResult;

    if (!isValid) {
      await message(
        `The selected folder does not appear to be a valid Fortnite installation:\n\n${selectedPath}\n\nPlease select the root Fortnite folder that contains the FortniteGame directory.`,
        { title: "Invalid Fortnite Installation" }
      );
      return null;
    }

    const normShipping = normalizePath(shippingPath);
    const existingBuild = buildStore.builds.find(
      (b: any) => normalizePath(b.shipping) === normShipping
    );
    if (existingBuild) {
      await message(
        `This Fortnite build has already been imported:\n\n${existingBuild.title} (${existingBuild.version})\n\nPath: ${existingBuild.path}`,
        { title: "Build Already Exists" }
      );
      return null;
    }

    let patternHexCheck: string[];
    try {
      patternHexCheck = (await invoke("locate_version", {
        filePath: shippingPath,
      })) as string[];
    } catch (error) {
      await message(
        `Failed to analyze the Fortnite executable:\n\n${shippingPath}\n\nThis may not be a valid Fortnite installation, or the file may be corrupted.`,
        { title: "Version Detection Failed" }
      );
      return null;
    }

    if (!patternHexCheck || !Array.isArray(patternHexCheck)) {
      await message(
        "Unable to read version information from the Fortnite executable.\n\nThe file may be corrupted or not a valid Fortnite installation.",
        { title: "Invalid Version Data" }
      );
      return null;
    }

    const { version, netcl } = parseVersionInfo(patternHexCheck);

    if (version === "NOT FOUND") {
      await message(
        `Could not detect the Fortnite version from:\n\n${shippingPath}\n\nThis may be a corrupted installation or an unsupported Fortnite version.`,
        { title: "Version Not Found" }
      );
      return null;
    }

    if (netcl === "NOT FOUND") {
      await message(
        `Found Fortnite version ${version}, but could not detect the network client version.\n\nThis installation may be incomplete or corrupted.`,
        { title: "Network Client Not Found" }
      );
      return null;
    }

    if (version !== "12.41") {
      await message(
        `This launcher only supports Fortnite 12.41 (build 12905909).\n\nDetected version: ${version}\n\nPlease select a Fortnite 12.41 installation to import.`,
        { title: "Unsupported Version" }
      );
      return null;
    }

    const isSupported = supportedVersions.includes(version);

    // Always use the known build number for 12.41
    const buildNumber = IMPORT_BUILD_NETCL;

    // Properly extract the FortniteGame directory from the shipping executable path
    // shippingPath = C:\...\FortniteGame\Binaries\Win64\FortniteClient-Win64-Shipping.exe
    // We need: C:\...\FortniteGame
    const normalizedShipping = shippingPath.replace(/\//g, "\\");
    const fortniteGameDir = normalizedShipping.substring(0, normalizedShipping.lastIndexOf("\\FortniteGame\\") + 12);

    let buildSize: number;
    let formattedSize: string;

    try {
      buildSize = await getBuildSize(fortniteGameDir);
      formattedSize = formatBytes(buildSize);
    } catch (error) {
      console.warn("Could not calculate build size:", error);
      formattedSize = "Unknown";
    }

    let chapterSeasonInfo;
    try {
      chapterSeasonInfo = getChapterAndSeason(version);
    } catch (error) {
      console.warn("Could not determine chapter/season:", error);
      chapterSeasonInfo = { chapter: "Unknown", season: "Unknown" };
    }

    const { chapter, season } = chapterSeasonInfo;

    // Season X is Chapter 1 Season 10 (version 10.x)
    const isSeasonX = chapter === 1 && season === 10;
    const seasonLabel = isSeasonX ? "X" : season.toString();
    const titleLabel = isSeasonX
      ? "Season X"
      : `Chapter ${chapter} Season ${season}`;

    const result: ImportResult = {
      path: fortniteGameDir,
      version: version,
      netcl: buildNumber,
      title: titleLabel,
      season: seasonLabel,
      size: formattedSize,
      isSupported,
      shipping: shippingPath,
    };

    // Download Mobile Builds paks during import
    if (Config.LAUNCH_OPTIONS.DOWNLOAD_PAKS && Config.LAUNCH_OPTIONS.MOBILE_BUILDS.length > 0) {
      try {
        const paksDir = `${fortniteGameDir}\\Content\\Paks`;
        await invoke("download_paks", {
          paksDir,
          pakLinks: Config.LAUNCH_OPTIONS.MOBILE_BUILDS,
        });
        console.log("Mobile Builds paks downloaded successfully to:", paksDir);
      } catch (pakError) {
        console.warn("Failed to download Mobile Builds paks during import:", pakError);
      }
    }

    console.log("Successfully imported build:", result);

    return result;
  } catch (error) {
    console.error("Import build error:", error);
    let errorMessage = "An unexpected error occurred during import.";

    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        errorMessage =
          "Permission denied. Please ensure you have read access to the selected folder and try again.";
      } else if (
        error.message.includes("not found") ||
        error.message.includes("ENOENT")
      ) {
        errorMessage =
          "The selected folder or required files could not be found. Please verify the Fortnite installation is complete.";
      } else if (error.message.includes("timeout")) {
        errorMessage =
          "The operation timed out. This may be due to a slow disk or large installation. Please try again.";
      } else {
        errorMessage = `Import failed: ${error.message}`;
      }
    }

    await message(
      `${errorMessage}\n\nPlease check the console for more details and try again.`,
      { title: "Import Error" }
    );

    return null;
  }
};

export const isVersionSupported = (version: string): boolean => {
  if (!version || typeof version !== "string") {
    return false;
  }
  return supportedVersions.includes(version.trim());
};