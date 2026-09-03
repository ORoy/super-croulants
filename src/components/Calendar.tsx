import { useMemo, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useSheetRawData } from "../hooks/useSheetData";
import { useIsMobile } from "../hooks/useIsMobile";
import { useSeason } from "../hooks/useSeason";
import { calendarTabs, DEFAULT_SEASON } from "../config/sheets";
import { colors } from "../theme/tokens";
import { transformMatches, type Match } from "../utils/matches";

const ROW_BORDER = "oklch(0.23 0.02 250)";

const mutedLabelStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: colors.mutedText,
};

interface MatchRowProps {
  match: Match;
  isMobile: boolean;
  accentResult?: boolean;
  onClick: () => void;
}

function MatchRow({ match, isMobile, accentResult = false, onClick }: MatchRowProps) {
  const resultStyle: CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: accentResult ? 700 : 800,
    color: accentResult ? colors.accent : colors.primaryText,
  };

  const hasPtsFS = match.played && match.awayPtsFS !== null && match.homePtsFS !== null;

  if (isMobile) {
    return (
      <div
        onClick={onClick}
        style={{ padding: "12px 16px", borderBottom: `1px solid ${ROW_BORDER}`, cursor: "pointer" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <div style={{ fontSize: 12, color: colors.mutedText }}>{match.date}</div>
          <div style={mutedLabelStyle}>{match.status}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 15,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {match.awayTeam}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, gap: 1 }}>
            <div style={{ ...resultStyle, fontSize: accentResult ? 16 : 17 }}>{match.resultLabel}</div>
            {hasPtsFS && (
              <div style={{ fontSize: 10, color: colors.mutedText, whiteSpace: "nowrap" }}>
                {match.awayPtsFS} – {match.homePtsFS}
              </div>
            )}
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 15,
              flex: 1,
              minWidth: 0,
              textAlign: "right",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {match.homeTeam}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        display: "grid",
        gridTemplateColumns: "90px 1fr auto 1fr 90px",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        borderBottom: `1px solid ${ROW_BORDER}`,
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 13, color: colors.mutedText }}>{match.date}</div>
      <div style={{ fontWeight: 600, textAlign: "right" }}>{match.awayTeam}</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 8px", gap: 1 }}>
        <div style={resultStyle}>{match.resultLabel}</div>
        {hasPtsFS && (
          <div style={{ fontSize: 10, color: colors.mutedText, whiteSpace: "nowrap" }}>
            {match.awayPtsFS} – {match.homePtsFS}
          </div>
        )}
      </div>
      <div style={{ fontWeight: 600 }}>{match.homeTeam}</div>
      <div style={{ ...mutedLabelStyle, textAlign: "right" }}>{match.status}</div>
    </div>
  );
}

interface MatchSectionProps {
  title: string;
  matches: Match[];
  emptyMessage: string;
  isMobile: boolean;
  accentResult?: boolean;
  marginBottom?: number;
  onSelectMatch: (match: Match) => void;
}

function MatchSection({
  title,
  matches,
  emptyMessage,
  isMobile,
  accentResult = false,
  marginBottom = 32,
  onSelectMatch,
}: MatchSectionProps) {
  return (
    <div style={{ marginBottom }}>
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
        {matches.length === 0 ? (
          <div style={{ padding: "16px", color: colors.mutedText, fontSize: 14 }}>{emptyMessage}</div>
        ) : (
          matches.map(match => (
            <MatchRow
              key={match.id}
              match={match}
              isMobile={isMobile}
              accentResult={accentResult}
              onClick={() => onSelectMatch(match)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function Calendar() {
  const navigate = useNavigate();
  const { season, spreadsheetId } = useSeason();
  const { data: rawData, loading, error } = useSheetRawData(spreadsheetId, calendarTabs(season)[0]);
  const isMobile = useIsMobile();

  const matches = useMemo(() => transformMatches(rawData), [rawData]);
  const upcomingMatches = useMemo(() => matches.filter(match => !match.played), [matches]);
  const pastMatches = useMemo(
    () => [...matches.filter(match => match.played)].reverse(),
    [matches]
  );
  const hasUpcoming = upcomingMatches.length > 0;
  const subhead =
    season === DEFAULT_SEASON
      ? "Matchs à venir et historique des résultats"
      : `Calendrier complet de la saison ${season} — saison terminée`;

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800 }}>
          Calendrier
        </div>
        <div style={{ fontSize: 13, color: colors.mutedText }}>{subhead}</div>
      </div>

      {loading && <div style={{ color: colors.mutedText, fontSize: 14 }}>Chargement…</div>}
      {error && <div style={{ color: colors.error, fontSize: 14 }}>{error}</div>}

      {!loading && !error && (
        <>
          {hasUpcoming && (
            <MatchSection
              title="À venir"
              matches={upcomingMatches}
              emptyMessage="Aucun match à venir."
              isMobile={isMobile}
              accentResult
              onSelectMatch={match => navigate(`/${season}/calendar/${match.id}`)}
            />
          )}
          <MatchSection
            title="Résultats"
            matches={pastMatches}
            emptyMessage="Aucun résultat pour le moment."
            isMobile={isMobile}
            marginBottom={0}
            onSelectMatch={match => navigate(`/${season}/calendar/${match.id}`)}
          />
        </>
      )}
    </div>
  );
}
