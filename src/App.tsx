import {
  Container,
  Box,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { HashRouter, Routes, Route } from "react-router-dom";
import { theme } from "./theme";
import TopBar from "./components/TopBar";
import PlayersTabs from "./components/PlayersTabs";
import TeamRanking from "./components/TeamRanking";
import Calendar from "./components/Calendar";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <Box>
          <TopBar />

          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mt: 2 }}>
              <Routes>
                <Route path="/players/*" element={<PlayersTabs />} />
                <Route path="/teams" element={<TeamRanking />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/*" element={<PlayersTabs />} />
              </Routes>
            </Box>
          </Container>
        </Box>
      </HashRouter>
    </ThemeProvider>
  );
}