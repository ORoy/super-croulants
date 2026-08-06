Type: task
Status: open
Blocked by: 01

## Question

Build `/calendar`, restyling today's `Calendar.tsx` to match the mockup's dark theme — the data layer already works, this is primarily a visual/structural port.

### What already works (reuse, don't rebuild)

`src/components/Calendar.tsx` already fetches and parses both real sub-tabs of `Calendrier/Résultats/Étoiles 2025-26` via `useSheetRawData`:
- **Matchs** (`calendarTabs[0].range`): `transformMatches` unpacks the sheet's "two games per row" layout into one logical row per game (date, home/away team names, scores, status). No period-by-period breakdown exists in this data (confirmed gap, tracked on the map).
- **Étoiles** (`calendarTabs[1].range`): 3-stars-per-game as a single formatted text string per star cell (e.g. `"  #21 Jean-Francois Bertrand ... @ASSURANCIA"` — jersey #, name, team). `convertRawToTable` currently keeps these as raw indexed columns; this ticket doesn't need to change that parsing, just note it for ticket 06 which will need real stars parsed into `{number, name, team}`.

### Scope

Rebuild the page UI to match the mockup's `<!-- CALENDAR VIEW -->` section (grep for that comment in `.scratch/hockey-rankings-redesign/mockup/Hockey Rankings.dc.html`): "Upcoming" section (future/unplayed matches) and "Results" section (played matches, most recent first), each row showing date, team A, result/score or "vs", team B, status — with the mockup's separate mobile-stacked-card layout vs desktop-grid-row layout (see its `isMobile`/`isNotMobile` `sc-if` blocks).

Reuse `transformMatches`'s output shape from the existing `Calendar.tsx` (splitting into upcoming vs past matches by whatever "played" signal it already derives) rather than re-deriving it. Row click → Match Detail is **out of scope for this ticket** (ticket 06); leave rows non-interactive for now.

### Reuse

- The `Table`/`StatTable` component from ticket 02, if by the time this session runs it exists and fits — otherwise this view's rows are card-like, not tabular, so a shared table component may not apply here. Use your judgment; don't force a fit.
- `src/config/sheets.ts`'s `calendarTabs`, `SHEET_NAMES.calendar` — unchanged.

### Verify

`npm run dev`, visit `/calendar`, confirm both sections render real matches with correct dates/scores/status at desktop and mobile widths, no console errors. `npx eslint .`.
