Status: open

## Destination

Rebuild the super-croulants app to match the "Hockey Rankings" Claude Design mockup — dark theme, new nav (Standings / Leaderboard / Teams / Calendar), wired to real Google Sheets data — delivered as a sequence of session-sized build tickets, ordered by data readiness, ending with a written gap/recommendations doc for anything the current sheet can't support.

This effort **carries execution into the map** (Notes below apply the wayfinder override): tickets here are build sessions, not open decisions — the product/scope decisions were already settled in the grilling round that preceded this chart. Resolving a ticket means the view actually got built and verified, not just decided.

## Notes

- **Source mockup**: full original `Hockey Rankings.dc.html` is saved at `.scratch/hockey-rankings-redesign/mockup/Hockey Rankings.dc.html` (fetched via the `claude_design` MCP from https://claude.ai/design/p/5e493ac1-2d3d-43ec-902b-84c5dc128c58). It's written in Claude Design's `dc-runtime` pseudo-template syntax (`<sc-if>`, `<sc-for>`, `{{ expr }}`, a `<script data-dc-script>` block with a `class Component extends DCLogic`) — **not real JSX**. Every ticket needs to read the relevant section and translate it to real React, not copy it verbatim. Its companion `support.js` is the generic dc-runtime framework (same for every Claude Design project) — not project-specific, safe to ignore.
- **Standing preferences (from grilling, confirmed by user):**
  1. Drop MUI for all rebuilt pages/components — plain React + inline styles mirroring the mockup's own style patterns. Keep `HashRouter` from `react-router-dom` for routing only.
  2. New routes: `/standings`, `/leaderboard`, `/teams`, `/calendar`. Redirect `/players/*` → `/leaderboard`. Drop the old `/teams` placeholder page. `/live` added 2026-08-21 (ticket 08) — originally deferred for lack of a real-time data source, now unblocked (see 2026-08-21 correction under Not yet specified).
  3. One view per session. Session 0 (ticket 01) is foundation-only: theme tokens, layout/nav shell, routing — no real page content.
  4. Tables/leaderboards: show only columns backed by real sheet data. Drop mockup columns with no data source (don't blank/fake them). Add the sheet's 8th leaderboard mode ("Moyenne pts/match") that the mockup doesn't have.
  5. Player Detail: season totals only, no Game Log section (no clean per-game-per-player data source exists).
- **Data layer conventions to reuse** (see `src/utils/sheetFetch.ts`, `src/hooks/useSheetData.ts`, `src/config/sheets.ts`): `useSheetData(range, sheetName?)` → `RowData[]` (headers = row 1 of the range); `useSheetRawData(range, sheetName?)` → `string[][]` for custom parsing (see `Calendar.tsx`'s `transformMatches`/`convertRawToTable` for the established pattern of hand-parsing a packed sheet range). Add new tab names/ranges to `src/config/sheets.ts` rather than hardcoding in components.
- **Real spreadsheet tabs available** (id `1ox-qt2fNqSYlord98tRPTX7S5L4TlnwjVltQDPoo4R4`, key in `.env.local` as `VITE_GOOGLE_SHEETS_API_KEY`): `Classement Joueurs 2025-26` (today's `playerTabs`, 8 ranges), `Calendrier/Résultats/Étoiles 2025-26` (today's `calendarTabs`, 2 ranges), `Classement Saison Régulière 2025-26` (**not yet wired into the app** — real team standings: 3 stacked tables, Overall/Séries/Saison Régulière, one header block each), `BD Site WEB` (tiny lookup: `Équipe, Couleur Fond, Couleur text` — real per-team brand colors), `Feuilles de match` (raw per-game scoresheets — messy, only useful as a last resort; see Not yet specified), `Super Croulants Gérants 2025-26` (league admin sheet, not needed for the site).
- Every ticket file should end with a **Verify** step: `npm run dev`, view the route in a browser, confirm it renders real data with no console errors, run `npx eslint .`.

## Decisions so far

<!-- populated as tickets close -->

## Not yet specified

- **Player position (C/LW/RW/D/G).** No per-player master position field exists anywhere in the workbook — only a broad G/D/A tag buried inside individual `Feuilles de match` lineup blocks (not a clean per-player source). Declined (2026-08-21) — not pursuing, current G/D/A tag stays as-is.
- **Player Game Log (per-game G/A/PTS/+/-).** No clean source; `Feuilles de match` is print-layout, not row-per-player-per-game — building an in-app parser for it was considered and rejected (2026-08-21) as too much ongoing maintenance risk. Parked as a sheet-maintainer ask, tracked in `.scratch/hockey-rankings-redesign/issues/12-player-game-log-request.md`.
- These gaps were the intended content of ticket 07 (gap write-up), which produced `docs/data-gaps.md`. Two of the original five gaps below turned out to be resolvable after all — see 2026-08-21 correction below.

**2026-08-21 correction**: the "Live view" and "Score by Period" gaps below were both based on a wrong premise — `Feuilles de match` was assumed to only fill in after the game, when it actually updates live during play (confirmed by the user, who also gave the exact done-signal: the period-3 shots-on-goal cell being filled). This unblocks both:
- **Live view** — now being built directly against `Feuilles de match` (polled every 30s), no new sheet tab needed. Tracked in `.scratch/hockey-rankings-redesign/issues/08-live-match-view.md`.
- **Match Detail "Score by Period"** — derivable from the `Période` field already logged on every goal entry in `Feuilles de match`, no Calendrier schema change needed. Tracked in `.scratch/hockey-rankings-redesign/issues/09-score-by-period.md`.
- **The "PBC" bonus-points column** on `Classement Saison Régulière 2025-26` (adds to PTS to form "Total") — meaning now confirmed (penalty-based team bonus points); exact computation formula from raw penalty data still unconfirmed but irrelevant, since the sheet already computes it. Now being surfaced as a display-only column, PTS stays the ranking basis. Tracked in `.scratch/hockey-rankings-redesign/issues/10-standings-pbc-columns.md`.

## Out of scope

(none currently — the live match view previously listed here turned out to be achievable; see the 2026-08-21 correction above.)
