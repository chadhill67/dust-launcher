import { Config } from "../config";

type Season = `${string}`;

const seasonDescriptions: Record<Season, string> = {
  "10": "Time travel warped the map with Rift Zones, reviving old locations like Moisty Mire with new twists. The B.R.U.T.E. mech sparked intense gameplay debates. A black hole event closed the chapter, shocking the community.",
};

const seasonImages: Record<Season, string> = {
  "10": Config.IMAGES.SEASON_X_BG,
};

function translateSeason(season: number) {
  if (season === 10) return `Chapter 1, Season X`;
  return `Season ${season}`;
}

function getSeasonDescription(season: Season): string {
  return seasonDescriptions[season] || "Description not available for this season.";
}

function getSeasonImage(season: Season): string {
  return seasonImages[season] || "";
}

export function SeasonInfo(season: Season) {
  const num = Number(season);
  return {
    readableSeason: translateSeason(num),
    description: getSeasonDescription(season),
    image: getSeasonImage(season),
  };
}
