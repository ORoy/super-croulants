Type: task
Status: open
Blocked by: (none)

## Question

Add the `PBC` and `Total` columns to `/standings`, reversing ticket 04's "ignore" call on them. Ticket 04 skipped them because the PBC formula couldn't be reverse-engineered from the sheet's numbers alone — confirmed now (by the user, who knows the league's rules): PBC is a bonus-points column the league assigns to teams based on penalties. No formula needs to be recomputed — the sheet already carries the correct value; the app just isn't displaying it.

### Data (already fetched, just not parsed)

`src/utils/standings.ts`'s `STANDINGS_SHEET` range (`A1:T22`) already includes these columns at fixed offsets, identical across all 3 stacked sections (Overall / Séries / Saison Régulière — verified against a live fetch, same header row layout repeats for each):

- `COL.pbc = 17` (header `PBC`)
- `COL.total = 18` (header `Total`, i.e. `PTS + PBC` — verified additive: e.g. Régulière PTS 102 + Séries PTS 27 = Overall PTS 129, same relationship holds for PBC and Total)

Add both to the `TeamStanding` interface and `parseStandingsSection`'s field mapping, same pattern as the existing `pts`/`gf`/`ga` fields.

### UI

Add `PBC` and `Total` as two new columns in `Standings.tsx`'s `RECORD_COLUMNS` (after `PTS`, matching the sheet's own column order). **Keep `PTS` as the sort/rank basis** — don't switch ranking to `Total`; this wasn't confirmed as the league's actual ranking rule, only that PBC/Total should be visible. If the displayed team order (already sheet-driven, not app-sorted) doesn't match a `PTS` sort in some section, that's a sign `Total` might actually be the intended rank order — flag it rather than silently reordering.

### Verify

`npm run dev`, visit `/standings`, spot-check one team's PBC/Total against a raw fetch of the sheet (e.g. RED STORM overall: PBC 56, Total 185). Confirm sort-by-column still works for the new columns. `npx eslint .`.

### Doc updates (do alongside this ticket)

- `docs/data-gaps.md` item 5: update to note PBC's *meaning* is now known (penalty-based team bonus) even though its exact computation formula (from raw penalty data) is still unconfirmed — not that it matters, since the sheet already computes it and the app just reads it.
