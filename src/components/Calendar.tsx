import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useSheetRawData } from "../hooks/useSheetData";
import { calendarTabs, SHEET_NAMES } from "../config/sheets";
import { colors } from "../theme/tokens";

const MATCH_COLUMNS = 10;
const MOBILE_BREAKPOINT = 720;
const ROW_BORDER = "oklch(0.23 0.02 250)";

interface Match {
  id: string;
  date: string;
  awayTeam: string;
  awayScore: number | null;
  homeTeam: string;
  homeScore: number | null;
  played: boolean;
  status: string;
  resultLabel: string;
}

const parseScore = (value: string | undefined): number | null => {
  const trimmed = value?.trim() ?? "";
  if (trimmed === "" || trimmed === "--" || trimmed === "----") {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

// Each game block has a fixed 10-column layout:
// [phase, date, heure, ptsFS visiteur, buts visiteur, visiteurs, "@", local, buts local, ptsFS local]
const buildMatch = (values: string[], id: string): Match | null => {
  const date = values[1]?.trim() ?? "";
  const awayTeam = values[5]?.trim() ?? "";
  const homeTeam = values[7]?.trim() ?? "";

  if (!date || date === "----" || !awayTeam || !homeTeam) {
    return null;
  }

  const awayScore = parseScore(values[4]);
  const homeScore = parseScore(values[8]);
  const played = awayScore !== null && homeScore !== null;

  return {
    id,
    date,
    awayTeam,
    awayScore,
    homeTeam,
    homeScore,
    played,
    status: played ? "Final" : "À venir",
    resultLabel: played ? `${awayScore} – ${homeScore}` : "vs",
  };
};

// Parse the raw sheet where each source row contains two games:
// first game in columns 0..9 and second game in columns 10..18.
const transformMatches = (rawRows: string[][]): Match[] => {
  if (rawRows.length === 0) {
    return [];
  }

  const headerRowIndex = rawRows.findIndex(
    row => row[0] === "Calendrier" && row[1] === "Date"
  );

  if (headerRowIndex === -1) {
    return [];
  }

  const matches: Match[] = [];

  for (let rowIndex = headerRowIndex + 1; rowIndex < rawRows.length; rowIndex++) {
    const source = rawRows[rowIndex] ?? [];

    const firstGameValues = source.slice(0, MATCH_COLUMNS);
    // Second game shares the first game's phase (column 0), then continues at column 10.
    const secondGameValues = [source[0] ?? "", ...source.slice(10, 19)];

    const firstMatch = buildMatch(firstGameValues, `${rowIndex}-1`);
    if (firstMatch) {
      matches.push(firstMatch);
    }

    const secondMatch = buildMatch(secondGameValues, `${rowIndex}-2`);
    if (secondMatch) {
      matches.push(secondMatch);
    }
  }

  return matches;
};

const useIsMobile = (breakpoint: number): boolean => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
};

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
}

function MatchRow({ match, isMobile, accentResult = false }: MatchRowProps) {
  const resultStyle: CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: accentResult ? 700 : 800,
    color: accentResult ? colors.accent : colors.primaryText,
  };

  if (isMobile) {
    return (
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${ROW_BORDER}` }}>
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
          <div style={{ ...resultStyle, fontSize: accentResult ? 16 : 17, flexShrink: 0 }}>
            {match.resultLabel}
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
      style={{
        display: "grid",
        gridTemplateColumns: "90px 1fr auto 1fr 90px",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        borderBottom: `1px solid ${ROW_BORDER}`,
      }}
    >
      <div style={{ fontSize: 13, color: colors.mutedText }}>{match.date}</div>
      <div style={{ fontWeight: 600, textAlign: "right" }}>{match.awayTeam}</div>
      <div style={{ ...resultStyle, padding: "0 8px" }}>{match.resultLabel}</div>
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
}

function MatchSection({
  title,
  matches,
  emptyMessage,
  isMobile,
  accentResult = false,
  marginBottom = 32,
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
            <MatchRow key={match.id} match={match} isMobile={isMobile} accentResult={accentResult} />
          ))
        )}
      </div>
    </div>
  );
}

export default function Calendar() {
  const { data: rawData, loading, error } = useSheetRawData(
    calendarTabs[0].range,
    SHEET_NAMES.calendar
  );
  const isMobile = useIsMobile(MOBILE_BREAKPOINT);

  const matches = useMemo(() => transformMatches(rawData), [rawData]);
  const upcomingMatches = useMemo(() => matches.filter(match => !match.played), [matches]);
  const pastMatches = useMemo(
    () => [...matches.filter(match => match.played)].reverse(),
    [matches]
  );

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800 }}>
          Calendrier
        </div>
        <div style={{ fontSize: 13, color: colors.mutedText }}>
          Matchs à venir et historique des résultats
        </div>
      </div>

      {loading && <div style={{ color: colors.mutedText, fontSize: 14 }}>Chargement…</div>}
      {error && <div style={{ color: "oklch(0.65 0.16 25)", fontSize: 14 }}>{error}</div>}

      {!loading && !error && (
        <>
          <MatchSection
            title="À venir"
            matches={upcomingMatches}
            emptyMessage="Aucun match à venir."
            isMobile={isMobile}
            accentResult
          />
          <MatchSection
            title="Résultats"
            matches={pastMatches}
            emptyMessage="Aucun résultat pour le moment."
            isMobile={isMobile}
            marginBottom={0}
          />
        </>
      )}
    </div>
  );
}
