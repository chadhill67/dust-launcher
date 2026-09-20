import { invoke } from "@tauri-apps/api/core";
import { useLibraryStore } from "../../stores/library";
import { Build } from "../../types";

export const exit = async (path: string): Promise<boolean> => {
  await invoke("close_game", {});

  const BuildState = useLibraryStore.getState();
  const selectedBuild: Build | undefined = BuildState.entries.get(path);

  if (!selectedBuild) {
    console.error("build not found in BuildState:", path);
    return false;
  }

  selectedBuild.open = false;
  BuildState.patch(path, selectedBuild);

  return true;
};
