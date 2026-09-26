-- Invented development data only. Do not run this against a live database.

TRUNCATE TABLE plays, players, teams, games RESTART IDENTITY CASCADE;

WITH active_game AS (
  INSERT INTO games (game_date, venue, status, current_quarter, created_at)
  VALUES ('2026-09-23', 'Barangay Sports Center', 'live', 2, '2026-09-23T10:00:00+08:00')
  RETURNING id
), active_teams AS (
  INSERT INTO teams (game_id, side, name, score)
  SELECT id, 'home', 'Blue Hawks', 24 FROM active_game
  UNION ALL SELECT id, 'away', 'Orange Lions', 21 FROM active_game
  RETURNING id, game_id, side
), active_players AS (
  INSERT INTO players (team_id, player_number, name, points, rebounds, assists, steals, blocks)
  SELECT id, 7, 'Marco Reyes', 8, 2, 1, 0, 0 FROM active_teams WHERE side = 'home'
  UNION ALL SELECT id, 12, 'Paolo Cruz', 6, 4, 2, 1, 0 FROM active_teams WHERE side = 'home'
  UNION ALL SELECT id, 18, 'Luis Santos', 10, 3, 0, 0, 1 FROM active_teams WHERE side = 'home'
  UNION ALL SELECT id, 4, 'Nico Ramos', 9, 1, 3, 0, 0 FROM active_teams WHERE side = 'away'
  UNION ALL SELECT id, 9, 'Andre Garcia', 7, 5, 0, 1, 0 FROM active_teams WHERE side = 'away'
  UNION ALL SELECT id, 15, 'Miguel Lim', 5, 2, 1, 0, 1 FROM active_teams WHERE side = 'away'
  RETURNING id, team_id, name
)
INSERT INTO plays (game_id, team_id, player_id, stat, amount, quarter, created_at)
SELECT t.game_id, p.team_id, p.id, 'points', 3, 2, TIMESTAMPTZ '2026-09-23T10:29:00+08:00' FROM active_players p JOIN active_teams t ON t.id = p.team_id WHERE p.name = 'Nico Ramos'
UNION ALL SELECT t.game_id, p.team_id, p.id, 'rebounds', 1, 2, TIMESTAMPTZ '2026-09-23T10:30:00+08:00' FROM active_players p JOIN active_teams t ON t.id = p.team_id WHERE p.name = 'Andre Garcia'
UNION ALL SELECT t.game_id, p.team_id, p.id, 'points', 2, 2, TIMESTAMPTZ '2026-09-23T10:31:00+08:00' FROM active_players p JOIN active_teams t ON t.id = p.team_id WHERE p.name = 'Marco Reyes';

WITH final_game AS (
  INSERT INTO games (game_date, venue, status, current_quarter, created_at, finished_at)
  VALUES ('2026-09-20', 'Holy Angel University Gym', 'final', 4, '2026-09-20T08:00:00+08:00', '2026-09-20T10:00:00+08:00')
  RETURNING id
), final_teams AS (
  INSERT INTO teams (game_id, side, name, score)
  SELECT id, 'home', 'Red Falcons', 78 FROM final_game
  UNION ALL SELECT id, 'away', 'Green Archers', 72 FROM final_game
  RETURNING id, side
)
INSERT INTO players (team_id, player_number, name, points, rebounds, assists, steals, blocks)
SELECT id, 5, 'Carlo Mendoza', 22, 7, 4, 2, 0 FROM final_teams WHERE side = 'home'
UNION ALL SELECT id, 10, 'Ethan Flores', 19, 6, 5, 1, 1 FROM final_teams WHERE side = 'away';
