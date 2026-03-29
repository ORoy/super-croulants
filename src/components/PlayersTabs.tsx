import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import DataTable from "./DataTable";
import { useSheetData } from "../hooks/useSheetData";

const playerTabs = [
  { label: "CLASSEMENT JOUEURS SAISON RÉGULIÈRE", range: "B2:I72" },
  { label: "CLASSEMENT JOUEURS SÉRIES", range: "K2:R72" },
  { label: "STATS JOUEURS SAISON + SÉRIES", range: "T2:AA72" },
  { label: "CLASSEMENT PÉNALITÉS", range: "AC2:AF72" },
  { label: "CLASSEMENT ÉTOILES", range: "AH2:AL72" },
  { label: "CLASSEMENT GARDIENS", range: "AN2:AU72" },
  { label: "CLASSEMENT DEPUIS 1997-1998", range: "AW2:BF307" },
  { label: "CLASSEMENT - MOYENNE PTS/MATCH > 2.00", range: "BI2:BP17" },
];

export default function PlayersTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const { data, loading, error } = useSheetData(playerTabs[activeTab].range);

  return (
    <Box>
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
