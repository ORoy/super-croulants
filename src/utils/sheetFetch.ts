const SHEET_ID = "1ox-qt2fNqSYlord98tRPTX7S5L4TlnwjVltQDPoo4R4";
const DEFAULT_SHEET_NAME = "Classement Joueurs 2025-26";

export interface RowData {
  [key: string]: string;
}

export const fetchSheetData = async (
  range: string,
  apiKey: string,
  sheetName: string = DEFAULT_SHEET_NAME
): Promise<RowData[]> => {
  if (!apiKey) {
    throw new Error("Google Sheets API key not configured");
  }

  const fullRange = `'${sheetName}'!${range}`;
  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    fullRange
  )}?key=${apiKey}`;

  const response = await fetch(valuesUrl);
  const result = await response.json();

  const rows = result.values || [];
  if (rows.length === 0) {
    return [];
  }

  // Convert rows to objects using first row as headers
  const headers = rows[0];
  const dataObjects = rows.slice(1).map((row: string[]) =>
    headers.reduce((obj: RowData, header: string, index: number) => {
      obj[header] = row[index] || "";
      return obj;
    }, {})
  );

  return dataObjects;
};
