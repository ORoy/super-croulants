import type { CSSProperties } from "react";
import { colors } from "../theme/tokens";
import type { RowData } from "../utils/sheetFetch";

export interface TableColumn {
  key: string;
  label: string;
}

interface StatTableProps {
  columns: TableColumn[];
  rows: RowData[];
  /** Number of leading columns pinned while scrolling horizontally (max 2). */
  stickyColumnCount?: number;
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
export default function StatTable({ columns, rows, stickyColumnCount = 2 }: StatTableProps) {
  const stickyCount = Math.min(stickyColumnCount, 2, columns.length);

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
              style={{
                ...headerCellStyle,
                ...stickyCellStyle(index),
                padding: "10px 16px",
              }}
            >
              {column.label}
            </div>
          ))}
        </div>

        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: "grid",
              gridTemplateColumns,
              fontSize: 14,
              borderBottom: `1px solid ${colors.border}`,
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
