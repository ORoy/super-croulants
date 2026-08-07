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
  deps: unknown[]
): UseFetchResult<T> {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetcher(apiKey)
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, ...deps]);

  return { data, loading, error };
}

export const useSheetData = ({ range, sheetName }: SheetRange): UseFetchResult<RowData[]> =>
  useSheetFetch(apiKey => fetchSheetData(range, apiKey, sheetName), [], [
    range,
    sheetName,
  ]);

export const useSheetRawData = ({ range, sheetName }: SheetRange): UseFetchResult<string[][]> =>
  useSheetFetch(apiKey => fetchSheetRawData(range, apiKey, sheetName), [], [
    range,
    sheetName,
  ]);
