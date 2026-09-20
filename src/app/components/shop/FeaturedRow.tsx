"use client";

import { ShopItem } from "../../../types";
import { BigFeaturedCard } from "./BigFeaturedCard";

export function FeaturedRow({ items }: { items: ShopItem[] }) {
  const left = items[0];
  const middle = items[1];

  return (
    <div className="grid grid-cols-[2fr_2fr_1fr] max-w-lg gap-2 h-105">
      {left && <BigFeaturedCard item={left} />}

      {middle && <BigFeaturedCard item={middle} />}
    </div>
  );
}
