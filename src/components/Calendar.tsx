import { useState, useMemo } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { useSheetData } from "../hooks/useSheetData";
import DataTable from "./DataTable";
import type { RowData } from "../utils/sheetFetch";

const CALENDAR_SHEET_NAME = "Calendrier/Résultats/Étoiles 2025-26";

const calendarTabs = [
  { label: "Matchs", range: "B2:T37" },
  { label: "Étoiles", range: "U4:AA35" },
];

// Transform matches: each row has 2 matches (B-K and L-T)
// Split them into separate rows with standardized headers
const transformMatches = (data: RowData[]): RowData[] => {
  if (data.length === 0) return [];

  // The first row is headers, but get the object keys to see what actually survived
  // (duplicates in the header row cause object key collapse)
  const headerRow = data[0];
  const allKeys = Object.keys(headerRow);
  
  // Split into two sets of columns (11 for first match, rest for second)
  const firstMatchKeys = allKeys.slice(0, 11); // B-K
  const secondMatchKeys = allKeys.slice(11); // L-T (or however many remain)
  
  // Get the actual header values from the first match columns
  const firstMatchHeaders = firstMatchKeys.map((k) => headerRow[k]);
  
  // Start with the header row
  const transformed: RowData[] = [headerRow];
  
  // Process data rows starting from index 2 (skip index 0=headers, index 1=empty row)
  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    
    // Skip rows that are completely empty
    if (!Object.values(row).some((v) => v)) continue;
    
    // First match
    const firstMatch: RowData = {};
    firstMatchKeys.forEach((key, idx) => {
      firstMatch[firstMatchHeaders[idx] || `col_${idx}`] = row[key];
    });
    if (Object.values(firstMatch).some((v) => v)) {
      transformed.push(firstMatch);
    }
    
    // Second match
    const secondMatch: RowData = {};
    secondMatchKeys.forEach((key, idx) => {
      secondMatch[firstMatchHeaders[idx] || `col_${idx}`] = row[key];
    });
    if (Object.values(secondMatch).some((v) => v)) {
      transformed.push(secondMatch);
    }
  }
  
  return transformed;
};

export default function Calendar() {
  const [activeTab, setActiveTab] = useState(0);
  const { data, loading, error } = useSheetData(
    calendarTabs[activeTab].range,
    CALENDAR_SHEET_NAME
  );

  // Transform matches data if on matches tab
  const displayData = useMemo(() => {
    return activeTab === 0 ? transformMatches(data) : data;
  }, [data, activeTab]);

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
      <DataTable data={displayData} loading={loading} error={error} />
    </Box>
  );
}
