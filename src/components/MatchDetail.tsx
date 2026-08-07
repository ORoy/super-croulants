import { useMemo, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSheetRawData, combineFetchStates } from "../hooks/useSheetData";
import { useTeamColors } from "../hooks/useTeamColors";
import { calendarTabs } from "../config/sheets";
import { transformMatches } from "../utils/matches";
import { findStarsForDate } from "../utils/stars";
import { colors } from "../theme/tokens";
import DetailPageStatus from "./DetailPageStatus";

const badgeStyle = (background: string | undefined, border: string | undefined): CSSProperties => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  flexShrink: 0,
  background: background || colors.border,
  border: border ? `2px solid ${border}` : undefined,
});

const starCardStyle: CSSProperties = {
  background: colors.cardBackground,
  border: `1px solid ${colors.accent}`,
  borderRadius: 10,
  padding: 16,
  textAlign: "left",
};

export default function MatchDetail() {
  const { matchId = "" } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const matchesResult = useSheetRawData(calendarTabs[0]);
  const starsResult = useSheetRawData(calendarTabs[1]);
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

  const { loading, error } = combineFetchStates(matchesResult, starsResult, teamColors);

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
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "clamp(8px,2vw,20px)",
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 30,
              fontWeight: 800,
              textAlign: "right",
            }}
          >
            {match.awayTeam}
          </div>
          <div style={badgeStyle(awayColor?.background, awayColor?.text)} />
        </div>
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(28px,7vw,44px)",
            fontWeight: 800,
            color: match.played ? colors.accent : colors.primaryText,
          }}
        >
          {match.resultLabel}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={badgeStyle(homeColor?.background, homeColor?.text)} />
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 30, fontWeight: 800 }}>
            {match.homeTeam}
          </div>
        </div>
      </div>

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
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                {star.name}
              </div>
              <div style={{ fontSize: 13, color: colors.mutedText, marginTop: 2 }}>
                #{star.number} · {star.team}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
