import { SHEET_ID, SHEET_NAMES } from "../config/sheets";

export interface RowData {
  [key: string]: string;
}

const fetchValues = async (
  range: string,
  apiKey: string,
  sheetName: string = SHEET_NAMES.players
): Promise<string[][]> => {
  if (!apiKey) {
    throw new Error("Google Sheets API key not configured");
  }

  const fullRange = `'${sheetName}'!${range}`;
  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    fullRange
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

export const fetchSheetData = async (
  range: string,
  apiKey: string,
  sheetName?: string
): Promise<RowData[]> => {
  const rows = await fetchValues(range, apiKey, sheetName);
  if (rows.length === 0) {
    return [];
  }

  // Convert rows to objects using first row as headers
  const headers = rows[0];
  return rows.slice(1).map((row: string[]) =>
    headers.reduce((obj: RowData, header: string, index: number) => {
      obj[header] = row[index] || "";
      return obj;
    }, {})
  );
};
