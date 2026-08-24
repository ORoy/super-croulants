import { useCallback, useEffect, useReducer } from "react";
import { fetchSheetData, fetchSheetRawData } from "../utils/sheetFetch";
import type { RowData } from "../utils/sheetFetch";
import type { SheetRange } from "../config/sheets";
import { subscribeKey, getSnapshot, ensureLoaded, makeKey } from "../utils/sheetCache";

const bumpCounter = (count: number) => count + 1;

interface UseFetchResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

const EMPTY_ARRAY: never[] = [];

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

// Reads `key` from the shared sheet cache (see sheetCache.ts), triggering a
// fetch on first use. Cache hits (e.g. revisiting a page within the session)
// resolve instantly with no network request.
//
// Deliberately not useSyncExternalStore: its "getSnapshot must return a
// referentially stable value" contract is a poor fit for a cache whose
// entries are mutated from plain (non-React-owned) async callbacks and from
// sibling hooks (useSheetBatch) reaching into the same entry — that
// combination drove it into a real "Maximum update depth exceeded" loop.
// A plain subscribe-and-force-update read sidesteps that contract entirely.
function useCachedSheet<T>(key: string, fetcher: () => Promise<T>, initialValue: T): UseFetchResult<T> {
  const [, forceUpdate] = useReducer(bumpCounter, 0);

  useEffect(() => subscribeKey(key, forceUpdate), [key]);

  useEffect(() => {
    ensureLoaded(key, fetcher);
    // fetcher is recreated each render from stable deps (range/sheetName/apiKey);
    // re-running this effect on every such recreation is unnecessary since
    // ensureLoaded is a no-op once `key` is loading/loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const snapshot = getSnapshot<T>(key);
  return {
    data: snapshot.status === "success" ? (snapshot.data as T) : initialValue,
    loading: snapshot.status === "loading" || snapshot.status === "idle",
    error: snapshot.error,
  };
}

export const useSheetData = ({ range, sheetName }: SheetRange): UseFetchResult<RowData[]> => {
  const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
  const key = makeKey("parsed", sheetName, range);
  const fetcher = useCallback(() => fetchSheetData(range, apiKey, sheetName), [range, apiKey, sheetName]);
  return useCachedSheet(key, fetcher, EMPTY_ARRAY);
};

export const useSheetRawData = (
  { range, sheetName }: SheetRange,
  refetchIntervalMs?: number
): UseFetchResult<string[][]> => {
  const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
  const key = makeKey("raw", sheetName, range);
  const fetcher = useCallback(() => fetchSheetRawData(range, apiKey, sheetName), [range, apiKey, sheetName]);
  const result = useCachedSheet(key, fetcher, EMPTY_ARRAY);

  useEffect(() => {
    if (!refetchIntervalMs) return;

    // Skip ticks while the tab is hidden; visibility regain already triggers
    // its own immediate refresh (see sheetCache.ts), so this just resumes
    // the normal cadence once the tab is visible again.
    const intervalId = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      ensureLoaded(key, fetcher, true);
    }, refetchIntervalMs);

    return () => clearInterval(intervalId);
  }, [key, fetcher, refetchIntervalMs]);

  return result;
};
