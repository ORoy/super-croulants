import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { colors } from "../theme/tokens";
import { useIsMobile } from "../hooks/useIsMobile";
import { useSeason } from "../hooks/useSeason";
import { SEASONS, DEFAULT_SEASON, type Season } from "../config/sheets";

const NAV_ITEMS = [
  { label: "Classement", path: "standings" },
  { label: "Joueurs", path: "leaderboard" },
  { label: "Équipes", path: "teams" },
  { label: "Calendrier", path: "calendar" },
  { label: "En direct", path: "live", liveOnly: true },
];

const TAB_BASE: CSSProperties = {
  padding: "8px 16px",
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 15,
  fontWeight: 600,
  borderRadius: 6,
  cursor: "pointer",
  letterSpacing: "0.3px",
  whiteSpace: "nowrap",
};

const TAB_INACTIVE: CSSProperties = { ...TAB_BASE, color: "oklch(0.75 0.02 250)" };
const TAB_ACTIVE: CSSProperties = { ...TAB_BASE, background: colors.accent, color: "#12181e" };

const TAB_BASE_MOBILE: CSSProperties = {
  padding: "12px 16px",
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 16,
  fontWeight: 600,
  borderRadius: 8,
  cursor: "pointer",
  letterSpacing: "0.3px",
  minHeight: 44,
  display: "flex",
  alignItems: "center",
};

const TAB_INACTIVE_MOBILE: CSSProperties = { ...TAB_BASE_MOBILE, color: "oklch(0.75 0.02 250)" };
const TAB_ACTIVE_MOBILE: CSSProperties = {
  ...TAB_BASE_MOBILE,
  background: colors.accent,
  color: "#12181e",
};

const seasonTagLabel = (s: Season): string => (s === DEFAULT_SEASON ? "En cours" : "Terminée");

const seasonRowStyle = (selected: boolean): CSSProperties =>
  selected
    ? {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "9px 12px",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        background: "oklch(0.24 0.02 250)",
      }
    : {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "9px 12px",
        cursor: "pointer",
        fontSize: 13,
        color: "oklch(0.8 0.02 250)",
      };

const logoStyle: CSSProperties = {
  width: 38,
  height: 38,
  flexShrink: 0,
  border: `2px solid ${colors.accent}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { season } = useSeason();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const seasonPickerRef = useRef<HTMLDivElement>(null);
  const showMobileNav = isMobile && mobileNavOpen;

  const visibleNavItems = NAV_ITEMS.filter(item => !item.liveOnly || season === DEFAULT_SEASON);

  const isActive = (path: string) => location.pathname.startsWith(`/${season}/${path}`);

  const handleNavigate = (path: string) => {
    navigate(`/${season}/${path}`);
    setMobileNavOpen(false);
  };

  const handleSeasonChange = (newSeason: Season) => {
    const [, , ...rest] = location.pathname.split("/");
    const restPath = rest.join("/") || "leaderboard";
    const target = restPath.startsWith("live") && newSeason !== DEFAULT_SEASON ? "leaderboard" : restPath;
    navigate(`/${newSeason}/${target}`);
    setSeasonOpen(false);
    setMobileNavOpen(false);
  };

  useEffect(() => {
    if (!seasonOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!seasonPickerRef.current?.contains(e.target as Node)) {
        setSeasonOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [seasonOpen]);

  const seasonPickerDesktop = (
    <div ref={seasonPickerRef} style={{ marginLeft: "auto", position: "relative", flexShrink: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          color: "oklch(0.85 0.02 250)",
          border: "1px solid oklch(0.3 0.02 250)",
          borderRadius: 6,
          padding: "6px 12px",
          whiteSpace: "nowrap",
          cursor: "pointer",
        }}
        onClick={() => setSeasonOpen(open => !open)}
      >
        <span style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.62 0.02 250)" }}>
          Saison
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "oklch(0.85 0.02 250)" }}>{season}</span>
        <span style={{ fontSize: 9, color: "oklch(0.62 0.02 250)" }}>▼</span>
      </div>
      {seasonOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            minWidth: 190,
            background: "oklch(0.19 0.02 250)",
            border: "1px solid oklch(0.32 0.02 250)",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 14px 34px rgba(0,0,0,0.45)",
            zIndex: 20,
          }}
        >
          {SEASONS.map(s => (
            <div key={s} style={seasonRowStyle(s === season)} onClick={() => handleSeasonChange(s)}>
              <span>Saison {s}</span>
              <span style={{ fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "oklch(0.6 0.02 250)" }}>
                {seasonTagLabel(s)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const seasonPickerMobile = (
    <div style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid oklch(0.26 0.02 250)" }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "oklch(0.62 0.02 250)",
          marginBottom: 6,
        }}
      >
        Saison
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {SEASONS.map(s => (
          <div
            key={s}
            style={{
              ...seasonRowStyle(s === season),
              border: "1px solid oklch(0.3 0.02 250)",
              borderRadius: 8,
              minHeight: 44,
            }}
            onClick={() => handleSeasonChange(s)}
          >
            <span>Saison {s}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "oklch(0.16 0.02 250)",
        borderBottom: "1px solid oklch(0.28 0.02 250)",
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "12px clamp(14px,4vw,28px)",
          display: "flex",
          alignItems: "center",
          gap: "clamp(10px,2vw,28px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            minWidth: 0,
            cursor: "pointer",
          }}
          onClick={() => handleNavigate("leaderboard")}
        >
          <div style={logoStyle}>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: 16,
                color: colors.accent,
                letterSpacing: "0.5px",
              }}
            >
              SC
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(17px,4.5vw,22px)",
                fontWeight: 800,
                letterSpacing: "0.5px",
                lineHeight: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              SUPER CROULANTS
            </div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "2px",
                color: colors.mutedText,
                textTransform: "uppercase",
              }}
            >
              Ils sont supers et croulants
            </div>
          </div>
        </div>

        {isMobile ? (
          <div
            role="button"
            aria-label="Toggle navigation menu"
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              border: "1px solid oklch(0.3 0.02 250)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              cursor: "pointer",
              flexDirection: "column",
              gap: 4,
            }}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <div style={{ width: 18, height: 2, background: "oklch(0.9 0.01 250)" }} />
            <div style={{ width: 18, height: 2, background: "oklch(0.9 0.01 250)" }} />
            <div style={{ width: 18, height: 2, background: "oklch(0.9 0.01 250)" }} />
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {visibleNavItems.map((item) => (
                <div
                  key={item.path}
                  style={isActive(item.path) ? TAB_ACTIVE : TAB_INACTIVE}
                  onClick={() => handleNavigate(item.path)}
                >
                  {item.label}
                </div>
              ))}
            </div>
            {seasonPickerDesktop}
          </>
        )}
      </div>

      {showMobileNav && (
        <div
          style={{
            borderTop: "1px solid oklch(0.28 0.02 250)",
            padding: "8px clamp(14px,4vw,28px) 14px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {visibleNavItems.map((item) => (
            <div
              key={item.path}
              style={isActive(item.path) ? TAB_ACTIVE_MOBILE : TAB_INACTIVE_MOBILE}
              onClick={() => handleNavigate(item.path)}
            >
              {item.label}
            </div>
          ))}
          {seasonPickerMobile}
        </div>
      )}
    </div>
  );
}
