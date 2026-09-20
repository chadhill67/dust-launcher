import { useEffect, useState } from "react";
import { ShopItem } from "../types";
import { api } from "../lib/api";
import { getCosmetic } from "../lib/cosmetics";

export function useShopItems() {
  const [featured, setFeatured] = useState<ShopItem[]>([]);
  const [daily, setDaily] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [expiration, setExpiration] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getShopCatalog();

        if (!res.success || !res.data) {
          return;
        }

        const json = res.data;

        const storefronts = Array.isArray(json.storefronts) ? json.storefronts : [];

        const dailyStore = storefronts.find(
          (s: any) =>
            s.name?.toLowerCase() === "brdailystorefront" ||
            s.name?.toLowerCase() === "daily"
        );
        const featuredStore = storefronts.find(
          (s: any) =>
            s.name?.toLowerCase() === "brweeklystorefront" ||
            s.name?.toLowerCase() === "featured" ||
            s.name?.toLowerCase() === "weekly"
        );

        const dailyEntries = dailyStore?.catalogEntries || [];
        const featuredEntries = featuredStore?.catalogEntries || [];

        // If daily is empty but we have entries in any storefront
        const allEntries = storefronts.flatMap((s: any) => s.catalogEntries || []);

        const entriesToUseFeatured = featuredEntries.length > 0 ? featuredEntries : allEntries.slice(0, 6);
        const entriesToUseDaily = dailyEntries.length > 0 ? dailyEntries : allEntries.slice(6);

        const loadItems = async (entries: any[]) => {
          const items: ShopItem[] = [];

          for (const entry of entries) {
            const rawId =
              entry.itemGrants?.[0]?.templateId ||
              entry.devName ||
              entry.offerId;
            if (!rawId) continue;

            const id = rawId.includes(":") ? rawId.split(":")[1] : rawId;
            const price = entry.prices?.[0]?.finalPrice ?? entry.prices?.[0]?.basePrice ?? 0;

            const data = await getCosmetic(id);
            if (data.status !== 200 || !data.data) continue;

            if (json.expiration) {
              setExpiration(json.expiration);
            }

            items.push({
              id: data.data.id,
              name: data.data.name,
              description: data.data.description,
              price,
              images: data.data.images,
              rarity: data.data.rarity,
            });
          }

          return items;
        };

        const [loadedFeatured, loadedDaily] = await Promise.all([
          loadItems(entriesToUseFeatured),
          loadItems(entriesToUseDaily),
        ]);

        setFeatured(loadedFeatured);
        setDaily(loadedDaily);
      } catch (err) {
        console.error("Failed to load shop catalog:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { featured, daily, loading, expiration };
}
