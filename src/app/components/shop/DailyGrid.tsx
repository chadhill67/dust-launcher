"use client";

import { ShopItem } from "../../../types";
import { SmallShopCard } from "./SmallShopCard";

export function DailyGrid({ items }: { items: ShopItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 max-w-3xl">
      {items.map((item) => (
        <SmallShopCard key={item.id} item={item} />
      ))}
    </div>
  );
}
