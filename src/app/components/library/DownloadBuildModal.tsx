"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Loader2, Download, FolderOpen, X, CheckCircle2, AlertCircle } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { Config } from "../../../config";
import { useLibraryStore } from "../../../stores/library";
import { showToast } from "../toaster";

type DownloadBuildModalProps = {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
};

type BuildVersion = {
  version: string;
  url: string;
  format: "zip" | "rar";
  seasonName: string;
};

const AVAILABLE_BUILDS: BuildVersion[] = [
  { version: "10.40", url: "https://cdn.cbn.lol/10.40", format: "rar", seasonName: "Chapter 1 Season X" },
  { version: "9.10", url: "https://cdn.cbn.lol/9.10", format: "rar", seasonName: "Chapter 1 Season 9" },
];

export function DownloadBuildModal({ open, onClose, onComplete }: DownloadBuildModalProps) {
  const [selectedBuild, setSelectedBuild] = useState<BuildVersion | null>(null);
  const [step, setStep] = useState<"select" | "folder" | "downloading" | "extracting" | "complete">("select");
  const [downloadPath, setDownloadPath] = useState<string>("");
  const [extractPath, setExtractPath] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addBuild = useLibraryStore((s) => s.add);

  useEffect(() => {
    if (!open) return;
    let unsubDownload: () => void;
    let unsubExtract: () => void;
    
    (async () => {
      unsubDownload = await listen("build-download-progress", (event: any) => {
        const { percent } = event.payload;
        setProgress(percent);
      });
      unsubExtract = await listen("build-extract-progress", (event: any) => {
        const { percent } = event.payload;
        setProgress(percent);
      });
    })();

    return () => {
      if (unsubDownload) unsubDownload();
      if (unsubExtract) unsubExtract();
    };
  }, [open]);

  async function selectFolder() {
    const selected = await openDialog({ directory: true, multiple: false });
    if (selected) {
      setExtractPath(selected.toString());
    }
  }

  async function startDownload() {
    if (!selectedBuild) return;
    setStep("downloading");
    setError(null);
    setProgress(0);

    try {
      setStatus("Preparing download...");

      const fileName = `Fortnite_${selectedBuild.version}.${selectedBuild.format}`;
      const defaultPath = `C:\\Fortnite\\${fileName}`;
      setDownloadPath(defaultPath);

      setStatus("Downloading...");

      await invoke("download_build", {
        url: selectedBuild.url,
        destination: defaultPath,
      });

      setStep("extracting");
      setProgress(0);
      setStatus("Extracting build...");

      const extractDir = extractPath || `C:\\Fortnite\\${selectedBuild.version}`;
      setExtractPath(extractDir);

      await invoke("extract_build", {
        archive: defaultPath,
        destination: extractDir,
      });

      const splashPath = `${extractDir}\\FortniteGame\\Content\\Splash\\Splash.bmp`;
      const exePath = `${extractDir}\\FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe`;

      const splashExists = await invoke("check_file_exists", { path: splashPath });

      let versionInfo: { version: string; netcl: string } = { version: "NOT FOUND", netcl: "NOT FOUND" };
      try {
        const patternHexCheck = (await invoke("locate_version", { filePath: exePath })) as string[];
        const { parseVersionInfo } = await import("../../../util/game/import");
        versionInfo = parseVersionInfo(patternHexCheck);
      } catch {}

      const isSupported = versionInfo.version === Config.CURRENT_VERSION;
      const buildData = {
        path: extractDir,
        splash: splashExists ? `file://${splashPath}` : "no splash",
        season: versionInfo.version,
        version: versionInfo.netcl,
        enabled: isSupported,
        excluded: !isSupported,
        open: false,
      };

      addBuild(extractDir, buildData);

      setStep("complete");
      setStatus("Build ready to play!");
      showToast.success(`Fortnite ${versionInfo.version} downloaded and extracted!`);

      setTimeout(() => {
        onComplete?.();
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Download failed");
      setStep("select");
      showToast.error(`Failed: ${err.message}`);
    }
  }

  function close() {
    if (step === "downloading" || step === "extracting") return;
    setStep("select");
    setSelectedBuild(null);
    setProgress(0);
    setError(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", padding: 16, backdropFilter: "blur(24px)" }}
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 18 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 18 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 560, borderRadius: 16, border: "1px solid var(--border)", background: "var(--surface)", padding: 24 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-strong)" }}>Download Fortnite Build</h2>
              <button onClick={close} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} aria-label="Close"><X size={18} /></button>
            </div>

            {step === "select" && (
              <div>
                <p style={{ color: "var(--text-muted)", marginBottom: 16, fontSize: 13 }}>Select a Fortnite version to download and extract.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {AVAILABLE_BUILDS.map((build) => (
                    <button
                      key={build.version}
                      onClick={() => setSelectedBuild(build)}
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: 10,
                        border: `1px solid ${selectedBuild?.version === build.version ? "var(--accent)" : "var(--border)"}`,
                        background: selectedBuild?.version === build.version ? "rgba(99, 102, 241, 0.1)" : "var(--surface-soft)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Download size={20} style={{ color: "var(--accent)" }} />
                        <div>
                          <p style={{ fontWeight: 500, color: "var(--text-strong)" }}>Fortnite {build.seasonName} ({build.version})</p>
                          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{build.format.toUpperCase()} • ~25 GB</p>
                        </div>
                      </div>
                      {selectedBuild?.version === build.version && <CheckCircle2 size={20} style={{ color: "var(--accent)" }} />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep("folder")}
                  disabled={!selectedBuild}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: "var(--accent)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: selectedBuild ? "pointer" : "not-allowed",
                    opacity: selectedBuild ? 1 : 0.5,
                  }}
                >
                  <FolderOpen size={18} style={{ marginRight: 8 }} />
                  Choose Extract Location
                </button>
              </div>
            )}

            {step === "folder" && (
              <div>
                <p style={{ color: "var(--text-muted)", marginBottom: 16, fontSize: 13 }}>
                  Select where to extract the build. Default: <code style={{ color: "var(--accent)" }}>C:\\Fortnite\\{selectedBuild?.version}</code>
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input
                    type="text"
                    value={extractPath}
                    onChange={(e) => setExtractPath(e.target.value)}
                    placeholder="C:\\Fortnite\\10.40"
                    style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-soft)", color: "var(--text-strong)" }}
                  />
                  <button onClick={selectFolder} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-soft)", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <FolderOpen size={18} />
                    Browse
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => { setStep("select"); setSelectedBuild(null); }} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-soft)", cursor: "pointer" }}>Back</button>
                  <button onClick={startDownload} style={{ padding: "12px 16px", borderRadius: 10, border: "none", background: "var(--accent)", color: "#fff", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
                    <Download size={18} style={{ marginRight: 8 }} />
                    Start Download
                  </button>
                </div>
              </div>
            )}

            {(step === "downloading" || step === "extracting") && (
              <div style={{ textAlign: "center" }}>
                <div style={{ marginBottom: 16 }}>
                  <Loader2 size={48} className="animate-spin" style={{ color: "var(--accent)", margin: "0 auto" }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-strong)", marginBottom: 8 }}>{status}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, fontFamily: "monospace" }}>{downloadPath || extractPath}</p>
                <div style={{ height: 8, borderRadius: 4, background: "var(--surface-soft)", overflow: "hidden" }}>
                  <motion.div
                    style={{ height: "100%", background: "var(--accent)", borderRadius: 4 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>{progress.toFixed(1)}%</p>
              </div>
            )}

            {step === "complete" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ marginBottom: 16 }}>
                  <CheckCircle2 size={48} style={{ color: "#22c55e", margin: "0 auto" }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>Build Ready!</p>
                <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Fortnite {selectedBuild?.version} has been downloaded and extracted.</p>
              </div>
            )}

            {error && (
              <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.3)", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={18} style={{ color: "#fda4af" }} />
                <span style={{ color: "#fda4af", fontSize: 13 }}>{error}</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}