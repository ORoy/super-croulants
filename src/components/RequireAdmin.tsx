import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { useSeason } from "../hooks/useSeason";

export default function RequireAdmin({ children }: { children: ReactElement }) {
  const { isAdmin } = useAdmin();
  const { season } = useSeason();
  return isAdmin ? children : <Navigate to={`/${season}/standings`} replace />;
}
