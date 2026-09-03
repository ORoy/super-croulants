import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StatTable, { type TableColumn } from "./StatTable";
import { useSheetRawData, useSheetData, combineFetchStates } from "../hooks/useSheetData";
import { useSheetBatch, type BatchRange } from "../hooks/useSheetBatch";
import { useTeamColors } from "../hooks/useTeamColors";
import { useSeason } from "../hooks/useSeason";
import { playerTabs, standingsSheet } from "../config/sheets";
import { SECTION_TITLES, parseStandingsSection } from "../utils/standings";
import { normalizeRow } from "../utils/normalizeRow";
import { equalsIgnoreCase } from "../utils/textMatch";
import { encodePlayerId } from "../utils/playerId";
import { colors } from "../theme/tokens";
import DetailPageStatus from "./DetailPageStatus";
import StatCard from "./StatCard";
import TeamLogo from "./TeamLogo";

const ROSTER_COLUMNS: TableColumn[] = [
  { key: "RANG", label: "RANG" },
  { key: "JOUEURS", label: "JOUEUR" },
  { key: "PTS", label: "PTS" },
  { key: "BUTS", label: "BUTS" },
  { key: "PASSES", label: "PASSES" },
  { key: "PJ", label: "PJ" },
  { key: "MOY PTS/ Match", label: "MOY PTS/MATCH" },
];

export default function TeamDetail() {
  const { teamId = "" } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { season, spreadsheetId } = useSeason();
  const decodedTeamId = decodeURIComponent(teamId);

  const standingsRange = standingsSheet(season);
  const rosterRange = playerTabs.find(tab => tab.label === "Saison Régulière")!;
  const teamDetailRanges: BatchRange[] = [standingsRange, { ...rosterRange, kind: "parsed" }];

  useSheetBatch(spreadsheetId, teamDetailRanges);
  const standingsResult = useSheetRawData(spreadsheetId, standingsRange);
  const rosterResult = useSheetData(spreadsheetId, rosterRange);
  const teamColors = useTeamColors();
  const { getTeamColor } = teamColors;

  const team = useMemo(() => {
    const teams = parseStandingsSection(standingsResult.data, SECTION_TITLES.overall);
    return teams.find(t => equalsIgnoreCase(t.team, decodedTeamId));
  }, [standingsResult.data, decodedTeamId]);

  const roster = useMemo(
    () =>
      rosterResult.data
        .map(normalizeRow)
        .filter(row => equalsIgnoreCase(row["ÉQUIPES"] ?? "", decodedTeamId)),
    [rosterResult.data, decodedTeamId]
  );

  const { loading, error } = combineFetchStates(standingsResult, rosterResult, teamColors);

  const teamColor = getTeamColor(decodedTeamId);

  const backLink = (
    <div
      style={{ color: colors.accent, fontSize: 13, cursor: "pointer", marginBottom: 16 }}
      onClick={() => navigate(`/${season}/teams`)}
    >
      ← Retour aux équipes
    </div>
  );

  if (loading || error || !team) {
    return (
      <DetailPageStatus
        backLink={backLink}
        loading={loading}
        error={error}
        notFoundMessage={team ? undefined : "Équipe introuvable."}
      />
    );
  }

  return (
    <div>
      {backLink}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22, flexWrap: "wrap" }}>
        <TeamLogo teamName={team.team} color={teamColor} size={72} radius={12} />
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, lineHeight: 1 }}>
            {team.team}
          </div>
          <div style={{ fontSize: 14, color: colors.mutedText, marginTop: 4 }}>
            Rang #{team.rank} · {team.w}-{team.l}-{team.otl} · {team.pts} PTS
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Fiche"
          value={`${team.w}-${team.l}-${team.otl}`}
          align="left"
          padding={16}
          valueFontSize={26}
        />
        <StatCard label="Buts pour" value={team.gf} align="left" padding={16} valueFontSize={26} />
        <StatCard label="Buts contre" value={team.ga} align="left" padding={16} valueFontSize={26} />
      </div>

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
        Effectif
      </div>
      {roster.length === 0 ? (
        <div style={{ color: colors.mutedText }}>Aucun joueur trouvé pour cette équipe.</div>
      ) : (
        <StatTable
          key={decodedTeamId}
          columns={ROSTER_COLUMNS}
          rows={roster}
          onRowClick={row => {
            const name = row["JOUEURS"];
            if (!name) return;
            navigate(`/${season}/leaderboard/${encodePlayerId(name, decodedTeamId)}`);
          }}
        />
      )}
    </div>
  );
}
