import { useEffect, useState } from "react";
import { fetchSheetData } from "../utils/sheetFetch";
import type { RowData } from "../utils/sheetFetch";

interface UseSheetDataResult {
  data: RowData[];
  loading: boolean;
  error: string | null;
}

export const useSheetData = (
  range: string,
  sheetName?: string
): UseSheetDataResult => {
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchSheetData(range, apiKey, sheetName)
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [range, apiKey, sheetName]);

  return { data, loading, error };
};
