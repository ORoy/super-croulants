Type: task
Status: open
Blocked by: (none — but shares `Feuilles de match` parsing groundwork with ticket 08; worth doing together or sequenced)

## Question

Add the "Score by Period" table to `MatchDetail.tsx`, reversing ticket 06's decision to omit it. Ticket 06 dropped it because `Calendrier/Résultats/Étoiles 2025-26`'s Matchs data only has final scores — true, but no longer the whole story: `docs/data-gaps.md` item 2 recommended asking the sheet maintainer to add 3 period-goal columns per team to that tab, but that ask isn't needed. `Feuilles de match`'s `Pointage` (scoring log) section already records a `Période` value (1/2/3) on every goal entry, alongside scorer (`But`) and assist (`Passe`/`Passe`) numbers — period-by-period score is just a count of goal-rows per team per période within that game's block.

### Scope

- For the selected match (by date + team names, same lookup `MatchDetail.tsx` already does against the Matchs data), find its `Feuilles de match` block (one block per team, two teams per game — see ticket 08 for the block layout details) and aggregate goals into a period-1/2/3 breakdown per team.
- Render the mockup's Score-by-Period table (grep the `MATCH DETAIL VIEW` section) below the existing score header.
- This only applies to **completed** matches — in-progress games are ticket 08's concern (`/live`), not this one.

### Reuse

If ticket 08 already built a `Feuilles de match` block parser (fetching, locating a game's block by date, reading the `Pointage` rows), reuse it here rather than writing a second one — both tickets need the same underlying per-game block lookup, just different fields out of it (08 needs shots/score/penalties live; this needs the goal `Période` values on completed games).

### Verify

`npm run dev`, open a past match's detail page, confirm the period breakdown sums to the final score already shown, and spot-check one match's numbers against the raw `Feuilles de match` block. `npx eslint .`.

### Doc updates (do alongside this ticket)

- `docs/data-gaps.md` item 2: replace the "add 3 columns to Calendrier" recommendation — not needed, this ticket derives it from `Feuilles de match` instead.
- `.scratch/hockey-rankings-redesign/map.md`: remove the "Match Detail Score by Period" line from **Not yet specified** (now specified — this ticket).
