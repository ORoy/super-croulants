# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Be concise. Short answers, minimal explanation, no restating the obvious.

## Commands

- `npm run dev` / `npm run build` / `npm run preview`
- `npx eslint .` — lint (no `lint` script defined)
- No test suite exists.

## Project

React + TS + Vite SPA, hockey league stats (players/teams/calendar), deployed to GitHub Pages (`main` push → `.github/workflows/deploy.yml`). UI text is French — match it.

Uses `HashRouter` (GitHub Pages has no server routing). Requires `VITE_GOOGLE_SHEETS_API_KEY` in `.env.local`.

## Architecture

- No backend. Data comes live from one hardcoded Google Sheet (`src/utils/sheetFetch.ts`), via `fetchSheetData` (headers = first row) or `fetchSheetRawData` (raw rows, for custom parsing like `Calendar.tsx`).
- Each UI tab hardcodes a sheet tab name + A1 range (e.g. `PlayersTabs.tsx`, `Calendar.tsx`). These are brittle: change them if the spreadsheet layout changes.
- `DataTable` = generic table renderer. `TeamTable` = variant supporting grouped 2-row headers, built but **not wired up yet** — `TeamRanking.tsx` still shows placeholder text (known gap).
- Routes (`App.tsx`): `/players/*`, `/teams`, `/calendar`, fallback → players. Each page owns its own tab state + sheet fetch, no shared data layer.
