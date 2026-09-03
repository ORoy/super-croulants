export const SHEET_ID = "1LqrFFgC07qJUDAzdAxxuujL8UgrC3Iq7s68a_ZvQSe4";

export const SHEET_NAMES = {
  players: "Données consolidés peu importe les échanges",
  playersAllTime: "Stats Joueurs Actifs et Retraités",
  calendar: "Calendrier/Résultats 2025-26",
  standings: "Classement Équipes 2025-26 LIVE",
  matchSheets: "Feuilles de match 2025-26",
} as const;

// A range plus the sheet tab it lives on (sheetName defaults to
// SHEET_NAMES.players when omitted, see sheetFetch.ts).
export interface SheetRange {
  range: string;
  sheetName?: string;
}

export const playerTabs: (SheetRange & { label: string })[] = [
  { label: "Saison Régulière", range: "AN2:AU72" },
  { label: "Séries", range: "BH2:BO72" },
  { label: "Saison + Séries", range: "CB2:CI72" },
  { label: "Pénalités", range: "CM2:CP72" },
  { label: "Joueurs étoiles", range: "CU2:CY72" },
  { label: "Gardiens", range: "T2:AA6" },
  { label: "1997-1998", range: "L2:V307", sheetName: SHEET_NAMES.playersAllTime },
];

export const calendarTabs: (SheetRange & { label: string })[] = [
  { label: "Matchs", range: "B1:AB37", sheetName: SHEET_NAMES.calendar },
  { label: "Étoiles", range: "U4:AA37", sheetName: SHEET_NAMES.calendar },
];

// One 20-row block per game (home team at columns A-Q, visiting team at the
// same layout shifted to CF-CV — see src/utils/liveMatches.ts). 1146 rows
// covers the sheet's full season + séries block count.
export const LIVE_MATCH_SHEET: SheetRange = { range: "E7:DB1146", sheetName: SHEET_NAMES.matchSheets };
