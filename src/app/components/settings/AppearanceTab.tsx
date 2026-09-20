
"use client";

import { Check, ChevronDown, ChevronUp, Palette } from "lucide-react";
import { useState } from "react";
import { themes } from "../../styles/themes";
import { OptionGroup } from "./OptionGroup";
import { ToggleOption } from "./ToggleOption";
import { DropdownOption } from "./DropdownOption";
import { useConfigStore } from "../../../stores/settings";
import { SidebarPosition } from "../../../types";

const themeData: Record<string, { accent: string; surface: string; label: string }> = {

  obsidian:  { accent: "#b8b8b2", surface: "#0b0c0c", label: "Obsidian" },


  noir:      { accent: "#deded8", surface: "#070707", label: "Noir" },

  
  ocean:     { accent: "#3d8fa8", surface: "#06141b", label: "Ocean" },

  
  sakura:    { accent: "#d98ba8", surface: "#190d14", label: "Sakura" },

  midnight:  { accent: "#58658f", surface: "#070a17", label: "Midnight" },

  aurora:    { accent: "#4eaa91", surface: "#061613", label: "Aurora" },

  crimson:   { accent: "#b83b42", surface: "#160708", label: "Crimson" },

  twilight:  { accent: "#9d7bb5", surface: "#100b15", label: "Twilight" },

  amethyst:  { accent: "#8d62a8", surface: "#100b15", label: "Amethyst" },

  galaxy:    { accent: "#b8bfd6", surface: "#050610", label: "Galaxy" },

  nebula:    { accent: "#a05b9f", surface: "#100813", label: "Nebula" },

  ember:     { accent: "#c86f32", surface: "#160b05", label: "Ember" },

  forest:    { accent: "#4f7942", surface: "#0b160c", label: "Forest" },

  rose:      { accent: "#c76f7c", surface: "#15090d", label: "Rose" },

  gold:      { accent: "#c69b3c", surface: "#130e05", label: "Gold" },

  steel:     { accent: "#87909a", surface: "#0a0c0e", label: "Steel" },

  copper:    { accent: "#a96845", surface: "#120a07", label: "Copper" },

  arctic:    { accent: "#8db9c9", surface: "#071218", label: "Arctic" },

  toxic:     { accent: "#8ea83e", surface: "#0a1005", label: "Toxic" },

  abyss:     { accent: "#27877e", surface: "#061110", label: "Abyss" },

  azure:     { accent: "#4d9bc4", surface: "#07131b", label: "Azure" },

  breeze:    { accent: "#4c9f96", surface: "#071412", label: "Breeze" },

  celestial: { accent: "#8f78ae", surface: "#100c17", label: "Celestial" },

  
  cobalt:    { accent: "#3e67a8", surface: "#080f1b", label: "Cobalt" },


  cosmic:    { accent: "#725b9e", surface: "#0b0815", label: "Cosmic" },

  
  cyber:     { accent: "#4e9b59", surface: "#061108", label: "Cyber" },


  dusk:      { accent: "#9b648f", surface: "#120a12", label: "Dusk" },


  eclipse:   { accent: "#c29a42", surface: "#100d06", label: "Eclipse" },


  electric:  { accent: "#3e9eb0", surface: "#061317", label: "Electric" },


  frost:     { accent: "#a5c9d4", surface: "#081216", label: "Frost" },

  ghost:     { accent: "#c7c9c5", surface: "#0b0c0c", label: "Ghost" },


  glacier:   { accent: "#62b6c4", surface: "#071317", label: "Glacier" },


  horizon:   { accent: "#c98349", surface: "#130b06", label: "Horizon" },


  inferno:   { accent: "#c34e43", surface: "#160807", label: "Inferno" },

  iris:      { accent: "#9a78ad", surface: "#100c15", label: "Iris" },


  jade:      { accent: "#3f9b73", surface: "#06120c", label: "Jade" },


  lavender:  { accent: "#b39ac7", surface: "#100c14", label: "Lavender" },

  lunar:     { accent: "#d7d7cf", surface: "#080909", label: "Lunar" },

  matrix:    { accent: "#4b9a58", surface: "#061108", label: "Matrix" },

  mercury:   { accent: "#989b9d", surface: "#0a0b0c", label: "Mercury" },

  monsoon:   { accent: "#397e9d", surface: "#071218", label: "Monsoon" },

  mystic:    { accent: "#81569e", surface: "#0d0913", label: "Mystic" },

  neon:      { accent: "#bd75b6", surface: "#120a12", label: "Neon" },

  onyx:      { accent: "#666a6c", surface: "#020202", label: "Onyx" },

  pearl:     { accent: "#d6d5ce", surface: "#0d0d0c", label: "Pearl" },

  plasma:    { accent: "#a35d9e", surface: "#100813", label: "Plasma" },

  prism:     { accent: "#6196a5", surface: "#081216", label: "Prism" },

  royal:     { accent: "#705c9b", surface: "#0b0912", label: "Royal" },

  ruby:      { accent: "#b83e59", surface: "#13070b", label: "Ruby" },

  sapphire:  { accent: "#416ba8", surface: "#080f18", label: "Sapphire" },

  shadow:    { accent: "#55595c", surface: "#060606", label: "Shadow" },

  solar:     { accent: "#c5a33e", surface: "#110d05", label: "Solar" },

  spectral:  { accent: "#779b48", surface: "#081006", label: "Spectral" },

  storm:     { accent: "#66727c", surface: "#070b0d", label: "Storm" },

  sunset:    { accent: "#c66f4a", surface: "#130906", label: "Sunset" },

  titanium:  { accent: "#92989b", surface: "#080a0b", label: "Titanium" },

  violet:    { accent: "#765e9d", surface: "#0b0912", label: "Violet" },

  volcanic:  { accent: "#bd623d", surface: "#120907", label: "Volcanic" },

  winter:    { accent: "#aab9c7", surface: "#070e13", label: "Winter" },

  zenith:    { accent: "#c6a846", surface: "#0f0c05", label: "Zenith" },

  jungle:    { accent: "#3f8f4f", surface: "#07130a", label: "Jungle" },

  
  spring:    { accent: "#7fbf68", surface: "#0e160b", label: "Spring" },


  summer:    { accent: "#d5a946", surface: "#121008", label: "Summer" },
};

