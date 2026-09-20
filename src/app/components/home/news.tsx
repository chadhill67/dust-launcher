import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../lib/api";
import { Config } from "../../../config";

type NewsMessage = {
  title: string;
  body: string;
};

type ContentPagesWithSTW = {
  savetheworldnews?: { news?: { messages?: NewsMessage[] } };
};

export function News() {
  const [items, setItems]   = useState<NewsMessage[]>([]);
  const [index, setIndex]   = useState(0);
  const [paused, setPaused] = useState(false);

  const DEFAULT_NEWS: NewsMessage[] = [
    {
      title: "Welcome to dust",
      body: "Experience Chapter 1 Fortnite with improved performance, custom cosmetics, and instant match loading.",
    },
    {
      title: "New Season Trailer Available",
      body: "Watch the latest cinematic trailer directly from the launcher dashboard. Click Watch Trailer above!",
    },
    {
      title: "Daily Item Shop Refreshed",
      body: "Check out the newly updated featured items and daily rotation in the Item Shop tab.",
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getContentPages();
        if (res.success && res.data) {
          const pages = res.data as ContentPagesWithSTW;
          const msgs = pages.savetheworldnews?.news?.messages;
          if (Array.isArray(msgs) && msgs.length > 0) {
            setItems(msgs);
            return;
          }
        }
      } catch {
        // Fallback to default items
      }
      setItems(DEFAULT_NEWS);
    })();
  }, []);

  useEffect(() => {
    if (items.length <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(id);
  }, [items.length, paused]);

  const current = items[index] || DEFAULT_NEWS[0];
  const carouselImages = Config.IMAGES.NEWS_CAROUSEL_IMAGES;
  const currentImage = carouselImages[index % carouselImages.length] || Config.IMAGES.SEASON_X_BG;

  return (
    <div
      style={{ position: "relative", height: 300, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: "1px solid var(--border)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Always-visible fallback background */}
      <div style={{ position: "absolute", inset: 0, background: "var(--surface-soft)" }} />

      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            {currentImage && (
              <img
                src={currentImage}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80"; }}
                draggable={false}
              />
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.32) 55%, rgba(0,0,0,0.08) 100%)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px 14px" }}>
              <p style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.25, marginBottom: 5 }}>
                {current.title}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.70)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {current.body}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* dot indicators */}
      {items.length > 1 && (
        <div style={{ position: "absolute", bottom: 14, right: 16, display: "flex", gap: 5, zIndex: 10 }}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              style={{
                width: i === index ? 18 : 6,
                height: 6,
                borderRadius: 99,
                background: i === index ? "var(--accent)" : "rgba(255,255,255,0.30)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 240ms ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
