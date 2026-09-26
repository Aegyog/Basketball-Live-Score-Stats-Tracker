# Courtside Ledger

Courtside Ledger is my basketball live-score and player-statistics tracker for local leagues and barangay tournaments. It keeps the game score, player totals, quarter, and recent plays in one place.

For Week 2, I connected the React client to an Express API and PostgreSQL database. The client can also run in a clearly labelled demo mode with `localStorage` when the database is unavailable.

## Live app

- GitHub Pages: <https://aegyog.github.io/Basketball-Live-Score-Stats-Tracker/>
- Repository: <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker>

The public Pages build uses demo mode until an API is deployed and the repository variables are changed. No database credential belongs in a `VITE_` variable.

## Features and usage

- Dashboard for active and completed games
- New-game setup for the date, venue, teams, and rosters
- Live scoreboard with regulation quarters and overtime
- Player selection and seven stat actions: 1, 2, or 3 points, rebound, assist, steal, and block
- Synchronized team scores, player totals, and recent-play log
- Transactional undo of the latest play
- Game completion and final-game summaries
- Server-side input validation and database constraints
- Demo adapter and HTTP adapter with the same client-facing functions

### Primary flow

1. Open the dashboard and select **Start a new game**.
2. Enter the date, venue, two different team names, and 1–15 players per side.
3. Select a player and record a stat. Points update both the player and team totals.
4. Use **Undo latest** to reverse the most recent play as one database transaction.
5. Advance through the quarters, then select **End game** to preserve the final result.
6. Open **History** to review completed games and player totals.

![Courtside Ledger dashboard](docs/screenshots/dashboard.png)

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
- <http://localhost:3000/api/games> returns the seeded games.

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

Open <http://localhost:5173>. The dashboard should show one active game and one completed game from PostgreSQL. To run without the server, set `VITE_USE_MOCK_API=true`; the orange demo notice confirms that games are then stored only in that browser.

### Environment variables

| File | Variable | Example | Purpose |
| --- | --- | --- | --- |
| `server/.env` | `DATABASE_URL` | `postgresql://postgres:devpassword@localhost:5432/basketball_tracker` | PostgreSQL connection string; secret in production |
| `server/.env` | `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed browser origins |
| `server/.env` | `NODE_ENV` | `development` | Runtime mode |
| `client/.env` | `VITE_USE_MOCK_API` | `false` | `false` selects the HTTP API; any other value selects demo mode |
| `client/.env` | `VITE_API_BASE_URL` | `http://localhost:3000` | Express API origin |
| root `.env` | `POSTGRES_PASSWORD` | `replace-with-a-long-random-value` | Used only by `compose.yml` |

All `VITE_` values are public in the built JavaScript. Never place a password, token, or database URL in them.

## API

All request bodies are JSON. Invalid input returns `400`, missing games return `404`, invalid state changes return `409`, and unexpected failures return a generic `500` response without a stack trace.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/healthz` | Confirm the Express process is alive |
| `GET` | `/readyz` | Confirm PostgreSQL is reachable |
| `GET` | `/api/games` | List games with teams, players, totals, and plays |
| `GET` | `/api/games/:id` | Get one complete game |
| `POST` | `/api/games` | Create a game and both rosters |
| `POST` | `/api/games/:id/plays` | Record a validated player stat |
| `DELETE` | `/api/games/:id/plays/latest` | Reverse the latest play transactionally |
| `PATCH` | `/api/games/:id/quarter` | Advance to the next quarter or overtime |
| `PATCH` | `/api/games/:id/finish` | Mark a live game final |

Example game body:

```json
{
  "date": "2026-09-26",
  "venue": "HAU Gym",
  "homeName": "Blue Hawks",
  "awayName": "Orange Lions",
  "homePlayers": ["Ana", "Bea"],
  "awayPlayers": ["Carlo", "Diego"]
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
  gamesRepo.js           parameterized reads and transactional mutations
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
- Docker Compose does not publish PostgreSQL to the host network.

## Known issues and next steps

- The schema and seed scripts were run successfully on local PostgreSQL 18. Live API checks covered health, readiness, game listing, creation, scoring, quarter advancement, undo, and game completion; the database was restored to the documented seed afterward.
- The API has no login or access gate yet. Do not expose the write endpoints publicly until an access layer such as Cloudflare Zero Trust or an application login protects every route.
- The local app currently uses the PostgreSQL administrator account. Before public deployment, it should use a separate account with only the permissions the app needs.
- GitHub Actions currently references official actions by release tags rather than immutable commit SHAs.
- GitHub Pages can host only the React client. The Express API and PostgreSQL database need a separate host before the public build can leave demo mode.

## AI assistance

I used OpenAI Codex heavily for requirements review, the React increment, the Week 2 database/API work, documentation, and testing. The exact help I received and the student-authorship work I still need to complete are recorded in [AI-USAGE.md](AI-USAGE.md).

## License

[MIT](LICENSE)
