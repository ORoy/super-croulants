import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSheetData, useSheetRawData, combineFetchStates } from "../hooks/useSheetData";
import { useTeamColors } from "../hooks/useTeamColors";
import { playerTabs, LIVE_MATCH_SHEET } from "../config/sheets";
import { normalizeRow } from "../utils/normalizeRow";
import { decodePlayerId } from "../utils/playerId";
import { equalsIgnoreCase } from "../utils/textMatch";
import { parseLiveGames, playerGameLog } from "../utils/liveMatches";
import { colors } from "../theme/tokens";
import DetailPageStatus from "./DetailPageStatus";
import StatCard from "./StatCard";

const GAME_LOG_GRID_COLUMNS = "1fr 2fr 50px 50px 50px";

const SKATER_SHEET = playerTabs.find(tab => tab.label === "Saison Régulière")!;
const PENALTY_SHEET = playerTabs.find(tab => tab.label === "Pénalités")!;
const GOALIE_SHEET = playerTabs.find(tab => tab.label === "Gardiens")!;

const matchesPlayer = (row: Record<string, string>, nameKey: string, teamKey: string, name: string, team: string) => {
  if (!equalsIgnoreCase(row[nameKey] ?? "", name)) {
    return false;
  }
  if (!team) {
    return true;
  }
  return equalsIgnoreCase(row[teamKey] ?? "", team);
};

export default function PlayerDetail() {
  const { playerId = "" } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { name, team } = decodePlayerId(playerId);

  const skaterResult = useSheetData(SKATER_SHEET);
  const penaltyResult = useSheetData(PENALTY_SHEET);
  const goalieResult = useSheetData(GOALIE_SHEET);
  const matchSheetResult = useSheetRawData(LIVE_MATCH_SHEET);
  const teamColors = useTeamColors();
  const { getTeamColor } = teamColors;

  const skaterRows = useMemo(() => skaterResult.data.map(normalizeRow), [skaterResult.data]);
  const penaltyRows = useMemo(() => penaltyResult.data.map(normalizeRow), [penaltyResult.data]);
  const goalieRows = useMemo(() => goalieResult.data.map(normalizeRow), [goalieResult.data]);

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

  const { loading, error } = combineFetchStates(skaterResult, penaltyResult, goalieResult, teamColors);
  const player = goalie ?? skater;
  const playerTeam = goalie?.["ÉQUIPE"] ?? skater?.["ÉQUIPES"] ?? team;
  const teamColor = getTeamColor(playerTeam);

  // Skaters only — G/A/PTS per game, reusing the "Feuilles de match" parser
  // built for tickets 08/09 (ticket 12). +/- has no source in that sheet.
  const gameLog = useMemo(
    () => (skater ? playerGameLog(parseLiveGames(matchSheetResult.data), name, playerTeam) : []),
    [skater, matchSheetResult.data, name, playerTeam]
  );

  const backLink = (
    <div
      style={{ color: colors.accent, fontSize: 13, cursor: "pointer", marginBottom: 16 }}
      onClick={() => navigate("/leaderboard")}
    >
      ← Retour au classement
    </div>
  );

  if (loading || error || !player) {
    return (
      <DetailPageStatus
        backLink={backLink}
        loading={loading}
        error={error}
        notFoundMessage={player ? undefined : "Joueur introuvable."}
      />
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

      {skater && gameLog.length > 0 && (
        <>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
            Journal des matchs
          </div>
          <div
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              overflowX: "auto",
              maxHeight: 480,
              overflowY: "auto",
            }}
          >
            <div style={{ minWidth: 380 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: GAME_LOG_GRID_COLUMNS,
                  padding: "10px 16px",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: colors.mutedText,
                  borderBottom: `1px solid ${colors.border}`,
                  position: "sticky",
                  top: 0,
                  background: colors.cardBackground,
                }}
              >
                <div>Date</div>
                <div>Adversaire</div>
                <div>B</div>
                <div>A</div>
                <div>PTS</div>
              </div>
              {gameLog.map(row => (
                <div
                  key={row.gameId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: GAME_LOG_GRID_COLUMNS,
                    padding: "9px 16px",
                    fontSize: 14,
                    alignItems: "center",
                    borderBottom: "1px solid oklch(0.23 0.02 250)",
                  }}
                >
                  <div style={{ color: colors.mutedText }}>{row.date}</div>
                  <div>
                    {row.isHome ? "vs " : "@ "}
                    {row.opponent}
                  </div>
                  <div>{row.goals}</div>
                  <div>{row.assists}</div>
                  <div style={{ fontWeight: 700, color: colors.accent }}>{row.points}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
