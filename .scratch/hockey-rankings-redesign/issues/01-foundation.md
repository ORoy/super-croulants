Type: task
Status: open
Blocked by: (none — do this first)

## Question

Build the foundation: dark theme tokens, page shell, top nav, and routing skeleton — no real page data yet. Every later ticket depends on this existing and looking right.

### Scope

1. **Fonts & base tokens.** From the mockup's `<helmet>` block (top of `.scratch/hockey-rankings-redesign/mockup/Hockey Rankings.dc.html`): Google Fonts `Barlow Condensed` (weights 500/600/700/800) for headings/numbers, `Work Sans` (400/500/600/700) for body text. Background `oklch(0.14 0.02 250)`, card background `oklch(0.18 0.02 250)`, border `oklch(0.27 0.02 250)`, muted text `oklch(0.68 0.02 250)`, primary text `oklch(0.95 0.01 250)`. Accent color is configurable in the mockup (`accentColor` prop, default `#B08A4E`) — hardcode one accent for now (pick from the mockup's option list: `#5D7C9A`, `#4F8A82`, `#B08A4E`, `#8F6B6B`), no need to build a theme picker.
2. **Drop MUI for these pages.** Remove `ThemeProvider`/`src/theme.ts` usage from the new layout (keep the package installed only if something else still needs it — check after other tickets land whether MUI is used anywhere at all post-migration, and if not, note it for removal but don't remove the dependency yet). Keep `HashRouter` from `react-router-dom` — only the router, not MUI's nav components.
3. **Layout shell**, replacing `src/components/TopBar.tsx`: sticky header, logo mark + "SUPER CROULANTS · Rec Hockey League" wordmark (left), desktop nav links (Standings / Leaderboard / Teams / Calendar) with active-tab styling, "2025–26 Season" badge, and a mobile hamburger menu that opens a stacked nav list below the header. See the mockup's `<!-- HEADER -->` section for exact markup/behavior (`isMobile`/`isMobileNavOpen` state, `sc-if` blocks) — reimplement the same responsive behavior as real React state (`useState` + a resize listener, matching the mockup's `componentDidMount`/`window.addEventListener('resize', ...)` pattern) rather than copying the template syntax.
4. **Routing skeleton** in `src/App.tsx`: routes for `/standings`, `/leaderboard`, `/teams`, `/calendar`; redirect `/players/*` → `/leaderboard` (use `<Navigate>`); fallback → `/leaderboard`. Each route can render a trivial placeholder component for now (e.g. `<div>Standings — TODO</div>`) — later tickets replace these.
5. Delete `src/components/TopBar.tsx`, `src/theme.ts`, `src/components/TeamRanking.tsx` (dead placeholder) once the new shell replaces them — but only once the new nav is confirmed working, so there's no dead period with a broken app.

### Reuse

- Keep `src/utils/sheetFetch.ts`, `src/hooks/useSheetData.ts`, `src/config/sheets.ts` untouched — the data layer doesn't change, only presentation.
- `PlayersTabs.tsx`, `Calendar.tsx`, `DataTable.tsx` can keep working under their old routes/imports until the tickets that replace them land — don't break them prematurely.

### Verify

`npm run dev`, confirm the header renders correctly at desktop and mobile widths (resize the browser or use devtools device toolbar), confirm all four nav links route correctly and the old `/players` URL redirects to `/leaderboard`. `npx eslint .`.
