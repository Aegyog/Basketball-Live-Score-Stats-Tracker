-- Courtside Ledger database schema. Safe to run repeatedly against the same database.

CREATE TABLE IF NOT EXISTS games (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  game_date DATE NOT NULL,
  venue TEXT NOT NULL CHECK (char_length(venue) BETWEEN 1 AND 120),
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'final')),
  current_quarter SMALLINT NOT NULL DEFAULT 1 CHECK (current_quarter BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  CHECK ((status = 'live' AND finished_at IS NULL) OR status = 'final')
);

CREATE TABLE IF NOT EXISTS teams (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  side TEXT NOT NULL CHECK (side IN ('home', 'away')),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  UNIQUE (game_id, side)
);

CREATE TABLE IF NOT EXISTS players (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_number INTEGER NOT NULL CHECK (player_number BETWEEN 1 AND 99),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  rebounds INTEGER NOT NULL DEFAULT 0 CHECK (rebounds >= 0),
  assists INTEGER NOT NULL DEFAULT 0 CHECK (assists >= 0),
  steals INTEGER NOT NULL DEFAULT 0 CHECK (steals >= 0),
  blocks INTEGER NOT NULL DEFAULT 0 CHECK (blocks >= 0),
  UNIQUE (team_id, player_number)
);

CREATE TABLE IF NOT EXISTS plays (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  stat TEXT NOT NULL CHECK (stat IN ('points', 'rebounds', 'assists', 'steals', 'blocks')),
  amount SMALLINT NOT NULL CHECK ((stat = 'points' AND amount BETWEEN 1 AND 3) OR (stat <> 'points' AND amount = 1)),
  quarter SMALLINT NOT NULL CHECK (quarter BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS games_created_at_idx ON games (created_at DESC);
CREATE INDEX IF NOT EXISTS teams_game_id_idx ON teams (game_id);
CREATE INDEX IF NOT EXISTS players_team_id_idx ON players (team_id);
CREATE INDEX IF NOT EXISTS plays_game_id_created_at_idx ON plays (game_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS plays_team_id_idx ON plays (team_id);
CREATE INDEX IF NOT EXISTS plays_player_id_idx ON plays (player_id);
