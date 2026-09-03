// Module-level cache shared by every useSheetData/useSheetRawData call across
// the SPA's lifetime. Keyed by (fetch kind, spreadsheetId, sheetName, range)
// so the same range fetched raw vs. parsed-to-objects doesn't collide, and so
// two seasons sharing an unsuffixed tab name (see ticket 14) don't collide
// either. Survives HashRouter navigation; only a hard reload clears it. See
// ticket 13.

export type FetchStatus = "idle" | "loading" | "success" | "error";

export interface Snapshot<T> {
  data: T | undefined;
  status: FetchStatus;
  error: string | null;
}

interface Entry<T = unknown> {
  // Replaced (new object) only when status/data/error actually change, so
  // useSyncExternalStore's getSnapshot can return this by reference without
  // triggering React's "snapshot must be cached" infinite-loop check.
  snapshot: Snapshot<T>;
  promise?: Promise<void>;
  fetcher?: () => Promise<T>;
  listeners: Set<() => void>;
}

const cache = new Map<string, Entry>();

export const makeKey = (
  kind: "raw" | "parsed",
  spreadsheetId: string,
  sheetName: string | undefined,
  range: string
): string => `${kind}:${spreadsheetId}:${sheetName ?? ""}:${range}`;

function getEntry<T>(key: string): Entry<T> {
  let entry = cache.get(key) as Entry<T> | undefined;
  if (!entry) {
    entry = {
      snapshot: { data: undefined, status: "idle", error: null },
      listeners: new Set(),
    };
    cache.set(key, entry as Entry);
  }
  return entry;
}

function notify(key: string): void {
  cache.get(key)?.listeners.forEach(listener => listener());
}

// Every snapshot mutation must go through here and end with notify(): leaving
// a mutation un-notified desyncs React's useSyncExternalStore consistency
// check (it compares the snapshot captured at render time against a fresh
// getSnapshot() read in a passive effect) and drives it into a forced
// re-render loop — this was ticket 13's "Maximum update depth exceeded" bug.
function setSnapshot<T>(key: string, entry: Entry<T>, snapshot: Snapshot<T>): void {
  entry.snapshot = snapshot;
  notify(key);
}

export function subscribeKey(key: string, listener: () => void): () => void {
  const entry = getEntry(key);
  entry.listeners.add(listener);
  return () => entry.listeners.delete(listener);
}

export function getSnapshot<T>(key: string): Snapshot<T> {
  return getEntry<T>(key).snapshot;
}

// No-op if `key` is already loading or holds a successful result, unless
// `force` (used for tab-focus-regain and polling refreshes).
export function ensureLoaded<T>(key: string, fetcher: () => Promise<T>, force = false): void {
  const entry = getEntry<T>(key);
  entry.fetcher = fetcher;
  if (!force && (entry.promise || entry.snapshot.status === "loading" || entry.snapshot.status === "success")) {
    return;
  }

  setSnapshot(key, entry, { data: entry.snapshot.data, status: "loading", error: null });
  entry.promise = fetcher()
    .then(result => {
      setSnapshot(key, entry, { data: result, status: "success", error: null });
      entry.promise = undefined;
    })
    .catch((err: unknown) => {
      setSnapshot(key, entry, {
        data: entry.snapshot.data,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
      entry.promise = undefined;
    });
}

// Reserves `key` for a page-level batch fetch. Returns true only if `key` was
// a genuine cache miss (idle/error, nothing in flight) — the caller then owns
// resolving it via resolveBatch/rejectBatch, keeping the individual
// useSheetData/useSheetRawData hook for the same key from firing its own
// single-range request while the batch call is in flight.
export function claimForBatch(key: string): boolean {
  const entry = getEntry(key);
  if (entry.promise || entry.snapshot.status === "loading" || entry.snapshot.status === "success") {
    return false;
  }
  setSnapshot(key, entry, { data: entry.snapshot.data, status: "loading", error: null });
  return true;
}

export function resolveBatch<T>(key: string, data: T): void {
  const entry = getEntry<T>(key);
  setSnapshot(key, entry, { data, status: "success", error: null });
  entry.promise = undefined;
}

export function rejectBatch(key: string, message: string): void {
  const entry = getEntry(key);
  setSnapshot(key, entry, { data: entry.snapshot.data, status: "error", error: message });
  entry.promise = undefined;
}

// On tab focus regain, refetch only the ranges a currently-mounted page
// actually needs (i.e. keys with an active subscriber).
function refreshActiveEntries(): void {
  for (const [key, entry] of cache) {
    if (entry.listeners.size > 0 && entry.fetcher) {
      ensureLoaded(key, entry.fetcher, true);
    }
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshActiveEntries();
    }
  });
}
