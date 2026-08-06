export type SortDirection = "asc" | "desc";

export function compareSortValues(
  a: string | number,
  b: string | number,
  direction: SortDirection
): number {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }
  const cmp = String(a).localeCompare(String(b), "fr", { sensitivity: "base" });
  return direction === "asc" ? cmp : -cmp;
}
