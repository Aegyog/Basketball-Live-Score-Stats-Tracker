-- Courtside Ledger database schema. Safe to run repeatedly against the same database.

CREATE TABLE IF NOT EXISTS app_users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL CHECK (char_length(username) BETWEEN 3 AND 30),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS app_users_username_unique_idx
  ON app_users (lower(username));

CREATE TABLE IF NOT EXISTS leagues (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_user_id BIGINT REFERENCES app_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  season TEXT NOT NULL DEFAULT '' CHECK (char_length(season) <= 40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE leagues ADD COLUMN IF NOT EXISTS owner_user_id BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'leagues_owner_user_id_fkey'
      AND conrelid = 'leagues'::regclass
  ) THEN
    ALTER TABLE leagues
      ADD CONSTRAINT leagues_owner_user_id_fkey
      FOREIGN KEY (owner_user_id) REFERENCES app_users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS league_teams (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  league_id BIGINT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS league_players (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  league_team_id BIGINT NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
  player_number INTEGER NOT NULL CHECK (player_number BETWEEN 1 AND 99),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  UNIQUE (league_team_id, player_number)
);

CREATE TABLE IF NOT EXISTS games (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_user_id BIGINT REFERENCES app_users(id) ON DELETE CASCADE,
  league_id BIGINT REFERENCES leagues(id) ON DELETE SET NULL,
  game_date DATE NOT NULL,
  venue TEXT NOT NULL CHECK (char_length(venue) BETWEEN 1 AND 120),
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'final')),
  current_quarter SMALLINT NOT NULL DEFAULT 1 CHECK (current_quarter BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  CHECK ((status = 'live' AND finished_at IS NULL) OR status = 'final')
);

ALTER TABLE games ADD COLUMN IF NOT EXISTS league_id BIGINT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS owner_user_id BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'games_league_id_fkey'
      AND conrelid = 'games'::regclass
  ) THEN
    ALTER TABLE games
      ADD CONSTRAINT games_league_id_fkey
      FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'games_owner_user_id_fkey'
      AND conrelid = 'games'::regclass
  ) THEN
    ALTER TABLE games
      ADD CONSTRAINT games_owner_user_id_fkey
      FOREIGN KEY (owner_user_id) REFERENCES app_users(id) ON DELETE CASCADE;
  END IF;
END $$;

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
CREATE INDEX IF NOT EXISTS games_league_id_idx ON games (league_id);
CREATE INDEX IF NOT EXISTS games_owner_user_id_idx ON games (owner_user_id);
CREATE INDEX IF NOT EXISTS leagues_owner_user_id_idx ON leagues (owner_user_id);
CREATE INDEX IF NOT EXISTS league_teams_league_id_idx ON league_teams (league_id);
CREATE INDEX IF NOT EXISTS league_players_league_team_id_idx ON league_players (league_team_id);
DROP INDEX IF EXISTS leagues_name_season_unique_idx;
CREATE UNIQUE INDEX IF NOT EXISTS leagues_owner_name_season_unique_idx
  ON leagues (owner_user_id, lower(name), lower(season))
  WHERE owner_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS league_teams_league_name_unique_idx ON league_teams (league_id, lower(name));
CREATE INDEX IF NOT EXISTS teams_game_id_idx ON teams (game_id);
CREATE INDEX IF NOT EXISTS players_team_id_idx ON players (team_id);
CREATE INDEX IF NOT EXISTS plays_game_id_created_at_idx ON plays (game_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS plays_team_id_idx ON plays (team_id);
CREATE INDEX IF NOT EXISTS plays_player_id_idx ON plays (player_id);
