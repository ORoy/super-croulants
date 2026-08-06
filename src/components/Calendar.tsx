import { useState, useMemo } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import DataTable from "./DataTable";
import { useSheetRawData } from "../hooks/useSheetData";
import { calendarTabs, SHEET_NAMES } from "../config/sheets";
import type { RowData } from "../utils/sheetFetch";

const MATCH_COLUMNS = 10;

interface SheetTableView {
  rows: RowData[];
  columnOrder: string[];
  columnLabels: Record<string, string>;
}

const EMPTY_VIEW: SheetTableView = { rows: [], columnOrder: [], columnLabels: {} };

const createColumnKey = (index: number) => `match_col_${index}`;

const rowHasData = (values: (string | undefined)[]): boolean =>
  values.some(value => value?.trim() !== "");

const buildTableView = (
  rows: RowData[],
  columnOrder: string[],
  labels: string[]
): SheetTableView => ({
  rows,
  columnOrder,
  columnLabels: columnOrder.reduce((acc, key, index) => {
    acc[key] = labels[index] ?? "";
    return acc;
  }, {} as Record<string, string>),
});

// Parse the raw sheet where each source row contains two games:
// first game in columns 0..9 and second game in columns 10..18.
const transformMatches = (rawRows: string[][]): SheetTableView => {
  if (rawRows.length === 0) {
    return EMPTY_VIEW;
  }

  const headerRowIndex = rawRows.findIndex(
    row => row[0] === "Sem" && row[1] === "Date"
  );

  if (headerRowIndex === -1) {
    return EMPTY_VIEW;
  }

  const headerLabels = rawRows[headerRowIndex].slice(0, MATCH_COLUMNS);
  const columnOrder = headerLabels.map((_, index) => createColumnKey(index));

  const mapValuesToRow = (values: string[]): RowData => {
    const row: RowData = {};

    for (let index = 0; index < MATCH_COLUMNS; index++) {
      row[createColumnKey(index)] = values[index] ?? "";
    }

    return row;
  };

  const rows: RowData[] = [];

  for (let rowIndex = headerRowIndex + 1; rowIndex < rawRows.length; rowIndex++) {
    const source = rawRows[rowIndex] ?? [];

    const firstGameValues = source.slice(0, MATCH_COLUMNS);

    // Second game has no "Sem" column, so we prepend the week from first half.
    const secondGameValues = [source[0] ?? "", ...source.slice(10, 19)];

    if (rowHasData(firstGameValues)) {
      rows.push(mapValuesToRow(firstGameValues));
    }

    if (rowHasData(secondGameValues)) {
      rows.push(mapValuesToRow(secondGameValues));
    }
  }

  return buildTableView(rows, columnOrder, headerLabels);
};

// Convert raw sheet rows to table rows while preserving exact column order.
const convertRawToTable = (rawRows: string[][]): SheetTableView => {
  if (rawRows.length === 0) {
    return EMPTY_VIEW;
  }

  const headerRow = rawRows[0] ?? [];
  const headerIndices = headerRow
    .map((value, index) => ({ value, index }))
    .filter(item => item.value?.trim() !== "");

  const columnOrder = headerIndices.map(item => `star_col_${item.index}`);
  const labels = headerIndices.map(item => item.value);

  const rows: RowData[] = [];

  for (let rowIndex = 1; rowIndex < rawRows.length; rowIndex++) {
    const source = rawRows[rowIndex] ?? [];
    const row: RowData = {};

    headerIndices.forEach(item => {
      row[`star_col_${item.index}`] = source[item.index] ?? "";
    });

    if (rowHasData(Object.values(row))) {
      rows.push(row);
    }
  }

  return buildTableView(rows, columnOrder, labels);
};

export default function Calendar() {
  const [activeTab, setActiveTab] = useState(0);
  const { data: rawData, loading, error } = useSheetRawData(
    calendarTabs[activeTab].range,
    SHEET_NAMES.calendar
  );

  const matchesView = useMemo(() => transformMatches(rawData), [rawData]);
  const starsView = useMemo(() => convertRawToTable(rawData), [rawData]);

  const activeView = activeTab === 0 ? matchesView : starsView;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}>
        Calendrier
      </Typography>
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {calendarTabs.map((tab, idx) => (
          <Tab key={idx} label={tab.label} />
        ))}
      </Tabs>
      <DataTable
        data={activeView.rows}
        loading={loading}
        error={error}
        columnOrder={activeView.columnOrder}
        columnLabels={activeView.columnLabels}
      />
    </Box>
  );
}
