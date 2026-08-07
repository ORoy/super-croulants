// Team/player names appear with inconsistent casing across sheet tabs
// (e.g. "Red Storm" vs "RED STORM"), so comparisons must ignore case.
export const normalizeForComparison = (value: string): string => value.trim().toUpperCase();

export const equalsIgnoreCase = (a: string, b: string): boolean =>
  normalizeForComparison(a) === normalizeForComparison(b);
