Type: task
Status: open
Blocked by: (none — but shares `Feuilles de match` parsing groundwork with ticket 09; worth doing together or sequenced)

## Question

Build `/live`, reversing the map's earlier "out of scope" ruling (`.scratch/hockey-rankings-redesign/map.md`, "Out of scope" section — that ruling assumed no real-time data source exists, which is wrong: `Feuilles de match` **does** update during the game, not just after). `docs/data-gaps.md` item 1 needs the same correction — see the doc-update note at the bottom.

### Why the old ruling was wrong

`Feuilles de match` (spreadsheet id `1ox-qt2fNqSYlord98tRPTX7S5L4TlnwjVltQDPoo4R4`, tab not yet in `SHEET_NAMES`) is a per-game block layout, ~20 rows per team, two teams per game, two games per week (19:00 and 20:30 slots). Each block has:
- A `Date:`/`Heure:` header row and a `Tirs au but` (shots on goal) mini-table with columns `1 / 2 / 3 / Total` (periods).
- A live-updating score, referenced via labeled cells like `Formule Score 19h` / `Score 20:30` (a spreadsheet formula the scorekeeper's entries feed).
- A `Pointage` (scoring log) section: one row per goal, with `Période`, `Temps`, `But` (scorer #), `Passe`/`Passe` (assist #s) — this is also ticket 09's data source.
- A `Pénalités` section: `Numéro`, `Période`, `Temps`, `Infraction` per penalty.

**Confirmed done-signal** (per the user, not guessed): a game is finished when the **period-3 "Tirs au but" cell** is filled in for both teams — not when a score appears (score fills in progressively as the game is played).

**Before writing any code**: fetch a currently-in-progress or recently-played game's raw block (`fetchSheetRawData` against `Feuilles de match`) and pin down the *exact* column offsets for score, per-period shots, and period-3-filled detection — the offsets above are approximate, read from a handful of rows during scoping, not verified against a live in-progress game. Do this mapping first; don't guess coordinates in the parser.

### Scope

Mirror the Claude Design mockup's Live section (`.scratch/hockey-rankings-redesign/mockup/Hockey Rankings.dc.html`, grep `Live Match` / `isLive` / `liveMatch`): pulsing live-dot indicator, hero card (period · clock, big score, team names), a "Live Stats" comparison grid (Shots / PIM / Power Plays, team A vs team B), and a stars-of-match preview. Add the nav's `Live` tab back (the mockup already has it wired — `goToLive`/`navLiveStyle` — it was stripped in ticket 01 per the old out-of-scope call).

**Known gap — flag, don't silently drop or fake**: the mockup's Live Stats grid includes **Power Plays**, which has no clean source in `Feuilles de match` — it would have to be inferred from penalty start/end timestamps (a team is on the PP while an opponent's penalty is active and no goal/penalty has ended it), which is a meaningfully harder parsing problem than shots/PIM. Either drop Power Plays from the grid for v1, or scope it as a follow-up once the simpler stats are working — don't block this ticket on solving it.

**Clock**: the sheet has no live countdown clock, only period-anchored event timestamps (goal/penalty `Temps`). Don't fake a ticking clock — show "Period N" (derived from the latest period with any shots/goals/penalties logged) instead of `period · clock` from the mockup, or omit the clock portion of that label.

### Polling

`useSheetData`/`useSheetRawData` (`src/hooks/useSheetData.ts`) fetch once per mount, no polling exists anywhere in the app today. Add a poll (e.g. `setInterval` re-triggering the fetch, or a `refetchIntervalMs` option on the hook) at **30s**, scoped to the `/live` route only — don't poll on every page.

### Multiple concurrent games

Both weekly slots (19:00/20:30) can be in progress at once. `/live` should show a list of currently-in-progress games (using the block-per-slot layout), not assume exactly one.

### Verify

`npm run dev`, visit `/live` — during a real in-progress game, confirm score/shots update within one poll cycle (~30s) and match the raw sheet; after a game ends (period-3 shots filled), confirm it drops out of `/live` and shows correctly on `/calendar` as a final result. `npx eslint .`.

### Doc updates (do alongside this ticket)

- `docs/data-gaps.md` item 1: replace the "no real-time source, needs a new `État du match` tab" recommendation — the real source (`Feuilles de match`, live during play) is now known and this ticket builds against it directly.
- `.scratch/hockey-rankings-redesign/map.md`: remove the "Live match view" line from **Out of scope**, and update the **Not yet specified** entry for it (or remove it, since it's now specified — this ticket).
