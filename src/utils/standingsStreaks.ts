import { colors } from "../theme/tokens";
import type { TeamStanding } from "./standings";

// Streak/last-10 derivation from the Calendar's Matchs data. That sheet has
// no streak/record column, so we replicate the game-log parsing used by
// Calendar.tsx's transformMatches (two games packed per source row) to build
// a chronological per-team result log.

type GameOutcome = "W" | "L" | "T";

interface TeamGame {
  outcome: GameOutcome;
  isRegularSeason: boolean;
}

const REGULAR_SEASON_LABEL = "Saison";

export const extractGameLogs = (rawRows: string[][]): Map<string, TeamGame[]> => {
  const logs = new Map<string, TeamGame[]>();
  const appendLog = (team: string, game: TeamGame) => {
    if (!team) return;
    const existing = logs.get(team);
    if (existing) {
      existing.push(game);
    } else {
      logs.set(team, [game]);
    }
  };

  const headerRowIndex = rawRows.findIndex(row => row[1] === "Date" && row[5] === "Visiteurs");
  if (headerRowIndex === -1) {
    return logs;
  }

  for (let rowIndex = headerRowIndex + 1; rowIndex < rawRows.length; rowIndex++) {
    const row = rawRows[rowIndex] ?? [];
    const type = row[0] ?? "";
    const isRegularSeason = type === REGULAR_SEASON_LABEL;

    const games = [
      { awayTeam: row[5], awayGoals: row[4], homeTeam: row[7], homeGoals: row[8] },
      { awayTeam: row[14], awayGoals: row[13], homeTeam: row[16], homeGoals: row[17] },
    ];

    for (const game of games) {
      const awayGoals = Number(game.awayGoals);
      const homeGoals = Number(game.homeGoals);
      // Unplayed slots are filled with "----"/"--" placeholders, which fail
      // to parse as finite numbers.
      if (!Number.isFinite(awayGoals) || !Number.isFinite(homeGoals)) {
        continue;
      }

      const awayOutcome: GameOutcome =
        awayGoals > homeGoals ? "W" : awayGoals < homeGoals ? "L" : "T";
      const homeOutcome: GameOutcome =
        homeGoals > awayGoals ? "W" : homeGoals < awayGoals ? "L" : "T";

      appendLog(game.awayTeam, { outcome: awayOutcome, isRegularSeason });
      appendLog(game.homeTeam, { outcome: homeOutcome, isRegularSeason });
    }
  }

  return logs;
};

export interface StreakInfo {
  label: string;
  color: string;
}

const STREAK_PREFIX: Record<GameOutcome, string> = { W: "V", L: "D", T: "N" };
const STREAK_COLOR: Record<GameOutcome, string> = {
  W: colors.positive,
  L: colors.error,
  T: colors.mutedText,
};

const computeStreak = (games: TeamGame[]): StreakInfo => {
  if (games.length === 0) {
    return { label: "—", color: colors.mutedText };
  }

  const last = games[games.length - 1].outcome;
  let count = 0;
  for (let i = games.length - 1; i >= 0 && games[i].outcome === last; i--) {
    count++;
  }

  return { label: `${STREAK_PREFIX[last]}${count}`, color: STREAK_COLOR[last] };
};

const computeLast6 = (games: TeamGame[]): string => {
  const recent = games.slice(-6);
  const w = recent.filter(g => g.outcome === "W").length;
  const l = recent.filter(g => g.outcome === "L").length;
  const t = recent.filter(g => g.outcome === "T").length;
  return t > 0 ? `${w}-${l}-${t}` : `${w}-${l}`;
};

export interface DisplayTeam extends TeamStanding {
  streak?: StreakInfo;
  last10?: string;
}

export type SeasonFilter = "all" | "regular" | "series";

export const withStreaks = (
  teams: TeamStanding[],
  gameLogs: Map<string, TeamGame[]>,
  filter: SeasonFilter
): DisplayTeam[] =>
  teams.map(team => {
    const allGames = gameLogs.get(team.team) ?? [];
    const games =
      filter === "all"
        ? allGames
        : allGames.filter(g => (filter === "regular" ? g.isRegularSeason : !g.isRegularSeason));
    return { ...team, streak: computeStreak(games), last10: computeLast6(games) };
  });
