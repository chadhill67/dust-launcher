"use client";
import {
  CheckCircle2,
  Folder,
  Loader2,
  Lock,
  MoreVertical,
  Pause,
  Play,
  ShieldAlert,
  ShieldPlus,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { openPath } from "@tauri-apps/plugin-opener";
import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { Config } from "../../../config";
import { LIBRARY_KEY, useLibraryStore } from "../../../stores/library";
import { exit } from "../../../util/game/close";
import { start } from "../../../util/game/launch";
import { useAuth } from "../../../hooks/useAuth";
import { Build } from "../../../types";
import { showToast } from "../toaster";

type BuildCardProps = {
  path: string;
  build: Build;
  options: string | null;
  setOptions: (path: string | null) => void;
  handleDeleteBuild: (path: string) => void;
  isPublicBuild: boolean;
};

type LaunchStage =
  | "downloading"
  | "injecting"
  | "launching"
  | "verifying"
  | "done"
  | null;

type LaunchState = {
  file: string;
  progress: number;
  stage: LaunchStage;
  active: boolean;
};

type ValidationError = {
  message: string;
  errors: string[];
};

export function BuildCard({
  path,
  build,
  options,
  setOptions,
  handleDeleteBuild,
  isPublicBuild,
}: BuildCardProps) {
  const [launchState, setLaunchState] = useState<LaunchState>({
    file: "",
    progress: 0,
    stage: null,
    active: false,
  });
  const [validationError, setValidationError] = useState<ValidationError | null>(
    null,
  );
  const [verifyingFiles, setVerifyingFiles] = useState<string[]>([]);
  const { isValidSession } = useAuth.user();

  const BuildState = useLibraryStore.getState();
  const seasonImageUrl = Config.IMAGES.SEASON_X_BG;
  const imageUrl =
    build.splash && build.splash !== "no splash" ? build.splash : seasonImageUrl;
  const canLaunch = isPublicBuild && build.enabled !== false && !build.excluded;

  useEffect(() => {
    if (!build.open) return;

    const timer = window.setInterval(async () => {
      const running = await invoke("is_fn_running");
      if (!running) {
        build.open = false;
        localStorage.setItem(LIBRARY_KEY, JSON.stringify([...BuildState.entries]));
      }
    }, 3000);

    return () => window.clearInterval(timer);
  }, [BuildState.entries, build]);

  async function handleOpen() {
    await openPath(build.path);
  }

  async function addDefenderExclusion() {
    setOptions(null);

    try {
      await invoke("add_defender_exclusion", { path: build.path });
      showToast.success("Windows Defender exclusion requested.");
    } catch (error) {
      showToast.error(
        error instanceof Error
          ? error.message
          : "Failed to request Defender exclusion.",
      );
    }
  }

  async function deleteGSDKDLL() {
    setOptions(null);

    const dllPath = `${build.path}\\Engine\\Binaries\\ThirdParty\\NVIDIA\\NVaftermath\\Win64\\GSDK_Aftermath_lib.dll`;

    try {
      await invoke("delete_file", { path: dllPath });
      showToast.success("GSDK_Aftermath_lib.dll deleted successfully.");
    } catch (error) {
      showToast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete GSDK_Aftermath_lib.dll. File may not exist.",
      );
    }
  }

  async function launch() {
    if (!canLaunch) return;

    if (build.open) {
      const result = await exit(path);
      if (result) {
        build.open = false;
        localStorage.setItem(LIBRARY_KEY, JSON.stringify([...BuildState.entries]));
      }
      return;
    }

    // Delete GSDK_Aftermath_lib.dll before launch
    const dllPath = `${build.path}\\Engine\\Binaries\\ThirdParty\\NVIDIA\\NVaftermath\\Win64\\GSDK_Aftermath_lib.dll`;
    try {
      await invoke("delete_file", { path: dllPath });
      console.log("Deleted GSDK_Aftermath_lib.dll before launch");
    } catch (e) {
      console.log("GSDK DLL not found or failed to delete before launch:", e);
    }

    setLaunchState({ file: "", progress: 0, stage: "verifying", active: true });
    setValidationError(null);
    setVerifyingFiles([]);

    const unlistenDownload = await listen("download-progress", (event: any) => {
      const payload = event.payload;
      setLaunchState({
        file: payload.file || "",
        progress: payload.progress ?? 0,
        stage: payload.stage ?? "downloading",
        active: true,
      });
    });

    const unlistenVerify = await listen("verify-build", (event: any) => {
      const payload = event.payload;
      const label =
        payload.status === "deleted"
          ? `Removed: ${payload.file}`
          : `Failed to remove: ${payload.file}`;
      setVerifyingFiles((previous) => [...previous, label]);
    });

    const unlistenValidation = await listen(
      "build-validation-error",
      (event: any) => {
        const payload = event.payload;
        setValidationError({
          message: payload.message,
          errors: payload.errors,
        });
        setLaunchState({ file: "", progress: 0, stage: null, active: true });
      },
    );

    try {
      setLaunchState({ file: "", progress: 100, stage: "launching", active: true });
      const result = await start(path, isValidSession);

      if (result) {
        build.open = true;
        localStorage.setItem(LIBRARY_KEY, JSON.stringify([...BuildState.entries]));
      }
    } finally {
      if (!validationError) {
        setLaunchState({ file: "", progress: 0, stage: null, active: false });
        setVerifyingFiles([]);
      }
      unlistenDownload();
      unlistenVerify();
      unlistenValidation();
    }
  }

  const statusText =
    launchState.stage === "injecting"
      ? "Injecting"
      : launchState.stage === "launching"
        ? "Requesting admin"
        : launchState.stage === "done"
          ? "Finished"
          : "Preparing";

  const descriptionText = validationError
    ? validationError.message
    : launchState.stage === "verifying"
      ? "Checking build integrity"
      : launchState.stage === "launching"
        ? `Windows may ask to allow Fortnite ${build.season}`
        : launchState.file || "Getting ready";

  return (
    <>
      <AnimatePresence>
        {launchState.active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.75)",
              padding: 16,
              backdropFilter: "blur(24px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 18 }}
              className="launcher-modal max-w-md"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {validationError ? (
                    <ShieldAlert
                      style={{
                        width: 24,
                        height: 24,
                        color: "#fda4af",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Loader2
                      style={{
                        width: 24,
                        height: 24,
                        color: "var(--accent)",
                        flexShrink: 0,
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  )}
                  <div>
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "var(--text-strong)",
                      }}
                    >
                      {statusText}
                    </h3>
                    <p
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        color: "var(--text-muted)",
                      }}
                    >
                      {descriptionText}
                    </p>
                  </div>
                </div>

                {launchState.stage !== "launching" && (
                  <button
                    onClick={() => {
                      setLaunchState((current) => ({ ...current, active: false }));
                      setValidationError(null);
                      setVerifyingFiles([]);
                    }}
                    className="icon-button"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {validationError ? (
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div
                    style={{
                      maxHeight: 224,
                      overflowY: "auto",
                      borderRadius: 8,
                      border: "1px solid rgba(248, 113, 113, 0.2)",
                      background: "rgba(248, 113, 113, 0.1)",
                      padding: 16,
                    }}
                  >
                    {validationError.errors.map((error) => (
                      <p
                        key={error}
                        style={{
                          fontSize: 12,
                          lineHeight: 20,
                          color: "#fecdd3",
                        }}
                      >
                        {error}
                      </p>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setLaunchState((current) => ({ ...current, active: false }))
                    }
                    className="danger-button"
                    style={{ width: "100%" }}
                  >
                    Close
                  </button>
                </div>
              ) : launchState.stage === "verifying" ? (
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  {verifyingFiles.length > 0 && (
                    <div
                      style={{
                        maxHeight: 160,
                        overflowY: "auto",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "var(--surface-raised)",
                        padding: 16,
                      }}
                    >
                      {verifyingFiles.map((file) => (
                        <p
                          key={file}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 12,
                            lineHeight: 20,
                            color: "var(--text-muted)",
                          }}
                        >
                          <CheckCircle2
                            style={{
                              width: 12,
                              height: 12,
                              color: "#86efac",
                              flexShrink: 0,
                            }}
                          />
                          {file}
                        </p>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    Verifying pak files before launch
                  </p>
                </div>
              ) : launchState.stage !== "launching" ? (
                <div style={{ marginTop: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginBottom: 8,
                    }}
                  >
                    <span>{launchState.file || "Current file"}</span>
                    <span>{launchState.progress.toFixed(1)}%</span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: "var(--surface-raised)",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      style={{
                        height: "100%",
                        background: "var(--accent)",
                        borderRadius: 4,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${launchState.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.article
        layout
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.2s ease",
        }}
        whileHover={{ boxShadow: "0 12px 40px rgba(0,0,0,0.4)", y: -4 }}
        className="build-card group"
      >
        <div
          style={{
            position: "relative",
            aspectRatio: "16/10",
            overflow: "hidden",
            background: "var(--surface)",
          }}
        >
          <img
            src={imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
            }}
            draggable={false}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
            }}
          />

          {/* Status badge */}
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8 }}>
            {build.excluded && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: "rgba(248, 113, 113, 0.2)",
                  color: "#fda4af",
                  border: "1px solid rgba(248, 113, 113, 0.3)",
                }}
              >
                Excluded
              </span>
            )}
            {!isPublicBuild && !build.excluded && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: "rgba(250, 204, 21, 0.2)",
                  color: "#fde047",
                  border: "1px solid rgba(250, 204, 21, 0.3)",
                }}
              >
                Unsupported
              </span>
            )}
            {build.open && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: "rgba(34, 197, 94, 0.2)",
                  color: "#86efac",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                }}
              >
                Running
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 8 }}>
            <button
              onClick={launch}
              disabled={!canLaunch || build.loading}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canLaunch ? "pointer" : "not-allowed",
                opacity: canLaunch ? 1 : 0.5,
                transition: "all 0.2s ease",
              }}
              aria-label={build.open ? "Close build" : "Launch build"}
              onMouseEnter={(e) => {
                if (canLaunch) {
                  e.currentTarget.style.background = "rgba(0,0,0,0.7)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.5)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              {!canLaunch ? (
                <Lock size={18} style={{ color: "rgba(255,255,255,0.7)" }} />
              ) : build.loading ? (
                <Loader2 className="animate-spin" size={18} style={{ color: "var(--accent)" }} />
              ) : build.open ? (
                <Pause size={18} style={{ color: "#fff" }} />
              ) : (
                <Play size={18} style={{ color: "#fff" }} />
              )}
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setOptions(options === path ? null : path)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                aria-label="Build options"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.7)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.5)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                <MoreVertical size={18} style={{ color: "rgba(255,255,255,0.8)" }} />
              </button>

              <AnimatePresence>
                {options === path && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    style={{
                      position: "absolute",
                      bottom: 52,
                      right: 0,
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      background: "var(--surface-soft)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      padding: 8,
                      zIndex: 10,
                      minWidth: 160,
                    }}
                  >
                    <button
                      onClick={handleOpen}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        color: "var(--text-strong)",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Folder size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                      Open Folder
                    </button>
                    <button
                      onClick={addDefenderExclusion}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        color: "var(--text-strong)",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <ShieldPlus size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                      Exclude from Defender
                    </button>
                    <button
                      onClick={deleteGSDKDLL}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        color: "#fda4af",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <AlertTriangle size={16} style={{ color: "#fda4af", flexShrink: 0 }} />
                      Delete GSDK_Aftermath_lib.dll
                    </button>
                    <button
                      onClick={() => handleDeleteBuild(path)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        color: "#fda4af",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Trash2 size={16} style={{ color: "#fda4af", flexShrink: 0 }} />
                      Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text-strong)",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Fortnite {build.season}
            </h3>
          </div>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {build.netcl ?? (build.version.includes("CL") ? build.version : "Imported build")}
          </p>
        </div>
      </motion.article>
    </>
  );
}