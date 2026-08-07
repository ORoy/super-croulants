import { SHEET_NAMES, type SheetRange } from "../config/sheets";

// Shared parsing for the "Classement Saison Régulière" sheet tab, which packs
// three team tables (Overall, Séries, Saison Régulière) into one range, each
// with its own 2-row header block. Used by both the Standings and Teams
// views so the team list/rank/record stay derived from a single source.
export const STANDINGS_SHEET: SheetRange = { range: "A1:T22", sheetName: SHEET_NAMES.standings };

export const SECTION_TITLES = {
  overall: "SAISON RÉGULIÈRE + SÉRIES ÉLIMINATOIRES",
  series: "SÉRIES ÉLIMINATOIRES",
  regular: "SAISON RÉGULIÈRE",
} as const;

// Column indices within a team row (columns A onward). The sheet also has
// 4 "V" (wins vs. each team, self shown as "---") columns after the total
// wins column, plus periods (G/P/N), PBC and Total columns we don't surface.
const COL = {
  rank: 0,
  team: 1,
  gp: 2,
  wins: 3,
  losses: 8,
  otl: 9,
  gf: 10,
  ga: 11,
  diff: 12,
  pts: 16,
} as const;

export interface TeamStanding {
  rank: string;
  team: string;
  gp: number;
  w: number;
  l: number;
  otl: number;
  pts: number;
  gf: number;
  ga: number;
  diff: number;
}

const parseNumber = (value: string | undefined): number => {
  const parsed = Number(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
};

export const parseStandingsSection = (rawRows: string[][], title: string): TeamStanding[] => {
  const titleIndex = rawRows.findIndex(row => row.some(cell => cell === title));
  if (titleIndex === -1) {
    return [];
  }

  const teams: TeamStanding[] = [];
  // title row, then a grouped-label row, then the column-header row.
  let rowIndex = titleIndex + 3;

  while (rowIndex < rawRows.length) {
    const row = rawRows[rowIndex];
    const rank = row?.[COL.rank];
    if (!rank || Number.isNaN(Number(rank))) {
      break;
    }

    teams.push({
      rank,
      team: row[COL.team] ?? "",
      gp: parseNumber(row[COL.gp]),
      w: parseNumber(row[COL.wins]),
      l: parseNumber(row[COL.losses]),
      otl: parseNumber(row[COL.otl]),
      gf: parseNumber(row[COL.gf]),
      ga: parseNumber(row[COL.ga]),
      diff: parseNumber(row[COL.diff]),
      pts: parseNumber(row[COL.pts]),
    });
    rowIndex++;
  }

  return teams;
};
