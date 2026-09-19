import { equalsIgnoreCase } from "./textMatch";
import type { Season } from "../config/sheets";

// Parses "Feuilles de match" — a per-game scoresheet layout, one ~20-row
// block per game. Each block holds two team sub-blocks side by side: the
// home team at column offset 0, the visiting team at column offset 83
// (same internal layout, just shifted right). Column offsets below were
// pinned down against real season data (see ticket 08), not guessed:
// row 1 = "Date:"/date, row 2 = "Heure:"/time + shots-on-goal totals,
// row 3 = team name, rows 6-19 = one player per row (lineup, and — only on
// rows where they occurred — that player's penalty and/or goal).
//
// Blocks are NOT assumed to sit at fixed 20-row intervals from the top of
// the fetched range: a season's sheet can have a different number of leading
// rows (e.g. 2025-26 has 3 short 2-row holiday-placeholder blocks before its
// first real game; 2026-27 has none), which silently broke every block
// boundary downstream when the fetch range's start row didn't happen to line
// up. Instead each block is located by scanning for its own "Date:" marker
// (see findBlockStarts) — self-correcting regardless of what precedes it.
const BLOCK_ROWS = 20;
const VISITOR_COL_OFFSET = 83;
const PLAYER_ROW_START = 5;
const PLAYER_ROW_END = 19; // exclusive
const DATE_LABEL_COL = 0; // column E, home side only — label isn't duplicated on the away side

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

// A game counts as "in progress" from its scheduled Heure onward (see ticket
// 14) until the scoresheet is marked finished, or after this long if it never
// is — a backstop for a postponed/never-scored game, not the normal path.
const LIVE_WINDOW_MS = 2 * 60 * 60 * 1000;

const EASTERN_TIME_ZONE = "America/Toronto";

// League plays local Quebec (Eastern) time; the sheet's Heure carries no
// timezone. Re-reading "now" through this zone and building scheduledStart
// with the plain (browser-local) Date constructor puts both sides of every
// comparison in the same shifted-but-consistent frame, so start/duration math
// below is correct regardless of the viewer's actual timezone — no tz library
// needed.
const easternNow = (): Date => new Date(new Date().toLocaleString("en-US", { timeZone: EASTERN_TIME_ZONE }));

const MONTH_ABBREVIATIONS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

// Season "2026-27" -> Sep-Dec belongs to 2026, Jan-Aug to 2027 (the sheet's
// Date cell carries no year).
const seasonYearForMonth = (season: Season, month: number): number => {
  const startYear = Number(season.slice(0, 4));
  return month >= MONTH_ABBREVIATIONS.Sep ? startYear : startYear + 1;
};

// Parses the block's own "Date:"/"Heure:" cells (e.g. "11 Sep" + "19:30")
// into the game's scheduled Eastern-time start. Returns null on anything
// unexpected — a bad row should be skipped from the live list, never
// silently treated as live (ticket 14).
const parseScheduledStart = (date: string, time: string, season: Season): Date | null => {
  const dateMatch = /^(\d{1,2})\s+([A-Za-z]{3})$/.exec(date.trim());
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!dateMatch || !timeMatch) return null;

  const month = MONTH_ABBREVIATIONS[dateMatch[2]];
  if (month === undefined) return null;

  const day = Number(dateMatch[1]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const year = seasonYearForMonth(season, month);

  const start = new Date(year, month, day, hours, minutes);
  return Number.isNaN(start.getTime()) ? null : start;
};

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
  period: number;
  scheduledStart: Date | null;
  isInProgress: boolean;
  isFinished: boolean;
  hasScoresheetData: boolean;
}

export interface PlayerGameLogRow {
  gameId: string;
  date: string;
  opponent: string;
  isHome: boolean;
  goals: number;
  assists: number;
  points: number;
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

// Finds every game block's start row by scanning for its "Date:" marker,
// rather than assuming blocks sit at fixed BLOCK_ROWS intervals from the top
// of the fetched range (see the header comment above — that assumption broke
// whenever a season's sheet had a different number of leading rows).
const findBlockStarts = (rows: string[][]): number[] => {
  const starts: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i]?.[DATE_LABEL_COL] ?? "").trim() === "Date:") starts.push(i);
  }
  return starts;
};

