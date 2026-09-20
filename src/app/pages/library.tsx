"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, HardDrive, ArrowLeft, Play, Square, Folder, ShieldPlus, Trash2, AlertTriangle, Loader2, Download } from "lucide-react";
import { useLibraryStore } from "../../stores/library";
import { useAuth } from "../../hooks/useAuth";
import { ImportModal } from "../components/import/Modal";
import { Config } from "../../config";
import { invoke } from "@tauri-apps/api/core";
import { openPath } from "@tauri-apps/plugin-opener";
import { showToast } from "../components/toaster";
import { exit } from "../../util/game/close";
import { start } from "../../util/game/launch";
import { listen } from "@tauri-apps/api/event";
import { LIBRARY_KEY } from "../../stores/library";
import { Build } from "../../types";

function BuildCard({ build, onClick, isSupported }: { build: Build; onClick: () => void; isSupported: boolean }) {
  return (
    <motion.div
      className="Flopper-build-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
    >
      <div className="Flopper-build-hero">
        <img
          src={build.splash || Config.IMAGES.SEASON_X_BG}
          alt={build.title || "Build"}
          className="Flopper-build-img"
          onError={(e) => { e.currentTarget.src = Config.IMAGES.SEASON_X_BG; }}
        />
        {!isSupported && (
          <span className="Flopper-build-badge Flopper-build-badge--amber">Unsupported</span>
        )}
        {build.excluded && (
          <span className="Flopper-build-badge Flopper-build-badge--red">Excluded</span>
        )}
      </div>
      <div className="Flopper-build-footer">
        <h3 className="Flopper-build-name">Fortnite {build.season}</h3>
        <div className="Flopper-build-meta">
          <span className="Flopper-build-version">v{build.version}</span>
          <span className="Flopper-build-size"><HardDrive className="w-3 h-3" /> {(build as any).size || "—"}</span>
        </div>
      </div>
    </motion.div>
  );
}

