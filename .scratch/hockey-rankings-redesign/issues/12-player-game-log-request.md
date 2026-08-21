Type: task
Status: open — parked / low priority (explicit call: revisit later, not now)
Blocked by: (none — this is a data request, not build work, until the sheet changes)

## Question

`docs/data-gaps.md` item 4 (Player Game Log — per-game G/A/PTS/+/- on Player Detail) stays as a **sheet-maintainer ask**, not an app-side parsing project, for now.

### Why not parse `Feuilles de match` instead

Considered and rejected for this round: `Feuilles de match`'s blocks are more structured than the doc first suggested (fixed `Date`/`Heure`/team header, fixed `Pénalités`/`Alignement`/`Pointage` column groups, one row per rostered player) — but the scoring log (`Pointage`: `Période`, `Temps`, `But` scorer #, `Passe`/`Passe` assist #s) is a flat per-goal-event list, not pre-aggregated per player. Building a per-game player log means cross-referencing each game block's roster rows against its scoring-event rows (tally how many times each player's number appears as scorer/assist), which is real, ongoing parsing work — and fragile if the print template shifts between seasons. Tickets 08/09 need much smaller, well-anchored reads out of the same sheet (a handful of specific cells); this one needs a full per-block cross-reference. Not worth taking on alongside those.

### What to actually do now

Keep `docs/data-gaps.md` item 4's existing recommendation: ask the league organizer for a dedicated `Journal des matchs` tab, one row per player per game (date, opponent, G, A, +/- at minimum). No code change until that tab exists.

### Revisit trigger

If tickets 08/09 end up building a solid, reusable `Feuilles de match` block parser anyway (for live status / period scores), it's worth reassessing whether extending it to player game logs becomes cheap enough to be worth it — but that's a deliberate follow-up decision, not something to fold into this ticket by default.
