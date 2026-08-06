Type: task
Status: open
Blocked by: 02, 03, 04, 05

## Question

Wire up the two remaining drilldown pages and connect all the row-click navigation the earlier tickets deliberately left inert: Match Detail (from Calendar) and Player Detail (from Leaderboard). Blocked on all four list-view tickets since this ticket makes their rows clickable and needs each of their data shapes finalized.

### Match Detail

Mirror the mockup's `<!-- MATCH DETAIL VIEW -->` section (grep for that comment), **minus** the "Score by Period" table — no per-period data exists in the sheet (confirmed gap, tracked on the map; final score only). Keep: "back to Calendar" link, team names + final score header, date/status.

**Stars of the Game**: real data exists. Sheet `Calendrier/Résultats/Étoiles 2025-26`, the Étoiles range (`calendarTabs[1].range`, ticket 03 already fetches this raw) has one row per game date with 3 star cells, each a formatted string like `"  #21 Jean-Francois Bertrand ... @ASSURANCIA"`. Parse each cell with a regex to extract jersey number, name, and team (the `@TEAM` suffix), match the row to the selected match by date, and render the mockup's 3-star-card layout with real names.

### Player Detail

Mirror `<!-- PLAYER DETAIL VIEW -->`, **season totals only** — no Game Log section (confirmed decision, no clean per-game-per-player data source exists; don't build an empty/placeholder Game Log, just omit that whole section). Stat cards pull from whichever leaderboard row was clicked (ticket 02's data) — skater stat cards (GP/G/A/PTS/PIM; no +/- , no real data) vs goalie stat cards (record not available — sheet has no W/L/OTL for goalies, only PJ/SV%/GAA-derivable-from-BUTS CONTRE÷PJ/shots; adapt the mockup's goalie card set to what's real).

### Wiring

Go back through tickets 02 (Leaderboard rows), 03 (Calendar rows), 04 (Standings rows — Team Detail), 05 (Teams grid — already likely wired in ticket 05 itself, verify) and make each row clickable, navigating to the appropriate detail view/route with the right id.

### Reuse

- The team color lookup from ticket 05, for Match Detail's team badges.
- The `Table`/`StatTable` component if any part of these detail views is tabular.

### Verify

`npm run dev`: from `/calendar`, click a past match, confirm real stars of the game appear (spot-check one against a raw fetch of the Étoiles range) and the score/date are correct, no phantom period table. From `/leaderboard`, click a player row in at least 2 different modes (one skater, one goalie), confirm their detail page shows correct season stats with no Game Log section. `npx eslint .`.
