import { useEffect } from "react";
import { fetchSheetValuesBatch, rowsToRecords } from "../utils/sheetFetch";
import type { SheetRange } from "../config/sheets";
import { claimForBatch, resolveBatch, rejectBatch, makeKey } from "../utils/sheetCache";

export interface BatchRange extends SheetRange {
  /** "raw" (default) matches useSheetRawData; "parsed" matches useSheetData. */
  kind?: "raw" | "parsed";
}

// Collapses a page's still-uncached ranges into one Sheets API batchGet call,
// then seeds the shared cache so the page's own useSheetData/useSheetRawData
// calls for those same ranges resolve from cache instead of firing their own
// requests. `ranges` is expected to be referentially stable (module-level
// constants, or season-derived arrays) — it's read once per mount/season
// change, not deep-compared.
export function useSheetBatch(spreadsheetId: string, ranges: BatchRange[]): void {
  const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

  useEffect(() => {
    const misses = ranges
      .map(r => ({ ...r, key: makeKey(r.kind ?? "raw", spreadsheetId, r.sheetName, r.range) }))
      .filter(r => claimForBatch(r.key));

    if (misses.length === 0) return;

    fetchSheetValuesBatch(spreadsheetId, misses, apiKey)
      .then(results => {
        results.forEach((rows, index) => {
          const item = misses[index];
          resolveBatch(item.key, item.kind === "parsed" ? rowsToRecords(rows) : rows);
        });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        misses.forEach(item => rejectBatch(item.key, message));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, spreadsheetId]);
}
