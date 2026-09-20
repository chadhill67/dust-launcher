"use client";

import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useShopItems } from "../../hooks/useShopItems";
import { useProfileStore } from "../../stores/profile";
import { useEffect, useState } from "react";
import { BigFeaturedCard } from "../components/shop/BigFeaturedCard";
import { SmallShopCard } from "../components/shop/SmallShopCard";

export function Shop() {
  const auth = useAuth.user();
  const { featured, daily, loading, expiration } = useShopItems();
  const [timeLeft, setTimeLeft] = useState("∞");

  useEffect(() => {
    if (!expiration) return;
    const end = new Date(expiration).getTime();
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) { setTimeLeft("00:00:00"); return; }
      const s = Math.floor(diff / 1000);
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      setTimeLeft(
        d > 0
          ? `${d}d ${String(h).padStart(2, "0")}h`
          : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiration]);

  const vbucks =
    useProfileStore(
      (s) => s.profiles?.common_core?.items?.["Currency:MtxPurchased"]?.quantity
    ) ?? 0;

  if (!auth.isValidSession()) return null;

  if (loading) {
    return (
      <div className="min-h-full min-w-full flex items-center justify-center">
        <div className="h-5 w-5 border border-white border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  if (!featured.length && !daily.length) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-8 py-7 text-center">
          <h1 className="text-2xl font-semibold text-[var(--text-strong)]">No items found</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Try again later or check your backend connection.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="px-6 py-6 pb-10"
    >
      {/* header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white leading-none">Item Shop</h1>
          <p className="mt-1 text-sm text-white/50">Latest cosmetics available right now</p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-4 py-2">
          <div className="flex items-center gap-1.5">
            <img src="https://image.fnbr.co/price/icon_vbucks_50x.png" className="w-4 h-4" draggable={false} />
            <span className="text-white font-bold text-sm">{vbucks.toLocaleString()}</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-1.5 text-white/70 text-sm">
            <motion.svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </motion.svg>
            <span className="tabular-nums">{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* featured row */}
      {featured.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Featured</h2>
          <div className="flex flex-wrap gap-3">
            {featured.map((item) => (
              <BigFeaturedCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* daily grid */}
      {daily.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Daily</h2>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
            {daily.map((item) => (
              <SmallShopCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
