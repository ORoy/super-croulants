import type { CSSProperties } from "react";
import { colors } from "../theme/tokens";
import { getTeamInitials } from "../utils/teamInitials";
import type { TeamColor } from "../hooks/useTeamColors";

interface TeamLogoProps {
  teamName: string;
  color?: TeamColor;
  size: number;
  radius?: number;
}

export default function TeamLogo({ teamName, color, size, radius = 8 }: TeamLogoProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: radius,
    flexShrink: 0,
    background: color?.background || colors.border,
    border: `2px solid ${color?.text || colors.mutedText}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={style}>
      <span
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: Math.round(size * 0.42),
          lineHeight: 1,
          color: color?.text || colors.primaryText,
          letterSpacing: "0.5px",
        }}
      >
        {getTeamInitials(teamName)}
      </span>
    </div>
  );
}
