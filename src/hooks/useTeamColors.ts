import { normalizeForComparison } from "../utils/textMatch";

export interface TeamColor {
  background: string;
  text: string;
}

interface UseTeamColorsResult {
  getTeamColor: (teamName: string) => TeamColor | undefined;
  loading: boolean;
  error: string | null;
}

// Hardcoded rather than sheet-driven (was `BD Site WEB`) — team colors are
// shared/global across seasons and change rarely. Add a new team here.
// Team names ("Red Storm") don't match the standings/roster sheets' casing
// ("RED STORM"), so lookups are case-insensitive.
const TEAM_COLORS: Record<string, TeamColor> = {
  [normalizeForComparison("Blaxton")]: { background: "#ffffff", text: "#000000" },
  [normalizeForComparison("Assurancia")]: { background: "#000000", text: "#ffffff" },
  [normalizeForComparison("Gourmet")]: { background: "#f5f10a", text: "#000000" },
  [normalizeForComparison("Red Storm")]: { background: "#d40202", text: "#000000" },
};

export function useTeamColors(): UseTeamColorsResult {
  const getTeamColor = (teamName: string): TeamColor | undefined =>
    TEAM_COLORS[normalizeForComparison(teamName)];

  return { getTeamColor, loading: false, error: null };
}