const themeNames = Object.keys(themes);

const sidebarPositionOptions: { value: SidebarPosition; label: string }[] = [
  { value: "left",   label: "Left"   },
  { value: "right",  label: "Right"  },
  { value: "top",    label: "Top"    },
  { value: "bottom", label: "Bottom" },
];

const defaultSizes: Record<SidebarPosition, number> = {
  left:   144,
  right:  144,
  top:    44,
  bottom: 44,
};

export function AppearanceTab() {
  const config = useConfigStore();
  const [applyingTheme, setApplyingTheme] = useState<string | null>(null);
  const [showThemes, setShowThemes] = useState(false);

  function applyTheme(theme: string) {
    config.setTheme(theme);
    setApplyingTheme(themeData[theme]?.label ?? theme);
    window.setTimeout(() => setApplyingTheme(null), 1200);
  }

  function handlePositionChange(pos: SidebarPosition) {
    config.setSidebarPosition(pos);
    config.setSidebarSize(defaultSizes[pos]);
  }

  const isHorizontal = config.sidebarPosition === "top" || config.sidebarPosition === "bottom";
  const sizeLabel = isHorizontal ? "Bar height" : "Sidebar width";
  const sizeMin  = isHorizontal ? 32  : 48;
  const sizeMax  = isHorizontal ? 80  : 280;
  const sizeStep = isHorizontal ? 4   : 4;

  const currentThemeInfo = themeData[config.theme] || {
    label: config.theme,
    accent: "#888",
  };

  return (
    <div className="rounded-xl">
      <OptionGroup title="Theme" description="Choose your preferred color scheme">
        {applyingTheme && (
          <div className="theme-apply-overlay">
            <div>Applying {applyingTheme} theme</div>
          </div>
        )}

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: currentThemeInfo.accent }}
            />

            <span className="text-sm font-medium text-zinc-200">
              Active:{" "}
              <span className="text-white font-semibold">
                {currentThemeInfo.label}
              </span>
            </span>
          </div>

          <button
            onClick={() => setShowThemes((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <Palette size={13} />
            <span>{showThemes ? "Hide Themes" : "Show Themes"}</span>
            {showThemes ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {showThemes && (
          <div className="theme-swatch-grid mt-3 pt-3 border-t border-white/10">
            {themeNames.map((theme) => {
              const data = themeData[theme];
              const active = config.theme === theme;

              return (
                <button
                  key={theme}
                  className={`theme-card ${active ? "active" : ""}`}
                  onClick={() => applyTheme(theme)}
                  aria-label={data?.label ?? theme}
                  title={data?.label ?? theme}
                >
                  <span
                    className="theme-card-swatch"
                    style={{
                      background: `linear-gradient(135deg, ${
                        data?.surface ?? "#111"
                      }, ${data?.accent ?? "#888"})`,
                    }}
                  >
                    {active && (
                      <span className="theme-card-check">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </span>

                  <span
                    className="theme-card-dot"
                    style={{ background: data?.accent ?? "#888" }}
                  />

                  <span className="theme-card-label">
                    {data?.label ?? theme}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </OptionGroup>

      <div className="settings-divider" style={{ margin: "10px 0" }} />

      <OptionGroup
        title="Background"
        description="Control the animated background particles"
      >
        <ToggleOption
          label="Snow Particles"
          description={
            config.snowParticles
              ? "On — may slightly affect launcher performance, which could free fewer resources for the game. Snow is optimized so impact is minimal — try both and see what works best for you."
              : "Off — best performance. Disabling particles frees up resources. Recommended if you notice any FPS drops in game."
          }
          value={config.snowParticles ?? true}
          onChange={config.setSnowParticles}
        />
      </OptionGroup>

      <div className="settings-divider" style={{ margin: "10px 0" }} />

      <OptionGroup
        title="Sidebar"
        description="Customize sidebar position, size, and style"
      >
        <ToggleOption
          label="Minimize Sidebar"
          description="Icon-only navigation for a tighter layout."
          value={config.minimizeSidebar}
          onChange={config.setMinimizeSidebar}
        />

        <DropdownOption
          label="Position"
          description="Where the sidebar appears — size resets to best default for each position"
          options={sidebarPositionOptions}
          value={config.sidebarPosition}
          onChange={handlePositionChange}
        />

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-100">{sizeLabel}</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {config.sidebarSize}px
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min={sizeMin}
              max={sizeMax}
              step={sizeStep}
              value={config.sidebarSize}
              onChange={(e) =>
                config.setSidebarSize(Number(e.target.value))
              }
              className="w-36 h-2 appearance-none rounded-full bg-zinc-800 accent-zinc-400"
              aria-label={sizeLabel}
            />

            <span className="text-xs text-zinc-500 w-10 text-right tabular-nums">
              {config.sidebarSize}px
            </span>
          </div>
        </div>
      </OptionGroup>

      <div className="settings-divider" style={{ margin: "10px 0" }} />

      <OptionGroup
        title="Title Bar"
        description="Customize the top bar height"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-100">Bar Height</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {config.frameHeight ?? 32}px — range 24–56px
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="24"
              max="56"
              step="2"
              value={config.frameHeight ?? 32}
              onChange={(e) =>
                config.setFrameHeight(Number(e.target.value))
              }
              className="w-36 h-2 appearance-none rounded-full bg-zinc-800 accent-zinc-400"
              aria-label="Title bar height"
            />

            <span className="text-xs text-zinc-500 w-10 text-right tabular-nums">
              {config.frameHeight ?? 32}px
            </span>
          </div>
        </div>
      </OptionGroup>
    </div>
  );
}
