# AI usage

This project was built with AI assistance. This file records what was requested, what was kept or changed, and what still requires personal review.

## 1. How I used AI

### 2026-09-23 - Requirements, React screens, and demo data

- **Tool:** OpenAI Codex
- **What I asked for:** Read the finals requirements and build the first usable Courtside Ledger increment from the class template.
- **What it produced:** The five-screen React flow, reusable components, mock and HTTP adapters, browser persistence, documentation, and deployment workflow.
- **What I kept or changed:** I kept the adapter boundary and clearly labelled demo mode. The first end-game handler was corrected so navigation happens only after a successful update.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/9b519a6>

### 2026-09-26 - PostgreSQL schema and Express game API

- **Tool:** OpenAI Codex
- **What I asked for:** Complete the Week 2 backend locally without committing or pushing it.
- **What it produced:** Tables for games, teams, players, and plays; server validation; the seven game endpoints; and transactions for creating a game, recording a play, and undoing a play.
- **What I kept or changed:** I kept the database structure and transaction logic. I also asked for the API to match the existing React client instead of changing the interface again.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/195930d0b970c63b8d0fce0aa5fd2aba16eb9189>

### 2026-09-26 - Tests, security review, and documentation

- **Tool:** OpenAI Codex
- **What I asked for:** Verify the local increment and complete the Week 2 report, documentation update, security checklist, and reflection journal.
- **What it produced:** Validation tests, build checks, a full README, a security checklist, a revised report, and a Week 2 journal draft.
- **What I kept or changed:** I installed and configured PostgreSQL locally, then used Codex to run the database and API checks. The documents now record that the local integration passed while still listing the missing access control and commit links.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/195930d0b970c63b8d0fce0aa5fd2aba16eb9189>

### 2026-09-29 - League library and faster game tracking

- **Tool:** OpenAI Codex
- **What I asked for:** Help plan and review a League Library increment with reusable teams, player names, and jersey numbers, plus a faster live-scoring workflow. I implemented the selected client-side portions described in Section 3 and used Codex for the surrounding architecture, backend work, integration review, and debugging.
- **What it produced:** Codex provided the Express/PostgreSQL league support, server-side validation, API integration guidance, and review and debugging assistance. The completed increment combines that assistance with my client-side League Library, saved-roster setup, browser-local demo persistence, direct +1/+2/+3 point controls, one-tap non-scoring statistics, and expanded play history.
- **What I kept or changed:** I kept manual game entry as an alternative to saved rosters and made league games copy their selected team and player data into the game record so later roster edits cannot change historical results. I also connected the league workflow to the dashboard and game-setup screens and used direct stat controls to reduce the number of taps needed during a live game.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/ba11505>

### 2026-09-30 - Production deployment and initial access control

- **Tool:** OpenAI Codex
- **What I asked for:** Replace the browser-only public demo with the complete database-backed application and protect write access in production.
- **What it produced:** A Vercel-hosted Express API, a Neon PostgreSQL database, production environment configuration, signed sessions, and an initial shared-password access gate.
- **What I kept or changed:** I kept the database-backed Vercel deployment and server-side session checks. When the first deployment returned a Vercel 404, Codex added an explicit function route and rechecked the health endpoint instead of treating deployment success as proof that routing worked.
- **Commits:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/0460fb3>, <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/e3c72b0>, <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/10cc7ae>

### 2026-09-30 - Public accounts and private user data

- **Tool:** OpenAI Codex
- **What I asked for:** Replace the organization-style shared password with self-service accounts so anyone can use the application while keeping every user's data private.
- **What it produced:** Username/password registration and login, salted `scrypt` password hashes, signed eight-hour sessions, ownership columns and queries, authenticated game and league routes, and tests for account validation and password storage.
- **What I kept or changed:** I rejected the shared-password model because it did not fit a public product. I kept public registration with private per-user workspaces. Production verification used two temporary accounts to confirm cross-account denial, and the temporary accounts and records were removed afterward.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/4396040>

## 2. Where the AI got it wrong

### Case 1 - Finishing a game after a failed request

- **Initial output:** The first Week 1 handler switched to the summary immediately after attempting to finish a game.
- **Problem:** A failed save still looked successful in the interface.
- **Fix:** The mutation helper reports success, and the summary opens only after a successful update.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/9b519a6>

### Case 2 - One amount rule for every statistic

- **Initial output:** The first Week 2 validation design treated every amount from 1 to 3 as valid for every statistic.
- **Problem:** A request could record two rebounds or three steals as one event, which does not match the interface or the audit trail.
- **Fix:** Both `validation.js` and the `plays` table constraint allow 1–3 only for points and require exactly 1 for rebounds, assists, steals, and blocks.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/195930d0b970c63b8d0fce0aa5fd2aba16eb9189>

### Case 3 - Route-method mismatch

- **Initial output:** The Week 1 README listed the quarter and finish routes as `POST` while the existing HTTP adapter used `PATCH`.
- **Problem:** Implementing the README literally would make the real client receive `404` responses.
- **Fix:** The Week 2 API and README now use `PATCH`, matching `client/src/api/httpApi.js`.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/195930d0b970c63b8d0fce0aa5fd2aba16eb9189>

### Case 4 - PostgreSQL 18 seed timestamp error

- **Initial output:** The first seed script used timestamp text values inside a `UNION` query.
- **Problem:** PostgreSQL 18 treated the values as text, so inserting them into the `TIMESTAMPTZ` column failed.
- **Fix:** The seed timestamps were changed to explicit `TIMESTAMPTZ` values. The schema and seed scripts then completed successfully.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/195930d0b970c63b8d0fce0aa5fd2aba16eb9189>

## 3. Who wrote what

