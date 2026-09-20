import axios from "axios";

export const cosmeticsClient = axios.create({
  baseURL: "https://fortnite-api.com/v2",
  timeout: 15000,
});

export async function getCosmetic(id: string) {
  try {
    const cleanId = id.includes(":") ? id.split(":")[1] : id;
    const response = await cosmeticsClient.get(`/cosmetics/br/${cleanId}`);
    const data = response.data;

    if (!data || !data.data) {
      return { status: 404, data: null };
    }

    const cosmetic = data.data;

    return {
      status: 200,
      data: {
        id: cosmetic.id,
        name: cosmetic.name || cleanId,
        description: cosmetic.description || "",
        images: {
          featured: cosmetic.images?.featured || cosmetic.images?.icon || cosmetic.images?.smallIcon || "",
          icon: cosmetic.images?.icon || cosmetic.images?.smallIcon || "",
        },
        rarity: {
          value: cosmetic.rarity?.value || "common",
          displayValue: cosmetic.rarity?.displayValue || "Common",
        },
      },
    };
  } catch (error) {
    console.warn(`Failed to fetch cosmetic ${id}:`, error);
    // Fallback item so UI doesn't drop items completely
    const cleanId = id.includes(":") ? id.split(":")[1] : id;
    return {
      status: 200,
      data: {
        id: cleanId,
        name: cleanId.replace(/_/g, " "),
        description: "",
        images: {
          featured: `https://fortnite-api.com/images/cosmetics/br/${cleanId.toLowerCase()}/icon.png`,
          icon: `https://fortnite-api.com/images/cosmetics/br/${cleanId.toLowerCase()}/icon.png`,
        },
        rarity: {
          value: "rare",
          displayValue: "Rare",
        },
      },
    };
  }
}

export async function searchCosmetics(query: string) {
  try {
    const response = await cosmeticsClient.get(`/cosmetics/search`, {
      params: { name: query },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to search cosmetics:`, error);
    return { data: [] };
  }
}