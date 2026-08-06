Type: task
Status: open
Blocked by: 01, 04

## Question

Build `/teams` — the team grid plus its Team Detail drilldown page (roster). Blocked on Standings (04) because the team list, rank, and record come from that sheet/fetch — don't re-derive them separately.

### Data mapping

- **Team list + record + rank**: reuse whatever the Standings ticket (04) built for the "Overall" table (`Classement Saison Régulière 2025-26`, combined section) — rank, name, W-L-OTL, PTS.
- **Team colors**: sheet tab `BD Site WEB` (add to `SHEET_NAMES`/config), columns `Équipe, Couleur Fond, Couleur text` — 4 rows, one per team, real hex colors. Use these for the team logo/card background instead of the mockup's placeholder repeating-gradient pattern (match team names case-insensitively — sheet has e.g. "Red Storm" vs the standings sheet's "RED STORM").
- **Roster** (Team Detail only): sheet `Classement Joueurs 2025-26`, range `B2:I72` (same data ticket 02 uses for the "Saison Régulière" leaderboard mode) filtered by the `ÉQUIPES` column matching the selected team. This range is confirmed to include the full roster (67 real players across the 4 teams, including 0-point players like goalies) — not just point-scorers. No `Pos` column exists (confirmed gap) — drop that column from the roster table rather than showing blanks.

### Scope

1. **Teams grid** — mirror the mockup's `<!-- TEAMS VIEW -->` section (grep for that comment): a card per team with logo/color block, name, "Rank #N · W-L-OTL · PTS PTS". Replace the mockup's placeholder text ("8 clubs · Frostline Rec Hockey Association") with the real team count (4) and your league's actual name/tagline.
2. **Team Detail** — mirror `<!-- TEAM DETAIL VIEW -->`: header (logo, name, rank/record), 4 stat cards (Record, Goals For, Goals Against — all from the standings row; drop "Power Play %", no real data source for it), roster table.

Card/row click routing (team grid → team detail, "back to standings" link) can be wired now using local component state or route params (`/teams/:teamId`) — your call; either is fine as long as navigation works.

### Reuse

- The `Table`/`StatTable` component from ticket 02, for the roster table.
- Team color lookup built here will likely get reused by ticket 06 (Match Detail team badges) — export it in a way that's easy to import (e.g. a small hook or util), not buried as page-local state.

### Verify

`npm run dev`, visit `/teams`, confirm all 4 team cards show correct real colors/records, click into each team, confirm the roster table lists real players for that team only. `npx eslint .`.
