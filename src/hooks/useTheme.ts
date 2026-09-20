import { themes } from "../app/styles/themes";
import { useConfigStore } from "../stores/settings";
import { useEffect, useMemo } from "react";

type ThemeName = keyof typeof themes;

export function useTheme() {
  const { theme: themeName, setTheme: setThemeStore } = useConfigStore();

  const current = useMemo(() => {
    const name = themeName as ThemeName;
    return themes[name] || themes.obsidian;
  }, [themeName]);

  useEffect(() => {
    const palettes: Record<
      string,
      {
        accent: string;
        accentText: string;
        surface: string;
        surfaceSoft: string;
        sidebar: string;
        frame: string;
      }
    > = {
      obsidian: { accent:"#d4d4d8", accentText:"#09090b", surface:"#0a0a0c",  surfaceSoft:"#121215", sidebar:"#18181b", frame:"#151518" },
      noir:     { accent:"#f5f5f5", accentText:"#050505", surface:"#050505",  surfaceSoft:"#0f0f0f", sidebar:"#141414", frame:"#111111" },
      ocean:    { accent:"#22d3ee", accentText:"#03111c", surface:"#03111c",  surfaceSoft:"#071a28", sidebar:"#0a2030", frame:"#082028" },
      sakura:   { accent:"#f9a8d4", accentText:"#1a0a14", surface:"#1a0a14",  surfaceSoft:"#28121f", sidebar:"#321628", frame:"#2a1222" },
      midnight: { accent:"#6366f1", accentText:"#05071a", surface:"#05071a",  surfaceSoft:"#0c1030", sidebar:"#101538", frame:"#0d1230" },
      aurora:   { accent:"#2dd4bf", accentText:"#021a16", surface:"#021a16",  surfaceSoft:"#072822", sidebar:"#0d332c", frame:"#0a2c26" },
      crimson:  { accent:"#dc2626", accentText:"#fff5f5", surface:"#120303",  surfaceSoft:"#1f0606", sidebar:"#280808", frame:"#200606" },
      twilight: { accent:"#c084fc", accentText:"#0d0618", surface:"#0d0618",  surfaceSoft:"#180b28", sidebar:"#200f34", frame:"#1a0c2c" },
      amethyst: { accent:"#a855f7", accentText:"#0e0416", surface:"#0e0416",  surfaceSoft:"#1a0828", sidebar:"#220b34", frame:"#1c092c" },
      galaxy:   { accent:"#e0e7ff", accentText:"#02020f", surface:"#02020f",  surfaceSoft:"#06061c", sidebar:"#09092a", frame:"#070720" },
      nebula:   { accent:"#d946ef", accentText:"#0c0218", surface:"#0c0218",  surfaceSoft:"#180428", sidebar:"#200534", frame:"#1a042c" },
      ember:    { accent:"#f97316", accentText:"#110601", surface:"#110601",  surfaceSoft:"#1e0b02", sidebar:"#281004", frame:"#200d03" },
      forest:   { accent:"#22c55e", accentText:"#011007", surface:"#011007",  surfaceSoft:"#051a0d", sidebar:"#082414", frame:"#061e10" },
      rose:     { accent:"#fb7185", accentText:"#12030a", surface:"#12030a",  surfaceSoft:"#1e0610", sidebar:"#280818", frame:"#200614" },
      gold:     { accent:"#fbbf24", accentText:"#0f0a01", surface:"#0f0a01",  surfaceSoft:"#1c1402", sidebar:"#261c04", frame:"#1e1803" },
      steel:    { accent:"#94a3b8", accentText:"#08090c", surface:"#08090c",  surfaceSoft:"#121418", sidebar:"#181c22", frame:"#14181e" },
      copper:   { accent:"#c2793a", accentText:"#100800", surface:"#100800",  surfaceSoft:"#1c1002", sidebar:"#261804", frame:"#1e1403" },
      arctic:   { accent:"#bae6fd", accentText:"#020d18", surface:"#020d18",  surfaceSoft:"#061624", sidebar:"#0a1e30", frame:"#081a2a" },
      toxic:    { accent:"#a3e635", accentText:"#030a00", surface:"#030a00",  surfaceSoft:"#071400", sidebar:"#0b1c02", frame:"#091801" },
    };
    const palette = palettes[themeName] ?? palettes.obsidian;

    document.documentElement.style.setProperty("--accent", palette.accent);
    document.documentElement.style.setProperty("--accent-text", palette.accentText);
    document.documentElement.style.setProperty("--accent-soft", `${palette.accent}24`);
    document.documentElement.style.setProperty("--surface", palette.surface);
    document.documentElement.style.setProperty("--surface-soft", palette.surfaceSoft);
    document.documentElement.style.setProperty("--sidebar-bg", palette.sidebar);
    document.documentElement.style.setProperty("--frame-bg", palette.frame);
    document.documentElement.dataset.theme = themeName;
    document.documentElement.dataset.themeChanging = "true";

    const timer = window.setTimeout(() => {
      delete document.documentElement.dataset.themeChanging;
    }, 520);

    return () => window.clearTimeout(timer);
  }, [themeName]);

  const setTheme = (name: ThemeName) => {
    if (themes[name]) {
      setThemeStore(name);
    }
  };

  return {
    current,
    themeName: themeName as ThemeName,
    setTheme,
    themes,
  };
}
