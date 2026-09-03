Type: task
Status: open — mismatches identified via direct sheet inspection, blocked on decisions about the missing player-leaderboard blocks before sheet prep can start
Blocked by: [[14-season-toggle-2026-27]] (ship 2026-27 first — same URL-routing/config mechanism this ticket reuses); user input on where the missing 2024-25 blocks below live, or whether to drop them for this season

## Question

Add **2024-25** as a third toggleable season. [[14-season-toggle-2026-27]] pivoted to reading each season's LIVE workbook directly (no Interface WEB wrapper, no manual `IMPORTRANGE` formulas) — this ticket follows the same direct-read approach, adding this workbook's ID to `SEASON_SHEET_IDS`. Unlike 2026-27 (a verified exact-schema copy of the 2025-26 master), this workbook's schema doesn't line up cleanly — checked every tab against the exact coordinates the app reads for 2025-26/2026-27.

Source workbook: `https://docs.google.com/spreadsheets/d/1x_g2lfgi3HvZySuE0VabmsFBXgrMIKaT0Rbue84UV2g`

### Mismatches — re-validated 2026-09-02 against the actual shipped code (`src/config/sheets.ts`, post-[[17-migrate-2025-26-to-live-sheet]]), not just approximate header checks

1. **Standings (`Classement Équipes 2024-25 LIVE!A2:T22`, the app's exact literal range) — confirmed plug-and-play.** Same row/column structure at that exact anchor as 2025-26 (title row 2, column-group headers row 3, `Parties/Buts/Période/Points/Pén` groups). Only the title text differs cosmetically ("SAISON + TOURNOI À LA RONDE + SÉRIES" vs "SAISON RÉGULIÈRE + SÉRIES ÉLIMINATOIRES") — harmless.

2. **Calendar (`Calendrier/Résultats 2024-25!B1:AB37`, the app's exact literal range) — confirmed column-shifted.** Fetched both workbooks starting at the code's actual anchor, column B: 2025-26's column B holds `"Calendrier"`; 2024-25's column B holds `"Sem"` instead — the `"Calendrier"` column doesn't exist in 2024-25 at all. Every column from B onward is shifted one position left relative to what `Calendar.tsx` expects, so wiring this range in as-is would misparse every match row (wrong data in wrong fields), not just show a cosmetic gap. Needs the import range's column start adjusted to re-align before use.

3. **Match sheets (`Feuilles de match 2024-25!E7:DB1146`, the app's exact literal range) — no crash risk, but columns still unverified.** Tested the literal code range directly: the tab only has 1,144 rows, but the Sheets API **auto-clamps** the request to `E7:DB1144` rather than erroring — so copying the range verbatim wouldn't break anything, just silently return fewer rows than intended. Column count is 149 vs the current season's 145; the sample pulled (`E7:L8`) looks structurally similar (numbers, player name, assist marker) but isn't confirmed column-for-column identical to what `MatchDetail`/`PlayerDetail`/`Live` parse today — worth a closer diff before trusting it, not just a range-bound fix.

4. **Player leaderboard — the real blocker.** No `Données consolidés peu importe les échanges` tab exists in this workbook at all (unlike 2026-27, which has one). Checked every plausible candidate tab:
   - `Classement Joueurs 2024-25 LIVE` — header `RANG, JOUEURS, ÉQUIPES, PTS, BUTS, PASSES, PJ, MOY PTS/Match`, **exact match** to the Saison Régulière block's shape. This one block works as a source.
   - `Classement Joueurs Actifs`, `Classement Joueurs Retraités`, `Classement Joueurs à vie` — different shape (`Rang PTS, Status, Nom, PTS, Buts, Passes, PJ, Moy PTS/Match, Commentaires`) and the data is clearly career/all-time totals (e.g. "Francois Racine — 1054 PTS, 519 PJ", milestone comments), not 2024-25 season stats. These are the old-schema equivalent of the "depuis 1997-1998" all-time block, **not** substitutes for the missing per-season blocks.

   **Net result: only Saison Régulière has a real source for 2024-25.** Séries, Saison + Séries, Pénalités, Joueurs étoiles, and Gardiens have no matching tab found anywhere in this workbook — that data either wasn't tracked separately that season, or is buried inside `Feuilles de match`'s raw per-game rows (which [[12-player-game-log-request.md]] already rejected parsing as too fragile/costly for a similar ask).

5. **Team colors** — not applicable regardless of this ticket, since [[15-hardcode-team-colors]] removes the sheet dependency entirely.

6. **"Moyenne pts/match" mode** — also not applicable as a sheet lookup regardless of this ticket: [[14-season-toggle-2026-27]] made this a client-side filter (Saison Régulière rows with `Moy PTS/Match` > 2.00) rather than a sheet range, so it works for 2024-25 automatically once Saison Régulière data exists (via `Classement Joueurs 2024-25 LIVE`, item 4) — no separate source needed.

### Open decision needed before sheet prep can start

For the 5 missing player-stat blocks (item 4): does the league have this data somewhere else (a tab not yet checked, a different workbook, paper records), or should 2024-25's Leaderboard page simply ship with only the Saison Régulière tab/mode available, with the other 5 modes hidden for that season only? No recommendation yet — needs the user (or whoever maintained this season's sheet) to confirm whether the data exists anywhere before deciding to permanently drop those modes for this season.

### What to actually do once the above is resolved

No sheet prep needed — this is app-config-only, same as [[14-season-toggle-2026-27]]:

1. Get an answer on the missing player-stat blocks (open decision above).
2. `src/config/sheets.ts`: add `"2024-25": "1x_g2lfgi3HvZySuE0VabmsFBXgrMIKaT0Rbue84UV2g"` to `SEASON_SHEET_IDS`, extend the `Season` type.
3. Calendar range for 2024-25 needs its own column offset (not the shared `{season}`-templated range) to account for the missing "Calendrier" column identified above — verify the exact shift against real data before wiring in, don't guess the offset.
4. Match-sheet range for 2024-25 needs its own row bound (1,144 vs the template's per-season last row) and a closer column diff before trusting it column-for-column with `MatchDetail`/`PlayerDetail`/`Live`'s parsing.
5. `Leaderboard.tsx`: if some modes are dropped for this season (per the open decision above), its mode list needs to be season-aware instead of a fixed list for every season.
6. Verify: `npm run dev`, click through 2024-25 on every route, confirm real data renders with no console errors, confirm calendar dates/columns aren't shifted, run `npx eslint .`.

### Revisit trigger

Blocked until [[14-season-toggle-2026-27]] ships (reuses its season-routing mechanism) and until the missing-blocks decision above is made.