### Written by me

Within the AI-assisted League Library increment, I personally implemented the client-side league and roster workflow across selected portions of `client/src/App.jsx`, `client/src/components/GameSetup.jsx`, `client/src/components/LeagueLibrary.jsx`, `client/src/api/mockApi.js`, `client/src/components/TeamRosterPanel.jsx`, `client/src/components/PlayLog.jsx`, and `client/src/styles.css`.

My implementation connected the League Library to the game-setup flow, supported selecting saved teams and player rosters, added browser-local persistence for the demo version, and updated the live-game interface for faster statistics entry. This work appears in commit [`ba11505fbce77fe89d3806a8914b43af995763f1`](https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/ba11505fbce77fe89d3806a8914b43af995763f1).

The files work together as follows:

- **`client/src/App.jsx`:** I added league state and the handlers that create leagues, add or update saved teams, and keep the interface synchronized after each operation. The component loads games and leagues together, displays saved leagues on the dashboard, opens the League Library, and passes a selected league into game setup so a new game can begin from an existing roster.
- **`client/src/components/GameSetup.jsx`:** I added separate saved-league and manual-entry modes. The saved-league mode finds the selected league and teams, prevents the same team from being selected twice, previews both rosters, and submits their identifiers. Manual mode keeps the editable roster fields and submits cleaned player names and numeric jersey numbers.
- **`client/src/components/LeagueLibrary.jsx`:** I built the interface for creating a league, choosing a saved league, adding teams, and editing player rosters. Its local state controls the selected league and editor, limits a roster to 15 players, normalizes form values before saving, and enables starting a game only after the league contains at least two teams.
- **`client/src/api/mockApi.js`:** I added the browser-local league data layer used by demo mode. It safely reads and writes league data in `localStorage`, recovers from invalid saved JSON, prevents duplicate league and team names, creates stable identifiers, and copies saved team data into a new game so later roster edits do not rewrite that game's history.
- **`client/src/components/TeamRosterPanel.jsx`:** I changed each live roster row into direct stat controls. Points have separate +1, +2, and +3 buttons, while rebounds, assists, steals, and blocks add one per tap. The buttons identify the player through accessible labels, disable while a save is running, and become read-only totals when the component is used on the final summary screen.
- **`client/src/components/PlayLog.jsx`:** I added an expandable audit trail that shows the eight most recent plays by default and can reveal the complete history. It reports the record count, retains the undo action during a live game, connects the toggle to the list with ARIA attributes, and displays final summaries without an undo control.
- **`client/src/styles.css`:** I added the layouts and responsive rules for league folders, saved-team selection, roster editing, direct stat controls, quarter actions, and the expanded play log. The breakpoints collapse multi-column screens and controls for narrower devices while keeping the scoring actions usable.

Recounted on October 5, 2026 using nonblank source lines, excluding full-line comments and test files. In commit `ba11505`, the selected files contain 474 added lines under this rule:

- `client/src/components/GameSetup.jsx`: 115
- `client/src/components/LeagueLibrary.jsx`: 105
- `client/src/api/mockApi.js`: 93
- `client/src/App.jsx`: 67
- `client/src/components/TeamRosterPanel.jsx`: 41
- `client/src/styles.css`: 32
- `client/src/components/PlayLog.jsx`: 21

The current application source in `client/src/` and `server/` contains 2,247 lines under the same rule, including the October 5 validation fixes and runtime-permissions SQL. The selected additions are therefore approximately **21.1%** of this baseline (474 / 2,247). This is a size estimate, not independent proof of authorship or a claim that every added line survives unchanged. My claim applies only to the personally implemented portions described above; I must be able to explain those portions and distinguish Codex assistance. Recalculate if the final code changes.

### Local setup I completed

I installed PostgreSQL 18, created the `basketball_tracker` database, corrected the local environment settings, and checked that the connection worked. I also took part in reviewing the successful schema, seed, test, and API results. This setup and verification work supports the client-side code contribution documented above.

### AI-written parts I reviewed

- **Files:** `server/db/schema.sql`, `server/gamesRepo.js`, `server/validation.js`
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/195930d0b970c63b8d0fce0aa5fd2aba16eb9189>
- **What they do:** The schema separates games, teams, players, and play events. The repository changes those database rows into the object shape used by React. Recording and undoing a play updates the game, player totals, and play history together. Validation rejects bad game and play requests before they reach PostgreSQL.

## October 5, 2026 — finals alignment update

- **Tool:** OpenAI Codex.
- **Request:** Bring the tracker and submission documentation into line with the revised finals requirements.
- **Work produced:** Object-body validation and safe parser errors, regression tests, commit-pinned workflow actions, a base-path-safe logo URL, updated submission documentation, and a consistent contribution recount.
- **Review:** The server suite passes 47 tests and the client production build passes. This work is AI-assisted and is excluded from the claimed student contribution.
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/adca77236a46e89ef20d244869d40739cbcb880f>

### October 5 security follow-up (local record)

GitHub secret scanning and push protection were enabled, the database integration was limited to Production, and local Git email settings now use a GitHub noreply address. The owner confirmed authorship of the HoopStat logo. Codex prepared runtime-permissions.sql and the HOOPSTAT_DATABASE_URL override. I created the restricted hoopstat_app login, applied its permissions, and saved its connection string privately in Vercel. Codex deployed the updated API; health and database readiness returned 200, signed-out games returned 401, and malformed JSON returned a safe 400. Full signed-in feature and direct privilege verification remains outstanding. Neon Free has no IP allowlist/VPC option. The security follow-up is AI-assisted and is excluded from the personally authored contribution. Implementation commit: <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/adca77236a46e89ef20d244869d40739cbcb880f>.
