import { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import DataTable from "./DataTable";
import { useSheetData } from "../hooks/useSheetData";

const TEAM_SHEET_NAME = "Classement Saison Régulière 2025-26";

const teamTabs = [
  { label: "SAISON RÉGULIÈRE + SÉRIES", range: "B3:T8" },
  { label: "SÉRIES ÉLIMINATOIRES", range: "B10:T15" },
  { label: "SAISON RÉGULIÈRE", range: "B17:T22" },
];

export default function TeamRanking() {
  const [activeTab, setActiveTab] = useState(0);
  const { data, loading, error } = useSheetData(
    teamTabs[activeTab].range,
    TEAM_SHEET_NAME
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}>
        Classement Équipes
      </Typography>
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {teamTabs.map((tab, idx) => (
          <Tab key={tab.range} label={tab.label} />
        ))}
      </Tabs>
      <DataTable data={data} loading={loading} error={error} />
    </Box>
  );
}
