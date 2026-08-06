import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import { colors } from "./theme/tokens";

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
            <Route path="/standings" element={<div>Standings — TODO</div>} />
            <Route path="/leaderboard" element={<div>Leaderboard — TODO</div>} />
            <Route path="/teams" element={<div>Teams — TODO</div>} />
            <Route path="/calendar" element={<div>Calendar — TODO</div>} />
            <Route path="/players/*" element={<Navigate to="/leaderboard" replace />} />
            <Route path="*" element={<Navigate to="/leaderboard" replace />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}
