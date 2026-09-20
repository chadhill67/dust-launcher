import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderOpen, CheckCircle, XCircle, AlertTriangle, HardDrive } from "lucide-react";
import { importBuild, type ImportResult } from "../../../util/game/build";
import { useLibraryStore } from "../../../stores/library";

const supportedVersions = ["12.41"];

const splashMap: Record<string, string> = {
  "10.40": "https://dl.netcable.dev/10.40/Splash%20(1).bmp",
  "10.30": "https://dl.netcable.dev/10.30/Splash.bmp",
  "10.20": "https://dl.netcable.dev/10.20/Splash.bmp",
  "10.10": "https://dl.netcable.dev/10.10/Splash.bmp",
  "9.41": "https://dl.netcable.dev/9.41/Splash.bmp",
  "9.40": "https://dl.netcable.dev/9.40/Splash.bmp",
  "9.30": "https://dl.netcable.dev/9.30/Splash.bmp",
  "9.20": "https://dl.netcable.dev/9.20/Splash.bmp",
  "9.10": "https://dl.netcable.dev/9.10/Splash.bmp",
  "8.51": "https://dl.netcable.dev/8.51/Splash.bmp",
  "8.50": "https://dl.netcable.dev/8.50/Splash.bmp",
  "8.40": "https://dl.netcable.dev/8.40/Splash.bmp",
  "8.30": "https://dl.netcable.dev/8.30/Splash.bmp",
  "8.20": "https://dl.netcable.dev/8.20/Splash.bmp",
  "8.10": "https://dl.netcable.dev/8.10/Splash.bmp",
  "8.00": "https://dl.netcable.dev/8.00/Splash.bmp",
  "7.40": "https://dl.netcable.dev/7.40/Splash.bmp",
  "7.30": "https://dl.netcable.dev/7.30/Splash.bmp",
  "7.20": "https://dl.netcable.dev/7.20/Splash.bmp",
  "7.10": "https://dl.netcable.dev/7.10/Splash.bmp",
  "7.00": "https://dl.netcable.dev/7.00/Splash.bmp",
  "6.31": "https://dl.netcable.dev/6.31/Splash.bmp",
  "6.30": "https://dl.netcable.dev/6.31/Splash.bmp",
  "6.20": "https://dl.netcable.dev/6.20/Splash.bmp",
  "6.10": "https://dl.netcable.dev/6.10/Splash.bmp",
  "6.00": "https://dl.netcable.dev/6.00/Splash.bmp",
  "5.41": "https://dl.netcable.dev/5.41/Splash.bmp",
  "5.40": "https://dl.netcable.dev/5.40/Splash.bmp",
  "5.30": "https://dl.netcable.dev/5.30/Splash.bmp",
  "5.20": "https://dl.netcable.dev/5.20/Splash.bmp",
  "5.10": "https://dl.netcable.dev/5.10/Splash.bmp",
  "5.00": "https://dl.netcable.dev/5.00/Splash.bmp",
  "4.5": "https://dl.netcable.dev/4.5/Splash.bmp",
  "4.4": "https://dl.netcable.dev/4.4/Splash.bmp",
  "4.3": "https://dl.netcable.dev/4.3/Splash.bmp",
  "4.2": "https://dl.netcable.dev/4.2/Splash.bmp",
  "4.1": "https://dl.netcable.dev/4.1/Splash.bmp",
  "4.0": "https://dl.netcable.dev/4.0/Splash.bmp",
  "3.5": "https://dl.netcable.dev/3.5/Splash.bmp",
  "3.4": "https://dl.netcable.dev/3.4/Splash.bmp",
  "3.3": "https://dl.netcable.dev/3.3/Splash.bmp",
  "3.2": "https://dl.netcable.dev/3.2/Splash.bmp",
  "3.1": "https://dl.netcable.dev/3.1/Splash.bmp",
  "3.0": "https://dl.netcable.dev/3.0/Splash.bmp",
  "2.5": "https://dl.netcable.dev/2.5/Splash.bmp",
  "2.4": "https://dl.netcable.dev/2.4/Splash.bmp",
  "2.3": "https://dl.netcable.dev/2.3/Splash.bmp",
  "2.2": "https://dl.netcable.dev/2.2/Splash.bmp",
  "2.1": "https://dl.netcable.dev/2.1/Splash.bmp",
  "2.0": "https://dl.netcable.dev/2.0/Splash.bmp",
  "1.11": "https://dl.netcable.dev/1.11/Splash.bmp",
  "1.10": "https://dl.netcable.dev/1.10/Splash.bmp",
  "1.9": "https://dl.netcable.dev/1.9/Splash.bmp",
  "1.8": "https://dl.netcable.dev/1.8/Splash.bmp",
  "1.7": "https://dl.netcable.dev/1.7/Splash.bmp",
  "1.6": "https://dl.netcable.dev/1.6/Splash.bmp",
  "1.5": "https://dl.netcable.dev/1.5/Splash.bmp",
  "1.4": "https://dl.netcable.dev/1.4/Splash.bmp",
  "1.3": "https://dl.netcable.dev/1.3/Splash.bmp",
  "1.2": "https://dl.netcable.dev/1.2/Splash.bmp",
  "1.1": "https://dl.netcable.dev/1.1/Splash.bmp",
  "1.0": "https://dl.netcable.dev/1.0/Splash.bmp",
};

