"use client";

import { Settings as SettingsIcon, SlidersHorizontal, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { InformationTab } from "../components/settings/InformationTab";
import { AppearanceTab } from "../components/settings/AppearanceTab";
import { OptionGroup } from "../components/settings/OptionGroup";
import { ToggleOption } from "../components/settings/ToggleOption";
import { useConfigStore } from "../../stores/settings";
import { Config } from "../../config";

type Tab = "general" | "launch" | "options";

export function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const location = useLocation();
  const config = useConfigStore();

  const tabs = [
    { id: "general" as Tab, label: "General",  icon: SlidersHorizontal },
    { id: "launch"  as Tab, label: "Launch",   icon: Rocket            },
    { id: "options" as Tab, label: "Options",  icon: SettingsIcon      },
  ];

  useEffect(() => {
    setActiveTab("general");
  }, [location.key]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="settings-page"
    >
      <header className="settings-header">
        <div>
          <h1>Settings</h1>
        </div>
        <div className="settings-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={active ? "active" : ""}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.section
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
          className="settings-panel"
        >
          {/* ── General: Appearance + Info ── */}
          {activeTab === "general" && (
            <div className="settings-stack">
              <InformationTab />
              <div className="settings-divider" />
              <AppearanceTab />
            </div>
          )}

          {/* ── Launch: game priority, admin, close behavior ── */}
          {activeTab === "launch" && (
            <div className="settings-stack">
              <OptionGroup
                title="High Priority Launch"
                description="Boost Fortnite's process priority and permissions for better performance."
              >
                <ToggleOption
                  label="High Priority (Task Manager)"
                  description="Sets Fortnite to HIGH priority in Task Manager when launched."
                  value={config.highPriorityLaunch}
                  onChange={config.setHighPriorityLaunch}
                />

                <ToggleOption
                  label="Launch with Admin Permissions"
                  description="Runs Fortnite with elevated administrator privileges (UAC prompt will appear)."
                  value={config.adminLaunch}
                  onChange={config.setAdminLaunch}
                />
              </OptionGroup>

              <div className="settings-divider" />

              <OptionGroup
                title="Launcher Exit Behavior"
                description="Control what happens to Fortnite when you close the launcher."
              >
                <ToggleOption
                  label="Minimize on Launch"
                  description="Minimizes the launcher to the background when Fortnite starts."
                  value={config.minimizeOnLaunch}
                  onChange={config.setMinimizeOnLaunch}
                />

                <ToggleOption
                  label="Keep Game Running on Close"
                  description="When ON, closing the launcher will NOT close Fortnite — the game keeps running. When OFF, closing the launcher also closes the game."
                  value={!config.closeGameOnLauncherExit}
                  onChange={(val) => config.setCloseGameOnLauncherExit(!val)}
                />
              </OptionGroup>
            </div>
          )}

          {/* ── Options: misc toggles ── */}
          {activeTab === "options" && (
            <div className="settings-stack">
              <OptionGroup
                title="Window"
                description="Window and display options."
              >
                <ToggleOption
                  label="Always on Top"
                  description="Keeps the launcher above all other windows."
                  value={config.alwaysOnTop}
                  onChange={config.setAlwaysOnTop}
                />
                <ToggleOption
                  label="Use Low Usage"
                  description="Optimizes the launcher for minimal CPU and memory usage. Reduces animations, background processes, and render frequency."
                  value={config.lowUsageMode}
                  onChange={config.setLowUsageMode}
                />
              </OptionGroup>

              {Config.LAUNCH_OPTIONS.EOR_ENABLED != null && (
                <>
                  <div className="settings-divider" />
                  <OptionGroup
                    title="Gameplay"
                    description="In-game options."
                  >
                    <ToggleOption
                      label="EOR (Edit on Release)"
                      description="Enables Edit on Release."
                      value={config.eorEnabled}
                      onChange={config.setEorEnabled}
                    />
                    <ToggleOption
                      label="ROR (Reset on Release)"
                      description="Enables Reset on Release."
                      value={config.rorEnabled}
                      onChange={config.setRorEnabled}
                    />
                    <ToggleOption
                      label="Mobile Builds"
                      description="Optimizes in-game performance and makes it better for low-end PCs."
                      value={config.mobileBuilds}
                      onChange={config.setMobileBuilds}
                    />
                  </OptionGroup>
                </>
              )}
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </motion.div>
  );
}