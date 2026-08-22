// Parses "Feuilles de match" — a per-game scoresheet layout, one 20-row
// block per game. Each block holds two team sub-blocks side by side: the
// home team at column offset 0, the visiting team at column offset 83
// (same internal layout, just shifted right). Column offsets below were
// pinned down against real season data (see ticket 08), not guessed:
// row 1 = "Date:"/date, row 2 = "Heure:"/time + shots-on-goal totals,
// row 3 = team name, rows 6-19 = one player per row (lineup, and — only on
// rows where they occurred — that player's penalty and/or goal).
const BLOCK_ROWS = 20;
const VISITOR_COL_OFFSET = 83;
const PLAYER_ROW_START = 5;
const PLAYER_ROW_END = 19; // exclusive

const TEAM_NAME_ROW = 2;
const SHOTS_ROW = 1;
const SHOTS_PERIOD_COLS = [13, 14, 15] as const;
const SHOTS_TOTAL_COL = 16;

const PENALTY_NUMBER_COL = 0;
const PENALTY_PERIOD_COL = 1;
const PENALTY_TIME_COL = 2;
const PENALTY_INFRACTION_COL = 3;

const LINEUP_NUMBER_COL = 5;
const LINEUP_NAME_COL = 6;

const GOAL_PERIOD_COL = 12;
const GOAL_TIME_COL = 13;
const GOAL_SCORER_COL = 14;
const GOAL_ASSIST_COLS = [15, 16] as const;

export interface LiveGoal {
  period: number;
  time: string;
  scorerNumber: string;
  assistNumbers: string[];
}

export interface LivePenalty {
  playerNumber: string;
  period: number;
  time: string;
  infraction: string;
}

export interface LiveTeam {
  name: string;
  shotsByPeriod: [string, string, string];
  shotsTotal: string;
  goals: LiveGoal[];
  penalties: LivePenalty[];
  roster: Map<string, string>;
}

export interface LiveStandout {
  name: string;
  teamName: string;
  goals: number;
  assists: number;
}

export interface LiveGame {
  id: string;
  date: string;
  time: string;
  away: LiveTeam;
  home: LiveTeam;
  awayScore: number;
  homeScore: number;
  period: number | null;
  isInProgress: boolean;
  isFinished: boolean;
}

const cellAt = (block: string[][], row: number, colOffset: number, col: number): string =>
  (block[row]?.[colOffset + col] ?? "").trim();

const parseTeamBlock = (block: string[][], colOffset: number): LiveTeam => {
  const name = cellAt(block, TEAM_NAME_ROW, colOffset, 0);
  const shotsByPeriod = SHOTS_PERIOD_COLS.map(col => cellAt(block, SHOTS_ROW, colOffset, col)) as [
    string,
    string,
    string
  ];
  const shotsTotal = cellAt(block, SHOTS_ROW, colOffset, SHOTS_TOTAL_COL);

  const roster = new Map<string, string>();
  const goals: LiveGoal[] = [];
  const penalties: LivePenalty[] = [];

  for (let row = PLAYER_ROW_START; row < PLAYER_ROW_END; row++) {
    const playerNumber = cellAt(block, row, colOffset, LINEUP_NUMBER_COL);
    const playerName = cellAt(block, row, colOffset, LINEUP_NAME_COL);
    if (playerNumber && playerName) {
      roster.set(playerNumber, playerName);
    }

    const infraction = cellAt(block, row, colOffset, PENALTY_INFRACTION_COL);
    if (infraction) {
      penalties.push({
        playerNumber: cellAt(block, row, colOffset, PENALTY_NUMBER_COL),
        period: Number(cellAt(block, row, colOffset, PENALTY_PERIOD_COL)) || 0,
        time: cellAt(block, row, colOffset, PENALTY_TIME_COL),
        infraction,
      });
    }

    const goalPeriod = cellAt(block, row, colOffset, GOAL_PERIOD_COL);
    if (goalPeriod) {
      goals.push({
        period: Number(goalPeriod) || 0,
        time: cellAt(block, row, colOffset, GOAL_TIME_COL),
        scorerNumber: cellAt(block, row, colOffset, GOAL_SCORER_COL),
        assistNumbers: GOAL_ASSIST_COLS.map(col => cellAt(block, row, colOffset, col)).filter(Boolean),
      });
    }
  }

  return { name, shotsByPeriod, shotsTotal, goals, penalties, roster };
};

