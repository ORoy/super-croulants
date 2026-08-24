Type: task
Status: open — spec settled via grilling session, ready to build (implementation is a separate follow-up ticket, not this one)
Blocked by: (none)

## Question

The app just hit the Google Sheets API quota from normal navigation. How do we cut down Sheets API request volume, and what's actually worth building now vs. parking for later?

### Why this happened

Read through `src/utils/sheetFetch.ts`, `src/hooks/useSheetData.ts`, and every page that calls them:

- **Zero caching or dedup anywhere.** Every `useSheetData`/`useSheetRawData` call fires a fresh HTTP request on mount, with nothing shared across components or across navigations. Leave `/standings` and come back → refetch. Switch a Leaderboard mode pill → refetch that mode's range (8 modes = up to 8 independent ranges, one per pill click, every session). Open a match: `MatchDetail` alone fires 3 separate requests (matches, stars, the full `Feuilles de match` live-sheet range) — none of it shared with `/live` or `PlayerDetail`, which each independently refetch that same large `Feuilles de match` range again.
- **`Live.tsx` polls every 30s** on the full `Feuilles de match` range (`A1:CV1140`) for the entire time `/live` is mounted, regardless of whether a game is actually in progress or the tab is even visible.
- **The API key is public.** `VITE_GOOGLE_SHEETS_API_KEY` is a Vite env var, inlined into the built JS bundle at build time. The site is a static GitHub Pages SPA with no backend (per `CLAUDE.md`), so the Sheets API quota is **one shared bucket across every visitor to the deployed site**, not scoped to a single browser session. Estimated traffic (per the user, unconfirmed): roughly ~10 concurrent visitors at peak. This means the fix isn't purely about one person's click pattern — it's also about how many people can be on the site at once before the shared bucket runs out.

### Approaches considered

| Approach | What it does | Pros | Cons |
|---|---|---|---|
| **A. Client-side cache + dedupe + batching** (chosen for this ticket) | Shared in-memory cache in the SPA; fewer, smarter requests per visitor | Free, zero infra, ships independently of everything else, directly fixes the reported problem (navigating within one session) | Doesn't reduce the *total* bucket draw from many simultaneous visitors — 10 people each loading the site cold still costs ~10x the request count |
| **B. Server-side shared proxy/cache** (parked) | A small serverless/edge function sits in front of Sheets API, caches responses, serves all visitors from one copy | The only approach that actually caps total quota regardless of visitor count | Introduces a real backend — conflicts with this project's current "no backend, static GH Pages" design; ongoing infra to own |
| **C. Scheduled snapshot via GitHub Action** (parked) | A cron'd GitHub Action calls Sheets API once (server-side secret), publishes a static JSON snapshot the site fetches instead of hitting Sheets API live | Fully decouples visitor count from quota (visitors hit the GH Pages CDN, free & unlimited); stays "no backend" in spirit — it's a CI build step, not a running server; free | Adds CI/build complexity; loses true live-ness for anything not covered by the snapshot cadence; `/live` specifically would need its own answer since it wants near-real-time reads during an actual game |

Decision: build **A** now. **B** and **C** are documented here so they don't need re-litigating, but explicitly not pursued yet — the user wants to keep this free and doesn't want the added infra complexity right now. Revisit if A turns out insufficient (see Revisit trigger below).

### What to actually do now (spec for the follow-up build ticket)

1. **Shared in-memory cache**, keyed by `(sheetName, range)`, module-level singleton (e.g. inside `useSheetData.ts` or a new `src/utils/sheetCache.ts`). Scoped to the SPA's lifetime — survives all in-app `HashRouter` navigation (which is what the user actually hit the quota doing), cleared only on a hard reload or new tab. No TTL for normal (non-live) data — season/roster/calendar data only changes when the sheet-maintainer updates it, so there's no real staleness cost to holding it for the session.
2. **Refetch triggers, only two**: (a) first request for a given `(sheetName, range)` key — cache miss — and (b) the browser tab regaining focus/visibility (Page Visibility API), which refetches whatever range(s) the currently-mounted page needs. This replaces today's "every navigation always refetches" behavior while still catching the case where the sheet changed while the tab sat open in the background. No other automatic invalidation (no TTL, no background polling) outside Live's own timer.
3. **Leaderboard's 8 stat modes**: lazy-fetch each mode on first pill click, then serve from the shared cache on repeat visits within the session. Not an eager batch-all-8 fetch on load — most sessions won't click through all 8, so paying for only what's viewed is cheaper, and it still gets the full benefit of the cache once viewed.
4. **Live match sheet** (`Feuilles de match` / `LIVE_MATCH_SHEET`), currently fetched independently by `Live.tsx`, `MatchDetail.tsx`, and `PlayerDetail.tsx`: route all three through the same shared cache entry.
   - `Live.tsx` stays the only writer that refreshes it on a timer — **keep the interval at 30s, unchanged, revisit later if still needed** (explicit call: not touching this now).
   - Additionally, pause that 30s poll while the tab isn't visible (Page Visibility API), resuming — and immediately refreshing — on focus.
   - `MatchDetail`/`PlayerDetail` just read whatever's cached (or trigger the one-time fetch on a cache miss) — they don't start their own poll.
5. **Batch multi-range page loads** with the Sheets API's `values:batchGet` endpoint, for whichever ranges are still cache-misses on a given page load:
   - `MatchDetail`: matches + stars + live sheet (currently 3 separate requests → 1)
   - `TeamDetail`: standings + roster (currently 2 → 1)
   - `Standings`: standings + matches (currently 2 → 1)
   Only the ranges not already served by the cache need to go into a page's `batchGet` call — batching and caching are independent layers; caching decides *whether* to fetch, batching decides *how many calls* the leftover fetches cost.

Also worth a quick, independent check on the user's own time: whether billing/a quota increase is cheaply available on the Google Cloud project behind this key. Not a dependency of this ticket — the app should stay frugal regardless of quota size — but free headroom while this ships doesn't hurt.

### Revisit trigger

If quota is still getting hit after the above ships (client-side fix, item A), or if traffic grows meaningfully past the ~10-concurrent estimate, revisit **B** (server-side proxy) or **C** (scheduled GitHub Action snapshot) from the comparison above — C is probably the better fit given the "keep it free, no backend" preference already established for this project, but that's a decision to make at that time, not now.
