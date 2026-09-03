Type: task
Status: done — shipped 2026-09-02
Blocked by: (none)

## Question

Switch the app's current (and today, only) season, 2025-26, from reading through the "Interface WEB" wrapper spreadsheet to reading **directly** from the real "Super Croulants LIVE 2025-26" workbook. This is step one of two, in the order the user asked for: land this migration first, *then* add 2026-27 as a second toggleable season ([[14-season-toggle-2026-27]], which now assumes this ticket has already shipped and just extends the same direct-read pattern to a second workbook).

Target workbook: `Super Croulants LIVE 2025-26` — `1LqrFFgC07qJUDAzdAxxuujL8UgrC3Iq7s68a_ZvQSe4`
Current (to be replaced) source: `Interface WEB` — `1ox-qt2fNqSYlord98tRPTX7S5L4TlnwjVltQDPoo4R4`

### Why

Interface WEB isn't primary data — every tab it exposes today is a hand-maintained `IMPORTRANGE` formula wrapping this same LIVE workbook, reshaped into the fixed ranges `src/config/sheets.ts` currently hardcodes. That's an extra layer someone has to keep in sync by hand every season. [[14-season-toggle-2026-27]] already committed to reading 2026-27 directly from its LIVE workbook with no wrapper — doing the same for 2025-26 first means both seasons use one consistent approach instead of 2025-26 being the odd one out.

### What changes in `src/config/sheets.ts` (old Interface WEB range → new LIVE-workbook range)

All ranges below were verified by reading the actual header rows directly against the LIVE workbook (not inferred) — confirmed real, correctly-shaped data at every one.

| Block | Old (Interface WEB) | New (LIVE 2025-26, direct) |
|---|---|---|
| Saison Régulière | `Classement Joueurs 2025-26!B2:I72` | `Données consolidés peu importe les échanges!AN2:AU72` |
| Séries | `Classement Joueurs 2025-26!K2:R72` | `Données consolidés peu importe les échanges!BH2:BO72` |
| Saison + Séries | `Classement Joueurs 2025-26!T2:AA72` | `Données consolidés peu importe les échanges!CB2:CI72` |
| Pénalités | `Classement Joueurs 2025-26!AC2:AF72` | `Données consolidés peu importe les échanges!CM2:CP72` |
| Joueurs étoiles | `Classement Joueurs 2025-26!AH2:AL72` | `Données consolidés peu importe les échanges!CU2:CY72` |
| Gardiens | `Classement Joueurs 2025-26!AN2:AU72` | `Données consolidés peu importe les échanges!T2:AA6` |
| "depuis 1997-1998" (all-time) | `Classement Joueurs 2025-26!AW2:BF307` | `Stats Joueurs Actifs et Retraités!L2:V307` |
| Moyenne pts/match | `Classement Joueurs 2025-26!BI2:BP17` (manually typed, no formula) | **no sheet range** — computed client-side, see below |
| Standings | `Classement Saison Régulière 2025-26!A1:T22` | `Classement Équipes 2025-26 LIVE!A2:T22` |
| Calendar — Matchs | `Calendrier/Résultats/Étoiles 2025-26!B1:T37` | `Calendrier/Résultats 2025-26!A1:AB37` |
| Calendar — Étoiles | `Calendrier/Résultats/Étoiles 2025-26!U4:AA37` | same tab, `U4:AA37` (confirmed real data reading it directly — this came back empty through Interface WEB's copy) |
| Match sheets | `Feuilles de match!A1:CV1140` | `Feuilles de match 2025-26!E7:DB1146` (this workbook's tab genuinely has 1,146 rows — matches the old bound exactly, no trim needed here, unlike 2026-27) |
| Team colors | `BD Site WEB!A1:C5` | **n/a** — already hardcoded per [[15-hardcode-team-colors]] (done), unaffected by this migration |

### What to actually do

1. `src/config/sheets.ts`: change `SHEET_ID` to `1LqrFFgC07qJUDAzdAxxuujL8UgrC3Iq7s68a_ZvQSe4`; update `SHEET_NAMES`, `playerTabs`, `calendarTabs`, `LIVE_MATCH_SHEET` to the new tab names/ranges in the table above. Remove `TEAM_COLORS_SHEET` if [[15-hardcode-team-colors]] hasn't already (check current state — it was marked done outside this conversation).
2. Add the "Moyenne pts/match" mode as a client-side computation: filter/sort the already-fetched Saison Régulière rows for `Moy PTS/Match` > 2.00, replacing the removed ninth range. Wherever `Leaderboard.tsx` currently fetches this mode's data, it now derives it instead.
3. No routing/UI changes — this ticket is data-source only, single season, no `:season` param or Header dropdown (that's [[14-season-toggle-2026-27]]'s job, once this lands).
4. Verify: `npm run dev`, check every route (Standings, all 8 Leaderboard modes including the now-computed Moyenne pts/match, Teams, Calendar, a match detail page, a player detail page, Live) renders the same real data as before with no console errors, run `npx eslint .`.
5. Once this is merged and confirmed working, the app no longer reads Interface WEB (`1ox-qt2fN...`) at all — worth a quick check with whoever else might depend on that spreadsheet before treating it as fully retired.

### Revisit trigger

None — ready to build now.
