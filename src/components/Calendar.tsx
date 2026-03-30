import { useState, useMemo, useEffect } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { fetchSheetRawData } from "../utils/sheetFetch";
import DataTable from "./DataTable";
import type { RowData } from "../utils/sheetFetch";

const CALENDAR_SHEET_NAME = "Calendrier/Résultats/Étoiles 2025-26";

const calendarTabs = [
  { label: "Matchs", range: "B1:T37" },
  { label: "Étoiles", range: "U4:AA37" },
];

const MATCH_COLUMNS = 10;

interface MatchesTransformResult {
  rows: RowData[];
  columnOrder: string[];
  columnLabels: Record<string, string>;
}

interface TableTransformResult {
  rows: RowData[];
  columnOrder: string[];
  columnLabels: Record<string, string>;
}

const createColumnKey = (index: number) => `match_col_${index}`;

// Parse the raw sheet where each source row contains two games:
// first game in columns 0..9 and second game in columns 10..18.
const transformMatches = (rawRows: string[][]): MatchesTransformResult => {
  const emptyResult: MatchesTransformResult = {
    rows: [],
    columnOrder: [],
    columnLabels: {},
  };

  if (rawRows.length === 0) {
    return emptyResult;
  }

  const headerRowIndex = rawRows.findIndex(
    row => row[0] === "Sem" && row[1] === "Date"
  );

  if (headerRowIndex === -1) {
    return emptyResult;
  }

  const headerLabels = rawRows[headerRowIndex].slice(0, MATCH_COLUMNS);
  const columnOrder = headerLabels.map((_, index) => createColumnKey(index));
  const columnLabels = columnOrder.reduce((acc, key, index) => {
    acc[key] = headerLabels[index] ?? "";
    return acc;
  }, {} as Record<string, string>);

  const mapValuesToRow = (values: string[]): RowData => {
    const row: RowData = {};

    for (let index = 0; index < MATCH_COLUMNS; index++) {
      row[createColumnKey(index)] = values[index] ?? "";
    }

    return row;
  };

  const hasVisibleData = (values: string[]): boolean =>
    values.some(value => value?.trim() !== "");

  const rows: RowData[] = [];

  for (let rowIndex = headerRowIndex + 1; rowIndex < rawRows.length; rowIndex++) {
    const source = rawRows[rowIndex] ?? [];

    const firstGameValues = source.slice(0, MATCH_COLUMNS);

    // Second game has no "Sem" column, so we prepend the week from first half.
    const secondGameValues = [source[0] ?? "", ...source.slice(10, 19)];

    if (hasVisibleData(firstGameValues)) {
      rows.push(mapValuesToRow(firstGameValues));
    }

    if (hasVisibleData(secondGameValues)) {
      rows.push(mapValuesToRow(secondGameValues));
    }
  }

  return { rows, columnOrder, columnLabels };
};

export default function Calendar() {
  const [activeTab, setActiveTab] = useState(0);
  const [rawData, setRawData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchSheetRawData(calendarTabs[activeTab].range, apiKey, CALENDAR_SHEET_NAME)
      .then(data => {
        setRawData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [activeTab, apiKey]);

  const matchesView = useMemo(() => transformMatches(rawData), [rawData]);
  const starsView = useMemo(() => convertRawToTable(rawData), [rawData]);

  const displayData = activeTab === 0 ? matchesView.rows : starsView.rows;

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
        data={displayData}
        loading={loading}
        error={error}
        columnOrder={activeTab === 0 ? matchesView.columnOrder : starsView.columnOrder}
        columnLabels={activeTab === 0 ? matchesView.columnLabels : starsView.columnLabels}
      />
    </Box>
  );
}

// Convert raw sheet rows to table rows while preserving exact column order.
const convertRawToTable = (rawRows: string[][]): TableTransformResult => {
  const emptyResult: TableTransformResult = {
    rows: [],
    columnOrder: [],
    columnLabels: {},
  };

  if (rawRows.length === 0) {
    return emptyResult;
  }

  const headerRow = rawRows[0] ?? [];
  const headerIndices = headerRow
    .map((value, index) => ({ value, index }))
    .filter(item => item.value?.trim() !== "");

  const columnOrder = headerIndices.map(item => `star_col_${item.index}`);
  const columnLabels = headerIndices.reduce((acc, item) => {
    acc[`star_col_${item.index}`] = item.value;
    return acc;
  }, {} as Record<string, string>);

  const rows: RowData[] = [];

  for (let rowIndex = 1; rowIndex < rawRows.length; rowIndex++) {
    const source = rawRows[rowIndex] ?? [];
    const row: RowData = {};

    headerIndices.forEach(item => {
      row[`star_col_${item.index}`] = source[item.index] ?? "";
    });

    const hasVisibleData = Object.values(row).some(value => value.trim() !== "");
    if (hasVisibleData) {
      rows.push(row);
    }
  }

  return { rows, columnOrder, columnLabels };
};
