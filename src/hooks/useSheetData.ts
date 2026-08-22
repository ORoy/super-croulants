import { useEffect, useState } from "react";
import { fetchSheetData, fetchSheetRawData } from "../utils/sheetFetch";
import type { RowData } from "../utils/sheetFetch";
import type { SheetRange } from "../config/sheets";

interface UseFetchResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

// Combines several fetch results into one loading/error pair: loading while
// any source is still loading, surfacing the first error encountered.
export function combineFetchStates(
  ...results: { loading: boolean; error: string | null }[]
): { loading: boolean; error: string | null } {
  return {
    loading: results.some(r => r.loading),
    error: results.find(r => r.error)?.error ?? null,
  };
}

function useSheetFetch<T>(
  fetcher: (apiKey: string) => Promise<T>,
  initialValue: T,
  deps: unknown[],
  refetchIntervalMs?: number
): UseFetchResult<T> {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

  useEffect(() => {
    let cancelled = false;

    // Polling refetches keep any previously loaded data on screen instead of
    // flashing back to a loading state every interval tick.
    const load = (showLoading: boolean) => {
      if (showLoading) setLoading(true);
      setError(null);

      fetcher(apiKey)
        .then(result => {
          if (cancelled) return;
          setData(result);
          setLoading(false);
        })
        .catch(err => {
          if (cancelled) return;
          console.error(err);
          setError(err.message);
          setLoading(false);
        });
    };

    load(true);

    if (!refetchIntervalMs) {
      return () => {
        cancelled = true;
      };
    }

    const intervalId = setInterval(() => load(false), refetchIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, refetchIntervalMs, ...deps]);

  return { data, loading, error };
}

export const useSheetData = ({ range, sheetName }: SheetRange): UseFetchResult<RowData[]> =>
  useSheetFetch(apiKey => fetchSheetData(range, apiKey, sheetName), [], [
    range,
    sheetName,
  ]);

export const useSheetRawData = (
  { range, sheetName }: SheetRange,
  refetchIntervalMs?: number
): UseFetchResult<string[][]> =>
  useSheetFetch(
    apiKey => fetchSheetRawData(range, apiKey, sheetName),
    [],
    [range, sheetName],
    refetchIntervalMs
  );
