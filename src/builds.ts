type BuildInfo = {
  url: string;
  format: "zip" | "rar";
};

const BuildsList = new Map<string, BuildInfo>([
  ["10.40", { url: "https://cdn.cbn.lol/10.40", format: "rar" }],
]);

export function getBuild(version: string): BuildInfo | null {
  return BuildsList.get(version) ?? null;
}
