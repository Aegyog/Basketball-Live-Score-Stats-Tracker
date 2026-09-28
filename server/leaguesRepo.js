function problem(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function duplicateProblem(error, message) {
  if (error.code === '23505') return problem(409, message)
  return error
}

function assembleLeagues(leagueRows, teamRows, playerRows) {
  const leagues = new Map(leagueRows.map((row) => [String(row.id), {
    id: String(row.id),
    name: row.name,
    season: row.season,
    createdAt: row.created_at,
    teams: [],
  }]))
  const teams = new Map()

  for (const row of teamRows) {
    const team = { id: String(row.id), name: row.name, players: [] }
    teams.set(String(row.id), team)
    leagues.get(String(row.league_id))?.teams.push(team)
  }

  for (const row of playerRows) {
    teams.get(String(row.league_team_id))?.players.push({
      id: String(row.id),
      number: row.player_number,
      name: row.name,
    })
  }

  return [...leagues.values()]
}

async function loadLeagues(client, where = '', values = []) {
  const leagues = await client.query(
    `SELECT id, name, season, created_at
     FROM leagues ${where}
     ORDER BY lower(name), lower(season), id`,
    values
  )
  if (leagues.rowCount === 0) return []

  const leagueIds = leagues.rows.map((league) => league.id)
  const teams = await client.query(
    `SELECT id, league_id, name
     FROM league_teams
     WHERE league_id = ANY($1::bigint[])
     ORDER BY league_id, lower(name), id`,
    [leagueIds]
  )
  const teamIds = teams.rows.map((team) => team.id)
  const players = teamIds.length === 0
    ? { rows: [] }
    : await client.query(
      `SELECT id, league_team_id, player_number, name
       FROM league_players
       WHERE league_team_id = ANY($1::bigint[])
       ORDER BY league_team_id, player_number, id`,
      [teamIds]
    )

  return assembleLeagues(leagues.rows, teams.rows, players.rows)
}

async function insertPlayers(client, teamId, players) {
  await client.query(
    `INSERT INTO league_players (league_team_id, player_number, name)
     SELECT $1, roster.player_number, roster.player_name
     FROM unnest($2::integer[], $3::text[]) WITH ORDINALITY
       AS roster(player_number, player_name, position)
     ORDER BY roster.position`,
    [teamId, players.map((player) => player.number), players.map((player) => player.name)]
  )
}

export async function getAll(pool) {
  return loadLeagues(pool)
}

export async function getById(pool, id) {
  const result = await loadLeagues(pool, 'WHERE id = $1', [id])
  return result[0] ?? null
}

export async function create(pool, input) {
  try {
    const result = await pool.query(
      `INSERT INTO leagues (name, season)
       VALUES ($1, $2)
       RETURNING id`,
      [input.name, input.season]
    )
    return getById(pool, result.rows[0].id)
  } catch (error) {
    throw duplicateProblem(error, 'A league with that name and season already exists')
  }
}

export async function createTeam(pool, leagueId, input) {
  const client = await pool.connect()
  let teamId

  try {
    await client.query('BEGIN')
    const league = await client.query('SELECT id FROM leagues WHERE id = $1 FOR KEY SHARE', [leagueId])
    if (league.rowCount === 0) throw problem(404, 'League not found')
    const team = await client.query(
      `INSERT INTO league_teams (league_id, name)
       VALUES ($1, $2)
       RETURNING id`,
      [leagueId, input.name]
    )
    teamId = team.rows[0].id
    await insertPlayers(client, teamId, input.players)
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw duplicateProblem(error, 'That team name or jersey number is already used in this league roster')
  } finally {
    client.release()
  }

  return getById(pool, leagueId)
}

export async function updateTeam(pool, teamId, input) {
  const client = await pool.connect()
  let leagueId

  try {
    await client.query('BEGIN')
    const team = await client.query(
      `UPDATE league_teams
       SET name = $1
       WHERE id = $2
       RETURNING league_id`,
      [input.name, teamId]
    )
    if (team.rowCount === 0) throw problem(404, 'League team not found')
    leagueId = team.rows[0].league_id
    await client.query('DELETE FROM league_players WHERE league_team_id = $1', [teamId])
    await insertPlayers(client, teamId, input.players)
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw duplicateProblem(error, 'That team name or jersey number is already used in this league roster')
  } finally {
    client.release()
  }

  return getById(pool, leagueId)
}
