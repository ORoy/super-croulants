import type { ReactNode } from "react";
import { colors } from "../theme/tokens";

interface DetailPageStatusProps {
  backLink: ReactNode;
  loading: boolean;
  error: string | null;
  /** Shown when the record wasn't found; omit while it may still exist. */
  notFoundMessage?: string;
}

// Shared loading/error/not-found states for the *Detail pages. Returns null
// once none of those states apply, meaning the caller should render its
// normal content.
export default function DetailPageStatus({
  backLink,
  loading,
  error,
  notFoundMessage,
}: DetailPageStatusProps) {
  if (loading) {
    return (
      <div>
        {backLink}
        <div style={{ color: colors.mutedText }}>Chargement…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {backLink}
        <div style={{ color: colors.error }}>Erreur de chargement : {error}</div>
      </div>
    );
  }

  if (notFoundMessage) {
    return (
      <div>
        {backLink}
        <div style={{ color: colors.mutedText }}>{notFoundMessage}</div>
      </div>
    );
  }

  return null;
}
