import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { useSeason } from "../hooks/useSeason";
import { DEFAULT_SEASON } from "../config/sheets";

// Only the current season's stats are gated. Past seasons are historical
// record, not competitive-advantage info, so they stay open to everyone.
export default function RequireAdmin({ children }: { children: ReactElement }) {
  const { isAdmin } = useAdmin();
  const { season } = useSeason();
  return isAdmin || season !== DEFAULT_SEASON ? children : <Navigate to={`/${season}/standings`} replace />;
}
