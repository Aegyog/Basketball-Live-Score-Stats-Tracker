# Project Increment Report

## Week of: 2026-09-26

## What changed this week

- Connected the basketball tracker to a local Express and PostgreSQL backend instead of saving everything only in the browser.
- Replaced the old sample sightings API with basketball routes for viewing games, creating a game, recording or undoing a play, moving to the next quarter, and finishing a game.
- Added PostgreSQL tables for games, teams, players, and plays, including their relationships and basic data rules.
- Added server-side validation so invalid game and play data is rejected before it reaches the database.
- Used database transactions for creating games, recording plays, and undoing plays so the score, player stats, and play history stay consistent.
- Added sample data and validation tests.
- Installed PostgreSQL 18 locally, created the `basketball_tracker` database, ran the schema and seed files, and checked the complete API workflow.
- Updated the README, screenshot, security checklist, AI disclosure, and reflection journal.
- Added a PostgreSQL-backed League Library so reusable teams and player numbers can be selected when starting a game, while keeping manual setup available.
- Kept historical records stable by copying saved league rosters into each new game's existing snapshot tables.
- Deployed the React client and Express API to Vercel, connected a Neon PostgreSQL production database, and replaced public demo mode with authenticated persistence.
- Replaced the initial shared scorer password with public username/password registration, salted password hashes, signed eight-hour sessions, and private per-user leagues and games.
- Verified production with two temporary accounts: each could use its own workspace, while direct access to the other account's league and game returned no data or `404`. The test accounts were deleted afterward.

Implementation commit: <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/195930d0b970c63b8d0fce0aa5fd2aba16eb9189>

## Why I made these changes

The Week 1 version worked as a browser demo, but its data was only stored in `localStorage`. My Week 2 goal was to make the same app work with a real local database. The public GitHub Pages version can still use demo mode because a local PostgreSQL database cannot be reached from the public website.

## Problems I ran into

- The first database connection failed because `server/.env` still contained the example password. I changed the active `DATABASE_URL` to use my real local PostgreSQL password without placing it in a tracked file.
- The seed script failed on PostgreSQL 18 because timestamp text inside a `UNION` was being treated as plain text. With Codex's help, the timestamps were changed to explicit `TIMESTAMPTZ` values.
- The Week 1 README said two routes used `POST`, but the React HTTP adapter used `PATCH`. The API and documentation now use the same methods.
- The first validation rule allowed amounts of 2 or 3 for every statistic. It now allows 1–3 only for points and exactly 1 for rebounds, assists, steals, and blocks.
- The first Vercel API deployment returned platform-level 404 responses because `server.js` was not detected as a function. An explicit Vercel route now sends every API request to the Express app.
- The first production authentication design used one shared password, which would require every user to know the same secret. It was replaced with self-service accounts and record ownership so anyone can register without gaining access to someone else's data.

## What is left to do

- Review the backend files until I can explain how the schema, validation, and transactions work.
- Write and test a meaningful part myself so I can meet the required 20% student-authored code rule.
- Add email verification and password recovery so users can regain access without administrator help.
- Add optional organization roles only if teams later need to share one workspace.
- Check the public GitHub links after the push and submit them in Canvas.
