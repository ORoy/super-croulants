Type: task
Status: open
Blocked by: 01

## Question

Build `/leaderboard`, replacing today's `PlayersTabs.tsx`. This is the biggest single view — if it doesn't fit one session, it's fine to land the mode-switcher shell + the 2-3 simplest modes first and leave the rest as a natural continuation (note what's done/left in your resolution).

### Data mapping (all from sheet `Classement Joueurs 2025-26`, via `src/config/sheets.ts`'s existing `playerTabs`)

The mockup expects 7 modes; the real sheet supports 8 (one extra). Build all 8 as mode tabs, mirroring the mockup's `<!-- LEADERBOARD VIEW -->` mode-switcher markup/behavior but with real columns:

| Mode label | Sheet range (existing `playerTabs` entry) | Real columns → table columns |
|---|---|---|
| Saison Régulière | `B2:I72` | RANG, JOUEURS, ÉQUIPES, PTS, BUTS, PASSES, PJ, MOY PTS/Match |
| Séries | `K2:R72` | same shape |
| Saison + Séries | `T2:AA72` | same shape |
| Pénalités | `AC2:AF72` | RANG, JOUEURS, ÉQUIPES, TOTAL (min) |
| Joueurs étoiles | `AH2:AL72` | RANG, JOUEURS, ÉQUIPES, POINTS, MOY PTS/Match |
| Gardiens | `AN2:AU72` | RANG, JOUEURS, ÉQUIPE, PJ, % ÉFFICACITÉ, TOTAL LANCERS REÇUS, MOY LANCERS/MATCH, BUTS CONTRE |
| 1997-1998 (label as "Legacy" or "Depuis 1997-98") | `AW2:BF307` | Rang, Rang Début de saison, Progression, Status, Nom, PTS, Buts, Passes, PJ, Moy PTS/Match |
| Moyenne pts/match (**not in the mockup — new mode, add it**) | `BI2:BP17` | Rang, Status, Nom, PTS, Buts, Passes, PJ, Moy PTS/Match |

**Do not** try to add the mockup's `Pos`, `+/-`, `SOG` columns — no real data source exists for these anywhere in the workbook (confirmed by research). Drop them from every table rather than showing blanks.

### Visual reference

Mockup's `<!-- LEADERBOARD VIEW -->` section in `.scratch/hockey-rankings-redesign/mockup/Hockey Rankings.dc.html` (grep for that comment) — mode-switcher pill row, sticky first-two-columns table, rank/name/team styling. Translate the `sc-for`/`{{ }}` template into real `.map()` JSX over the `RowData[]` from `useSheetData`.

### Reuse

- `useSheetData(range)` from `src/hooks/useSheetData.ts` (defaults to the players sheet — matches these ranges already).
- This is a good point to introduce a shared `Table`/`StatTable` component styled like the mockup's tables (sticky header, sticky first N columns, zebra-free dark rows) — later tickets (Standings, Calendar, Team roster) will reuse it. Don't over-abstract on the first use; keep its props close to what this ticket actually needs (`rows`, `columns: {key, label}[]`) and let later tickets extend it if needed.
- Row click → player detail is **out of scope for this ticket** (that's ticket 06); leave rows non-interactive or `cursor: default` for now.

### Verify

`npm run dev`, visit `/leaderboard`, click through all 8 modes, confirm each renders real rows with no console errors (watch for `undefined` cells if a column name assumption is wrong — log `Object.keys(data[0])` while developing to confirm actual header text, since headers come verbatim from the sheet and may have exact wording/newlines like `MOY\nPTS/\nMatch` that need trimming). `npx eslint .`.
