import { useMemo } from "react";
import { useSheetData } from "./useSheetData";
import { TEAM_COLORS_SHEET } from "../config/sheets";
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

// `BD Site WEB` team names ("Red Storm") don't match the standings/roster
// sheets' casing ("RED STORM"), so lookups are case-insensitive.
export function useTeamColors(): UseTeamColorsResult {
  const { data, loading, error } = useSheetData(TEAM_COLORS_SHEET);

  const colorsByTeam = useMemo(() => {
    const map = new Map<string, TeamColor>();
    for (const row of data) {
      const name = row["Équipe"];
      if (!name) continue;
      map.set(normalizeForComparison(name), {
        background: row["Couleur Fond"] ?? "",
        text: row["Couleur text"] ?? "",
      });
    }
    return map;
  }, [data]);

  const getTeamColor = (teamName: string): TeamColor | undefined =>
    colorsByTeam.get(normalizeForComparison(teamName));

  return { getTeamColor, loading, error };
}
