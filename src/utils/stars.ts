// Parsing for the "Étoiles" raw range: one row per game date, 3 star cells
// (columns 2, 4, 6), each a packed string like
// "  #21 Jean-Francois Bertrand                                  @ASSURANCIA".
export interface Star {
  star: number;
  number: string;
  name: string;
  team: string;
}

const STAR_CELL_PATTERN = /^\s*#(\d+)\s+(.+?)\s+@(.+?)\s*$/;
const STAR_CELL_COLUMNS = [2, 4, 6];

const parseStarCell = (cell: string | undefined): Omit<Star, "star"> | null => {
  const match = cell?.match(STAR_CELL_PATTERN);
  if (!match) {
    return null;
  }
  const [, number, name, team] = match;
  return { number, name: name.trim(), team: team.trim() };
};

// Matches are identified by date only (the sheet has no per-game id), so if
// two games share a date the same stars row is returned for both.
export const findStarsForDate = (rawRows: string[][], date: string): Star[] => {
  const row = rawRows.find(candidate => candidate[0]?.trim() === date);
  if (!row) {
    return [];
  }

  const stars: Star[] = [];
  STAR_CELL_COLUMNS.forEach((column, index) => {
    const parsed = parseStarCell(row[column]);
    if (parsed) {
      stars.push({ star: index + 1, ...parsed });
    }
  });
  return stars;
};
