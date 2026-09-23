# Project Increment Report

## Week of: 2026-09-23

## What changed this week

- Started the project from the official full-stack class template so the repository has separate `client/` and `server/` folders, environment examples, and a GitHub Pages workflow.
- Replaced the sample React client with the Courtside Ledger basketball tracker.
- Added five working views: dashboard, new-game setup, live tracker, game history, and final-game summary.
- Split repeated UI into reusable components for the header, game cards, scoreboard, team rosters, demo notice, and recent-play log.
- Added the seven planned stat actions: 1, 2, or 3 points, rebound, assist, steal, and block.
- Added synchronized team totals, player totals, the current quarter, a recent-play audit trail, undo, game completion, and seeded demo data.
- Added matching mock and HTTP API modules. Week 1 uses the mock module and stores games in `localStorage`; the React screens can later switch to Express with `VITE_USE_MOCK_API=false`.
- Added responsive styling and keyboard-visible focus states.
- Added GitHub Pages deployment configuration, environment examples, current README documentation, and the first `AI-USAGE.md` entries.

The main implementation is backed by commit [`9b519a6`](https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/9b519a6).

## Why

The approved project replaces paper score sheets for local basketball games. The Week 1 goal was to make the primary scorekeeper flow usable before adding persistence on the server. Building against a mock adapter lets the interface and state transitions be tested now while preserving the same function boundary that the Express API will use later.

## What broke or what I got stuck on

- The first production build could not start `esbuild` under the restricted workspace process. Running the same `npm run build` with normal project access succeeded, so this was an environment restriction rather than a code error.
- The first end-game handler moved to the summary screen even when the update failed. I changed the mutation helper to report success and only navigate after a successful finish.
- The repository started with only a one-line README, so the official template and all project structure had to be added before feature work could be documented.
- I could visually verify the dashboard and live tracker, but I have not yet committed a real running-app screenshot to the README.
- The server folder still contains the official sample resource. I left that visible and documented instead of claiming the basketball backend was complete.

## What is left

- Design the PostgreSQL basketball schema for games, teams, players, and plays.
- Replace the sample Express routes and repository with the documented `/api/games` routes.
- Add server-side validation, transactions, and API tests for recording and undoing plays.
- Connect the React HTTP adapter to the deployed API and test CORS and error states.
- Add at least one substantial self-authored part and document it for the 20% course requirement.
- Commit real dashboard and live-tracker screenshots.
- Enable GitHub Pages with GitHub Actions and verify the public live link.
