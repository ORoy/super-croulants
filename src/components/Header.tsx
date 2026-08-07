import { useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { colors } from "../theme/tokens";
import { useIsMobile } from "../hooks/useIsMobile";

const NAV_ITEMS = [
  { label: "Standings", path: "/standings" },
  { label: "Leaderboard", path: "/leaderboard" },
  { label: "Teams", path: "/teams" },
  { label: "Calendar", path: "/calendar" },
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const showMobileNav = isMobile && mobileNavOpen;

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileNavOpen(false);
  };

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
          onClick={() => handleNavigate("/leaderboard")}
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
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.path}
                  style={isActive(item.path) ? TAB_ACTIVE : TAB_INACTIVE}
                  onClick={() => handleNavigate(item.path)}
                >
                  {item.label}
                </div>
              ))}
            </div>
            <div
              style={{
                marginLeft: "auto",
                fontSize: 13,
                color: colors.mutedText,
                border: "1px solid oklch(0.3 0.02 250)",
                borderRadius: 6,
                padding: "6px 12px",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              2025–26 Season
            </div>
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
          {NAV_ITEMS.map((item) => (
            <div
              key={item.path}
              style={isActive(item.path) ? TAB_ACTIVE_MOBILE : TAB_INACTIVE_MOBILE}
              onClick={() => handleNavigate(item.path)}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
