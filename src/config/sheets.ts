export const SHEET_ID = "1ox-qt2fNqSYlord98tRPTX7S5L4TlnwjVltQDPoo4R4";

export const SHEET_NAMES = {
  players: "Classement Joueurs 2025-26",
  calendar: "Calendrier/Résultats/Étoiles 2025-26",
  standings: "Classement Saison Régulière 2025-26",
} as const;

export const playerTabs = [
  { label: "Saison Régulière", range: "B2:I72" },
  { label: "Séries", range: "K2:R72" },
  { label: "Saison + Séries", range: "T2:AA72" },
  { label: "Pénalités", range: "AC2:AF72" },
  { label: "Joueurs étoiles", range: "AH2:AL72" },
  { label: "Gardiens", range: "AN2:AU72" },
  { label: "1997-1998", range: "AW2:BF307" },
  { label: "Moyenne pts/match", range: "BI2:BP17" },
];

export const calendarTabs = [
  { label: "Matchs", range: "B1:T37" },
  { label: "Étoiles", range: "U4:AA37" },
];
