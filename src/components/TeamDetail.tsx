import { useMemo, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StatTable, { type TableColumn } from "./StatTable";
import { useSheetRawData, useSheetData } from "../hooks/useSheetData";
import { useTeamColors } from "../hooks/useTeamColors";
import { playerTabs, SHEET_NAMES } from "../config/sheets";
import { STANDINGS_RANGE, SECTION_TITLES, parseStandingsSection } from "../utils/standings";
import { normalizeRow } from "../utils/normalizeRow";
import { colors } from "../theme/tokens";

const ERROR_COLOR = "oklch(0.65 0.16 25)";

const ROSTER_RANGE = playerTabs.find(tab => tab.label === "Saison Régulière")!.range;

const ROSTER_COLUMNS: TableColumn[] = [
  { key: "RANG", label: "RANG" },
  { key: "JOUEURS", label: "JOUEUR" },
  { key: "PTS", label: "PTS" },
  { key: "BUTS", label: "BUTS" },
  { key: "PASSES", label: "PASSES" },
  { key: "PJ", label: "PJ" },
  { key: "MOY PTS/ Match", label: "MOY PTS/MATCH" },
];

const statCardStyle: CSSProperties = {
  background: colors.cardBackground,
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  padding: 16,
};

const statLabelStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: colors.mutedText,
};

const statValueStyle: CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 26,
  fontWeight: 800,
  marginTop: 4,
};

export default function TeamDetail() {
  const { teamId = "" } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const decodedTeamId = decodeURIComponent(teamId);

  const { data: standingsRaw, loading: standingsLoading, error: standingsError } = useSheetRawData(
    STANDINGS_RANGE,
    SHEET_NAMES.standings
  );
  const { data: rosterRaw, loading: rosterLoading, error: rosterError } = useSheetData(ROSTER_RANGE);
  const { getTeamColor, loading: colorsLoading, error: colorsError } = useTeamColors();

  const team = useMemo(() => {
    const teams = parseStandingsSection(standingsRaw, SECTION_TITLES.overall);
    return teams.find(t => t.team.toUpperCase() === decodedTeamId.toUpperCase());
  }, [standingsRaw, decodedTeamId]);

  const roster = useMemo(
    () =>
      rosterRaw
        .map(normalizeRow)
        .filter(row => (row["ÉQUIPES"] ?? "").toUpperCase() === decodedTeamId.toUpperCase()),
    [rosterRaw, decodedTeamId]
  );

  const loading = standingsLoading || rosterLoading || colorsLoading;
  const error = standingsError ?? rosterError ?? colorsError;

  const teamColor = getTeamColor(decodedTeamId);

  const backLink = (
    <div
      style={{ color: colors.accent, fontSize: 13, cursor: "pointer", marginBottom: 16 }}
      onClick={() => navigate("/teams")}
    >
      ← Retour aux équipes
    </div>
  );

  if (loading) {
    return (
      <div>
        {backLink}
        <div style={{ color: colors.mutedText }}>Chargement…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {backLink}
        <div style={{ color: ERROR_COLOR }}>Erreur de chargement : {error}</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div>
        {backLink}
        <div style={{ color: colors.mutedText }}>Équipe introuvable.</div>
      </div>
    );
  }

  return (
    <div>
      {backLink}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22, flexWrap: "wrap" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 12,
            flexShrink: 0,
            background: teamColor?.background || colors.border,
            border: teamColor?.text ? `2px solid ${teamColor.text}` : undefined,
          }}
        />
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
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Fiche</div>
          <div style={statValueStyle}>
            {team.w}-{team.l}-{team.otl}
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Buts pour</div>
          <div style={statValueStyle}>{team.gf}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Buts contre</div>
          <div style={statValueStyle}>{team.ga}</div>
        </div>
      </div>

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
        Effectif
      </div>
      {roster.length === 0 ? (
        <div style={{ color: colors.mutedText }}>Aucun joueur trouvé pour cette équipe.</div>
      ) : (
        <StatTable columns={ROSTER_COLUMNS} rows={roster} />
      )}
    </div>
  );
}