// The latest period with any logged activity — the sheet has no live clock,
// only period-anchored event timestamps (see ticket 08).
const currentPeriod = (home: LiveTeam, away: LiveTeam): number | null => {
  let latest = 0;
  for (const period of [1, 2, 3]) {
    const idx = period - 1;
    const hasActivity =
      home.shotsByPeriod[idx] !== "" ||
      away.shotsByPeriod[idx] !== "" ||
      home.goals.some(g => g.period === period) ||
      away.goals.some(g => g.period === period) ||
      home.penalties.some(p => p.period === period) ||
      away.penalties.some(p => p.period === period);
    if (hasActivity) latest = period;
  }
  return latest || null;
};

export const parseLiveGames = (rows: string[][]): LiveGame[] => {
  const games: LiveGame[] = [];

  for (let start = 0; start + BLOCK_ROWS <= rows.length; start += BLOCK_ROWS) {
    const block = rows.slice(start, start + BLOCK_ROWS);
    const date = cellAt(block, 0, 0, 1);
    if (!date) continue;

    const home = parseTeamBlock(block, 0);
    const away = parseTeamBlock(block, VISITOR_COL_OFFSET);
    if (!home.name || !away.name) continue;

    const time = cellAt(block, 1, 0, 1);

    // Confirmed done-signal: period-3 shots-on-goal filled in for both teams.
    const isFinished = home.shotsByPeriod[2] !== "" && away.shotsByPeriod[2] !== "";
    const hasStarted =
      home.shotsByPeriod[0] !== "" ||
      away.shotsByPeriod[0] !== "" ||
      home.goals.length > 0 ||
      away.goals.length > 0 ||
      home.penalties.length > 0 ||
      away.penalties.length > 0;

    games.push({
      id: `${date}-${time}-${start}`,
      date,
      time,
      home,
      away,
      // Score isn't a single labeled cell — it's the count of logged goals,
      // which fills in progressively as the game is played.
      homeScore: home.goals.length,
      awayScore: away.goals.length,
      period: currentPeriod(home, away),
      isInProgress: hasStarted && !isFinished,
      isFinished,
    });
  }

  return games;
};

// Finds a completed game's `Feuilles de match` block for Match Detail's
// "Score by Period" table (ticket 09), matching Calendrier's "Matchs" data
// (date + team names) to the corresponding scoresheet block.
export const findFinishedGame = (
  games: LiveGame[],
  date: string,
  awayTeam: string,
  homeTeam: string
): LiveGame | undefined =>
  games.find(
    game =>
      game.isFinished &&
      game.date === date &&
      game.away.name === awayTeam &&
      game.home.name === homeTeam
  );

export interface PeriodScoreRow {
  period: number;
  away: number;
  home: number;
}

// Period-by-period goal counts, derived from the `Période` value already
// logged on every goal entry in `Pointage` — no separate period-score field
// exists in the sheet.
export const periodScores = (game: LiveGame): PeriodScoreRow[] =>
  [1, 2, 3].map(period => ({
    period,
    away: game.away.goals.filter(g => g.period === period).length,
    home: game.home.goals.filter(g => g.period === period).length,
  }));

const bumpStandout = (
  map: Map<string, LiveStandout>,
  name: string,
  teamName: string,
  kind: "goal" | "assist"
) => {
  const key = `${teamName}::${name}`;
  const existing = map.get(key) ?? { name, teamName, goals: 0, assists: 0 };
  if (kind === "goal") existing.goals += 1;
  else existing.assists += 1;
  map.set(key, existing);
};

// Live "standouts so far" — there's no official stars-of-the-game pick until
// a game ends, so this previews the current point leaders instead.
export const computeStandouts = (home: LiveTeam, away: LiveTeam, homeName: string, awayName: string): LiveStandout[] => {
  const map = new Map<string, LiveStandout>();

  for (const [team, teamName] of [
    [home, homeName],
    [away, awayName],
  ] as const) {
    for (const goal of team.goals) {
      const scorer = team.roster.get(goal.scorerNumber);
      if (scorer) bumpStandout(map, scorer, teamName, "goal");
      for (const assistNumber of goal.assistNumbers) {
        const assister = team.roster.get(assistNumber);
        if (assister) bumpStandout(map, assister, teamName, "assist");
      }
    }
  }

  return [...map.values()]
    .sort((a, b) => b.goals + b.assists - (a.goals + a.assists) || b.goals - a.goals)
    .slice(0, 2);
};
