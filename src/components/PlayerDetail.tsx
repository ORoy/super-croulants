import { useMemo, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSheetData } from "../hooks/useSheetData";
import { useTeamColors } from "../hooks/useTeamColors";
import { playerTabs } from "../config/sheets";
import { normalizeRow } from "../utils/normalizeRow";
import { decodePlayerId } from "../utils/playerId";
import { colors } from "../theme/tokens";

const ERROR_COLOR = "oklch(0.65 0.16 25)";

const SKATER_RANGE = playerTabs.find(tab => tab.label === "Saison Régulière")!.range;
const PENALTY_RANGE = playerTabs.find(tab => tab.label === "Pénalités")!.range;
const GOALIE_RANGE = playerTabs.find(tab => tab.label === "Gardiens")!.range;

const matchesPlayer = (row: Record<string, string>, nameKey: string, teamKey: string, name: string, team: string) => {
  if ((row[nameKey] ?? "").toLowerCase() !== name.toLowerCase()) {
    return false;
  }
  if (!team) {
    return true;
  }
  return (row[teamKey] ?? "").toLowerCase() === team.toLowerCase();
};

const statCardStyle: CSSProperties = {
  background: colors.cardBackground,
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  padding: 14,
  textAlign: "center",
};

const highlightCardStyle: CSSProperties = {
  ...statCardStyle,
  border: `1px solid ${colors.accent}`,
};

const statLabelStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: colors.mutedText,
};

const statValueStyle: CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 24,
  fontWeight: 800,
  marginTop: 4,
};

function StatCard({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div style={highlight ? highlightCardStyle : statCardStyle}>
      <div style={statLabelStyle}>{label}</div>
      <div style={statValueStyle}>{value}</div>
    </div>
  );
}

export default function PlayerDetail() {
  const { playerId = "" } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { name, team } = decodePlayerId(playerId);

  const { data: skaterData, loading: skaterLoading, error: skaterError } = useSheetData(SKATER_RANGE);
  const { data: penaltyData, loading: penaltyLoading, error: penaltyError } = useSheetData(PENALTY_RANGE);
  const { data: goalieData, loading: goalieLoading, error: goalieError } = useSheetData(GOALIE_RANGE);
  const { getTeamColor, loading: colorsLoading, error: colorsError } = useTeamColors();

  const skaterRows = useMemo(() => skaterData.map(normalizeRow), [skaterData]);
  const penaltyRows = useMemo(() => penaltyData.map(normalizeRow), [penaltyData]);
  const goalieRows = useMemo(() => goalieData.map(normalizeRow), [goalieData]);

  const goalie = useMemo(
    () => goalieRows.find(row => matchesPlayer(row, "JOUEURS", "ÉQUIPE", name, team)),
    [goalieRows, name, team]
  );
  const skater = useMemo(
    () => (goalie ? undefined : skaterRows.find(row => matchesPlayer(row, "JOUEURS", "ÉQUIPES", name, team))),
    [skaterRows, name, team, goalie]
  );
  const penalty = useMemo(
    () => penaltyRows.find(row => matchesPlayer(row, "JOUEURS", "ÉQUIPES", name, team)),
    [penaltyRows, name, team]
  );

  const loading = skaterLoading || penaltyLoading || goalieLoading || colorsLoading;
  const error = skaterError ?? penaltyError ?? goalieError ?? colorsError;
  const player = goalie ?? skater;
  const playerTeam = goalie?.["ÉQUIPE"] ?? skater?.["ÉQUIPES"] ?? team;
  const teamColor = getTeamColor(playerTeam);

  const backLink = (
    <div
      style={{ color: colors.accent, fontSize: 13, cursor: "pointer", marginBottom: 16 }}
      onClick={() => navigate("/leaderboard")}
    >
      ← Retour au classement
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

  if (!player) {
    return (
      <div>
        {backLink}
        <div style={{ color: colors.mutedText }}>Joueur introuvable.</div>
      </div>
    );
  }

  const gp = Number(goalie ? goalie["PJ"] : skater?.["PJ"]) || 0;
  const butsContre = Number(goalie?.["BUTS CONTRE"]) || 0;
  const gaa = goalie && gp > 0 ? (butsContre / gp).toFixed(2) : "—";
  const svPctRaw = Number(goalie?.["% ÉFFICACITÉ"]);
  const svPct = goalie && Number.isFinite(svPctRaw) ? `${(svPctRaw * 100).toFixed(1)}%` : "—";

  return (
    <div>
      {backLink}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            flexShrink: 0,
            background: teamColor?.background || colors.border,
            border: teamColor?.text ? `2px solid ${teamColor.text}` : undefined,
          }}
        />
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, lineHeight: 1 }}>
            {name}
          </div>
          <div style={{ fontSize: 14, color: colors.mutedText, marginTop: 6 }}>
            {playerTeam}
            {goalie ? " · Gardien" : ""}
          </div>
        </div>
      </div>

      {goalie ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 14, marginBottom: 24 }}>
          <StatCard label="PJ" value={gp} />
          <StatCard label="GAA" value={gaa} highlight />
          <StatCard label="% Efficacité" value={svPct} />
          <StatCard label="Buts contre" value={goalie["BUTS CONTRE"] ?? "—"} />
          <StatCard label="Lancers reçus" value={goalie["TOTAL LANCERS REÇUS"] ?? "—"} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 14, marginBottom: 24 }}>
          <StatCard label="PJ" value={skater?.["PJ"] ?? "—"} />
          <StatCard label="Buts" value={skater?.["BUTS"] ?? "—"} />
          <StatCard label="Passes" value={skater?.["PASSES"] ?? "—"} />
          <StatCard label="Points" value={skater?.["PTS"] ?? "—"} highlight />
          <StatCard label="Pénalités (min)" value={penalty?.["TOTAL (min)"] ?? "0"} />
        </div>
      )}
    </div>
  );
}
