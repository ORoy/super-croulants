import { useMemo, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSheetRawData, combineFetchStates } from "../hooks/useSheetData";
import { useSheetBatch } from "../hooks/useSheetBatch";
import { useTeamColors } from "../hooks/useTeamColors";
import { calendarTabs, LIVE_MATCH_SHEET } from "../config/sheets";
import { transformMatches } from "../utils/matches";
import { findStarsForDate } from "../utils/stars";
import { parseLiveGames, findFinishedGame, periodScores } from "../utils/liveMatches";
import { colors } from "../theme/tokens";
import { encodePlayerId } from "../utils/playerId";
import DetailPageStatus from "./DetailPageStatus";
import TeamLogo from "./TeamLogo";

const starCardStyle: CSSProperties = {
  background: colors.cardBackground,
  border: `1px solid ${colors.accent}`,
  borderRadius: 10,
  padding: 16,
  textAlign: "left",
};

const periodWinStyle: CSSProperties = {
  color: colors.accent,
  fontWeight: 700,
};

const MATCH_DETAIL_RANGES = [calendarTabs[0], calendarTabs[1], LIVE_MATCH_SHEET];

export default function MatchDetail() {
  const { matchId = "" } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  useSheetBatch(MATCH_DETAIL_RANGES);
  const matchesResult = useSheetRawData(calendarTabs[0]);
  const starsResult = useSheetRawData(calendarTabs[1]);
  const matchSheetResult = useSheetRawData(LIVE_MATCH_SHEET);
  const teamColors = useTeamColors();
  const { getTeamColor } = teamColors;

  const match = useMemo(
    () => transformMatches(matchesResult.data).find(m => m.id === matchId),
    [matchesResult.data, matchId]
  );

  const stars = useMemo(
    () => (match ? findStarsForDate(starsResult.data, match.date) : []),
    [starsResult.data, match]
  );

  const periods = useMemo(() => {
    if (!match || !match.played) return null;
    const games = parseLiveGames(matchSheetResult.data);
    const game = findFinishedGame(games, match.date, match.awayTeam, match.homeTeam);
    return game ? periodScores(game) : null;
  }, [matchSheetResult.data, match]);

  const { loading, error } = combineFetchStates(matchesResult, starsResult, matchSheetResult, teamColors);

  const backLink = (
    <div
      style={{ color: colors.accent, fontSize: 13, cursor: "pointer", marginBottom: 16 }}
      onClick={() => navigate("/calendar")}
    >
      ← Retour au calendrier
    </div>
  );

  if (loading || error || !match) {
    return (
      <DetailPageStatus
        backLink={backLink}
        loading={loading}
        error={error}
        notFoundMessage={match ? undefined : "Match introuvable."}
      />
    );
  }

  const awayColor = getTeamColor(match.awayTeam);
  const homeColor = getTeamColor(match.homeTeam);

  return (
    <div>
      {backLink}
      <div style={{ fontSize: 13, color: colors.mutedText, marginBottom: 6 }}>
        {match.date} · {match.status}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)",
          alignItems: "center",
          gap: "clamp(8px,2vw,20px)",
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, minWidth: 0 }}>
          <div
            onClick={() => navigate(`/teams/${encodeURIComponent(match.awayTeam)}`)}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(16px,5vw,30px)",
              fontWeight: 800,
              textAlign: "right",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
              cursor: "pointer",
            }}
          >
            {match.awayTeam}
          </div>
          <TeamLogo teamName={match.awayTeam} color={awayColor} size={40} />
        </div>
        <div
          style={{
            justifySelf: "center",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(28px,7vw,44px)",
            fontWeight: 800,
            color: match.played ? colors.accent : colors.primaryText,
            whiteSpace: "nowrap",
          }}
        >
          {match.resultLabel}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <TeamLogo teamName={match.homeTeam} color={homeColor} size={40} />
          <div
            onClick={() => navigate(`/teams/${encodeURIComponent(match.homeTeam)}`)}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(16px,5vw,30px)",
              fontWeight: 800,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
              cursor: "pointer",
            }}
          >
            {match.homeTeam}
          </div>
        </div>
      </div>

      {match.played && match.awayPtsFS !== null && match.homePtsFS !== null && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: -20, marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              padding: "6px 14px",
              background: colors.background,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: colors.mutedText }}>
              Formule Score
            </span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, lineHeight: 1 }}>
              {match.awayPtsFS} – {match.homePtsFS}
            </span>
          </div>
        </div>
      )}

      {periods && (
        <>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
            Pointage par période
          </div>
          <div
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              overflowX: "auto",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr repeat(3, 70px) 70px 130px",
                minWidth: 590,
                padding: "10px 16px",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: colors.mutedText,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div>Équipe</div>
              <div>1re</div>
              <div>2e</div>
              <div>3e</div>
              <div>Final</div>
              <div>Formule Score</div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr repeat(3, 70px) 70px 130px",
                minWidth: 590,
                padding: "11px 16px",
                fontSize: 14,
                alignItems: "center",
                borderBottom: "1px solid oklch(0.23 0.02 250)",
              }}
            >
              <div
                onClick={() => navigate(`/teams/${encodeURIComponent(match.awayTeam)}`)}
                style={{ fontWeight: 600, cursor: "pointer" }}
              >
                {match.awayTeam}
              </div>
              {periods.map(p => (
                <div key={p.period} style={p.away > p.home ? periodWinStyle : undefined}>
                  {p.away}
                </div>
              ))}
              <div style={{ fontWeight: 700 }}>{match.awayScore}</div>
              <div style={{ fontWeight: 700 }}>{match.awayPtsFS ?? "–"}</div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr repeat(3, 70px) 70px 130px",
                minWidth: 590,
                padding: "11px 16px",
                fontSize: 14,
                alignItems: "center",
              }}
            >
              <div
                onClick={() => navigate(`/teams/${encodeURIComponent(match.homeTeam)}`)}
                style={{ fontWeight: 600, cursor: "pointer" }}
              >
                {match.homeTeam}
              </div>
              {periods.map(p => (
                <div key={p.period} style={p.home > p.away ? periodWinStyle : undefined}>
                  {p.home}
                </div>
              ))}
              <div style={{ fontWeight: 700 }}>{match.homeScore}</div>
              <div style={{ fontWeight: 700 }}>{match.homePtsFS ?? "–"}</div>
            </div>
          </div>
        </>
      )}

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
        Étoiles du match
      </div>
      {stars.length === 0 ? (
        <div style={{ color: colors.mutedText, fontSize: 14 }}>
          Aucune étoile enregistrée pour ce match.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
          {stars.map(star => (
            <div key={star.star} style={starCardStyle}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: colors.mutedText,
                }}
              >
                Étoile {star.star}
              </div>
              <div
                onClick={() => navigate(`/leaderboard/${encodePlayerId(star.name, star.team)}`)}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  marginTop: 4,
                  cursor: "pointer",
                }}
              >
                {star.name}
              </div>
              <div style={{ fontSize: 13, color: colors.mutedText, marginTop: 2 }}>
                #{star.number} ·{" "}
                <span
                  onClick={() => navigate(`/teams/${encodeURIComponent(star.team)}`)}
                  style={{ cursor: "pointer" }}
                >
                  {star.team}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
