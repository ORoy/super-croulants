// Shared parsing for the Calendar's "Matchs" raw range, packed two games per
// source row. Used by both Calendar.tsx (list) and MatchDetail.tsx (single
// match lookup by id) so the id scheme and field layout stay in one place.
const MATCH_COLUMNS = 10;

export interface Match {
  id: string;
  date: string;
  awayTeam: string;
  awayScore: number | null;
  homeTeam: string;
  homeScore: number | null;
  played: boolean;
  status: string;
  resultLabel: string;
}

const parseScore = (value: string | undefined): number | null => {
  const trimmed = value?.trim() ?? "";
  if (trimmed === "" || trimmed === "--" || trimmed === "----") {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

// Each game block has a fixed 10-column layout:
// [phase, date, heure, ptsFS visiteur, buts visiteur, visiteurs, "@", local, buts local, ptsFS local]
const buildMatch = (values: string[], id: string): Match | null => {
  const date = values[1]?.trim() ?? "";
  const awayTeam = values[5]?.trim() ?? "";
  const homeTeam = values[7]?.trim() ?? "";

  if (!date || date === "----" || !awayTeam || !homeTeam) {
    return null;
  }

  const awayScore = parseScore(values[4]);
  const homeScore = parseScore(values[8]);
  const played = awayScore !== null && homeScore !== null;

  return {
    id,
    date,
    awayTeam,
    awayScore,
    homeTeam,
    homeScore,
    played,
    status: played ? "Final" : "À venir",
    resultLabel: played ? `${awayScore} – ${homeScore}` : "vs",
  };
};

// Parse the raw sheet where each source row contains two games:
// first game in columns 0..9 and second game in columns 10..18.
export const transformMatches = (rawRows: string[][]): Match[] => {
  if (rawRows.length === 0) {
    return [];
  }

  const headerRowIndex = rawRows.findIndex(
    row => row[0] === "Calendrier" && row[1] === "Date"
  );

  if (headerRowIndex === -1) {
    return [];
  }

  const matches: Match[] = [];

  for (let rowIndex = headerRowIndex + 1; rowIndex < rawRows.length; rowIndex++) {
    const source = rawRows[rowIndex] ?? [];

    const firstGameValues = source.slice(0, MATCH_COLUMNS);
    // Second game shares the first game's phase (column 0), then continues at column 10.
    const secondGameValues = [source[0] ?? "", ...source.slice(10, 19)];

    const firstMatch = buildMatch(firstGameValues, `${rowIndex}-1`);
    if (firstMatch) {
      matches.push(firstMatch);
    }

    const secondMatch = buildMatch(secondGameValues, `${rowIndex}-2`);
    if (secondMatch) {
      matches.push(secondMatch);
    }
  }

  return matches;
};
