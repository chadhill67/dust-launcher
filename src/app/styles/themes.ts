import { Theme } from "../../types";

export const themes: Record<string, Theme> = {
  midnight: {
    background: { primary: "bg-[#05071a]", secondary: "bg-[#0c1030]" },
    text: { primary: "text-indigo-50", secondary: "text-indigo-300/60" },
    button: { base: "bg-[#141850]", hover: "hover:bg-[#1e2468]", active: "bg-[#1e2468]" },
    border: "border-[#2a3080]",
    gradient: { from: "#05071a", to: "#0c1030" },
  },

  obsidian: {
    background: { primary: "bg-[#0a0a0c]", secondary: "bg-[#121215]" },
    text: { primary: "text-zinc-100", secondary: "text-zinc-500" },
    button: { base: "bg-[#1e1e22]", hover: "hover:bg-[#28282e]", active: "bg-[#28282e]" },
    border: "border-[#2e2e34]",
    gradient: { from: "#0a0a0c", to: "#18181b" },
  },

  ocean: {
    background: {
      primary: "bg-[#041c2c]",
      secondary: "bg-[#0a2f47]",
    },
    text: {
      primary: "text-cyan-50",
      secondary: "text-cyan-400/60",
    },
    button: {
      base: "bg-[#0d3a54]",
      hover: "hover:bg-[#114d6b]",
      active: "bg-[#114d6b]",
    },
    border: "border-[#1a5575]",
    gradient: {
      from: "#041c2c",
      to: "#082938",
    },
  },

  sakura: {
    background: {
      primary: "bg-[#1a0d1f]",
      secondary: "bg-[#2d1b33]",
    },
    text: {
      primary: "text-pink-50",
      secondary: "text-pink-300/70",
    },
    button: {
      base: "bg-[#3d2547]",
      hover: "hover:bg-[#4d3357]",
      active: "bg-[#4d3357]",
    },
    border: "border-[#5d4367]",
    gradient: {
      from: "#1a0d1f",
      to: "#2a1533",
    },
  },

  nebula: {
    background: {
      primary: "bg-[#150a2e]",
      secondary: "bg-[#22154a]",
    },
    text: {
      primary: "text-purple-50",
      secondary: "text-purple-300/60",
    },
    button: {
      base: "bg-[#2d1f5c]",
      hover: "hover:bg-[#3a2a6e]",
      active: "bg-[#3a2a6e]",
    },
    border: "border-[#4a3880]",
    gradient: {
      from: "#150a2e",
      to: "#1f1240",
    },
  },

  galaxy: {
    background: {
      primary: "bg-[#02020f]",
      secondary: "bg-[#06061c]",
    },
    text: {
      primary: "text-indigo-50",
      secondary: "text-indigo-200/50",
    },
    button: {
      base: "bg-[#0a0a30]",
      hover: "hover:bg-[#10103e]",
      active: "bg-[#10103e]",
    },
    border: "border-[#3d3370]",
    gradient: {
      from: "#0c0a1f",
      to: "#16122e",
    },
  },

  aurora: {
    background: {
      primary: "bg-[#0a1f1c]",
      secondary: "bg-[#0f2e2a]",
    },
    text: {
      primary: "text-emerald-50",
      secondary: "text-emerald-300/60",
    },
    button: {
      base: "bg-[#143d37]",
      hover: "hover:bg-[#1a4f47]",
      active: "bg-[#1a4f47]",
    },
    border: "border-[#256156]",
    gradient: {
      from: "#0a1f1c",
      to: "#0d2824",
    },
  },

  ember: {
    background: {
      primary: "bg-[#1f0f0a]",
      secondary: "bg-[#2d1710]",
    },
    text: {
      primary: "text-orange-50",
      secondary: "text-orange-300/60",
    },
    button: {
      base: "bg-[#3d2115]",
      hover: "hover:bg-[#4d2b1a]",
      active: "bg-[#4d2b1a]",
    },
    border: "border-[#5d3820]",
    gradient: {
      from: "#1f0f0a",
      to: "#28140d",
    },
  },

  forest: {
    background: {
      primary: "bg-[#0a1f0f]",
      secondary: "bg-[#0f2e18]",
    },
    text: {
      primary: "text-green-50",
      secondary: "text-green-300/60",
    },
    button: {
      base: "bg-[#143d22]",
      hover: "hover:bg-[#1a4f2c]",
      active: "bg-[#1a4f2c]",
    },
    border: "border-[#256136]",
    gradient: {
      from: "#0a1f0f",
      to: "#0d2814",
    },
  },

  twilight: {
    background: {
      primary: "bg-[#1a0f2e]",
      secondary: "bg-[#281747]",
    },
    text: {
      primary: "text-violet-50",
      secondary: "text-violet-300/60",
    },
    button: {
      base: "bg-[#35215c]",
      hover: "hover:bg-[#432b70]",
      active: "bg-[#432b70]",
    },
    border: "border-[#523685]",
    gradient: {
      from: "#1a0f2e",
      to: "#221340",
    },
  },

  crimson: {
    background: {
      primary: "bg-[#1f0a0f]",
      secondary: "bg-[#2d0f18]",
    },
    text: {
      primary: "text-red-50",
      secondary: "text-red-300/60",
    },
    button: {
      base: "bg-[#3d1522]",
      hover: "hover:bg-[#4d1b2c]",
      active: "bg-[#4d1b2c]",
    },
    border: "border-[#5d2236]",
    gradient: {
      from: "#1f0a0f",
      to: "#280d14",
    },
  },

  amethyst: {
    background: {
      primary: "bg-[#1a0d2e]",
      secondary: "bg-[#2a1547]",
    },
    text: {
      primary: "text-purple-50",
      secondary: "text-purple-300/60",
    },
    button: {
      base: "bg-[#3a1f5c]",
      hover: "hover:bg-[#4a2970]",
      active: "bg-[#4a2970]",
    },
    border: "border-[#5a3685]",
    gradient: {
      from: "#1a0d2e",
      to: "#241240",
    },
  },

  noir: {
    background: {
      primary: "bg-[#0f0f12]",
      secondary: "bg-[#18181c]",
    },
    text: {
      primary: "text-slate-50",
      secondary: "text-slate-400/70",
    },
    button: {
      base: "bg-[#222228]",
      hover: "hover:bg-[#2c2c34]",
      active: "bg-[#2c2c34]",
    },
    border: "border-[#35353f]",
    gradient: {
      from: "#0f0f12",
      to: "#151518",
    },
  },
};

