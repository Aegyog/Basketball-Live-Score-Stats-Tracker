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

### 2026-09-30 - Authenticated production deployment

- **Tool:** OpenAI Codex
- **What I asked for:** Replace the public demo deployment with the complete database-backed application and explain the production setup afterward.
- **What it produced:** A shared scorer login with signed eight-hour sessions, protected API routes, Vercel Express routing, a Neon production database, production environment configuration, and deployment documentation.
- **What I kept or changed:** I approved the Neon Marketplace integration and the two production secrets. Codex corrected an initial Vercel 404 by adding an explicit function route, then verified a temporary scoring write and transactional undo against production without leaving test data behind.
- **Commits:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/0460fb3>, <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/e3c72b0>

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

No substantial student-authored code is claimed yet. The current Week 1 and Week 2 implementation is heavily AI-assisted. Before final submission, I still need to write, test, and explain a meaningful portion myself and add its exact file and commit link here so the project satisfies the 20% self-authored requirement.

### Local setup I completed

I installed PostgreSQL 18, created the `basketball_tracker` database, corrected the local environment settings, and checked that the connection worked. I also took part in reviewing the successful schema, seed, test, and API results. This is real setup and testing work, but I am not counting it as the required student-authored code.

### AI-written parts I reviewed

- **Files:** `server/db/schema.sql`, `server/gamesRepo.js`, `server/validation.js`
- **Commit:** <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker/commit/195930d0b970c63b8d0fce0aa5fd2aba16eb9189>
- **What they do:** The schema separates games, teams, players, and play events. The repository changes those database rows into the object shape used by React. Recording and undoing a play updates the game, player totals, and play history together. Validation rejects bad game and play requests before they reach PostgreSQL.

Reviewing a description is not the same as authoring the code. I need to be able to explain these files and add my own tested contribution before claiming the badge requirement is complete.
