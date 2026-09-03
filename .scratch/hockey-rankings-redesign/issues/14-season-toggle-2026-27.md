Type: task
Status: done — shipped 2026-09-02
Blocked by: (none) — [[17-migrate-2025-26-to-live-sheet]] shipped first as planned

## Question

Let visitors toggle between seasons, starting with **2025-26 (current) + 2026-27 (next)**. (2024-25 is a separate follow-up, [[16-season-toggle-2024-25]].) Sequenced after [[17-migrate-2025-26-to-live-sheet]] at the user's request: land the 2025-26 data-source migration alone first, verify it, then build the toggle + add 2026-27 on top of that already-working foundation.

### Background — architecture changed mid-investigation, this supersedes the original plan

Original plan (superseded): read through the "Interface WEB" spreadsheet, whose tabs are thin `IMPORTRANGE` wrappers around a separate "LIVE" master workbook, and have the user hand-build matching wrapper tabs for 2026-27. That plan is dropped.

**What changed**: the user shared direct access to the 2025-26 LIVE master workbook itself (`1LqrFFgC07qJUDAzdAxxuujL8UgrC3Iq7s68a_ZvQSe4` — previously only known indirectly, via the `IMPORTRANGE` formulas in Interface WEB, and inaccessible: 403). With direct access confirmed, and the 2026-27 LIVE workbook (`1zdsgL8FRMn951hB4zcAfvsZ0SE7P4soQHnTNac-hGto`) verified to be a literal "Make a copy" of it — **every shared tab has the identical internal sheet ID** across both workbooks (`Données consolidés peu importe les échanges` = `1661057261` in both, `Stats Joueurs Actifs et Retraités` = `810995697` in both, `Classement Équipes ... LIVE` = `578907248` in both, etc.) — the decision is: **drop the Interface WEB wrapper entirely and have the app read directly from each season's LIVE workbook.** No manual formula-writing needed for either season; the data already exists in the right shape.

### Decisions (updated)

1. **Data source — read directly from each season's LIVE workbook**, not through Interface WEB. `SHEET_ID` becomes a season-keyed map instead of a single constant:
   - `"2025-26"` → `1LqrFFgC07qJUDAzdAxxuujL8UgrC3Iq7s68a_ZvQSe4`
   - `"2026-27"` → `1zdsgL8FRMn951hB4zcAfvsZ0SE7P4soQHnTNac-hGto`
2. **Cache-key consequence** (new, since this wasn't a risk under the old single-spreadsheet plan): two of the needed tabs are named identically across both workbooks with no season suffix (`Données consolidés peu importe les échanges`, `Stats Joueurs Actifs et Retraités`). The existing cache key (`kind:sheetName:range`, in `src/utils/sheetCache.ts`) would collide between seasons for these tabs — season B would silently read season A's cached data. **The cache key and every fetch function must incorporate the spreadsheet ID**, not just sheet name + range. This touches `sheetFetch.ts` (thread `spreadsheetId` through `fetchValues`/`fetchSheetValuesBatch` instead of importing the constant), `sheetCache.ts`'s `makeKey`, and `useSheetData.ts`'s hooks.
3. **"Moyenne pts/match" leaderboard mode — now computed client-side, not sheet-sourced.** Under the old wrapper plan this block turned out to be manually-typed values in Interface WEB with no formula behind it (a real per-season maintenance burden). It's actually a simple derived view: "players with `Moy PTS/Match` > 2.00" from the Saison Régulière data the app already fetches (row 1 of that block in Interface WEB literally read `"Classement des joueurs avec une moyenne de PTS / Match > 2.00"`). Compute this by filtering/sorting the already-fetched Saison Régulière rows instead of a ninth sheet range — removes a manual step per season entirely.
4. **Routing**: unchanged from the original plan — season as a URL path segment on every route (`/:season/standings`, `/:season/leaderboard(/:playerId)`, `/:season/teams(/:teamId)`, `/:season/calendar(/:matchId)`, `/:season/live`), root/unmatched → `/2026-27/leaderboard` (2026-27 is default/current).
5. **Header**: unchanged — static "Saison 2025–26" badge becomes a season dropdown, swapping the URL's season segment.
6. **Nav**: unchanged — "En direct" (Live) hidden whenever the selected season isn't the current one.
7. **Team colors**: unaffected either way — [[15-hardcode-team-colors]] (done) already removed the sheet dependency for colors.
8. **Scope**: ship 2025-26 + 2026-27 only. 2024-25 stays a separate follow-up ([[16-season-toggle-2024-25]]) — its workbook genuinely lacks the matching tabs regardless of wrapper-vs-direct, so this pivot doesn't change that ticket's blocker.

### Ranges

[[17-migrate-2025-26-to-live-sheet]] already establishes the full range table for 2025-26 against the LIVE workbook (see its "What changes" table) — this ticket's job is just to (a) generalize those fixed values into the `{season}`-templated config described below, and (b) point the same template at 2026-27's workbook, which was verified to have **identical tab names and column layout at every one of those same coordinates** (see Background above). The only 2026-27-specific difference: **match sheets need a different row bound** — its `Feuilles de match 2026-27` tab has only 1,140 rows (vs 2025-26's 1,146), so its range is `E7:DB1140`, not a copy-paste of 2025-26's bound. Everything else is the same coordinates, different spreadsheet ID.

### What to actually do (spec for the build)

- `src/config/sheets.ts`: replace the single `SHEET_ID` constant with a season-keyed map (`SEASON_SHEET_IDS: Record<Season, string>`), `Season = "2025-26" | "2026-27"` (extend when 2024-25 lands). Tab-name helpers become `<base> ${season}` templates for the suffixed tabs; the two unsuffixed tabs stay literal names. Drop the now-unused `Interface WEB`-specific range comments.
- `sheetFetch.ts`: add `spreadsheetId` as a parameter to `fetchValues`/`fetchSheetData`/`fetchSheetRawData`/`fetchSheetValuesBatch` instead of importing the constant.
- `sheetCache.ts`: `makeKey` takes `spreadsheetId` as a fourth key component.
- `useSheetData.ts`: hooks take/derive `spreadsheetId` (from the active `:season` route param) and pass it through.
- Leaderboard: add the client-side "Moyenne pts/match" filter (>2.00) over the Saison Régulière rows, replacing the old ninth-range fetch.
- `App.tsx`: add `:season` to every route; root/unmatched → `/2026-27/leaderboard`.
- `Header.tsx`: season dropdown (2025-26 / 2026-27) swapping the URL's season segment; nav filters out "En direct" when `season !== currentSeason`.
- Verify: `npm run dev`, click through both seasons on every route, confirm real data renders with no console errors, confirm no cross-season data bleed on the two unsuffixed-tab ranges (this is exactly the bug Decision 2 exists to prevent — test it deliberately), confirm Live tab hidden on 2025-26, run `npx eslint .`.

### Out of scope (this ticket)

- **2024-25 season** — [[16-season-toggle-2024-25]].

### Revisit trigger

None — this is ready to build now.