export function ImportModal({ onClose }: { onClose: () => void }) {
  const [buildInfo, setBuildInfo] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addBuild = useLibraryStore((s: any) => s.addBuild);

  const isVersionSupported = buildInfo && supportedVersions.includes(buildInfo.version);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const importResult = await importBuild();
      if (importResult) {
        setBuildInfo(importResult);
      }
    } catch (err) {
      console.error("Failed to import build:", err);
      setError("Failed to import build. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!buildInfo || !isVersionSupported) return;

    setImporting(true);
    setError(null);
    try {
      const newBuild = {
        path: buildInfo.path,
        version: buildInfo.version,
        netcl: buildInfo.netcl,
        season: buildInfo.season,
        title: buildInfo.title,
        size: buildInfo.size,
        shipping: buildInfo.shipping,
        splash: splashMap[buildInfo.version] || undefined,
        open: false,
        enabled: true,
        excluded: false,
        loading: false,
      };

      addBuild(newBuild);
      await new Promise((resolve) => setTimeout(resolve, 800));
      onClose();
    } catch (err) {
      console.error("Failed to add build:", err);
      setError("Failed to add build to library.");
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !importing && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, importing, loading]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#0d0d0d] p-0 rounded-2xl w-full max-w-2xl shadow-2xl border border-white/10 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-black/20 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <HardDrive className="w-5 h-5 text-white" />
              </motion.div>
              <h2 className="text-xl font-semibold text-white">Add Fortnite Installation</h2>
            </div>

            <motion.button
              onClick={onClose}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors duration-200 cursor-pointer"
              disabled={importing || loading}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-5 relative z-10">
            {/* Description */}
            <div className="space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed">
                Select the folder containing the{" "}
                <code className="px-2 py-1 bg-white/5 rounded text-gray-200 font-mono text-xs border border-white/10">
                  FortniteGame
                </code>{" "}
                and{" "}
                <code className="px-2 py-1 bg-white/5 rounded text-gray-200 font-mono text-xs border border-white/10">
                  Engine
                </code>{" "}
                directories.
              </p>
              <p className="text-gray-400 text-sm">
                Once imported, the build will be automatically added to your library.
              </p>
            </div>

            {/* Selected Path / Build Info */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {buildInfo ? "Build Information" : "Selected Path"}
              </label>

              <div
                className={`bg-black/40 backdrop-blur-sm px-4 py-3 rounded-lg text-sm transition-all duration-200 border ${
                  buildInfo
                    ? isVersionSupported
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-red-500/30 bg-red-500/5"
                    : "border-white/10"
                }`}
              >
                {buildInfo ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {isVersionSupported ? (
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <span className={`font-medium ${isVersionSupported ? "text-green-300" : "text-red-300"}`}>
                        {buildInfo.title}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-gray-300 ml-6">
                      <div>Version: <span className="text-gray-100">{buildInfo.version}</span></div>
                      <div>Season: <span className="text-gray-100">{buildInfo.season}</span></div>
                      <div className="font-mono text-gray-400 truncate">Path: {buildInfo.path}</div>

                      {!isVersionSupported && (
                        <motion.div
                          className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                            <p className="text-yellow-300 text-sm font-medium">Launch Restricted</p>
                          </div>
                          <p className="text-yellow-200 text-xs">
                            This build can be imported to your library, but only Season X (10.40) can be launched. Other versions will show as Unsupported.
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">No folder selected</span>
                    <FolderOpen className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <motion.button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 text-gray-300 hover:text-white text-sm transition-all duration-200 border border-white/10 cursor-pointer"
                disabled={importing || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>

              <div className="flex gap-2">
                <motion.button
                  onClick={handleImport}
                  className="px-5 py-2.5 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 border border-white/10 hover:border-white/20 cursor-pointer"
                  disabled={loading || importing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                      Browsing...
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-4 h-4" />
                      Browse
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={handleContinue}
                  disabled={!buildInfo || importing}
                  className="px-5 py-2.5 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {importing ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                      Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Add Build
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}