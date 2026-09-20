"use client";

import { Home, Library, Settings, ShoppingCart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useConfigStore } from "../../stores/settings";

type NavItem = {
  id: string;
  path: string;
  icon: typeof Home;
  label: string;
};

const ALL_ITEMS: NavItem[] = [
  { id: "home",     path: "/",         icon: Home,         label: "Home"      },
  { id: "library",  path: "/library",  icon: Library,      label: "Library"   },
  { id: "shop",     path: "/shop",     icon: ShoppingCart, label: "Shop"      },
  { id: "settings", path: "/settings", icon: Settings,     label: "Settings"  },
];

export function Sidebar({ style }: { style?: React.CSSProperties }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const minimized = useConfigStore((s) => s.minimizeSidebar);
  const position  = useConfigStore((s) => s.sidebarPosition);
  const size      = useConfigStore((s) => s.sidebarSize);
  const frameH    = useConfigStore((s) => s.frameHeight ?? 32);

  const isH      = position === "top" || position === "bottom";
  const isV      = position === "left" || position === "right";
  const iconOnly = minimized && isV;
  const narrow   = isV && size < 140;
  const effSize  = iconOnly ? 52 : size;

  const ACCENT_GLOW = "rgba(122, 162, 247, 0.4)";

  function isActive(path: string) {
    return path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
  }

  function NavBtn({ item }: { item: NavItem }) {
    const active = isActive(item.path);
    const Icon   = item.icon;

    const baseStyles = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 600,
      lineHeight: 1,
      whiteSpace: "nowrap",
      cursor: "pointer",
      border: "none",
      outline: "none",
      transition: "all 180ms cubic-bezier(0.4, 0, 0.2, 1)",
    } as React.CSSProperties;

    if (isH) {
      // Horizontal floating pill
      return (
        <button
          onClick={() => navigate(item.path)}
          aria-label={item.label}
          style={{
            ...baseStyles,
            height: 36,
            padding: "0 14px",
            color: active ? "#fff" : "rgba(255,255,255,0.45)",
            background: active 
              ? "linear-gradient(135deg, rgba(122,162,247,0.25) 0%, rgba(122,162,247,0.15) 100%)" 
              : "transparent",
            boxShadow: active ? `0 0 16px ${ACCENT_GLOW}, inset 0 1px 0 rgba(255,255,255,0.08)` : "none",
            transform: active ? "scale(1.02)" : "scale(1)",
          }}
        >
          <Icon size={16} style={{ flexShrink: 0, strokeWidth: active ? 2.2 : 1.8 }} />
          {!iconOnly && <span>{item.label}</span>}
        </button>
      );
    }

    if (iconOnly || narrow) {
      return (
        <button
          onClick={() => navigate(item.path)}
          aria-label={item.label}
          title={item.label}
          style={{
            ...baseStyles,
            width: "100%",
            height: 40,
            padding: "0 12px",
            justifyContent: "center",
            color: active ? "#fff" : "rgba(255,255,255,0.55)",
            background: active 
              ? "linear-gradient(135deg, rgba(122,162,247,0.25) 0%, rgba(122,162,247,0.15) 100%)" 
              : "transparent",
            boxShadow: active ? `0 0 16px ${ACCENT_GLOW}, inset 0 1px 0 rgba(255,255,255,0.08)` : "none",
          }}
        >
          <Icon size={18} style={{ strokeWidth: active ? 2.2 : 1.8 }} />
        </button>
      );
    }

    // Full label vertical
    return (
      <button
        onClick={() => navigate(item.path)}
        aria-label={item.label}
        style={{
          ...baseStyles,
          width: "100%",
          padding: "0 14px",
          height: 42,
          color: active ? "#fff" : "rgba(255,255,255,0.65)",
          background: active 
            ? "linear-gradient(135deg, rgba(122,162,247,0.25) 0%, rgba(122,162,247,0.15) 100%)" 
            : "transparent",
          boxShadow: active ? `0 0 16px ${ACCENT_GLOW}, inset 0 1px 0 rgba(255,255,255,0.08)` : "none",
          textAlign: "left",
        }}
      >
        <Icon size={17} style={{ flexShrink: 0, strokeWidth: active ? 2.2 : 1.8 }} />
        <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
      </button>
    );
  }

  // Pill container styles
  const pillWidth = isH ? "auto" : effSize;
  const pillHeight = isH ? 48 : "calc(100% - " + frameH + "px)";
  const pillTop = isH ? (position === "top" ? frameH : undefined) : frameH;
  const pillBottom = isH ? (position === "bottom" ? 0 : undefined) : 0;
  const pillLeft = !isH && position === "left" ? 8 : undefined;
  const pillRight = !isH && position === "right" ? 8 : undefined;

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: pillTop,
    bottom: pillBottom,
    left: pillLeft,
    right: pillRight,
    width: pillWidth,
    height: pillHeight,
    zIndex: 40,
    pointerEvents: "none",
    ...style,
  };

  const pillStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isH ? "row" : "column",
    alignItems: "center",
    justifyContent: isH ? "center" : "space-between",
    gap: isH ? 6 : 8,
    padding: isH ? "6px 10px" : "8px 8px",
    width: "100%",
    height: "100%",
    borderRadius: isH ? 16 : 14,
    background: "rgba(13, 13, 18, 0.9)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
    pointerEvents: "auto",
    transition: "width 200ms cubic-bezier(0.4, 0, 0.2, 1), height 200ms cubic-bezier(0.4, 0, 0.2, 1), background 300ms ease, border-color 300ms ease",
    overflow: "hidden",
  };

  if (isH) {
    return (
      <aside style={{ ...containerStyle, ...style }}>
        <nav style={{ ...pillStyle, flexDirection: "row", justifyContent: "center", padding: "6px 16px", gap: 4, borderRadius: 16 }}>
          {ALL_ITEMS.filter((i) => i.id !== "settings").map((item) => (
            <NavBtn key={item.id} item={item} />
          ))}
          <div style={{ 
            width: 1, 
            height: "60%", 
            background: "rgba(255, 255, 255, 0.06)",
            margin: "0 8px",
            alignSelf: "center",
          }} />
          {ALL_ITEMS.filter((i) => i.id === "settings").map((item) => (
            <NavBtn key={item.id} item={item} />
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside style={{ ...containerStyle, ...style }}>
      <div style={{ ...pillStyle, flexDirection: "column", justifyContent: "space-between", padding: "8px 8px", gap: 16 }}>
        <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {ALL_ITEMS.filter((i) => i.id !== "settings").map((item) => (
            <NavBtn key={item.id} item={item} />
          ))}
        </nav>
        <div style={{ 
          width: "100%", 
          height: 1, 
          background: "rgba(255, 255, 255, 0.04)",
          margin: "4px 0",
        }} />
        <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {ALL_ITEMS.filter((i) => i.id === "settings").map((item) => (
            <NavBtn key={item.id} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}