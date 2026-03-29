import { useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import DataTable from "./DataTable";
import { useSheetData } from "../hooks/useSheetData";

const playerTabs = [
  { label: "Saison Régulière", range: "B2:I72" },
  { label: "Séries", range: "K2:R72" },
  { label: "Saison + Séries", range: "T2:AA72" },
  { label: "Pénalités", range: "AC2:AF72" },
  { label: "Joueurs étoiles", range: "AH2:AL72" },
  { label: "Gardiens", range: "AN2:AU72" },
  { label: "1997-1998", range: "AW2:BF307" },
  { label: "Moyenne pts/match", range: "BI2:BP17" },
];

export default function PlayersTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const { data, loading, error } = useSheetData(playerTabs[activeTab].range);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}>
        Classement Joueurs
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="player sections"
        >
          {playerTabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ mt: 3 }}>
        <DataTable data={data} loading={loading} error={error} />
      </Box>
    </Box>
  );
}
