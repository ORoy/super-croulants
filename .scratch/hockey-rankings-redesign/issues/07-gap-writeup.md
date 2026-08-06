Type: task
Status: open
Blocked by: (none — can be done any time, independent of the other tickets)

## Question

Turn the map's "Not yet specified" section into a short, polished, standalone recommendations document the user can hand to whoever maintains the Google Sheet — concrete asks, not vague gaps. Write it to `docs/data-gaps.md` in the repo (new file).

### Content (source: this map's "Not yet specified" section, already researched — no new investigation needed)

For each gap, state: what the site wants to show, why the current sheet can't provide it, and a concrete minimal schema change that would unblock it. Cover:

1. **Live match view** — no real-time data source (`Feuilles de match` is filled in after the game). Recommend: a small sheet tab (e.g. `État du match`) the scorekeeper updates during the game — period, clock, score, shots — that the site polls. Note this was ruled out of scope for the current rebuild (see map's "Out of scope") and would be a fresh effort once the tab exists, not a resumption of this one.
2. **Match Detail "Score by Period"** — `Calendrier/Résultats/Étoiles 2025-26`'s Matchs data has final scores only. Recommend: 3 extra columns per team (period 1/2/3 goals) alongside the existing final-score columns.
3. **Player position (C/LW/RW/D/G)** — no per-player master field exists; only a broad G/D/A tag buried in individual `Feuilles de match` lineup blocks. Recommend: add a `Position` column to `Classement Joueurs 2025-26`'s base roster area (even a broad G/D/A is enough to unblock the Leaderboard's dropped `Pos` column and roster tables).
4. **Player Game Log (per-game G/A/PTS/+/-)** — `Feuilles de match` is a print layout, not row-per-player-per-game. Recommend: a dedicated `Journal des matchs` tab, one row per player per game (date, opponent, G, A, +/-), so Player Detail can show game-by-game history.
5. **The "PBC" bonus-points column** on `Classement Saison Régulière 2025-26` — its formula is unconfirmed (tried goals-based, period-based, win/loss-based hypotheses, none matched; possibly related to the per-game "PtsFS" values in the Matchs data). Not currently blocking anything (the sheet's own PTS/row order is used directly for rankings), but worth a direct question to the league organizer if the "Total" (PTS+PBC) ranking ever needs to be reproduced from scratch rather than just read off the sheet.

Keep each item to a short paragraph. This is a reference doc for the user's own follow-up planning, not a spec to be implemented as part of this effort.

### Verify

`docs/data-gaps.md` exists, reads clearly standalone (no unexplained jargon like "ticket 04" — write it for a reader who never saw this map), and every recommendation names the specific sheet tab it applies to.
