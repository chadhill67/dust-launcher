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

export function SmallShopCard({ item }: { item: ShopItem }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      transition={{ type: "spring", stiffness: 340, damping: 24 }}
      className="relative rounded-xl overflow-hidden shadow-xl border border-white/10 bg-black cursor-pointer"
      style={{ aspectRatio: "1 / 1.15" }}
    >
      {/* rarity gradient */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${rarityGradient(item.rarity.value)}`}
        style={{ filter: "brightness(0.88)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* item image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={item.id}
          src={item.images.icon}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.32 }}
          className="absolute inset-0 w-full h-full object-cover drop-shadow-xl"
          draggable={false}
          onError={(e) => { (e.target as HTMLImageElement).src = item.images.icon; }}
        />
      </AnimatePresence>

      {/* info overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-3 py-3">
        <h3 className="text-white text-xs font-extrabold leading-tight line-clamp-1">{item.name}</h3>
        <div className="flex items-center gap-1 mt-1.5">
          <img src="https://image.fnbr.co/price/icon_vbucks_50x.png" className="w-3 h-3" draggable={false} />
          <span className="text-white font-bold text-[11px]">{item.price.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}
