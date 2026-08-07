import { useMemo, type CSSProperties, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useSheetRawData, combineFetchStates } from "../hooks/useSheetData";
import { calendarTabs } from "../config/sheets";
import { colors } from "../theme/tokens";
import { STANDINGS_SHEET, SECTION_TITLES, parseStandingsSection } from "../utils/standings";
import { extractGameLogs, withStreaks, type DisplayTeam } from "../utils/standingsStreaks";
import { compareSortValues } from "../utils/sortValues";
import { useColumnSort } from "../hooks/useColumnSort";
import { useTeamColors, type TeamColor } from "../hooks/useTeamColors";
import TeamLogo from "./TeamLogo";

interface ColumnDef {
  key: string;
  label: string;
  width: string;
  sticky?: number;
  render: (team: DisplayTeam) => ReactNode;
  /** Plain comparable value for sorting; omit to make the column non-sortable. */
  sortValue?: (team: DisplayTeam) => string | number;
}

const diffLabel = (value: number) => (value >= 0 ? `+${value}` : `${value}`);
const diffColor = (value: number) => (value >= 0 ? colors.positive : colors.error);

const RANK_COL: ColumnDef = {
  key: "rank",
  label: "#",
  width: "44px",
  sticky: 0,
  render: t => t.rank,
  sortValue: t => Number(t.rank),
};

const createTeamColumn = (getTeamColor: (teamName: string) => TeamColor | undefined): ColumnDef => ({
  key: "team",
  label: "Équipe",
  width: "1.5fr",
  sticky: 44,
  sortValue: t => t.team,
  render: t => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <TeamLogo teamName={t.team} color={getTeamColor(t.team)} size={26} radius={5} />
      <div style={{ fontWeight: 600 }}>{t.team}</div>
    </div>
  ),
});

const RECORD_COLUMNS: ColumnDef[] = [
  { key: "gp", label: "PJ", width: "56px", render: t => t.gp, sortValue: t => t.gp },
  { key: "w", label: "V", width: "56px", render: t => t.w, sortValue: t => t.w },
  { key: "l", label: "D", width: "56px", render: t => t.l, sortValue: t => t.l },
  { key: "otl", label: "DP", width: "56px", render: t => t.otl, sortValue: t => t.otl },
  {
    key: "pts",
    label: "PTS",
    width: "64px",
    render: t => <strong>{t.pts}</strong>,
    sortValue: t => t.pts,
  },
  { key: "gf", label: "BP", width: "56px", render: t => t.gf, sortValue: t => t.gf },
  { key: "ga", label: "BC", width: "56px", render: t => t.ga, sortValue: t => t.ga },
  {
    key: "diff",
    label: "DIFF",
    width: "64px",
    render: t => (
      <span style={{ color: diffColor(t.diff), fontWeight: 600 }}>{diffLabel(t.diff)}</span>
    ),
    sortValue: t => t.diff,
  },
];

const STREAK_COLUMNS: ColumnDef[] = [
  {
    key: "streak",
    label: "SÉRIE",
    width: "72px",
    render: t =>
      t.streak && <span style={{ color: t.streak.color, fontWeight: 600 }}>{t.streak.label}</span>,
  },
  {
    key: "last10",
    label: "10D",
    width: "80px",
    render: t => <span style={{ color: colors.mutedText }}>{t.last10}</span>,
  },
];

const createColumns = (getTeamColor: (teamName: string) => TeamColor | undefined) => {
  const teamCol = createTeamColumn(getTeamColor);
  return {
    full: [RANK_COL, teamCol, ...RECORD_COLUMNS, ...STREAK_COLUMNS],
    recordOnly: [RANK_COL, teamCol, ...RECORD_COLUMNS],
  };
};

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
  const navigate = useNavigate();
  const { sortState, toggleSort } = useColumnSort();
  const gridTemplateColumns = columns.map(c => c.width).join(" ");
  const minWidth = columns.reduce(
    (sum, c) => sum + (c.width.endsWith("fr") ? 180 : parseInt(c.width, 10)),
    0
  );

  const sortedTeams = useMemo(() => {
    if (!sortState) return teams;
    const column = columns.find(c => c.key === sortState.key);
    if (!column?.sortValue) return teams;
    const { direction } = sortState;
    return [...teams].sort((a, b) =>
      compareSortValues(column.sortValue!(a), column.sortValue!(b), direction)
    );
  }, [teams, columns, sortState]);

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
          {columns.map((col, index) => (
            <div
              key={col.key}
              onClick={() => {
                if (!col.sortValue) return;
                const sample = teams.length > 0 ? col.sortValue(teams[0]) : "";
                toggleSort(col.key, index, typeof sample === "number");
              }}
              style={{ ...stickyStyle(col.sticky), cursor: col.sortValue ? "pointer" : undefined }}
            >
              {col.label}
              {sortState?.key === col.key && (
                <span style={{ color: colors.accent }}>
                  {" "}
                  {sortState.direction === "asc" ? "▲" : "▼"}
                </span>
              )}
            </div>
          ))}
        </div>
        {sortedTeams.map(team => (
          <div
            key={team.team}
            onClick={() => navigate(`/teams/${encodeURIComponent(team.team)}`)}
            style={{
              display: "grid",
              gridTemplateColumns,
              minWidth,
              padding: "11px 16px",
              fontSize: 14,
              alignItems: "center",
              borderBottom: `1px solid ${colors.border}`,
              cursor: "pointer",
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
  const standingsResult = useSheetRawData(STANDINGS_SHEET);
  const matchesResult = useSheetRawData(calendarTabs[0]);
  const teamColors = useTeamColors();
  const { getTeamColor } = teamColors;

  const { full: FULL_COLUMNS, recordOnly: RECORD_ONLY_COLUMNS } = useMemo(
    () => createColumns(getTeamColor),
    [getTeamColor]
  );

  const gameLogs = useMemo(() => extractGameLogs(matchesResult.data), [matchesResult.data]);

  const overall = useMemo(
    () =>
      withStreaks(
        parseStandingsSection(standingsResult.data, SECTION_TITLES.overall),
        gameLogs,
        false
      ),
    [standingsResult.data, gameLogs]
  );
  const regular = useMemo(
    () =>
      withStreaks(
        parseStandingsSection(standingsResult.data, SECTION_TITLES.regular),
        gameLogs,
        true
      ),
    [standingsResult.data, gameLogs]
  );
  const series = useMemo(
    () => parseStandingsSection(standingsResult.data, SECTION_TITLES.series),
    [standingsResult.data]
  );

  const { loading, error } = combineFetchStates(standingsResult, matchesResult, teamColors);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800 }}>
          Classement des Équipes
        </div>
        <div style={{ fontSize: 13, color: colors.mutedText }}>
          Ensemble (saison régulière + séries)
        </div>
      </div>

      {loading && <div style={{ color: colors.mutedText }}>Chargement…</div>}
      {error && <div style={{ color: colors.error }}>Erreur de chargement : {error}</div>}

      {!loading && !error && (
        <>
          <StandingsSection title="Saison + Séries" columns={FULL_COLUMNS} teams={overall} />
          <StandingsSection title="Saison Régulière" columns={FULL_COLUMNS} teams={regular} />
          <StandingsSection title="Séries" columns={RECORD_ONLY_COLUMNS} teams={series} />
        </>
      )}
    </div>
  );
}
