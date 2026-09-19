import { useMemo, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSheetRawData, combineFetchStates } from "../hooks/useSheetData";
import { useSheetBatch } from "../hooks/useSheetBatch";
import { useTeamColors } from "../hooks/useTeamColors";
import { useSeason } from "../hooks/useSeason";
import { calendarTabs, liveMatchSheet } from "../config/sheets";
import { transformMatches } from "../utils/matches";
import { findStarsForDate } from "../utils/stars";
import { parseLiveGames, findGameForMatch, periodScores, gameEvents, type GameEvent } from "../utils/liveMatches";
import { colors } from "../theme/tokens";
import { encodePlayerId } from "../utils/playerId";
import DetailPageStatus from "./DetailPageStatus";
import TeamLogo from "./TeamLogo";

const POLL_INTERVAL_MS = 30_000;

const sectionTitleStyle: CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 20,
  fontWeight: 700,
  marginBottom: 10,
};

const statLabelStyle: CSSProperties = {
  textAlign: "center",
  color: colors.mutedText,
  fontSize: 12,
  letterSpacing: "1px",
  textTransform: "uppercase",
};

const eventTypeStyle = (type: GameEvent["type"]): CSSProperties => ({
  fontWeight: 700,
  color: type === "goal" ? colors.positive : colors.error,
});

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