// Whether either team's shots-on-goal total for `periodIndex` (0/1/2) has
// been filled in — the sheet's only per-period "this part is done" signal,
// checked on both sides since either scorekeeper filling in their side first
// is enough to trust the period turned over (ticket 14 grilling session).
const periodFilled = (home: LiveTeam, away: LiveTeam, periodIndex: number): boolean =>
  home.shotsByPeriod[periodIndex] !== "" || away.shotsByPeriod[periodIndex] !== "";

// The current period, derived from which period-shots columns are filled
// (R/S/T on the Heure row) rather than from logged goals/penalties — the
// sheet has no live clock, only these three per-period totals.
const currentPeriod = (home: LiveTeam, away: LiveTeam): number => {
  if (periodFilled(home, away, 1)) return 3; // period 2's total is in -> period 3
  if (periodFilled(home, away, 0)) return 2; // period 1's total is in -> period 2
  return 1;
};

export const parseLiveGames = (rows: string[][], season: Season): LiveGame[] => {
  const games: LiveGame[] = [];
  const now = easternNow();
  const blockStarts = findBlockStarts(rows);

  for (let i = 0; i < blockStarts.length; i++) {
    const start = blockStarts[i];
    const end = Math.min(start + BLOCK_ROWS, blockStarts[i + 1] ?? rows.length);
    const block = rows.slice(start, end);
    const date = cellAt(block, 0, 0, 1);
    if (!date) continue;

    const home = parseTeamBlock(block, 0);
    const away = parseTeamBlock(block, VISITOR_COL_OFFSET);
    if (!home.name || !away.name) continue;

    const time = cellAt(block, 1, 0, 1);

    // Confirmed done-signal: period-3 shots-on-goal filled in for either team.
    const isFinished = periodFilled(home, away, 2);
    // Whether anyone has actually typed anything into the scoresheet yet —
    // no longer what gates "in progress" (that's the schedule, below), but
    // still what the live screen uses to tell a real 0-0 from a game that
    // just hasn't been scored yet (ticket 14).
    const hasScoresheetData =
      home.shotsByPeriod[0] !== "" ||
      away.shotsByPeriod[0] !== "" ||
      home.goals.length > 0 ||
      away.goals.length > 0 ||
      home.penalties.length > 0 ||
      away.penalties.length > 0;

    const scheduledStart = parseScheduledStart(date, time, season);
    const isInProgress =
      scheduledStart !== null &&
      !isFinished &&
      now.getTime() >= scheduledStart.getTime() &&
      now.getTime() < scheduledStart.getTime() + LIVE_WINDOW_MS;

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
      scheduledStart,
      isInProgress,
      isFinished,
      hasScoresheetData,
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

// Per-game G/A/PTS history (ticket 12), reusing the roster + goals already
// parsed for tickets 08/09 — no separate per-player-per-game sheet needed.
// +/- has no source here (no on-ice tracking, only scorer/assist per goal)
// and stays out; see docs/data-gaps.md item 4.
export const playerGameLog = (games: LiveGame[], playerName: string, playerTeam: string): PlayerGameLogRow[] => {
  const rows: PlayerGameLogRow[] = [];

  for (const game of games) {
    if (!game.isFinished) continue;

    for (const [team, opponent, isHome] of [
      [game.home, game.away, true],
      [game.away, game.home, false],
    ] as const) {
      if (!equalsIgnoreCase(team.name, playerTeam)) continue;

      const number = [...team.roster.entries()].find(([, name]) => equalsIgnoreCase(name, playerName))?.[0];
      if (number === undefined) continue;

      const goals = team.goals.filter(g => g.scorerNumber === number).length;
      const assists = team.goals.filter(g => g.assistNumbers.includes(number)).length;

      rows.push({
        gameId: game.id,
        date: game.date,
        opponent: opponent.name,
        isHome,
        goals,
        assists,
        points: goals + assists,
      });
    }
  }

  return rows;
};