// ── Extra themes added below ──

Object.assign(themes as any, {
  rose: {
    background: { primary: "bg-[#130810]", secondary: "bg-[#1f1019]" },
    text: { primary: "text-rose-50", secondary: "text-rose-300/60" },
    button: { base: "bg-[#2e1522]", hover: "hover:bg-[#3d1c2d]", active: "bg-[#3d1c2d]" },
    border: "border-[#4d2438]",
    gradient: { from: "#130810", to: "#1c0d16" },
  },
  gold: {
    background: { primary: "bg-[#120e05]", secondary: "bg-[#1c160a]" },
    text: { primary: "text-amber-50", secondary: "text-amber-300/60" },
    button: { base: "bg-[#2e2410]", hover: "hover:bg-[#3c2f16]", active: "bg-[#3c2f16]" },
    border: "border-[#4d3c1e]",
    gradient: { from: "#120e05", to: "#1a1308" },
  },
  steel: {
    background: { primary: "bg-[#0c0e11]", secondary: "bg-[#14181e]" },
    text: { primary: "text-slate-100", secondary: "text-slate-400/70" },
    button: { base: "bg-[#1e242d]", hover: "hover:bg-[#28303b]", active: "bg-[#28303b]" },
    border: "border-[#333d4a]",
    gradient: { from: "#0c0e11", to: "#121620" },
  },
  copper: {
    background: { primary: "bg-[#110b07]", secondary: "bg-[#1a1009]" },
    text: { primary: "text-orange-50", secondary: "text-orange-200/60" },
    button: { base: "bg-[#2a1a0e]", hover: "hover:bg-[#382315]", active: "bg-[#382315]" },
    border: "border-[#4a2e18]",
    gradient: { from: "#110b07", to: "#190e09" },
  },
  arctic: {
    background: { primary: "bg-[#07101a]", secondary: "bg-[#0d1a28]" },
    text: { primary: "text-sky-50", secondary: "text-sky-300/60" },
    button: { base: "bg-[#0f2336]", hover: "hover:bg-[#182f46]", active: "bg-[#182f46]" },
    border: "border-[#1e3d58]",
    gradient: { from: "#07101a", to: "#0b1824" },
  },
  toxic: {
    background: { primary: "bg-[#080f03]", secondary: "bg-[#0f1a06]" },
    text: { primary: "text-lime-50", secondary: "text-lime-300/60" },
    button: { base: "bg-[#15290a]", hover: "hover:bg-[#1c360e]", active: "bg-[#1c360e]" },
    border: "border-[#274514]",
    gradient: { from: "#080f03", to: "#0d1a05" },
  },

  // ── NEW THEMES (50+) ──
  abyss: {
    background: { primary: "bg-[#030e0d]", secondary: "bg-[#061a18]" },
    text: { primary: "text-teal-50", secondary: "text-teal-300/60" },
    button: { base: "bg-[#062a26]", hover: "hover:bg-[#0a3a35]", active: "bg-[#0a3a35]" },
    border: "border-[#0f4a45]",
    gradient: { from: "#030e0d", to: "#051815" },
  },
  azure: {
    background: { primary: "bg-[#03101a]", secondary: "bg-[#061d33]" },
    text: { primary: "text-sky-50", secondary: "text-sky-300/60" },
    button: { base: "bg-[#061f3a]", hover: "hover:bg-[#082c4f]", active: "bg-[#082c4f]" },
    border: "border-[#0e4a6b]",
    gradient: { from: "#03101a", to: "#05182f" },
  },
  breeze: {
    background: { primary: "bg-[#021312]", secondary: "bg-[#042524]" },
    text: { primary: "text-teal-50", secondary: "text-teal-300/60" },
    button: { base: "bg-[#052523]", hover: "hover:bg-[#083a37]", active: "bg-[#083a37]" },
    border: "border-[#0f4a48]",
    gradient: { from: "#021312", to: "#03201f" },
  },
  celestial: {
    background: { primary: "bg-[#0d0618]", secondary: "bg-[#1a0c30]" },
    text: { primary: "text-purple-50", secondary: "text-purple-300/60" },
    button: { base: "bg-[#1a0c30]", hover: "hover:bg-[#261045]", active: "bg-[#261045]" },
    border: "border-[#3d1a6b]",
    gradient: { from: "#0d0618", to: "#150a28" },
  },
  cobalt: {
    background: { primary: "bg-[#040c1a]", secondary: "bg-[#081833]" },
    text: { primary: "text-blue-50", secondary: "text-blue-300/60" },
    button: { base: "bg-[#081833]", hover: "hover:bg-[#0c2448]", active: "bg-[#0c2448]" },
    border: "border-[#153a5f]",
    gradient: { from: "#040c1a", to: "#06152e" },
  },
  cosmic: {
    background: { primary: "bg-[#0a0418]", secondary: "bg-[#140830]" },
    text: { primary: "text-violet-50", secondary: "text-violet-300/60" },
    button: { base: "bg-[#140830]", hover: "hover:bg-[#1e0e48]", active: "bg-[#1e0e48]" },
    border: "border-[#2a1460]",
    gradient: { from: "#0a0418", to: "#100628" },
  },
  cyber: {
    background: { primary: "bg-[#011007]", secondary: "bg-[#02200e]" },
    text: { primary: "text-green-50", secondary: "text-green-300/60" },
    button: { base: "bg-[#02200e]", hover: "hover:bg-[#033015]", active: "bg-[#033015]" },
    border: "border-[#084018]",
    gradient: { from: "#011007", to: "#021a0c" },
  },
  dusk: {
    background: { primary: "bg-[#0c0218]", secondary: "bg-[#1a0430]" },
    text: { primary: "text-purple-50", secondary: "text-purple-300/60" },
    button: { base: "bg-[#1a0430]", hover: "hover:bg-[#260645]", active: "bg-[#260645]" },
    border: "border-[#3d086b]",
    gradient: { from: "#0c0218", to: "#150328" },
  },
  eclipse: {
    background: { primary: "bg-[#0a0800]", secondary: "bg-[#141000]" },
    text: { primary: "text-amber-50", secondary: "text-amber-300/60" },
    button: { base: "bg-[#141000]", hover: "hover:bg-[#1e1800]", active: "bg-[#1e1800]" },
    border: "border-[#2a2000]",
    gradient: { from: "#0a0800", to: "#100d00" },
  },
  electric: {
    background: { primary: "bg-[#021117]", secondary: "bg-[#04222e]" },
    text: { primary: "text-cyan-50", secondary: "text-cyan-300/60" },
    button: { base: "bg-[#04222e]", hover: "hover:bg-[#063648]", active: "bg-[#063648]" },
    border: "border-[#0a4a5e]",
    gradient: { from: "#021117", to: "#031a24" },
  },
  frost: {
    background: { primary: "bg-[#020d18]", secondary: "bg-[#041a30]" },
    text: { primary: "text-sky-50", secondary: "text-sky-300/60" },
    button: { base: "bg-[#041a30]", hover: "hover:bg-[#062848]", active: "bg-[#062848]" },
    border: "border-[#0a3d5e]",
    gradient: { from: "#020d18", to: "#031528" },
  },
  ghost: {
    background: { primary: "bg-[#09090b]", secondary: "bg-[#121215]" },
    text: { primary: "text-zinc-50", secondary: "text-zinc-400/70" },
    button: { base: "bg-[#121215]", hover: "hover:bg-[#1a1a1e]", active: "bg-[#1a1a1e]" },
    border: "border-[#2a2a2f]",
    gradient: { from: "#09090b", to: "#101013" },
  },
  glacier: {
    background: { primary: "bg-[#02111a]", secondary: "bg-[#042233]" },
    text: { primary: "text-cyan-50", secondary: "text-cyan-300/60" },
    button: { base: "bg-[#042233]", hover: "hover:bg-[#06364d]", active: "bg-[#06364d]" },
    border: "border-[#0a5a75]",
    gradient: { from: "#02111a", to: "#031a28" },
  },
  horizon: {
    background: { primary: "bg-[#120802]", secondary: "bg-[#1f1004]" },
    text: { primary: "text-orange-50", secondary: "text-orange-300/60" },
    button: { base: "bg-[#1f1004]", hover: "hover:bg-[#2d1806]", active: "bg-[#2d1806]" },
    border: "border-[#3d2408]",
    gradient: { from: "#120802", to: "#180c03" },
  },
  inferno: {
    background: { primary: "bg-[#120303]", secondary: "bg-[#1f0505]" },
    text: { primary: "text-red-50", secondary: "text-red-300/60" },
    button: { base: "bg-[#1f0505]", hover: "hover:bg-[#2d0707]", active: "bg-[#2d0707]" },
    border: "border-[#3d0a0a]",
    gradient: { from: "#120303", to: "#180404" },
  },
  iris: {
    background: { primary: "bg-[#0d0618]", secondary: "bg-[#1a0c30]" },
    text: { primary: "text-purple-50", secondary: "text-purple-300/60" },
    button: { base: "bg-[#1a0c30]", hover: "hover:bg-[#261045]", active: "bg-[#261045]" },
    border: "border-[#3d1a6b]",
    gradient: { from: "#0d0618", to: "#150a28" },
  },
  jade: {
    background: { primary: "bg-[#01100a]", secondary: "bg-[#022014]" },
    text: { primary: "text-emerald-50", secondary: "text-emerald-300/60" },
    button: { base: "bg-[#022014]", hover: "hover:bg-[#03301e]", active: "bg-[#03301e]" },
    border: "border-[#084028]",
    gradient: { from: "#01100a", to: "#021a10" },
  },
  lavender: {
    background: { primary: "bg-[#0e0616]", secondary: "bg-[#1c0c2c]" },
    text: { primary: "text-purple-50", secondary: "text-purple-300/60" },
    button: { base: "bg-[#1c0c2c]", hover: "hover:bg-[#281040]", active: "bg-[#281040]" },
    border: "border-[#3d1858]",
    gradient: { from: "#0e0616", to: "#150a24" },
  },
  lunar: {
    background: { primary: "bg-[#060606]", secondary: "bg-[#0d0d0d]" },
    text: { primary: "text-gray-50", secondary: "text-gray-400/70" },
    button: { base: "bg-[#0d0d0d]", hover: "hover:bg-[#1a1a1a]", active: "bg-[#1a1a1a]" },
    border: "border-[#2a2a2a]",
    gradient: { from: "#060606", to: "#0a0a0a" },
  },
  matrix: {
    background: { primary: "bg-[#011006]", secondary: "bg-[#02200c]" },
    text: { primary: "text-green-50", secondary: "text-green-300/60" },
    button: { base: "bg-[#02200c]", hover: "hover:bg-[#033012]", active: "bg-[#033012]" },
    border: "border-[#084018]",
    gradient: { from: "#011006", to: "#021a0c" },
  },
  mercury: {
    background: { primary: "bg-[#08080a]", secondary: "bg-[#101014]" },
    text: { primary: "text-slate-50", secondary: "text-slate-400/70" },
    button: { base: "bg-[#101014]", hover: "hover:bg-[#1a1a20]", active: "bg-[#1a1a20]" },
    border: "border-[#2a2a34]",
    gradient: { from: "#08080a", to: "#0c0c10" },
  },
  monsoon: {
    background: { primary: "bg-[#021018]", secondary: "bg-[#042030]" },
    text: { primary: "text-sky-50", secondary: "text-sky-300/60" },
    button: { base: "bg-[#042030]", hover: "hover:bg-[#063048]", active: "bg-[#063048]" },
    border: "border-[#0a4a60]",
    gradient: { from: "#021018", to: "#031824" },
  },
  mystic: {
    background: { primary: "bg-[#0a0314]", secondary: "bg-[#140628]" },
    text: { primary: "text-purple-50", secondary: "text-purple-300/60" },
    button: { base: "bg-[#140628]", hover: "hover:bg-[#1e0a3c]", active: "bg-[#1e0a3c]" },
    border: "border-[#2a0e4e]",
    gradient: { from: "#0a0314", to: "#100520" },
  },
  neon: {
    background: { primary: "bg-[#100412]", secondary: "bg-[#200824]" },
    text: { primary: "text-pink-50", secondary: "text-pink-300/60" },
    button: { base: "bg-[#200824]", hover: "hover:bg-[#300c36]", active: "bg-[#300c36]" },
    border: "border-[#401048]",
    gradient: { from: "#100412", to: "#18061c" },
  },
  onyx: {
    background: { primary: "bg-[#000000]", secondary: "bg-[#0a0a0a]" },
    text: { primary: "text-gray-50", secondary: "text-gray-400/70" },
    button: { base: "bg-[#0a0a0a]", hover: "hover:bg-[#141414]", active: "bg-[#141414]" },
    border: "border-[#1f1f1f]",
    gradient: { from: "#000000", to: "#050505" },
  },
  pearl: {
    background: { primary: "bg-[#0c0c0b]", secondary: "bg-[#181816]" },
    text: { primary: "text-stone-50", secondary: "text-stone-400/70" },
    button: { base: "bg-[#181816]", hover: "hover:bg-[#242422]", active: "bg-[#242422]" },
    border: "border-[#353532]",
    gradient: { from: "#0c0c0b", to: "#121210" },
  },
  plasma: {
    background: { primary: "bg-[#0c0218]", secondary: "bg-[#180430]" },
    text: { primary: "text-purple-50", secondary: "text-purple-300/60" },
    button: { base: "bg-[#180430]", hover: "hover:bg-[#240645]", active: "bg-[#240645]" },
    border: "border-[#3d086b]",
    gradient: { from: "#0c0218", to: "#140328" },
  },
  prism: {
    background: { primary: "bg-[#021117]", secondary: "bg-[#04222e]" },
    text: { primary: "text-cyan-50", secondary: "text-cyan-300/60" },
    button: { base: "bg-[#04222e]", hover: "hover:bg-[#063648]", active: "bg-[#063648]" },
    border: "border-[#0a4a5e]",
    gradient: { from: "#021117", to: "#031a24" },
  },
  royal: {
    background: { primary: "bg-[#080414]", secondary: "bg-[#100828]" },
    text: { primary: "text-violet-50", secondary: "text-violet-300/60" },
    button: { base: "bg-[#100828]", hover: "hover:bg-[#180c3c]", active: "bg-[#180c3c]" },
    border: "border-[#20104a]",
    gradient: { from: "#080414", to: "#0c0620" },
  },
  ruby: {
    background: { primary: "bg-[#110306]", secondary: "bg-[#1c060c]" },
    text: { primary: "text-rose-50", secondary: "text-rose-300/60" },
    button: { base: "bg-[#1c060c]", hover: "hover:bg-[#2a0810]", active: "bg-[#2a0810]" },
    border: "border-[#3c0c14]",
    gradient: { from: "#110306", to: "#16040a" },
  },
  sapphire: {
    background: { primary: "bg-[#040c1a]", secondary: "bg-[#081833]" },
    text: { primary: "text-blue-50", secondary: "text-blue-300/60" },
    button: { base: "bg-[#081833]", hover: "hover:bg-[#0c2448]", active: "bg-[#0c2448]" },
    border: "border-[#153a5f]",
    gradient: { from: "#040c1a", to: "#06152e" },
  },
  shadow: {
    background: { primary: "bg-[#050505]", secondary: "bg-[#0d0d0d]" },
    text: { primary: "text-gray-50", secondary: "text-gray-400/70" },
    button: { base: "bg-[#0d0d0d]", hover: "hover:bg-[#151515]", active: "bg-[#151515]" },
    border: "border-[#1f1f1f]",
    gradient: { from: "#050505", to: "#0a0a0a" },
  },
  solar: {
    background: { primary: "bg-[#0f0a01]", secondary: "bg-[#1e1402]" },
    text: { primary: "text-yellow-50", secondary: "text-yellow-300/60" },
    button: { base: "bg-[#1e1402]", hover: "hover:bg-[#2d1e03]", active: "bg-[#2d1e03]" },
    border: "border-[#3d2804]",
    gradient: { from: "#0f0a01", to: "#181002" },
  },
  spectral: {
    background: { primary: "bg-[#051003]", secondary: "bg-[#0a2006]" },
    text: { primary: "text-lime-50", secondary: "text-lime-300/60" },
    button: { base: "bg-[#0a2006]", hover: "hover:bg-[#0e300a]", active: "bg-[#0e300a]" },
    border: "border-[#14400c]",
    gradient: { from: "#051003", to: "#081805" },
  },
  storm: {
    background: { primary: "bg-[#05080a]", secondary: "bg-[#0a1014]" },
    text: { primary: "text-slate-50", secondary: "text-slate-400/70" },
    button: { base: "bg-[#0a1014]", hover: "hover:bg-[#0e181e]", active: "bg-[#0e181e]" },
    border: "border-[#15202a]",
    gradient: { from: "#05080a", to: "#081014" },
  },
  sunset: {
    background: { primary: "bg-[#120602]", secondary: "bg-[#1f0c04]" },
    text: { primary: "text-orange-50", secondary: "text-orange-300/60" },
    button: { base: "bg-[#1f0c04]", hover: "hover:bg-[#2d1006]", active: "bg-[#2d1006]" },
    border: "border-[#3d1808]",
    gradient: { from: "#120602", to: "#180903" },
  },
  titanium: {
    background: { primary: "bg-[#070809]", secondary: "bg-[#0e1012]" },
    text: { primary: "text-slate-50", secondary: "text-slate-400/70" },
    button: { base: "bg-[#0e1012]", hover: "hover:bg-[#16181c]", active: "bg-[#16181c]" },
    border: "border-[#1f2228]",
    gradient: { from: "#070809", to: "#0a0c0e" },
  },
  violet: {
    background: { primary: "bg-[#080414]", secondary: "bg-[#100828]" },
    text: { primary: "text-violet-50", secondary: "text-violet-300/60" },
    button: { base: "bg-[#100828]", hover: "hover:bg-[#180c3c]", active: "bg-[#180c3c]" },
    border: "border-[#20104a]",
    gradient: { from: "#080414", to: "#0c0620" },
  },
  volcanic: {
    background: { primary: "bg-[#120602]", secondary: "bg-[#1f0c04]" },
    text: { primary: "text-orange-50", secondary: "text-orange-300/60" },
    button: { base: "bg-[#1f0c04]", hover: "hover:bg-[#2d1006]", active: "bg-[#2d1006]" },
    border: "border-[#3d1808]",
    gradient: { from: "#120602", to: "#180903" },
  },
  winter: {
    background: { primary: "bg-[#02020f]", secondary: "bg-[#04041e]" },
    text: { primary: "text-indigo-50", secondary: "text-indigo-300/60" },
    button: { base: "bg-[#04041e]", hover: "hover:bg-[#06062c]", active: "bg-[#06062c]" },
    border: "border-[#080835]",
    gradient: { from: "#02020f", to: "#030318" },
  },
  zenith: {
    background: { primary: "bg-[#0d0a00]", secondary: "bg-[#1a1400]" },
    text: { primary: "text-yellow-50", secondary: "text-yellow-300/60" },
    button: { base: "bg-[#1a1400]", hover: "hover:bg-[#261e00]", active: "bg-[#261e00]" },
    border: "border-[#352a00]",
    gradient: { from: "#0d0a00", to: "#141000" },
  },
});
