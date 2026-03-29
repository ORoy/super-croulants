import { useState } from "react";
import { Box, Tabs, Tab, Typography, Paper } from "@mui/material";

const teamTabs = [
  { label: "Saison Régulière + Séries" },
  { label: "Séries Éliminatoires" },
  { label: "Saison Régulière" },
];

export default function TeamRanking() {
  const [activeTab, setActiveTab] = useState(0);

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
          <Tab key={idx} label={tab.label} />
        ))}
      </Tabs>
      <Paper sx={{ p: 3 }}>
        <Typography>Content for {teamTabs[activeTab].label}</Typography>
      </Paper>
    </Box>
  );
}
