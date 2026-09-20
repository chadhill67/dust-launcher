"use client";
import { Minus, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState } from "react";
import { useConfigStore } from "../../stores/settings";
import { Config } from "../../config";
import { invoke } from "@tauri-apps/api/core";

export function Frame() {
  const [isHoveringClose, setIsHoveringClose] = useState(false);
  const [isHoveringMin, setIsHoveringMin] = useState(false);
  const frameHeight = useConfigStore((state) => state.frameHeight ?? 32);

  const appWindow = getCurrentWindow();

  const handleMinimize = async () => {
    await appWindow.minimize();
  };

  const handleClose = async () => {
    const { closeGameOnLauncherExit } = useConfigStore.getState();
    if (closeGameOnLauncherExit) {
      try {
        await invoke("close_game");
      } catch (err) {
        console.error("Failed to close game on exit:", err);
      }
    }
    await appWindow.close();
  };

  return (
    <div
      data-tauri-drag-region
      className="frame-shell fixed left-0 right-0 top-0 z-50 flex select-none items-center justify-between pl-2 pr-1 text-[13px] text-zinc-100"
      style={{ height: frameHeight }}
    >
      <div className="flex items-center gap-2 font-semibold">
        <img src={Config.IMAGES.APP_ICON} className="h-5 w-5 rounded-sm" />
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleMinimize}
          onMouseEnter={() => setIsHoveringMin(true)}
          onMouseLeave={() => setIsHoveringMin(false)}
          className="flex w-8 cursor-pointer items-center justify-center rounded-sm transition-colors duration-150 hover:bg-white/10"
          style={{ height: frameHeight - 2 }}
          aria-label="Minimize"
        >
          <Minus
            size={16}
            className={`transition-colors duration-150 ${
              isHoveringMin ? "text-white" : "text-zinc-500"
            }`}
            strokeWidth={2}
          />
        </button>

        <button
          onClick={handleClose}
          onMouseEnter={() => setIsHoveringClose(true)}
          onMouseLeave={() => setIsHoveringClose(false)}
          className="flex w-8 cursor-pointer items-center justify-center rounded-sm transition-colors duration-150 hover:bg-red-500/80"
          style={{ height: frameHeight - 2 }}
          aria-label="Close"
        >
          <X
            size={16}
            className={`transition-colors duration-150 ${
              isHoveringClose ? "text-white" : "text-zinc-500"
            }`}
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}
