Type: task
Status: done
Blocked by: (none)

## Question

Replace the `BD Site WEB` Google Sheets fetch for team colors with a hardcoded constant in the app, to drop one API call from the shared quota (see [[13-sheets-quota-optimization]] context) and keep colors consistent across seasons without needing a per-season color tab (see [[14-season-toggle-2026-27]] Decision 5, where the user chose to keep colors shared/global rather than sheet-driven per season).

### Background

`useTeamColors` (`src/hooks/useTeamColors.ts`) fetches `TEAM_COLORS_SHEET` (`src/config/sheets.ts`: `BD Site WEB!A1:C5`) via `useSheetData`, builds a case-insensitive `Map<teamName, {background, text}>`, and exposes `getTeamColor(teamName)`. Consumed by `MatchDetail.tsx`, `Standings.tsx`, `TeamDetail.tsx`, `Live.tsx`, `PlayerDetail.tsx`, `TeamLogo.tsx`, `Teams.tsx` — 7 call sites, all just calling `getTeamColor(name)`.

Current full sheet contents (only 4 teams, header + 4 rows — read directly from the sheet):

| Équipe | Couleur Fond | Couleur text |
|---|---|---|
| Blaxton | `#ffffff` | `#000000` |
| Assurancia | `#000000` | `#ffffff` |
| Gourmet | `#f5f10a` | `#000000` |
| Red Storm | `#d40202` | `#000000` |

### What to actually do

1. Add a hardcoded lookup (e.g. `src/theme/teamColors.ts` or alongside `TeamColor` in `useTeamColors.ts`) with the 4 rows above, keyed case-insensitively the same way `normalizeForComparison` does today.
2. Change `useTeamColors` to return `getTeamColor` from that constant instead of calling `useSheetData(TEAM_COLORS_SHEET)` — keep the same `{ getTeamColor, loading, error }` shape so none of the 7 call sites need to change (`loading`/`error` can just be static `false`/`null`, or the hook's return type can drop them if a quick check shows no caller depends on the loading state for colors specifically).
3. Remove `TEAM_COLORS_SHEET` from `src/config/sheets.ts` once nothing references it.
4. New teams: since this is now a manual list instead of a live sheet, adding a team requires a code change (one line) instead of a spreadsheet edit — acceptable per user's request, but worth a one-line comment noting where to add a new team so it's not a mystery later.
5. Verify: `npm run dev`, check every page that shows team colors (Standings, Teams, Team Detail, Match Detail, Player Detail, Live) still renders the right colors, confirm no `BD Site WEB` network request fires, run `npx eslint .`.

### Revisit trigger

If team colors start changing often enough that a code deploy per change becomes annoying, revisit going back to a sheet-driven source — but that's not the expectation right now.
