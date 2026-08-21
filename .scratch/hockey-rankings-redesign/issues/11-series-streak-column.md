Type: task
Status: open
Blocked by: (none)

## Question

Bug fix, not a data gap: the "Séries" section on `/standings` is missing the SÉRIE (streak) column that Overall and Saison Régulière both show. Root cause, confirmed in `src/components/Standings.tsx`: the `series` array is built with plain `parseStandingsSection` (line ~247-250) and rendered with `RECORD_ONLY_COLUMNS`, while `overall` and `regular` both additionally call `withStreaks(..., gameLogs, ...)` and render with `FULL_COLUMNS` (which includes `STREAK_COLUMNS`). Nobody wired the series section up to `withStreaks` — it's an oversight, not a sheet limitation.

### Fix

`src/utils/standingsStreaks.ts`'s `extractGameLogs` already tags each game with `isRegularSeason` (`type === "Saison"`). Series/playoff games use other phase labels — confirmed from the sheet: `Tournoi à la ronde`, `Demi-Finale`, `Finale` (no single `"Séries"` label exists). `withStreaks`'s current `regularSeasonOnly: boolean` param only supports "regular only" or "all games" — there's no "series only" (i.e. `!isRegularSeason`) mode. Add one (e.g. change the param to a 3-way filter, or add a sibling function) so the series section can be filtered to just its own games rather than the combined overall log.

Call the resulting `withStreaks` output for `series` in `Standings.tsx`, same as `overall`/`regular`.

### Column choice — SÉRIE only, not 6D

Add the `SÉRIE` (streak) column to the Séries section. **Don't** add the `6D` (last-6-games) column there — a playoff run is short (this season's series teams have 4-5 games total), so a trailing-6 window is redundant with the V/D/N record columns already shown. This means the series section needs its own column set: `RECORD_COLUMNS` + just the streak column, not the full `STREAK_COLUMNS` pair — add a new column list (e.g. `recordWithStreak`) alongside the existing `full`/`recordOnly` in `createColumns`.

### Verify

`npm run dev`, visit `/standings`, confirm the Séries table now shows a SÉRIE column (no 6D column) with a plausible streak per team — spot-check one team's streak by manually walking their `Tournoi à la ronde`/`Demi-Finale`/`Finale` games in the Calendar data. `npx eslint .`.
