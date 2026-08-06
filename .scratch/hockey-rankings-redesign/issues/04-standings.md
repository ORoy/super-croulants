Type: task
Status: open
Blocked by: 01

## Question

Build `/standings` — this fills a real gap (the current `TeamRanking.tsx` is pure placeholder, no data fetch at all) using a sheet tab the app doesn't consume yet.

### New data source (add to `src/config/sheets.ts`)

Sheet tab `Classement Saison Régulière 2025-26` (not currently in `SHEET_NAMES`) contains **three stacked tables in one range**, each with its own 2-row header block:
1. **"SAISON RÉGULIÈRE + SÉRIES ÉLIMINATOIRES"** (combined/overall) — the mockup's "Overall" table.
2. **"SÉRIES ÉLIMINATOIRES"** (playoffs/series).
3. **"SAISON RÉGULIÈRE"** (regular season).

Fetch the whole block raw (e.g. `A1:T22` — confirm exact bounds by checking row/column counts, sheet is 22 rows × 20 cols) via `useSheetRawData`, then split it into the 3 tables client-side by finding each section's title row (`"SAISON RÉGULIÈRE + SÉRIES ÉLIMINATOIRES"` / `"SÉRIES ÉLIMINATOIRES"` / `"SAISON RÉGULIÈRE"` in column B) — same pattern as `Calendar.tsx`'s custom raw-parsing, not a generic header-row fetch.

**Column mapping per team row** (columns A onward): `Rang, Équipe, PJ, [W-total, W-vs-Team1, W-vs-Team2, W-vs-Team3 — 4 "V" columns, self-matchup shows "---"], D (losses), N (OTL/ties), BP (GF), BC (GA), +/- (DIFF), G/P/N (periods won/lost/tied — season totals, NOT per-game), PTS, PBC (unexplained bonus, ignore), Total (PTS+PBC, ignore), Total Min (team penalty minutes)`.

Map to the mockup's Overall/Regular/Series table columns: `# → Rang, Team → Équipe, GP → PJ, W → the total-wins column (first V), L → D, OTL → N, PTS → PTS (use this directly, not Total), GF → BP, GA → BC, DIFF → +/-`.

**Streak and Last 10** have no column in this sheet — derive them client-side from the Calendar's Matchs data (ticket 03's `transformMatches` output or equivalent): for each team, walk their games in date order, compute the current win/loss streak and the record over the last 10 games played. This needs both sheets fetched on this page (standings + calendar matches) — that's expected, not a bug.

### Scope

Rebuild `<!-- STANDINGS VIEW -->` from the mockup (grep for that comment) — three stacked tables (Overall, Regular Season, Series) with sticky rank/team columns, colored diff/streak text. Row click → Team Detail is **out of scope for this ticket** (ticket 06 wires it once ticket 05 exists); leave rows non-interactive for now.

### Reuse

- The `Table`/`StatTable` component from ticket 02 if it fits (sticky-column, dark-row table) — this view is the closest match to that shape, good candidate to actually use it if it exists by now.
- `BD Site WEB` sheet (`Équipe, Couleur Fond, Couleur text`) has real per-team colors — not required for this ticket's plain-text rank tables, but note it for ticket 05 (Teams grid, which needs it for card styling).

### Verify

`npm run dev`, visit `/standings`, confirm all 3 tables show the correct 4 teams with correct records (spot-check one row's PTS/GF/GA against the raw sheet fetch you did), confirm streak/last-10 look plausible against the calendar data. `npx eslint .`.
