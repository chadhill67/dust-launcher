"use client";
import { BuildCard } from "./BuildCard";
import { Config } from "../../../config";

interface BuildGridProps {
  builds: [string, any][];
  options: string | null;
  setOptions: (path: string | null) => void;
  handleDeleteBuild: (path: string) => void;
}

export function BuildGrid({
  builds,
  options,
  setOptions,
  handleDeleteBuild,
}: BuildGridProps) {
  const currentVersion = Config.CURRENT_VERSION;
  const sortedBuilds = [...builds].sort(([, a], [, b]) =>
    a.version === currentVersion
      ? -1
      : b.version === currentVersion
        ? 1
        : 0,
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 16,
      }}
    >
      {sortedBuilds.map(([path, build]) => (
        <BuildCard
          key={path}
          path={path}
          build={build}
          options={options}
          setOptions={setOptions}
          handleDeleteBuild={handleDeleteBuild}
          isPublicBuild={build.version === currentVersion}
        />
      ))}
    </div>
  );
}