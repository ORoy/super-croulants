import { useMemo, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useSheetRawData } from "../hooks/useSheetData";
import { useTeamColors } from "../hooks/useTeamColors";
import { SHEET_NAMES } from "../config/sheets";
import { STANDINGS_RANGE, SECTION_TITLES, parseStandingsSection } from "../utils/standings";
import { colors } from "../theme/tokens";

const ERROR_COLOR = "oklch(0.65 0.16 25)";

const logoStyle = (background: string, border: string): CSSProperties => ({
  width: 48,
  height: 48,
  borderRadius: 8,
  flexShrink: 0,
  background: background || colors.border,
  border: border ? `2px solid ${border}` : undefined,
});

export default function Teams() {
  const navigate = useNavigate();

  const { data: standingsRaw, loading: standingsLoading, error: standingsError } = useSheetRawData(
    STANDINGS_RANGE,
    SHEET_NAMES.standings
  );
  const { getTeamColor, loading: colorsLoading, error: colorsError } = useTeamColors();

  const teams = useMemo(
    () => parseStandingsSection(standingsRaw, SECTION_TITLES.overall),
    [standingsRaw]
  );

  const loading = standingsLoading || colorsLoading;
  const error = standingsError ?? colorsError;

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800 }}>
          Équipes
        </div>
        <div style={{ fontSize: 13, color: colors.mutedText }}>
          {teams.length} clubs · Super Croulants
        </div>
      </div>

      {loading && <div style={{ color: colors.mutedText }}>Chargement…</div>}
      {error && <div style={{ color: ERROR_COLOR }}>Erreur de chargement : {error}</div>}

      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 14,
          }}
        >
          {teams.map(team => {
            const teamColor = getTeamColor(team.team);
            return (
              <div
                key={team.team}
                onClick={() => navigate(`/teams/${encodeURIComponent(team.team)}`)}
                style={{
                  background: colors.cardBackground,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 10,
                  padding: 18,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={logoStyle(teamColor?.background ?? "", teamColor?.text ?? "")} />
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 19, fontWeight: 700 }}>
                  {team.team}
                </div>
                <div style={{ fontSize: 13, color: colors.mutedText }}>
                  Rang #{team.rank} · {team.w}-{team.l}-{team.otl} · {team.pts} PTS
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
