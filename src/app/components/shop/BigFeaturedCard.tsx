"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShopItem } from "../../../types";

function rarityGradient(rarity: string) {
  switch (rarity.toLowerCase()) {
    case "common":       return "from-[#6b727d] via-[#989fa4] to-[#474c54]";
    case "uncommon":     return "from-[#a1fe00] via-[#61bf00] to-[#024f03]";
    case "rare":         return "from-[#00afff] via-[#0077c8] to-[#00458a]";
    case "epic":         return "from-[#ce59ff] via-[#8b32cc] to-[#4c197b]";
    case "legendary":    return "from-[#ff8b19] via-[#d45c10] to-[#8a3c1d]";
    case "crystal":      return "from-[#606de0] via-[#6991ff] to-[#284d9c]";
    case "icon":
    case "icon series":  return "from-[#5cf2f3] via-[#00e0ff] to-[#004c71]";
    case "dc":           return "from-[#19193f] via-[#212138] to-[#000033]";
    default:             return "from-neutral-600 via-neutral-700 to-neutral-800";
  }
}

export function BigFeaturedCard({ item }: { item: ShopItem }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-zinc-950 cursor-pointer group flex-shrink-0"
      style={{ width: 260, height: 370 }}
    >
      {/* rarity background glow */}
      <div className={`absolute inset-0 bg-gradient-to-b ${rarityGradient(item.rarity.value)} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

      {/* item image with subtle zoom effect */}
      <AnimatePresence mode="wait">
        <motion.img
          key={item.id}
          src={item.images.featured || item.images.icon}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.38 }}
          className="absolute inset-0 w-full h-full object-contain p-2 drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-300"
          draggable={false}
          onError={(e) => { (e.target as HTMLImageElement).src = item.images.icon; }}
        />
      </AnimatePresence>

      {/* info overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-5 py-4 flex flex-col gap-1 border-t border-white/10 backdrop-blur-[2px]">
        <div className="flex items-center justify-between">
          <p className="text-white/70 text-[11px] font-extrabold uppercase tracking-widest capitalize">
            {item.rarity.displayValue}
          </p>
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
            <img src="https://image.fnbr.co/price/icon_vbucks_50x.png" className="w-3.5 h-3.5" draggable={false} />
            <span className="text-white font-bold text-xs">{item.price.toLocaleString()}</span>
          </div>
        </div>
        <h3 className="text-white text-lg font-black tracking-tight leading-tight line-clamp-1">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-white/60 text-xs line-clamp-1">
            {item.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
