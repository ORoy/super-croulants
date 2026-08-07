export const SHEET_ID = "1ox-qt2fNqSYlord98tRPTX7S5L4TlnwjVltQDPoo4R4";

export const SHEET_NAMES = {
  players: "Classement Joueurs 2025-26",
  calendar: "Calendrier/Résultats/Étoiles 2025-26",
  standings: "Classement Saison Régulière 2025-26",
  teamColors: "BD Site WEB",
} as const;

// A range plus the sheet tab it lives on (sheetName defaults to
// SHEET_NAMES.players when omitted, see sheetFetch.ts).
export interface SheetRange {
  range: string;
  sheetName?: string;
}

// Équipe, Couleur Fond, Couleur text — 4 rows, one per team.
export const TEAM_COLORS_SHEET: SheetRange = { range: "A1:C5", sheetName: SHEET_NAMES.teamColors };

export const playerTabs: (SheetRange & { label: string })[] = [
  { label: "Saison Régulière", range: "B2:I72" },
  { label: "Séries", range: "K2:R72" },
  { label: "Saison + Séries", range: "T2:AA72" },
  { label: "Pénalités", range: "AC2:AF72" },
  { label: "Joueurs étoiles", range: "AH2:AL72" },
  { label: "Gardiens", range: "AN2:AU72" },
  { label: "1997-1998", range: "AW2:BF307" },
  { label: "Moyenne pts/match", range: "BI2:BP17" },
];

export const calendarTabs: (SheetRange & { label: string })[] = [
  { label: "Matchs", range: "B1:T37", sheetName: SHEET_NAMES.calendar },
  { label: "Étoiles", range: "U4:AA37", sheetName: SHEET_NAMES.calendar },
];
