"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ShopItem } from "../../../types";
import { api } from "../../../lib/api";
import { getCosmetic } from "../../../lib/cosmetics";

type ShopCardProps = {
  item: ShopItem;
  index: number;
};

function ShopCard({ item, index }: ShopCardProps) {
  const getRarityGradient = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "linear-gradient(to bottom right, #71717a, #52525b, #3f3f46)";
      case "uncommon":
        return "linear-gradient(to bottom right, #84cc16, #65a30d, #4d7c0f)";
      case "rare":
        return "linear-gradient(to bottom right, #06b6d4, #0891b2, #0e7490)";
      case "epic":
        return "linear-gradient(to bottom right, #a855f7, #9333ea, #7e22ce)";
      case "legendary":
        return "linear-gradient(to bottom right, #f97316, #ea580c, #c2410c)";
      case "mythic":
        return "linear-gradient(to bottom right, #facc15, #eab308, #ca8a04)";
      case "marvel":
        return "linear-gradient(to bottom right, #dc2626, #b91c1c, #991b1b)";
      case "dc":
        return "linear-gradient(to bottom right, #2563eb, #1d4ed8, #1e40af)";
      case "icon series":
        return "linear-gradient(to bottom right, #06b6d4, #0891b2, #0e7490)";
      case "star wars":
        return "linear-gradient(to bottom right, #334155, #1e293b, #0f172a)";
      default:
        return "linear-gradient(to bottom right, #52525b, #3f3f46, #27272a)";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ width: "100%", aspectRatio: "4/3", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.3)", border: "1px solid var(--border)", background: "#000", position: "relative" }}
    >
      <motion.div
        key={`bg-${index}`}
        style={{ position: "absolute", inset: 0, background: getRarityGradient(item.rarity.value), filter: "brightness(0.85)" }}
        initial={{ opacity: 0, scale: 1.07 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      />

      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.6) 100%)" }} />

      <AnimatePresence mode="wait">
        <motion.div
          key={`image-${index}`}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.45 }}
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <img
            src={item.images.featured || item.images.icon}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 25px 25px rgba(0,0,0,0.5))" }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = item.images.icon;
            }}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 50%, transparent 100%)", padding: "12px 16px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`info-${index}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 800, lineHeight: 1.2, textShadow: "0 2px 4px rgba(0,0,0,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.name}
            </h3>
            <p style={{ color: "#d1d5db", fontSize: 12, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {item.description || "No description available."}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <img
                src="https://image.fnbr.co/price/icon_vbucks_50x.png"
                style={{ width: 16, height: 16 }}
                draggable={false}
              />
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                {item.price.toLocaleString()}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function ShopPreview() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [indices, setIndices] = useState([0, 1]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShop();
  }, []);

  useEffect(() => {
    if (!items.length) return;

    const interval = setInterval(() => {
      setIndices((prev) => [
        (prev[0] + 1) % items.length,
        (prev[1] + 1) % items.length,
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, [items]);

  const fetchShop = async () => {
    try {
      const res = await api.getShopCatalog();
      if (!res.success || !res.data) throw new Error("Bad response");

      const json = res.data;

      const storefronts = Array.isArray(json.storefronts) ? json.storefronts : [];

      const daily =
        storefronts.find((s: any) =>
          s.name?.toLowerCase() === "brdailystorefront" ||
          s.name?.toLowerCase() === "daily"
        )?.catalogEntries || [];
      const weekly =
        storefronts.find((s: any) =>
          s.name?.toLowerCase() === "brweeklystorefront" ||
          s.name?.toLowerCase() === "featured" ||
          s.name?.toLowerCase() === "weekly"
        )?.catalogEntries || [];

      const allEntries = storefronts.flatMap((s: any) => s.catalogEntries || []);
      const selectedStores = [...weekly, ...daily].length > 0 ? [...weekly, ...daily] : allEntries;

      if (!selectedStores.length) {
        setLoading(false);
        return;
      }

      const loaded: ShopItem[] = [];

      for (const entry of selectedStores) {
        const price = entry.prices?.[0]?.finalPrice ?? entry.prices?.[0]?.basePrice ?? 0;
        const rawId =
          entry.itemGrants?.[0]?.templateId ||
          entry.devName ||
          entry.offerId;

        if (!rawId) continue;
        const id = rawId.includes(":") ? rawId.split(":")[1] : rawId;

        try {
          const data = await getCosmetic(id);
          if (data.status !== 200 || !data.data) continue;

          loaded.push({
            id: data.data.id,
            name: data.data.name,
            description: data.data.description,
            price: price || 0,
            images: {
              featured: data.data.images.featured,
              icon: data.data.images.icon,
            },
            rarity: data.data.rarity,
          });
        } catch {
          continue;
        }
      }

      setItems(loaded.slice(0, 6));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ flex: 1 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{ width: "100%", aspectRatio: "4/3", borderRadius: 12, background: "var(--surface-soft)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: 40, height: 40, border: "4px solid var(--border)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <span style={{ color: "var(--text-strong)", fontSize: 13, fontWeight: 600 }}>Loading...</span>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ flex: 1 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{ width: "100%", aspectRatio: "4/3", borderRadius: 12, background: "var(--surface-soft)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>No items available</span>
            </motion.div>
          </div>
        ))}
      </div>
    );
  }

  // Ensure we have at least 2 items, duplicate if needed
  const displayItems = items.length >= 2 ? items : [...items, ...items];

  return (
    <div style={{ display: "flex", gap: 12, width: "100%" }}>
      <div style={{ flex: 1 }}>
        <ShopCard
          item={displayItems[indices[0] % displayItems.length]}
          index={indices[0]}
        />
      </div>
      <div style={{ flex: 1 }}>
        <ShopCard
          item={displayItems[indices[1] % displayItems.length]}
          index={indices[1]}
        />
      </div>
    </div>
  );
}