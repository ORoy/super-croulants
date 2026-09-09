import { useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import StatTable, { type TableColumn } from "./StatTable";
import { useSheetData } from "../hooks/useSheetData";
import { useSeason } from "../hooks/useSeason";
import { playerTabs, type Season } from "../config/sheets";
import { colors } from "../theme/tokens";
import { normalizeRow } from "../utils/normalizeRow";
import { encodePlayerId } from "../utils/playerId";

const REGULAR_SERIES_BOTH_COLUMNS: TableColumn[] = [
  { key: "RANG", label: "RANG" },
  { key: "JOUEURS", label: "JOUEUR" },
  { key: "ÉQUIPES", label: "ÉQUIPE" },
  { key: "PTS", label: "PTS" },
  { key: "BUTS", label: "BUTS" },
  { key: "PASSES", label: "PASSES" },
  { key: "PJ", label: "PJ" },
  { key: "MOY PTS/ Match", label: "MOY PTS/MATCH" },
];

// The "1997-1998" tab's header ("Progression 2025-26", "Progression 2026-27", …)
// tracks the current season, so its column key can't be a static literal.
const PROGRESSION_KEY_PLACEHOLDER = "__PROGRESSION_KEY__";

interface Mode {
  /** Matches an entry in `playerTabs` (drives the sheet range fetched). */
  sheetLabel: string;
  /** Label shown on the mode-switcher pill. */
  displayLabel: string;
  columns: TableColumn[];
  /** Row key holding the player's name, for Player Detail navigation. */
  nameKey: string;
  /** Row key holding the player's team, when this mode's columns include one. */
  teamKey?: string;
}

const MODES: Mode[] = [
  {
    sheetLabel: "Saison Régulière",
    displayLabel: "Saison Régulière",
    columns: REGULAR_SERIES_BOTH_COLUMNS,
    nameKey: "JOUEURS",
    teamKey: "ÉQUIPES",
  },
  {
    sheetLabel: "Séries",
    displayLabel: "Séries",
    columns: REGULAR_SERIES_BOTH_COLUMNS,
    nameKey: "JOUEURS",
    teamKey: "ÉQUIPES",
  },
  {
    sheetLabel: "Saison + Séries",
    displayLabel: "Saison + Séries",
    columns: REGULAR_SERIES_BOTH_COLUMNS,
    nameKey: "JOUEURS",
    teamKey: "ÉQUIPES",
  },
  {
    sheetLabel: "Pénalités",
    displayLabel: "Pénalités",
    columns: [
      { key: "RANG", label: "RANG" },
      { key: "JOUEURS", label: "JOUEUR" },
      { key: "ÉQUIPES", label: "ÉQUIPE" },
      { key: "TOTAL (min)", label: "TOTAL (MIN)" },
    ],
    nameKey: "JOUEURS",
    teamKey: "ÉQUIPES",
  },
  {
    sheetLabel: "Joueurs étoiles",
    displayLabel: "Joueurs Étoiles",
    columns: [
      { key: "RANG", label: "RANG" },
      { key: "JOUEURS", label: "JOUEUR" },
      { key: "ÉQUIPES", label: "ÉQUIPE" },
      { key: "POINTS", label: "POINTS" },
      { key: "MOY PTS/ Match", label: "MOY PTS/MATCH" },
    ],
    nameKey: "JOUEURS",
    teamKey: "ÉQUIPES",
  },
  {
    sheetLabel: "Gardiens",
    displayLabel: "Gardiens",
    columns: [
      { key: "RANG", label: "RANG" },
      { key: "JOUEURS", label: "JOUEUR" },
      { key: "ÉQUIPE", label: "ÉQUIPE" },
      { key: "PJ", label: "PJ" },
      { key: "% ÉFFICACITÉ", label: "% EFFICACITÉ" },
      { key: "TOTAL LANCERS REÇUS", label: "LANCERS REÇUS" },
      { key: "MOY LANCERS / MATCH", label: "MOY LANCERS/MATCH" },
      { key: "BUTS CONTRE", label: "BUTS CONTRE" },
    ],
    nameKey: "JOUEURS",
    teamKey: "ÉQUIPE",
  },
  {
    sheetLabel: "1997-1998",
    displayLabel: "Depuis 1997-98",
    columns: [
      { key: "Rang", label: "RANG" },
      { key: "Rang Début de saison", label: "RANG DÉBUT SAISON" },
      { key: PROGRESSION_KEY_PLACEHOLDER, label: "PROGRESSION" },
      { key: "Status", label: "STATUT" },
      { key: "Nom", label: "JOUEUR" },
      { key: "PTS", label: "PTS" },
      { key: "Buts", label: "BUTS" },
      { key: "Passes", label: "PASSES" },
      { key: "PJ", label: "PJ" },
      { key: "Moy PTS / Match", label: "MOY PTS/MATCH" },
    ],
    nameKey: "Nom",
  },
];

const resolveMode = (mode: Mode, season: Season): Mode => ({
  ...mode,
  columns: mode.columns.map(column =>
    column.key === PROGRESSION_KEY_PLACEHOLDER ? { ...column, key: `Progression ${season}` } : column
  ),
});

const pillBase: CSSProperties = {
  padding: "8px 16px",
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 6,
  cursor: "pointer",
  letterSpacing: "0.3px",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const pillInactive: CSSProperties = {
  ...pillBase,
  color: colors.mutedText,
  background: colors.cardBackground,
  border: `1px solid ${colors.border}`,
};

const pillActive: CSSProperties = {
  ...pillBase,
  background: colors.accent,
  color: "#12181e",
  border: `1px solid ${colors.accent}`,
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const { season, spreadsheetId } = useSeason();
  const [activeModeIndex, setActiveModeIndex] = useState(0);
  const activeMode = useMemo(() => resolveMode(MODES[activeModeIndex], season), [activeModeIndex, season]);

  const { data, loading, error } = useSheetData(
    spreadsheetId,
    playerTabs.find(tab => tab.label === activeMode.sheetLabel) ?? { range: "" }
  );

  const rows = useMemo(
    () => data.map(normalizeRow).filter(row => (row[activeMode.nameKey] ?? "").trim() !== ""),
    [data, activeMode.nameKey]
  );

  return (
    <div>
      <div
        style={{
          marginBottom: 18,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800 }}>
            Classement Joueurs
          </div>
          <div style={{ fontSize: 13, color: colors.mutedText }}>
            Meneurs statistiques de la ligue
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            width: "100%",
            paddingBottom: 2,
          }}
        >
          {MODES.map((mode, index) => (
            <div
              key={mode.sheetLabel}
              style={index === activeModeIndex ? pillActive : pillInactive}
              onClick={() => setActiveModeIndex(index)}
            >
              {mode.displayLabel}
            </div>
          ))}
        </div>
      </div>

      {loading && <div style={{ color: colors.mutedText, padding: "24px 0" }}>Chargement…</div>}

      {!loading && error && (
        <div style={{ color: colors.error, padding: "24px 0" }}>
          Erreur de chargement : {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div style={{ color: colors.mutedText, padding: "24px 0" }}>Aucune donnée disponible.</div>
      )}

      {!loading && !error && rows.length > 0 && (
        <StatTable
          key={activeMode.sheetLabel}
          columns={activeMode.columns}
          rows={rows}
          onRowClick={row => {
            const name = row[activeMode.nameKey];
            if (!name) return;
            const team = activeMode.teamKey ? (row[activeMode.teamKey] ?? "") : "";
            navigate(`/${season}/leaderboard/${encodePlayerId(name, team)}`);
          }}
        />
      )}
    </div>
  );
}
