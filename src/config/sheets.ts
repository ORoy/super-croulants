export type Season = "2025-26" | "2026-27";

// 2026-27 is current/default; nav order shown in the season dropdown.
export const SEASONS: Season[] = ["2026-27", "2025-26"];
export const DEFAULT_SEASON: Season = "2026-27";

export const SEASON_SHEET_IDS: Record<Season, string> = {
  "2025-26": "1LqrFFgC07qJUDAzdAxxuujL8UgrC3Iq7s68a_ZvQSe4",
  "2026-27": "1zdsgL8FRMn951hB4zcAfvsZ0SE7P4soQHnTNac-hGto",
};

// These two tabs carry no season suffix — identical name in every season's
// workbook. Kept as plain literals (not season-templated) since callers rely
// on them as stable defaults; the spreadsheetId is what actually varies.
export const PLAYERS_SHEET_NAME = "Données consolidés peu importe les échanges";
export const PLAYERS_ALL_TIME_SHEET_NAME = "Stats Joueurs Actifs et Retraités";

const seasonSheetNames = (season: Season) => ({
  calendar: `Calendrier/Résultats ${season}`,
  standings: `Classement Équipes ${season} LIVE`,
  matchSheets: `Feuilles de match ${season}`,
});

// A range plus the sheet tab it lives on (sheetName defaults to
// PLAYERS_SHEET_NAME when omitted, see sheetFetch.ts).
export interface SheetRange {
  range: string;
  sheetName?: string;
}

// Unlike calendar/standings/match-sheet tabs, none of these carry a season
// suffix (see PLAYERS_SHEET_NAME/PLAYERS_ALL_TIME_SHEET_NAME above) — the
// range/sheetName pairs are identical across seasons, only spreadsheetId
// differs, so this stays a plain constant rather than a season-keyed function.
export const playerTabs: (SheetRange & { label: string })[] = [
  { label: "Saison Régulière", range: "AN2:AU72" },
  { label: "Séries", range: "BH2:BO72" },
  { label: "Saison + Séries", range: "CB2:CI72" },
  { label: "Pénalités", range: "CM2:CP72" },
  { label: "Joueurs étoiles", range: "CU2:CY72" },
  { label: "Gardiens", range: "T2:AA6" },
  { label: "1997-1998", range: "L2:V307", sheetName: PLAYERS_ALL_TIME_SHEET_NAME },
];

export const calendarTabs = (season: Season): (SheetRange & { label: string })[] => {
  const calendarSheetName = seasonSheetNames(season).calendar;
  return [
    { label: "Matchs", range: "B1:AB37", sheetName: calendarSheetName },
    { label: "Étoiles", range: "U4:AA37", sheetName: calendarSheetName },
  ];
};

export const standingsSheet = (season: Season): SheetRange => ({
  range: "A2:T22",
  sheetName: seasonSheetNames(season).standings,
});

// One 20-row block per game (home team at columns A-Q, visiting team at the
// same layout shifted to CF-CV — see src/utils/liveMatches.ts). Last row
// bound covers each season's full season + séries block count.
const MATCH_SHEET_LAST_ROW: Record<Season, number> = {
  "2025-26": 1146,
  "2026-27": 1140,
};

export const liveMatchSheet = (season: Season): SheetRange => ({
  range: `E7:DB${MATCH_SHEET_LAST_ROW[season]}`,
  sheetName: seasonSheetNames(season).matchSheets,
});