export default function MatchDetail() {
  const { matchId = "" } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { season, spreadsheetId } = useSeason();

  const [matchesRange, starsRange] = calendarTabs(season);
  const matchSheetRange = liveMatchSheet(season);
  const matchDetailRanges = [matchesRange, starsRange, matchSheetRange];

  useSheetBatch(spreadsheetId, matchDetailRanges);
  const matchesResult = useSheetRawData(spreadsheetId, matchesRange);
  const starsResult = useSheetRawData(spreadsheetId, starsRange);
  const match = useMemo(
    () => transformMatches(matchesResult.data).find(m => m.id === matchId),
    [matchesResult.data, matchId]
  );
  // A match without a final score yet could be currently live, so keep
  // polling its scoresheet until the Calendar sheet marks it played; a
  // finished match's scoresheet won't change again.
  const matchSheetResult = useSheetRawData(
    spreadsheetId,
    matchSheetRange,
    match && !match.played ? POLL_INTERVAL_MS : undefined
  );
  const teamColors = useTeamColors();
  const { getTeamColor } = teamColors;

  const stars = useMemo(
    () => (match ? findStarsForDate(starsResult.data, match.date) : []),
    [starsResult.data, match]
  );

  // Whatever the scoresheet has for this match — live, finished, or not
  // found — every section below just renders what's there instead of
  // branching on match.played.
  const game = useMemo(() => {
    if (!match) return null;
    const games = parseLiveGames(matchSheetResult.data, season);
    return findGameForMatch(games, match.date, match.awayTeam, match.homeTeam) ?? null;
  }, [matchSheetResult.data, match, season]);

  const isLive = !!game?.isInProgress;
  // A future match's block can already exist in the sheet (empty, pre-
  // created ahead of time) — only treat the game as having data once it's
  // actually started, not merely because a matching block was found.
  const hasStarted = !!game && (game.isInProgress || game.isFinished);

  const periods = useMemo(() => (hasStarted && game ? periodScores(game) : null), [hasStarted, game]);
  const events = useMemo(() => (hasStarted && game ? gameEvents(game) : []), [hasStarted, game]);

  const { loading, error } = combineFetchStates(matchesResult, starsResult, matchSheetResult, teamColors);

  const backLink = (
    <div
      style={{ color: colors.accent, fontSize: 13, cursor: "pointer", marginBottom: 16 }}
      onClick={() => navigate(`/${season}/calendar`)}
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
      {isLive ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: colors.error,
              animation: "live-pulse 1.2s ease-in-out infinite",
            }}
          />
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: colors.error,
              fontWeight: 700,
            }}
          >
            {`Période ${game!.period}`}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: colors.mutedText, marginBottom: 6 }}>
          {match.date}
          {match.hour && ` · ${match.hour}`} · {match.status}
        </div>
      )}
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
            onClick={() => navigate(`/${season}/teams/${encodeURIComponent(match.awayTeam)}`)}
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
            color: match.played || isLive ? colors.accent : colors.primaryText,
            whiteSpace: "nowrap",
          }}
        >
          {isLive ? `${game!.awayScore} – ${game!.homeScore}` : match.resultLabel}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <TeamLogo teamName={match.homeTeam} color={homeColor} size={40} />
          <div
            onClick={() => navigate(`/${season}/teams/${encodeURIComponent(match.homeTeam)}`)}
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

      {hasStarted && game && (
        <>
          <div style={sectionTitleStyle}>Statistiques</div>
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
                gridTemplateColumns: "1fr 90px 1fr",
                padding: "10px 16px",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: colors.mutedText,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div>{match.awayTeam}</div>
              <div style={{ textAlign: "center" }}>Stat</div>
              <div style={{ textAlign: "right" }}>{match.homeTeam}</div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 1fr",
                padding: "12px 16px",
                fontSize: 15,
                alignItems: "center",
                borderBottom: "1px solid oklch(0.23 0.02 250)",
              }}
            >
              <div style={{ fontWeight: 700 }}>{game.away.shotsTotal || "0"}</div>
              <div style={statLabelStyle}>Tirs</div>
              <div style={{ fontWeight: 700, textAlign: "right" }}>{game.home.shotsTotal || "0"}</div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 1fr",
                padding: "12px 16px",
                fontSize: 15,
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700 }}>{game.away.penalties.length * 2}</div>
              <div style={statLabelStyle}>Pén (min)</div>
              <div style={{ fontWeight: 700, textAlign: "right" }}>{game.home.penalties.length * 2}</div>
            </div>
          </div>
        </>
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
                onClick={() => navigate(`/${season}/teams/${encodeURIComponent(match.awayTeam)}`)}
                style={{ fontWeight: 600, cursor: "pointer" }}
              >
                {match.awayTeam}
              </div>
              {periods.map(p => (
                <div key={p.period} style={p.away > p.home ? periodWinStyle : undefined}>
                  {p.away}
                </div>
              ))}
              <div style={{ fontWeight: 700 }}>{match.awayScore ?? game!.awayScore}</div>
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
                onClick={() => navigate(`/${season}/teams/${encodeURIComponent(match.homeTeam)}`)}
                style={{ fontWeight: 600, cursor: "pointer" }}
              >
                {match.homeTeam}
              </div>
              {periods.map(p => (
                <div key={p.period} style={p.home > p.away ? periodWinStyle : undefined}>
                  {p.home}
                </div>
              ))}
              <div style={{ fontWeight: 700 }}>{match.homeScore ?? game!.homeScore}</div>
              <div style={{ fontWeight: 700 }}>{match.homePtsFS ?? "–"}</div>
            </div>
          </div>
        </>
      )}

      {hasStarted && (
        <>
          <div style={sectionTitleStyle}>Évènements du match</div>
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
                gridTemplateColumns: "60px 80px 80px 1fr 1.3fr 1.8fr",
                minWidth: 640,
                padding: "10px 16px",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: colors.mutedText,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div>Pér</div>
              <div>Temps</div>
              <div>Type</div>
              <div>Équipe</div>
              <div>Joueur</div>
              <div>Détail</div>
            </div>
            {events.length === 0 ? (
              <div style={{ padding: 16, fontSize: 13, color: colors.mutedText }}>Aucun évènement enregistré.</div>
            ) : (
              events.map((e, index) => (
                <div
                  key={`${e.type}-${e.period}-${e.time}-${e.playerNumber}-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 80px 80px 1fr 1.3fr 1.8fr",
                    minWidth: 640,
                    padding: "10px 16px",
                    fontSize: 14,
                    alignItems: "center",
                    borderBottom: "1px solid oklch(0.23 0.02 250)",
                  }}
                >
                  <div style={{ color: colors.mutedText }}>{e.period}</div>
                  <div style={{ color: colors.mutedText }}>{e.time}</div>
                  <div style={eventTypeStyle(e.type)}>{e.type === "goal" ? "But" : "Pénalité"}</div>
                  <div>{e.teamName}</div>
                  <div style={{ fontWeight: 600 }}>
                    #{e.playerNumber} {e.playerName}
                  </div>
                  <div style={{ color: colors.mutedText }}>{e.detail}</div>
                </div>
              ))
            )}
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
                onClick={() => navigate(`/${season}/leaderboard/${encodePlayerId(star.name, star.team)}`)}
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
                  onClick={() => navigate(`/${season}/teams/${encodeURIComponent(star.team)}`)}
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
