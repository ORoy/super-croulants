import { useMemo, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useSheetRawData } from "../hooks/useSheetData";
import { useTeamColors } from "../hooks/useTeamColors";
import { useSeason } from "../hooks/useSeason";
import { liveMatchSheet } from "../config/sheets";
import { colors } from "../theme/tokens";
import { parseLiveGames, computeStandouts, type LiveGame, type LiveStandout } from "../utils/liveMatches";
import { encodePlayerId } from "../utils/playerId";
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

const standoutNote = (standout: LiveStandout): string => {
  const parts: string[] = [];
  if (standout.goals > 0) parts.push(`${standout.goals} ${standout.goals > 1 ? "buts" : "but"}`);
  if (standout.assists > 0) parts.push(`${standout.assists} ${standout.assists > 1 ? "passes" : "passe"}`);
  return parts.join(", ") || "—";
};

interface LiveGameCardProps {
  game: LiveGame;
  getTeamColor: ReturnType<typeof useTeamColors>["getTeamColor"];
}

function LiveGameCard({ game, getTeamColor }: LiveGameCardProps) {
  const navigate = useNavigate();
  const { season } = useSeason();
  const standouts = useMemo(
    () => computeStandouts(game.home, game.away, game.home.name, game.away.name),
    [game]
  );

  const goToTeam = (team: string) => () => navigate(`/${season}/teams/${encodeURIComponent(team)}`);

  const awayColor = getTeamColor(game.away.name);
  const homeColor = getTeamColor(game.home.name);
  const awayShots = game.away.shotsTotal || "0";
  const homeShots = game.home.shotsTotal || "0";
  const awayPim = game.away.penalties.length * 2;
  const homePim = game.home.penalties.length * 2;

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          padding: 26,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: colors.error,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          Période {game.period ?? 1}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)",
            alignItems: "center",
            gap: "clamp(8px,2vw,20px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, minWidth: 0 }}>
            <div
              onClick={goToTeam(game.away.name)}
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
              {game.away.name}
            </div>
            <TeamLogo teamName={game.away.name} color={awayColor} size={40} />
          </div>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(32px,8vw,52px)",
              fontWeight: 800,
              color: colors.accent,
              whiteSpace: "nowrap",
            }}
          >
            {game.awayScore} – {game.homeScore}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <TeamLogo teamName={game.home.name} color={homeColor} size={40} />
            <div
              onClick={goToTeam(game.home.name)}
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
              {game.home.name}
            </div>
          </div>
        </div>
      </div>

      <div style={sectionTitleStyle}>Statistiques en direct</div>
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
          <div onClick={goToTeam(game.away.name)} style={{ cursor: "pointer" }}>
            {game.away.name}
          </div>
          <div style={{ textAlign: "center" }}>Stat</div>
          <div onClick={goToTeam(game.home.name)} style={{ textAlign: "right", cursor: "pointer" }}>
            {game.home.name}
          </div>
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
          <div style={{ fontWeight: 700 }}>{awayShots}</div>
          <div style={statLabelStyle}>Tirs</div>
          <div style={{ fontWeight: 700, textAlign: "right" }}>{homeShots}</div>
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
          <div style={{ fontWeight: 700 }}>{awayPim}</div>
          <div style={statLabelStyle}>Pén (min)</div>
          <div style={{ fontWeight: 700, textAlign: "right" }}>{homePim}</div>
        </div>
      </div>

      <div style={sectionTitleStyle}>Meneurs jusqu'à présent</div>
      {standouts.length === 0 ? (
        <div style={{ color: colors.mutedText, fontSize: 14 }}>Aucun pointage pour le moment.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {standouts.map(standout => (
            <div
              key={`${standout.teamName}-${standout.name}`}
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                padding: 16,
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: colors.mutedText }}>
                Meneur
              </div>
              <div
                onClick={() => navigate(`/${season}/leaderboard/${encodePlayerId(standout.name, standout.teamName)}`)}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  marginTop: 4,
                  cursor: "pointer",
                }}
              >
                {standout.name}
              </div>
              <div style={{ fontSize: 13, color: colors.mutedText, marginTop: 2 }}>
                <span onClick={goToTeam(standout.teamName)} style={{ cursor: "pointer" }}>
                  {standout.teamName}
                </span>{" "}
                · {standoutNote(standout)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Live() {
  const { season, spreadsheetId } = useSeason();
  const { data: rawData, loading, error } = useSheetRawData(
    spreadsheetId,
    liveMatchSheet(season),
    POLL_INTERVAL_MS
  );
  const { getTeamColor, loading: colorsLoading, error: colorsError } = useTeamColors();

  const liveGames = useMemo(
    () => parseLiveGames(rawData).filter(game => game.isInProgress),
    [rawData]
  );

  const isLoading = loading || colorsLoading;
  const loadError = error || colorsError;

  return (
    <div>
      <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: colors.error,
            animation: "live-pulse 1.2s ease-in-out infinite",
          }}
        />
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800 }}>
          Matchs en direct
        </div>
      </div>

      {isLoading && <div style={{ color: colors.mutedText, fontSize: 14 }}>Chargement…</div>}
      {loadError && <div style={{ color: colors.error, fontSize: 14 }}>{loadError}</div>}

      {!isLoading && !loadError && (
        liveGames.length === 0 ? (
          <div
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: 16,
              color: colors.mutedText,
              fontSize: 14,
            }}
          >
            Aucun match en direct pour le moment.
          </div>
        ) : (
          liveGames.map(game => <LiveGameCard key={game.id} game={game} getTeamColor={getTeamColor} />)
        )
      )}
    </div>
  );
}
