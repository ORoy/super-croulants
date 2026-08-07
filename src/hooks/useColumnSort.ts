import { useState } from "react";
import type { SortDirection } from "../utils/sortValues";

export interface SortState {
  key: string;
  direction: SortDirection;
}

interface UseColumnSortResult {
  sortState: SortState | null;
  /** Toggle direction if already sorting by `key`; otherwise pick a default
   *  direction (ascending for the leading column or non-numeric columns,
   *  descending for other numeric columns). */
  toggleSort: (key: string, index: number, isNumeric: boolean) => void;
}

export function useColumnSort(): UseColumnSortResult {
  const [sortState, setSortState] = useState<SortState | null>(null);

  const toggleSort = (key: string, index: number, isNumeric: boolean) => {
    setSortState(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      const direction: SortDirection = index === 0 || !isNumeric ? "asc" : "desc";
      return { key, direction };
    });
  };

  return { sortState, toggleSort };
}
