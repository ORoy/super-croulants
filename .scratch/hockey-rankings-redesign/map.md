Status: open

## Destination

Rebuild the super-croulants app to match the "Hockey Rankings" Claude Design mockup — dark theme, new nav (Standings / Leaderboard / Teams / Calendar), wired to real Google Sheets data — delivered as a sequence of session-sized build tickets, ordered by data readiness, ending with a written gap/recommendations doc for anything the current sheet can't support.

This effort **carries execution into the map** (Notes below apply the wayfinder override): tickets here are build sessions, not open decisions — the product/scope decisions were already settled in the grilling round that preceded this chart. Resolving a ticket means the view actually got built and verified, not just decided.

## Notes

- **Source mockup**: full original `Hockey Rankings.dc.html` is saved at `.scratch/hockey-rankings-redesign/mockup/Hockey Rankings.dc.html` (fetched via the `claude_design` MCP from https://claude.ai/design/p/5e493ac1-2d3d-43ec-902b-84c5dc128c58). It's written in Claude Design's `dc-runtime` pseudo-template syntax (`<sc-if>`, `<sc-for>`, `{{ expr }}`, a `<script data-dc-script>` block with a `class Component extends DCLogic`) — **not real JSX**. Every ticket needs to read the relevant section and translate it to real React, not copy it verbatim. Its companion `support.js` is the generic dc-runtime framework (same for every Claude Design project) — not project-specific, safe to ignore.
- **Standing preferences (from grilling, confirmed by user):**
  1. Drop MUI for all rebuilt pages/components — plain React + inline styles mirroring the mockup's own style patterns. Keep `HashRouter` from `react-router-dom` for routing only.
  2. New routes: `/standings`, `/leaderboard`, `/teams`, `/calendar`. Redirect `/players/*` → `/leaderboard`. Drop the old `/teams` placeholder page. No `/live` route — the mockup's Live view is out of scope (no real-time data source; see Not yet specified).
  3. One view per session. Session 0 (ticket 01) is foundation-only: theme tokens, layout/nav shell, routing — no real page content.
  4. Tables/leaderboards: show only columns backed by real sheet data. Drop mockup columns with no data source (don't blank/fake them). Add the sheet's 8th leaderboard mode ("Moyenne pts/match") that the mockup doesn't have.
  5. Player Detail: season totals only, no Game Log section (no clean per-game-per-player data source exists).
- **Data layer conventions to reuse** (see `src/utils/sheetFetch.ts`, `src/hooks/useSheetData.ts`, `src/config/sheets.ts`): `useSheetData(range, sheetName?)` → `RowData[]` (headers = row 1 of the range); `useSheetRawData(range, sheetName?)` → `string[][]` for custom parsing (see `Calendar.tsx`'s `transformMatches`/`convertRawToTable` for the established pattern of hand-parsing a packed sheet range). Add new tab names/ranges to `src/config/sheets.ts` rather than hardcoding in components.
- **Real spreadsheet tabs available** (id `1ox-qt2fNqSYlord98tRPTX7S5L4TlnwjVltQDPoo4R4`, key in `.env.local` as `VITE_GOOGLE_SHEETS_API_KEY`): `Classement Joueurs 2025-26` (today's `playerTabs`, 8 ranges), `Calendrier/Résultats/Étoiles 2025-26` (today's `calendarTabs`, 2 ranges), `Classement Saison Régulière 2025-26` (**not yet wired into the app** — real team standings: 3 stacked tables, Overall/Séries/Saison Régulière, one header block each), `BD Site WEB` (tiny lookup: `Équipe, Couleur Fond, Couleur text` — real per-team brand colors), `Feuilles de match` (raw per-game scoresheets — messy, only useful as a last resort; see Not yet specified), `Super Croulants Gérants 2025-26` (league admin sheet, not needed for the site).
- Every ticket file should end with a **Verify** step: `npm run dev`, view the route in a browser, confirm it renders real data with no console errors, run `npx eslint .`.

## Decisions so far

<!-- populated as tickets close -->

## Not yet specified

- **Live view replacement / data source.** No real-time data exists today (`Feuilles de match` is filled in after the game, not during). Recommendation to write up in ticket 07: add a small sheet tab the scorekeeper updates live (e.g. `État du match`: period, clock, score, shots) that the site polls — revisit as a fresh effort once that exists. Out of scope for this map's destination (see Out of scope).
- **Match Detail "Score by Period" table.** `Calendrier/Résultats/Étoiles 2025-26`'s Matchs data only has final scores, no per-period breakdown. Recommendation: add 3 columns per team (period 1/2/3 goals) to that sheet.
- **Player position (C/LW/RW/D/G).** No per-player master position field exists anywhere in the workbook — only a broad G/D/A tag buried inside individual `Feuilles de match` lineup blocks (not a clean per-player source). Recommendation: add a `Position` column (even just G/D/A) to `Classement Joueurs 2025-26`'s base roster area.
- **Player Game Log (per-game G/A/PTS/+/-).** No clean source; `Feuilles de match` is print-layout, not row-per-player-per-game. Recommendation: add a dedicated `Journal des matchs` tab, one row per player per game.
- **The "PBC" bonus-points column** on `Classement Saison Régulière 2025-26` (adds to PTS to form "Total") — formula unconfirmed by research (possibly related to the per-game "PtsFS" values in the Matchs data, unverified). Not blocking: the sheet's own PTS/rank order is used directly, no need to decode PBC. Worth asking the league organizer directly if the "Total" ranking ever needs to be reproduced from scratch.
- These five gaps are the intended content of ticket 07 (gap write-up) — that ticket's job is to turn this section into a polished, actionable recommendations doc for the user, then this section empties out.

## Out of scope

- **Live match view** (real-time score/period/clock). No underlying data source exists and building one is a separate effort (a scorekeeper-facing live-update mechanism), not a UI task. Ruled out of this map's destination per grilling round 1, Q4.
