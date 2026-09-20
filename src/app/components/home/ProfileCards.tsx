import { useProfileStore } from "../../../stores/profile";
import { useUserStore } from "../../../stores/user";
import { Config } from "../../../config";

const DEFAULT_SKIN = "cid_001_athena_commando_f_default";

function card(extra?: React.CSSProperties): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--surface-soft)",
    padding: "10px 14px",
    overflow: "hidden",
    minWidth: 0,
    ...extra,
  };
}

function label(style?: React.CSSProperties): React.CSSProperties {
  return { fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500, lineHeight: 1, ...style };
}

function value(style?: React.CSSProperties): React.CSSProperties {
  return { fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.15, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...style };
}

function GreetingCard() {
  const favoriteCharacter = useProfileStore((s) => s.getFavoriteCharacter()) || DEFAULT_SKIN;
  const displayName       = useUserStore((s) => s.displayName) ?? "Player";

  const cleanCid = favoriteCharacter.includes(":") ? favoriteCharacter.split(":")[1] : favoriteCharacter;
  const iconUrl  = `https://fortnite-api.com/images/cosmetics/br/${cleanCid.toLowerCase()}/icon.png`;

  return (
    <div style={card()}>
      <img
        src={iconUrl}
        alt={cleanCid}
        onError={(e) => { (e.target as HTMLImageElement).src = `https://fortnite-api.com/images/cosmetics/br/${DEFAULT_SKIN}/icon.png`; }}
        style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
        draggable={false}
      />
      <div style={{ minWidth: 0 }}>
        <p style={label()}>Welcome back</p>
        <p style={value()}>{displayName}</p>
      </div>
    </div>
  );
}

function TierCard() {
  const tier = useProfileStore((s) => s.profiles?.athena?.stats?.attributes?.level) ?? 0;

  return (
    <div style={card({
      background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 52%, var(--surface)), color-mix(in srgb, var(--accent) 28%, var(--surface)))",
      border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
    })}>
      <img
        src={Config.IMAGES.BATTLE_PASS_ICON}
        style={{ width: 38, height: 38, objectFit: "contain", flexShrink: 0 }}
        draggable={false}
      />
      <div style={{ minWidth: 0 }}>
        <p style={label({ color: "rgba(255,255,255,0.55)" })}>Battle Pass</p>
        <p style={value()}>Tier {tier.toLocaleString()}</p>
      </div>
    </div>
  );
}

function VbucksCard() {
  const vbucks = useProfileStore((s) =>
    s.profiles?.common_core?.items?.["Currency:MtxPurchased"]?.quantity
  ) ?? 0;

  return (
    <div style={card({
      background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 68%, var(--surface)), color-mix(in srgb, var(--accent) 38%, var(--surface)))",
      border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)",
    })}>
      <img
        src={Config.IMAGES.VBUCKS_ICON}
        alt="V-Bucks"
        style={{ width: 38, height: 38, objectFit: "contain", flexShrink: 0 }}
        draggable={false}
      />
      <div style={{ minWidth: 0 }}>
        <p style={label({ color: "rgba(255,255,255,0.55)" })}>V-Bucks</p>
        <p style={value()}>{vbucks.toLocaleString()}</p>
      </div>
    </div>
  );
}

export function ProfileCardsRow() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
      <GreetingCard />
      <TierCard />
      <VbucksCard />
    </div>
  );
}
