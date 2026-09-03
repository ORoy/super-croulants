import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Leaderboard from "./components/Leaderboard";
import Calendar from "./components/Calendar";
import Live from "./components/Live";
import Standings from "./components/Standings";
import Teams from "./components/Teams";
import TeamDetail from "./components/TeamDetail";
import MatchDetail from "./components/MatchDetail";
import PlayerDetail from "./components/PlayerDetail";
import { colors } from "./theme/tokens";
import { DEFAULT_SEASON } from "./config/sheets";

export default function App() {
  return (
    <HashRouter>
      <div
        style={{
          minHeight: "100vh",
          background: colors.background,
          color: colors.primaryText,
          fontFamily: "'Work Sans', sans-serif",
        }}
      >
        <Header />
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(14px,4vw,28px)" }}>
          <Routes>
            <Route path="/:season/standings" element={<Standings />} />
            <Route path="/:season/leaderboard" element={<Leaderboard />} />
            <Route path="/:season/leaderboard/:playerId" element={<PlayerDetail />} />
            <Route path="/:season/teams" element={<Teams />} />
            <Route path="/:season/teams/:teamId" element={<TeamDetail />} />
            <Route path="/:season/calendar" element={<Calendar />} />
            <Route path="/:season/calendar/:matchId" element={<MatchDetail />} />
            <Route path="/:season/live" element={<Live />} />
            <Route path="*" element={<Navigate to={`/${DEFAULT_SEASON}/leaderboard`} replace />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}
