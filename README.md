# Courtside Ledger

[![Made with AI](https://img.shields.io/badge/Made_with-AI_assistance-24469b)](AI-USAGE.md)
[![Week 1](https://img.shields.io/badge/status-Week_1_demo-cb4b0b)](REPORT.md)

Courtside Ledger is a basketball live score and player statistics tracker for local leagues, barangay tournaments, and scorekeepers who currently rely on paper. It keeps the team score, individual player totals, quarter, and play log together in one record.

The Week 1 build is a responsive React demo. It stores games in the current browser with `localStorage`; the Express and PostgreSQL implementation is the next increment.

## Live app

- GitHub Pages: <https://aegyog.github.io/Basketball-Live-Score-Stats-Tracker/>
- Repository: <https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker>

GitHub Pages must be enabled with **Settings > Pages > Source: GitHub Actions**. Until that setting is enabled, use the local setup below.

## Week 1 features

- Dashboard with active and completed games
- New-game setup for team names, venue, date, and player rosters
- Live scoreboard with current quarter
- Player selection and seven stat actions: 1, 2, or 3 points, rebound, assist, steal, and block
- Synchronized team score, player totals, and recent-play log
- Undo for the most recent play
- Quarter advancement and game completion
- Game history and final-game summary
- Demo data saved in `localStorage`, with a visible demo-mode notice

### Main flow

1. Open the dashboard and choose **Start a new game**, or continue the seeded live game.
2. Enter both team names and comma-separated player names, then create the game.
3. Select a player from either roster and choose a stat action.
4. Use **Undo latest** if the last action was incorrect.
5. Advance the quarter as the game progresses, then choose **End game** to save the final result.
6. Open **Game history** to review completed games.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A current desktop or mobile browser
- PostgreSQL 17 is not required for the Week 1 demo; it will be required when the real API replaces demo mode.

## Setup and installation

```bash
git clone https://github.com/Aegyog/Basketball-Live-Score-Stats-Tracker.git
cd Basketball-Live-Score-Stats-Tracker/client
npm ci
copy .env.example .env
```

On macOS or Linux, use `cp .env.example .env` for the last command.

The client variables are:

| Variable | Week 1 value | Purpose |
| --- | --- | --- |
| `VITE_USE_MOCK_API` | `true` | Uses the local browser data adapter. Only the exact value `false` enables HTTP calls. |
| `VITE_API_BASE_URL` | `http://localhost:3000` | Base URL for the future Express API; ignored in demo mode. |

All `VITE_` values are public in the built client. Never put passwords or database URLs in them.

## Run locally

From the `client` folder:

```bash
npm run dev
```

Open <http://localhost:5173>. The first screen should show the Courtside Ledger dashboard, one active game, one completed game, and a Week 1 demo-mode notice.

To check the production bundle:

```bash
npm run build
npm run preview
```

## Planned API and database setup

The React client already has matching mock and HTTP adapters in `client/src/api/`. These are the routes that the Week 2 Express service will implement:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/games` | List live and completed games |
| `GET` | `/api/games/:id` | Get one game with teams, players, and plays |
| `POST` | `/api/games` | Create a game and its initial rosters |
| `POST` | `/api/games/:id/plays` | Record a player stat action |
| `DELETE` | `/api/games/:id/plays/latest` | Undo the latest play |
| `POST` | `/api/games/:id/quarter` | Advance the current quarter |
| `POST` | `/api/games/:id/finish` | Mark a game final |

The `server/` folder is still the official template scaffold and is not connected to the basketball client yet. When it is adapted, its `.env` will require:

```env
DATABASE_URL=postgresql://postgres:devpassword@localhost:5432/basketball_tracker
CORS_ORIGINS=http://localhost:5173
NODE_ENV=development
```

No real credentials are committed. The database schema and seed commands will be documented after the basketball tables replace the template schema.

## Project structure

```text
client/
  src/
    api/              mock and HTTP data adapters
    components/       reusable game, roster, score, and log UI
    App.jsx            screen flow and application state
    styles.css        design tokens and responsive styles
server/               Week 2 Express/PostgreSQL scaffold
.github/workflows/    GitHub Pages deployment
AI-USAGE.md           dated AI assistance record
REPORT.md             current project increment report
```

## Screenshots

The Week 1 dashboard and live tracker were visually checked at desktop and narrow widths. A repository screenshot still needs to be added before the Documentation Update is submitted; this is listed openly because a README image should be a real capture of the running app, not a mockup.

## Known issues and next steps

- Data is local to one browser; clearing site data removes demo games.
- The Express server, PostgreSQL schema, validation, and tests are not yet adapted to basketball.
- The GitHub Pages link requires the repository's Pages source to be set to GitHub Actions once.
- A real app screenshot still needs to be committed to this README.
- Week 2 will implement the basketball schema and REST routes, then switch `VITE_USE_MOCK_API` to `false` for integration testing.

## AI assistance

OpenAI Codex was used heavily for Week 1 requirements review, scaffolding, React implementation, documentation, and testing. The student has not yet claimed a self-authored 20% contribution; that work must be completed and documented in Week 2. See [AI-USAGE.md](AI-USAGE.md) for the dated record and commit evidence.

## License

[MIT](LICENSE)
