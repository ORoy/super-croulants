import { useMemo, type CSSProperties, type ReactNode } from "react";
import { useSheetRawData } from "../hooks/useSheetData";
import { SHEET_NAMES, calendarTabs } from "../config/sheets";
import { colors } from "../theme/tokens";

// The "Classement Saison Régulière" tab packs three team tables (Overall,
// Séries, Saison Régulière) into one range, each with its own 2-row header
// block. We fetch it raw and split by section title, same approach as
// Calendar.tsx's transformMatches for its packed Matchs range.
const STANDINGS_RANGE = "A1:T22";

const SECTION_TITLES = {
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

interface TeamStanding {
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

const parseStandingsSection = (rawRows: string[][], title: string): TeamStanding[] => {
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

// --- Streak / last-10 derivation from the Calendar's Matchs data ---------
// That sheet has no streak/record column, so we replicate the game-log
// parsing used by Calendar.tsx's transformMatches (two games packed per
// source row) to build a chronological per-team result log.

type GameOutcome = "W" | "L" | "T";

interface TeamGame {
  outcome: GameOutcome;
  isRegularSeason: boolean;
}

const REGULAR_SEASON_LABEL = "Saison";

const extractGameLogs = (rawRows: string[][]): Map<string, TeamGame[]> => {
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

interface StreakInfo {
  label: string;
  color: string;
}

const computeStreak = (games: TeamGame[]): StreakInfo => {
  if (games.length === 0) {
    return { label: "—", color: colors.mutedText };
  }

  const last = games[games.length - 1].outcome;
  let count = 0;
  for (let i = games.length - 1; i >= 0 && games[i].outcome === last; i--) {
    count++;
  }

  const prefix = last === "W" ? "W" : last === "L" ? "L" : "N";
  const color = last === "W" ? POSITIVE_COLOR : last === "L" ? NEGATIVE_COLOR : colors.mutedText;
  return { label: `${prefix}${count}`, color };
};

const computeLast10 = (games: TeamGame[]): string => {
  const recent = games.slice(-10);
  const w = recent.filter(g => g.outcome === "W").length;
  const l = recent.filter(g => g.outcome === "L").length;
  const t = recent.filter(g => g.outcome === "T").length;
  return t > 0 ? `${w}-${l}-${t}` : `${w}-${l}`;
};

const withStreaks = (
  teams: TeamStanding[],
  gameLogs: Map<string, TeamGame[]>,
  regularSeasonOnly: boolean
): DisplayTeam[] =>
  teams.map(team => {
    const allGames = gameLogs.get(team.team) ?? [];
    const games = regularSeasonOnly ? allGames.filter(g => g.isRegularSeason) : allGames;
    return { ...team, streak: computeStreak(games), last10: computeLast10(games) };
  });

// --- Presentation ----------------------------------------------------------

const POSITIVE_COLOR = "oklch(0.7 0.14 150)";
const NEGATIVE_COLOR = "oklch(0.65 0.16 25)";

interface DisplayTeam extends TeamStanding {
  streak?: StreakInfo;
  last10?: string;
}

interface ColumnDef {
  key: string;
  label: string;
  width: string;
  sticky?: number;
  render: (team: DisplayTeam) => ReactNode;
}

const diffLabel = (value: number) => (value >= 0 ? `+${value}` : `${value}`);
const diffColor = (value: number) => (value >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR);

const RANK_COL: ColumnDef = {
  key: "rank",
  label: "#",
  width: "44px",
  sticky: 0,
  render: t => t.rank,
};

const TEAM_COL: ColumnDef = {
  key: "team",
  label: "Team",
  width: "1.5fr",
  sticky: 44,
  render: t => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 5,
          flexShrink: 0,
          background:
            "repeating-linear-gradient(45deg, oklch(0.5 0.03 250), oklch(0.5 0.03 250) 3px, oklch(0.22 0.02 250) 3px, oklch(0.22 0.02 250) 6px)",
        }}
      />
      <div style={{ fontWeight: 600 }}>{t.team}</div>
    </div>
  ),
};

const RECORD_COLUMNS: ColumnDef[] = [
  { key: "gp", label: "GP", width: "56px", render: t => t.gp },
  { key: "w", label: "W", width: "56px", render: t => t.w },
  { key: "l", label: "L", width: "56px", render: t => t.l },
  { key: "otl", label: "OTL", width: "56px", render: t => t.otl },
  { key: "pts", label: "PTS", width: "64px", render: t => <strong>{t.pts}</strong> },
  { key: "gf", label: "GF", width: "56px", render: t => t.gf },
  { key: "ga", label: "GA", width: "56px", render: t => t.ga },
  {
    key: "diff",
    label: "DIFF",
    width: "64px",
    render: t => (
      <span style={{ color: diffColor(t.diff), fontWeight: 600 }}>{diffLabel(t.diff)}</span>
    ),
  },
];

const STREAK_COLUMNS: ColumnDef[] = [
  {
    key: "streak",
    label: "STRK",
    width: "72px",
    render: t =>
      t.streak && <span style={{ color: t.streak.color, fontWeight: 600 }}>{t.streak.label}</span>,
  },
  {
    key: "last10",
    label: "L10",
    width: "80px",
    render: t => <span style={{ color: colors.mutedText }}>{t.last10}</span>,
  },
];

const FULL_COLUMNS: ColumnDef[] = [RANK_COL, TEAM_COL, ...RECORD_COLUMNS, ...STREAK_COLUMNS];
const RECORD_ONLY_COLUMNS: ColumnDef[] = [RANK_COL, TEAM_COL, ...RECORD_COLUMNS];

const stickyStyle = (sticky: number | undefined): CSSProperties =>
  sticky === undefined
    ? {}
    : {
        position: "sticky",
        left: sticky,
        zIndex: 1,
        background: colors.cardBackground,
      };

function StandingsSection({
  title,
  columns,
  teams,
}: {
  title: string;
  columns: ColumnDef[];
  teams: DisplayTeam[];
}) {
  const gridTemplateColumns = columns.map(c => c.width).join(" ");
  const minWidth = columns.reduce(
    (sum, c) => sum + (c.width.endsWith("fr") ? 180 : parseInt(c.width, 10)),
    0
  );

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns,
            minWidth,
            padding: "10px 16px",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: colors.mutedText,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          {columns.map(col => (
            <div key={col.key} style={stickyStyle(col.sticky)}>
              {col.label}
            </div>
          ))}
        </div>
        {teams.map(team => (
          <div
            key={team.team}
            style={{
              display: "grid",
              gridTemplateColumns,
              minWidth,
              padding: "11px 16px",
              fontSize: 14,
              alignItems: "center",
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            {columns.map(col => (
              <div key={col.key} style={stickyStyle(col.sticky)}>
                {col.render(team)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Standings() {
  const { data: standingsRaw, loading: standingsLoading, error: standingsError } = useSheetRawData(
    STANDINGS_RANGE,
    SHEET_NAMES.standings
  );
  const { data: matchesRaw, loading: matchesLoading, error: matchesError } = useSheetRawData(
    calendarTabs[0].range,
    SHEET_NAMES.calendar
  );

  const gameLogs = useMemo(() => extractGameLogs(matchesRaw), [matchesRaw]);

  const overall = useMemo(
    () => withStreaks(parseStandingsSection(standingsRaw, SECTION_TITLES.overall), gameLogs, false),
    [standingsRaw, gameLogs]
  );
  const regular = useMemo(
    () => withStreaks(parseStandingsSection(standingsRaw, SECTION_TITLES.regular), gameLogs, true),
    [standingsRaw, gameLogs]
  );
  const series = useMemo(
    () => parseStandingsSection(standingsRaw, SECTION_TITLES.series),
    [standingsRaw]
  );

  const loading = standingsLoading || matchesLoading;
  const error = standingsError ?? matchesError;

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800 }}>
          League Standings
        </div>
        <div style={{ fontSize: 13, color: colors.mutedText }}>
          Overall (regular season + series)
        </div>
      </div>

      {loading && <div style={{ color: colors.mutedText }}>Loading…</div>}
      {error && <div style={{ color: NEGATIVE_COLOR }}>Error loading standings: {error}</div>}

      {!loading && !error && (
        <>
          <StandingsSection title="Overall" columns={FULL_COLUMNS} teams={overall} />
          <StandingsSection title="Regular Season" columns={FULL_COLUMNS} teams={regular} />
          <StandingsSection title="Series" columns={RECORD_ONLY_COLUMNS} teams={series} />
        </>
      )}
    </div>
  );
}
