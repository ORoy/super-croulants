import type { RowData } from "./sheetFetch";

// Sheet headers can span multiple lines (e.g. "MOY\nPTS/\nMatch"); collapse
// whitespace so lookups can use a single-line key.
const normalizeHeader = (header: string): string => header.replace(/\s+/g, " ").trim();

export const normalizeRow = (row: RowData): RowData => {
  const normalized: RowData = {};
  for (const key of Object.keys(row)) {
    normalized[normalizeHeader(key)] = row[key];
  }
  return normalized;
};
