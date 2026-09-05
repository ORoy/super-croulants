// Centralized dark-theme color tokens, shared by the header/nav shell and
// every rebuilt page view. Keep in sync with src/index.css.
export const colors = {
  background: "oklch(0.14 0.02 250)",
  cardBackground: "oklch(0.18 0.02 250)",
  border: "oklch(0.27 0.02 250)",
  mutedText: "oklch(0.68 0.02 250)",
  subtleText: "oklch(0.55 0.02 250)",
  primaryText: "oklch(0.95 0.01 250)",
  accent: "#B08A4E",
  positive: "oklch(0.7 0.14 150)",
  error: "oklch(0.65 0.16 25)",
} as const;
