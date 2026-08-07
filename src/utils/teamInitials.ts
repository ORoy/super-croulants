import { normalizeForComparison } from "./textMatch";

// Curated marks matching the design system's "Team Logos" board — not
// derivable from the team names alone (e.g. Blaxton -> "BX", not "BL").
const TEAM_INITIALS: Record<string, string> = {
  "RED STORM": "RS",
  "BLAXTON": "BX",
  "ASSURANCIA": "AS",
  "GOURMET": "GM",
};

const deriveInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
};

export const getTeamInitials = (teamName: string): string =>
  TEAM_INITIALS[normalizeForComparison(teamName)] ?? deriveInitials(teamName);