function BuildDetail({ buildPath, build, onBack, onDeleted }: { buildPath: string; build: Build; onBack: () => void; onDeleted: () => void }) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteBuild = useLibraryStore((s: any) => s.delete);
  const BuildState = useLibraryStore.getState();
  const { isValidSession } = useAuth.user();
  const isSupported = build.version === Config.CURRENT_VERSION;

  const handleLaunch = async () => {
    if (build.open) {
      const result = await exit(buildPath);
      if (result) { build.open = false; localStorage.setItem(LIBRARY_KEY, JSON.stringify([...BuildState.entries])); }
      return;
    }
    const gsdkPath = `${buildPath}\\Engine\\Binaries\\ThirdParty\\NVIDIA\\NVaftermath\\Win64\\GSDK_Aftermath_lib.dll`;
    try { await invoke("delete_file", { path: gsdkPath }); } catch {}
    setIsLaunching(true);
    const u1 = await listen("download-progress", () => {});
    const u2 = await listen("verify-build", () => {});
    const u3 = await listen("build-validation-error", () => {});
    try {
      const result = await start(buildPath, isValidSession);
      if (result) { build.open = true; localStorage.setItem(LIBRARY_KEY, JSON.stringify([...BuildState.entries])); }
    } finally { setIsLaunching(false); u1(); u2(); u3(); }
  };

  const handleDefenderExclusion = async () => {
    try { await invoke("add_defender_exclusion", { path: buildPath }); showToast.success("Windows Defender exclusion requested."); }
    catch (e) { showToast.error(e instanceof Error ? e.message : "Failed."); }
  };

  const handleDeleteGSDK = async () => {
    const dllPath = `${buildPath}\\Engine\\Binaries\\ThirdParty\\NVIDIA\\NVaftermath\\Win64\\GSDK_Aftermath_lib.dll`;
    try { await invoke("delete_file", { path: dllPath }); showToast.success("GSDK_Aftermath_lib.dll deleted."); }
    catch { showToast.error("File not found or failed to delete."); }
  };

  const handleConfirmDelete = () => { deleteBuild(buildPath); setShowDeleteConfirm(false); onDeleted(); };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.35 }} className="Flopper-detail flex flex-col h-full">
      <div className="Flopper-detail-header">
        <button onClick={onBack} className="Flopper-back-btn" title="Back to Library">
          <ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Back to Library</span>
        </button>
        <div className="Flopper-detail-actions">
          <button onClick={() => openPath(buildPath)} className="Flopper-detail-action" title="Open folder"><Folder className="w-4 h-4" /></button>
          <button onClick={handleDefenderExclusion} className="Flopper-detail-action" title="Add Defender exclusion"><ShieldPlus className="w-4 h-4" /></button>
          <button onClick={handleDeleteGSDK} className="Flopper-detail-action" title="Delete GSDK DLL"><AlertTriangle className="w-4 h-4" /></button>
          <button onClick={() => setShowDeleteConfirm(true)} className="Flopper-detail-action Flopper-detail-action--danger" title="Remove from library"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="Flopper-detail-content">
        <div className="Flopper-detail-hero">
          <img src={build.splash || Config.IMAGES.SEASON_X_BG} alt={build.title || "Build"} className="Flopper-detail-img" onError={(e) => { e.currentTarget.src = Config.IMAGES.SEASON_X_BG; }} />
          <div className="Flopper-detail-gradient" />
          <div className="Flopper-detail-overlay">
            <div className="Flopper-detail-info">
              <p className="Flopper-detail-greeting">Welcome to</p>
              <h1 className="Flopper-detail-title">Fortnite {build.season}</h1>
              {build.title && build.title !== `Fortnite ${build.season}` && <h2 className="Flopper-detail-subtitle">{build.title}</h2>}
              <p className="Flopper-detail-desc">
                {isSupported ? `Chapter 2 Season 2 — jump back into the island with Fortnite 12.41 (build 12905909).` : `This build (v${build.version}) is in your library but cannot be launched — only Fortnite 12.41 (${Config.CURRENT_VERSION}) is currently supported.`}
              </p>
              <button
                onClick={isSupported ? handleLaunch : undefined}
                disabled={!isSupported || isLaunching}
                className={`Flopper-launch-btn ${build.open ? "Flopper-launch-btn--running" : ""} ${isLaunching ? "Flopper-launch-btn--loading" : ""} ${!isSupported ? "Flopper-launch-btn--disabled" : ""}`}
              >
                {isLaunching ? <Loader2 className="w-4 h-4 animate-spin" /> : build.open ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isLaunching ? "Launching..." : build.open ? "Close Game" : "Launch Game"}
              </button>
            </div>
            <div className="Flopper-detail-badges">
              <span className="Flopper-detail-badge">v{build.version}</span>
              <span className={`Flopper-detail-badge ${isSupported ? "Flopper-detail-badge--green" : "Flopper-detail-badge--amber"}`}>
                {isSupported ? "Supported" : "Unsupported"}
              </span>
            </div>
          </div>
        </div>

        <div className="Flopper-detail-stats">
          <div className="Flopper-detail-stat"><p className="Flopper-detail-stat-label">Version</p><p className="Flopper-detail-stat-value">v{build.version}</p></div>
          <div className="Flopper-detail-stat"><p className="Flopper-detail-stat-label">Size</p><p className="Flopper-detail-stat-value">{(build as any).size || "Unknown"}</p></div>
          <div className="Flopper-detail-stat"><p className="Flopper-detail-stat-label">Status</p><p className={`Flopper-detail-stat-value ${isSupported ? "text-green-400" : "text-yellow-400"}`}>{isSupported ? "playable" : "View Only"}</p></div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-4" onClick={() => setShowDeleteConfirm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }} transition={{ type: "spring", stiffness: 320, damping: 30 }} onClick={(e) => e.stopPropagation()} className="Flopper-modal max-w-sm w-full">
              <div className="Flopper-modal-header"><div className="Flopper-modal-icon Flopper-modal-icon--red"><Trash2 size={18} /></div><h2 className="Flopper-modal-title">Remove Build?</h2></div>
              <p className="Flopper-modal-text">This removes <strong>Fortnite {build.season}</strong> from your library. Files on disk are not deleted.</p>
              <div className="Flopper-modal-actions"><button onClick={() => setShowDeleteConfirm(false)} className="Flopper-modal-btn Flopper-modal-btn--secondary">Cancel</button><button onClick={handleConfirmDelete} className="Flopper-modal-btn Flopper-modal-btn--danger">Remove</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Library() {
  const entries = useLibraryStore((state) => state.entries);
  const builds = Array.from(entries.entries());
  const wipeFn = useLibraryStore((state) => state.wipe);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [showConfirmWipe, setShowConfirmWipe] = useState(false);

  const user = useAuth.user();
  if (!user.isValidSession()) return null;

  const currentVersion = Config.CURRENT_VERSION;
  const selectedBuild = selectedPath ? entries.get(selectedPath) : null;

  if (selectedPath && selectedBuild) {
    return (
      <div className="Flopper-detail-page h-full overflow-hidden">
        <BuildDetail buildPath={selectedPath} build={selectedBuild} onBack={() => setSelectedPath(null)} onDeleted={() => setSelectedPath(null)} />
      </div>
    );
  }

  return (
    <div className="Flopper-library h-full overflow-hidden flex flex-col">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="Flopper-library-header">
        <div className="Flopper-library-header-left">
          <h1 className="Flopper-library-title">Library</h1>
          <div className="Flopper-library-meta">
            <span className="Flopper-library-count">{builds.length} build{builds.length !== 1 ? "s" : ""}</span>
            <p className="Flopper-library-subtitle">Manage your installed builds and quickly launch with one click.</p>
          </div>
        </div>
        <div className="Flopper-library-actions">
          <motion.button onClick={() => setImportOpen(true)} className="Flopper-import-btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Download className="w-4 h-4" /><span>Add Build</span>
          </motion.button>
        </div>
      </motion.header>

      <div className="Flopper-library-body min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {builds.length === 0 ? (
            <motion.div key="empty" className="Flopper-empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="Flopper-empty-icon"><HardDrive className="w-7 h-7" /></div>
              <h3 className="Flopper-empty-title">No builds found</h3>
              <p className="Flopper-empty-text">Import a Fortnite 12.41 installation to get started and launch the game.</p>
              <motion.button onClick={() => setImportOpen(true)} className="Flopper-empty-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Plus className="w-4 h-4" /><span>Import your first build</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="Flopper-grid">
              <AnimatePresence>
                {builds.map(([path, build]) => <BuildCard key={path} build={build} isSupported={build.version === currentVersion} onClick={() => setSelectedPath(path)} />)}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.footer initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.1 }} className="Flopper-library-footer">
        <span className="Flopper-library-footer-text">Showing {builds.length} build{builds.length !== 1 ? "s" : ""}</span>
        <button onClick={() => setShowConfirmWipe(true)} className="Flopper-clear-btn">Clear library</button>
      </motion.footer>
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}

    <AnimatePresence>
      {showConfirmWipe && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xl" onClick={() => setShowConfirmWipe(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 18 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 18 }} transition={{ type: "spring", stiffness: 320, damping: 30 }} onClick={(e) => e.stopPropagation()} className="Flopper-modal max-w-md">
            <div className="Flopper-modal-header"><div className="Flopper-modal-icon Flopper-modal-icon--red"><Trash2 size={20} /></div><h2 className="Flopper-modal-title">Clear Library?</h2></div>
            <p className="Flopper-modal-text">This removes all {entries.size} imported {entries.size === 1 ? "build" : "builds"} from the launcher. Files on disk are not deleted.</p>
            <div className="Flopper-modal-actions"><button onClick={() => setShowConfirmWipe(false)} className="Flopper-modal-btn Flopper-modal-btn--secondary">Cancel</button><button onClick={() => { wipeFn(); setShowConfirmWipe(false); }} className="Flopper-modal-btn Flopper-modal-btn--danger">Clear Library</button></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
}