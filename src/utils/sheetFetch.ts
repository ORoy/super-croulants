import { SHEET_ID, SHEET_NAMES } from "../config/sheets";
import type { SheetRange } from "../config/sheets";

export interface RowData {
  [key: string]: string;
}

const fullRange = (range: string, sheetName: string = SHEET_NAMES.players): string =>
  `'${sheetName}'!${range}`;

const fetchValues = async (
  range: string,
  apiKey: string,
  sheetName: string = SHEET_NAMES.players
): Promise<string[][]> => {
  if (!apiKey) {
    throw new Error("Google Sheets API key not configured");
  }

  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    fullRange(range, sheetName)
  )}?key=${apiKey}`;

  const response = await fetch(valuesUrl);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message ?? `Failed to fetch sheet data (${response.status})`
    );
  }

  return result.values || [];
};

export const fetchSheetRawData = fetchValues;

// Converts raw rows to objects using the first row as headers.
export const rowsToRecords = (rows: string[][]): RowData[] => {
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0];
  return rows.slice(1).map((row: string[]) =>
    headers.reduce((obj: RowData, header: string, index: number) => {
      obj[header] = row[index] || "";
      return obj;
    }, {})
  );
};

export const fetchSheetData = async (
  range: string,
  apiKey: string,
  sheetName?: string
): Promise<RowData[]> => rowsToRecords(await fetchValues(range, apiKey, sheetName));

// Fetches several ranges in a single Sheets API `values:batchGet` call.
// Results are returned in the same order as `ranges`, one raw row-grid per entry.
export const fetchSheetValuesBatch = async (
  ranges: SheetRange[],
  apiKey: string
): Promise<string[][][]> => {
  if (!apiKey) {
    throw new Error("Google Sheets API key not configured");
  }

  const params = new URLSearchParams({ key: apiKey });
  for (const { range, sheetName } of ranges) {
    params.append("ranges", fullRange(range, sheetName));
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?${params.toString()}`;
  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message ?? `Failed to fetch sheet data (${response.status})`
    );
  }

  const valueRanges: { values?: string[][] }[] = result.valueRanges || [];
  return valueRanges.map(vr => vr.values || []);
};
