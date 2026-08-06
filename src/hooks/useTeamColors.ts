import { useMemo } from "react";
import { useSheetData } from "./useSheetData";
import { SHEET_NAMES, teamColorsRange } from "../config/sheets";

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
  const { data, loading, error } = useSheetData(teamColorsRange, SHEET_NAMES.teamColors);

  const colorsByTeam = useMemo(() => {
    const map = new Map<string, TeamColor>();
    for (const row of data) {
      const name = row["Équipe"];
      if (!name) continue;
      map.set(name.toLowerCase(), {
        background: row["Couleur Fond"] ?? "",
        text: row["Couleur text"] ?? "",
      });
    }
    return map;
  }, [data]);

  const getTeamColor = (teamName: string): TeamColor | undefined =>
    colorsByTeam.get(teamName.toLowerCase());

  return { getTeamColor, loading, error };
}
