import { useMemo, useState, type CSSProperties } from "react";
import { colors } from "../theme/tokens";
import type { RowData } from "../utils/sheetFetch";
import { compareSortValues, type SortDirection } from "../utils/sortValues";

export interface TableColumn {
  key: string;
  label: string;
}

interface SortState {
  key: string;
  direction: SortDirection;
}

const parseNumeric = (raw: string | undefined): number | null => {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "—" || trimmed === "-") return null;
  const value = Number(trimmed.replace(",", ".").replace("%", ""));
  return Number.isFinite(value) ? value : null;
};

const isNumericColumn = (rows: RowData[], key: string): boolean => {
  const values = rows.map(r => r[key]).filter((v): v is string => !!v && v.trim() !== "");
  return values.length > 0 && values.every(v => parseNumeric(v) !== null);
};

interface StatTableProps {
  columns: TableColumn[];
  rows: RowData[];
  /** Number of leading columns pinned while scrolling horizontally (max 2). */
  stickyColumnCount?: number;
  /** When provided, rows become clickable (e.g. navigate to a detail page). */
  onRowClick?: (row: RowData) => void;
}

const RANK_COLUMN_WIDTH = 44;
const MAX_BODY_HEIGHT = 640;

const headerCellStyle: CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 12,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: colors.mutedText,
  position: "sticky",
  top: 0,
  zIndex: 3,
  background: colors.cardBackground,
};

// Generic table for stat leaderboards: sticky header, sticky leading columns
// (rank + name), dark non-interactive rows. Columns are entirely driven by
// the `columns` prop so callers control shape/order/labels per mode.
export default function StatTable({ columns, rows, stickyColumnCount = 2, onRowClick }: StatTableProps) {
  const [sortState, setSortState] = useState<SortState | null>(null);
  const stickyCount = Math.min(stickyColumnCount, 2, columns.length);

  const handleHeaderClick = (key: string, index: number) => {
    setSortState(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      const direction: SortDirection = index === 0 || !isNumericColumn(rows, key) ? "asc" : "desc";
      return { key, direction };
    });
  };

  const sortedRows = useMemo(() => {
    if (!sortState) return rows;
    const { key, direction } = sortState;
    const numeric = isNumericColumn(rows, key);
    return [...rows].sort((a, b) => {
      if (numeric) {
        const na = parseNumeric(a[key]);
        const nb = parseNumeric(b[key]);
        if (na === null && nb === null) return 0;
        if (na === null) return 1;
        if (nb === null) return -1;
        return compareSortValues(na, nb, direction);
      }
      return compareSortValues(a[key] ?? "", b[key] ?? "", direction);
    });
  }, [rows, sortState]);

  const gridTemplateColumns = columns
    .map((_, index) => {
      if (index === 0) return `${RANK_COLUMN_WIDTH}px`;
      if (index === 1) return "1.4fr";
      return "minmax(70px, 1fr)";
    })
    .join(" ");

  const minWidth = RANK_COLUMN_WIDTH + Math.max(columns.length - 1, 0) * 100 + 60;

  const stickyCellStyle = (index: number): CSSProperties =>
    index < stickyCount
      ? {
          position: "sticky",
          left: index === 0 ? 0 : RANK_COLUMN_WIDTH,
          zIndex: 1,
        }
      : {};

  return (
    <div
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        overflow: "auto",
        maxHeight: MAX_BODY_HEIGHT,
      }}
    >
      <div style={{ minWidth }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          {columns.map((column, index) => (
            <div
              key={column.key}
              onClick={() => handleHeaderClick(column.key, index)}
              style={{
                ...headerCellStyle,
                ...stickyCellStyle(index),
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              {column.label}
              {sortState?.key === column.key && (
                <span style={{ color: colors.accent }}>
                  {" "}
                  {sortState.direction === "asc" ? "▲" : "▼"}
                </span>
              )}
            </div>
          ))}
        </div>

        {sortedRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            style={{
              display: "grid",
              gridTemplateColumns,
              fontSize: 14,
              borderBottom: `1px solid ${colors.border}`,
              cursor: onRowClick ? "pointer" : undefined,
            }}
          >
            {columns.map((column, index) => (
              <div
                key={column.key}
                style={{
                  ...stickyCellStyle(index),
                  background: colors.cardBackground,
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  fontWeight: index === 0 ? 700 : index === 1 ? 600 : 400,
                  color: index === 0 ? colors.accent : colors.primaryText,
                }}
              >
                {row[column.key] ?? ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
