# HoopStat

[![Built with OpenAI Codex](https://img.shields.io/badge/Built_with-OpenAI_Codex-412991)](AI-USAGE.md)

HoopStat (previously Courtside Ledger) is my basketball live-score and player-statistics tracker for local leagues and barangay tournaments. It keeps the game score, player totals, quarter, and recent plays in one place.

For Week 2, I connected the React client to an Express API and PostgreSQL database. The client can also run in a clearly labelled demo mode with `localStorage` when the database is unavailable.

## Live app

- Production app: <https://client-delta-seven-96.vercel.app/>
- Production API health: <https://hoopstat-api.vercel.app/healthz>
- GitHub Pages: <https://aegyog.github.io/Basketball-Live-Score-Stats-Tracker/>
- Repository: <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker>

The Vercel production build uses self-service user accounts, an authenticated Express API, and a Neon PostgreSQL database. Each account has a private workspace: users cannot read or change another account's leagues or games. The GitHub Pages build remains a browser-local demo. No database credential belongs in a `VITE_` variable.

## Features and usage

- Dashboard for active and completed games
- Public account registration and username/password sign-in
- Private per-account leagues, games, rosters, and statistics
- League library for reusable teams, player names, and jersey numbers
- New-game setup for the date, venue, teams, player names, and jersey numbers
- Choice between saved league rosters and manual team entry for every new game
- Live scoreboard with regulation quarters and overtime
- Direct-tap PTS shortcuts for +1, +2, or +3, plus REB, AST, STL, and BLK tiles that add +1 and immediately save each play
- Synchronized team scores, player totals, and recent-play log
- Expandable full audit-trail history during live games and in completed-game summaries
- Transactional undo of the latest play
- Game completion and final-game summaries
- Server-side input validation and database constraints
- Demo adapter and HTTP adapter with the same client-facing functions

### Primary flow

1. Create an account with a unique username and a password of at least eight characters, or sign in to an existing account.
2. Open **Leagues** to create a reusable league folder, then add teams and their 1–15 player rosters.
3. Select **Start a new game**, then choose **Use saved league** or **Enter manually**.
4. For a saved league, select two teams and review the automatically loaded rosters. Manual setup still accepts two team names and their player numbers.
5. Use the +1, +2, or +3 PTS shortcut for a made shot, or tap another player stat to add +1. Point taps update both the player and team totals.
6. Use **Undo latest** to reverse the most recent play as one database transaction.
7. Advance through the quarters. Use **Undo quarter** immediately if the quarter was advanced accidentally, then select **End game** to preserve the final result.
8. Open **History** to review completed games, player totals, and the full saved audit trail.

Saved league rosters are templates. Starting a game copies the selected names and jersey numbers into that game's own roster, so later edits to the league library do not change historical games.

![Basketball tracker dashboard](docs/screenshots/dashboard.png)

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL 17 or newer (PostgreSQL 18 is verified locally)
- A current desktop or mobile browser

## Setup and installation

Clone the repository:

```bash
git clone https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker.git
cd Basketball-Live-Score-Stats-Tracker
```

### 1. Configure PostgreSQL and the API

Create a PostgreSQL database named `basketball_tracker`. Then install and configure the server:

```bash
cd server
npm ci
copy .env.example .env
```

On macOS or Linux, use `cp .env.example .env`. Edit `server/.env` with your local connection string and allowed client origin:

```env
DATABASE_URL=postgresql://postgres:devpassword@localhost:5432/basketball_tracker
CORS_ORIGINS=http://localhost:5173
NODE_ENV=development
SESSION_SECRET=replace-with-at-least-32-random-characters
```

Use placeholders in committed documentation and keep real credentials only in the ignored `.env` file or the hosting provider's environment settings.

Create the schema, load invented sample data, and run the validation tests:

```bash
npm run db:schema
npm run db:seed
npm test
```

`db:seed` intentionally deletes and recreates the development basketball records. Never run it against a live database.

Start the API:

```bash
npm run dev
```

Expected checks:

- <http://localhost:3000/healthz> returns `{"ok":true}`.
- <http://localhost:3000/readyz> returns `{"ok":true,"db":"up"}` when PostgreSQL is reachable.
- <http://localhost:3000/api/games> returns `401` until a user signs in.

### 2. Configure and run the React client

In a second terminal:

```bash
cd client
npm ci
copy .env.example .env
npm run dev
```

Set `client/.env` to use the API:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:3000
```

Open <http://localhost:5173>, create a username/password account, and the dashboard will open an empty private workspace backed by PostgreSQL. To run without the server, set `VITE_USE_MOCK_API=true`; the orange demo notice confirms that games are then stored only in that browser.

### Environment variables

| File | Variable | Example | Purpose |
| --- | --- | --- | --- |
| `server/.env` | `DATABASE_URL` | `postgresql://postgres:devpassword@localhost:5432/basketball_tracker` | PostgreSQL connection string; secret in production |
| `server/.env` | `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed browser origins |
| `server/.env` | `NODE_ENV` | `development` | Runtime mode |
| `server/.env` | `SESSION_SECRET` | `replace-with-at-least-32-random-characters` | Signs eight-hour user sessions; secret in production |
| `client/.env` | `VITE_USE_MOCK_API` | `false` | `false` selects the HTTP API; any other value selects demo mode |
| `client/.env` | `VITE_API_BASE_URL` | `http://localhost:3000` | Express API origin |
| root `.env` | `POSTGRES_PASSWORD` | `replace-with-a-long-random-value` | Used only by `compose.yml` |

All `VITE_` values are public in the built JavaScript. Never place a password, token, or database URL in them.

## API

Request bodies must be JSON objects. Null, arrays, primitive values, and malformed JSON return a controlled `400`; bodies larger than 100 KB return `413`. Invalid input returns `400`, missing games return `404`, invalid state changes return `409`, and unexpected failures return a generic `500` response without a stack trace.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/healthz` | Confirm the Express process is alive |
| `GET` | `/readyz` | Confirm PostgreSQL is reachable |
| `POST` | `/api/auth/register` | Create a username/password account and return an eight-hour signed session token |
| `POST` | `/api/auth/login` | Verify a username/password and return an eight-hour signed session token |
| `GET` | `/api/auth/session` | Validate the current user session |
| `GET` | `/api/games` | List games with teams, players, totals, and plays |
| `GET` | `/api/games/:id` | Get one complete game |
| `POST` | `/api/games` | Create a game and both rosters |
| `GET` | `/api/leagues` | List saved leagues, teams, and players |
| `POST` | `/api/leagues` | Create a reusable league folder |
| `POST` | `/api/leagues/:id/teams` | Add a saved team and roster to a league |
| `PUT` | `/api/league-teams/:id` | Update a saved team and roster without changing past games |
| `POST` | `/api/games/:id/plays` | Record a validated player stat |
| `DELETE` | `/api/games/:id/plays/latest` | Reverse the latest play transactionally |
| `PATCH` | `/api/games/:id/quarter` | Advance to the next quarter or overtime |
| `PATCH` | `/api/games/:id/quarter/undo` | Move back one quarter when the new quarter has no plays |
| `PATCH` | `/api/games/:id/finish` | Mark a live game final |

Example game body:

```json
{
  "date": "2026-09-26",
  "venue": "HAU Gym",
  "homeName": "Blue Hawks",
  "awayName": "Orange Lions",
  "homePlayers": [{ "number": 7, "name": "Ana" }, { "number": 12, "name": "Bea" }],
  "awayPlayers": [{ "number": 4, "name": "Carlo" }, { "number": 9, "name": "Diego" }]
}
```

Example play body:

```json
{
  "teamSide": "home",
  "playerId": "1",
  "stat": "points",
  "amount": 3
}
```

## Project structure

```text
client/
  src/api/              mock and HTTP adapters
  src/components/       game, roster, score, and play-log UI
  src/App.jsx            screen flow and application state
server/
  db/schema.sql          normalized PostgreSQL schema and indexes
  db/seed.sql            invented development data
  auth.js                signed account-session creation and verification
  usersRepo.js           account validation and scrypt password hashing
  gamesRepo.js           parameterized reads and transactional mutations
  leaguesRepo.js         reusable league, team, and roster queries
  validation.js          server-side request validation
  validation.test.js     Node test-runner coverage for validation rules
  server.js              Express routes and error handling
docs/screenshots/        running-app documentation images
AI-USAGE.md              dated AI-assistance record
REPORT.md                current project increment report
```

## Database and security notes

- Foreign keys are indexed, identifiers use lowercase snake case, and timestamps are timezone-aware.
- Create-game, record-play, and undo operations keep related writes in short transactions.
- Values are always passed as query parameters. The only dynamic SQL identifier is selected from an internal five-value stat whitelist.
- CORS uses an explicit origin allowlist, JSON bodies are limited to 100 KB, Express's identifying header is disabled, and production errors do not expose stack traces.
- Passwords are salted and hashed with Node's `scrypt`; plaintext passwords are never stored.
- Every `/api` game and league route requires a signed user session and filters records by the session's user ID. Health and readiness endpoints remain public for monitoring.
- The production database is a pooled Neon PostgreSQL resource connected to the API through encrypted Vercel environment variables.
- Docker Compose does not publish PostgreSQL to the host network.

## Known issues and next steps

- The production schema migration ran successfully on Neon without deleting the previous sample rows. Those unowned rows are hidden from user accounts.
- Live verification created two temporary accounts, confirmed that registration and sessions work, confirmed each account can see only its own leagues and games, and removed the temporary accounts and their data afterward.
- Accounts currently use usernames only. Email verification, password recovery, account deletion, and organization roles are not implemented yet, so users must retain their password.
- The user created the restricted hoopstat_app role and applied server/db/runtime-permissions.sql. The deployed API uses the separate Production HOOPSTAT_DATABASE_URL secret; health/readiness returned 200 after the switch. Keep the owner account for schema administration. Full signed-in feature and privilege verification remains outstanding.
- GitHub secret scanning and push protection were enabled on October 5. The Vercel database integration is now production-only; credentials previously propagated to Preview/Development still need owner rotation.
- Neon Free currently permits connections from any IP with valid credentials. IP allowlists and VPC access are unavailable on this plan, so app-only network reachability is not claimed.
- The Pages workflow pins each action to an immutable commit SHA.
- GitHub Pages is intended for demo mode. The latest checked workflow built successfully but skipped deployment because the repository was private at run time; repository visibility is now public. Use the Vercel production link for grading.

## Final submission

The final project, presentation, and AI badge are due **Friday, October 9, 2026, at 23:59 (Asia/Manila)** with no late window. The completed security checklist is in the private class workspace at `project/SECURITY-CHECKLIST.md` and is worth 5 of the final project’s 100 points.

## Asset credits

The HoopStat logo is original artwork created by the project owner, whose authorship was confirmed on October 5, 2026. The dashboard screenshot was captured from the application. The interface uses system fonts.

## AI assistance

I used OpenAI Codex heavily for requirements review, the React increment, the Week 2 database/API work, documentation, and testing. The exact help I received is recorded in [AI-USAGE.md](AI-USAGE.md).

## License

[MIT](LICENSE)

### Restricted production database connection

If Vercel's Neon integration manages DATABASE_URL, add a separate sensitive Production variable named HOOPSTAT_DATABASE_URL containing the pooled hoopstat_app connection string. The API prefers this variable and falls back to DATABASE_URL when it is absent. Deploy the updated server code after adding it; redeploying an older build does not include this change. Keep credentials out of Git. For schema or seed commands, use an owner connection and leave HOOPSTAT_DATABASE_URL unset.
