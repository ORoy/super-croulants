import type { CSSProperties, ReactNode } from "react";
import { colors } from "../theme/tokens";

interface StatCardProps {
  label: string;
  value: ReactNode;
  highlight?: boolean;
  align?: CSSProperties["textAlign"];
  padding?: number;
  valueFontSize?: number;
}

export default function StatCard({
  label,
  value,
  highlight = false,
  align = "center",
  padding = 14,
  valueFontSize = 24,
}: StatCardProps) {
  return (
    <div
      style={{
        background: colors.cardBackground,
        border: `1px solid ${highlight ? colors.accent : colors.border}`,
        borderRadius: 10,
        padding,
        textAlign: align,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: colors.mutedText,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: valueFontSize,
          fontWeight: 800,
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}
