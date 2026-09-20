import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Heart, Play, X } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
import { ImportModal } from "../components/import/Modal";
import { News } from "../components/home/news";
import { ProfileCardsRow } from "../components/home/ProfileCards";
import { ShopPreview } from "../components/home/ShopPreview";
import { useAuth } from "../../hooks/useAuth";
import { Config } from "../../config";
import { useState, useMemo, useEffect, useRef } from "react";
import { useTrailer } from "../../hooks/useTrailer";

const genStar = () => ({
  x: Math.random() * 500,
  delay: Math.random() * 3,
  duration: 3 + Math.random() * 3,
  size: 8 + Math.random() * 10,
  rotate: Math.random() * 180,
  drift: (Math.random() - 0.5) * 60,
});

export function Home() {
  const auth = useAuth.user();
  const { isOpen: trailerOpen, openTrailer, closeTrailer } = useTrailer();
  const [importOpen, setImportOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stars = useMemo(
    () => Array.from({ length: 14 }, genStar),
    []
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && trailerOpen) {
        closeTrailer();
      }
    }
    if (trailerOpen) {
      window.addEventListener("keydown", handleKeyDown);
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
      videoRef.current?.load(); // Reset video
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      videoRef.current?.pause();
    };
  }, [trailerOpen, closeTrailer]);

  if (!auth.isValidSession()) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ padding: "18px 22px 24px", minHeight: "100%", display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Profile stats row */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Overview</h2>
        <ProfileCardsRow />
      </div>

      {/* News carousel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)", letterSpacing: "0.08em", textTransform: "uppercase" }}>News</h2>
          {Config.TRAILER_URL && (
            <button
              onClick={openTrailer}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <Play size={13} className="fill-white" />
              <span>Watch Trailer</span>
            </button>
          )}
        </div>
        <News />
      </div>

      {/* Support / donate stellar style + Discord */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Support & Community</h2>
        
        {/* Stellar-style Support Card with animated star particles */}
        <div
          style={{
            position: "relative",
            width: "100%",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(20, 20, 30, 0.7) 100%)",
            backdropFilter: "blur(16px)",
            padding: "20px 22px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
          }}
        >
          {/* Optional banner background image */}
          {Config.IMAGES.DONATE_BANNER && (
            <img
              src={Config.IMAGES.DONATE_BANNER}
              draggable={false}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center",
                opacity: 0.18,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Floating twinkling star particles */}
          {stars.map((p, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: p.x,
                background: "radial-gradient(circle, #fff 10%, rgba(255,255,255,0.7) 40%, transparent 80%)",
                filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))",
              }}
              initial={{
                y: -30,
                x: p.x,
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                y: 160,
                x: p.x + p.drift,
                opacity: [0, 0.9, 0],
                rotate: p.rotate,
                scale: [0.7, 1.25, 0.7],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          {/* Content */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div className="flex flex-col gap-1.5 max-w-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/20 border border-red-500/30">
                  <Heart size={18} className="text-red-400 fill-red-400/40" />
                </div>
                <h3 className="text-lg font-bold tracking-wide text-white">SUPPORT DUST</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                Donate to unlock <span className="text-white font-semibold">exclusive perks</span> and help us keep the servers online.
              </p>
            </div>

            <button
              onClick={() => open(Config.DONATE_LINK)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-lg"
            >
              <span>Donate Now</span>
              <ExternalLink size={14} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* Discord button with provided Discord PNG */}
        <button
          onClick={() => open(Config.DISCORD_LINK || "https://discord.gg/Vrbsh9Vek8")}
          style={{
            width: "100%",
            height: 50,
            borderRadius: 12,
            border: "1px solid rgba(88, 101, 242, 0.35)",
            background: "linear-gradient(135deg, rgba(88, 101, 242, 0.22) 0%, rgba(88, 101, 242, 0.08) 100%)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: "0.02em",
            transition: "all 160ms ease",
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "linear-gradient(135deg, rgba(88, 101, 242, 0.35) 0%, rgba(88, 101, 242, 0.18) 100%)";
            btn.style.borderColor = "#5865F2";
            btn.style.transform = "translateY(-1px)";
            btn.style.boxShadow = "0 6px 20px rgba(88, 101, 242, 0.3)";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "linear-gradient(135deg, rgba(88, 101, 242, 0.22) 0%, rgba(88, 101, 242, 0.08) 100%)";
            btn.style.borderColor = "rgba(88, 101, 242, 0.35)";
            btn.style.transform = "translateY(0)";
            btn.style.boxShadow = "none";
          }}
        >
          <img
            src="https://pngimg.com/d/discord_PNG6.png"
            alt="Discord"
            className="w-6 h-6 object-contain"
            draggable={false}
          />
          <span>Join Discord Server</span>
        </button>
      </div>

      {/* Shop preview - two items side by side */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Featured Shop</h2>
        <ShopPreview />
      </div>

      {importOpen && (
        <ImportModal onClose={() => setImportOpen(false)} />
      )}

      {/* In-Launcher Trailer Modal (centered video player) */}
      <AnimatePresence>
        {trailerOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeTrailer}
            role="dialog"
            aria-modal="true"
            aria-label="Season Trailer"
          >
            <motion.div
              className="fixed inset-0 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm border-b border-white/10 z-10">
                  <div className="flex items-center gap-2">
                    <Play size={18} className="text-blue-400 fill-blue-400" />
                    <span className="text-sm font-bold text-white tracking-wide">Season Trailer</span>
                  </div>
                  <button
                    onClick={closeTrailer}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Close trailer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Video container */}
                <video
                  ref={videoRef}
                  src={Config.TRAILER_URL}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                  controls
                  controlsList="nodownload"
                  onEnded={closeTrailer}
                />

                {/* Bottom hint */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-black/60 backdrop-blur-sm border-t border-white/10">
                  <p className="text-center text-zinc-500 text-xs">
                    Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">Esc</kbd> or click outside to close
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

