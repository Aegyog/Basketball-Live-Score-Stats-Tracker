const STAT_COLUMNS = {
  points: 'points',
  rebounds: 'rebounds',
  assists: 'assists',
  steals: 'steals',
  blocks: 'blocks',
}

function problem(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function assembleGames(gameRows, teamRows, playerRows, playRows) {
  const games = new Map(
    gameRows.map((row) => [String(row.id), {
      id: String(row.id),
      date: row.game_date,
      venue: row.venue,
      status: row.status,
      quarter: row.current_quarter,
      createdAt: row.created_at,
      home: null,
      away: null,
      plays: [],
    }])
  )

  const teams = new Map()
  for (const row of teamRows) {
    const team = {
      id: String(row.id),
      name: row.name,
      score: row.score,
      players: [],
    }
    teams.set(String(row.id), team)
    games.get(String(row.game_id))[row.side] = team
  }

  for (const row of playerRows) {
    teams.get(String(row.team_id)).players.push({
      id: String(row.id),
      number: row.player_number,
      name: row.name,
      stats: {
        points: row.points,
        rebounds: row.rebounds,
        assists: row.assists,
        steals: row.steals,
        blocks: row.blocks,
      },
    })
  }

  for (const row of playRows) {
    games.get(String(row.game_id)).plays.push({
      id: String(row.id),
      teamSide: row.team_side,
      playerId: String(row.player_id),
      playerName: row.player_name,
      stat: row.stat,
      amount: row.amount,
      quarter: row.quarter,
      createdAt: row.created_at,
    })
  }

  return [...games.values()]
}

async function loadGames(client, where = '', values = []) {
  const games = await client.query(
    `SELECT id, game_date, venue, status, current_quarter, created_at
     FROM games ${where}
     ORDER BY created_at DESC, id DESC`,
    values
  )

  if (games.rowCount === 0) return []

  const gameIds = games.rows.map((row) => row.id)
  const teams = await client.query(
    `SELECT id, game_id, side, name, score
     FROM teams
     WHERE game_id = ANY($1::bigint[])
     ORDER BY game_id, CASE side WHEN 'home' THEN 0 ELSE 1 END`,
    [gameIds]
  )
  const teamIds = teams.rows.map((row) => row.id)
  const players = teamIds.length === 0
    ? { rows: [] }
    : await client.query(
      `SELECT id, team_id, player_number, name,
              points, rebounds, assists, steals, blocks
       FROM players
       WHERE team_id = ANY($1::bigint[])
       ORDER BY team_id, player_number, id`,
      [teamIds]
    )
  const plays = await client.query(
    `SELECT p.id, p.game_id, t.side AS team_side, p.player_id,
            pl.name AS player_name, p.stat, p.amount, p.quarter, p.created_at
     FROM plays p
     JOIN teams t ON t.id = p.team_id
     JOIN players pl ON pl.id = p.player_id
     WHERE p.game_id = ANY($1::bigint[])
     ORDER BY p.created_at DESC, p.id DESC`,
    [gameIds]
  )

  return assembleGames(games.rows, teams.rows, players.rows, plays.rows)
}

export async function getAll(pool) {
  return loadGames(pool)
}

export async function getById(pool, id) {
  const result = await loadGames(pool, 'WHERE id = $1', [id])
  return result[0] ?? null
}

export async function create(pool, input) {
  const client = await pool.connect()
  let gameId

  try {
    await client.query('BEGIN')
    const game = await client.query(
      `INSERT INTO games (game_date, venue)
       VALUES ($1, $2)
       RETURNING id`,
      [input.date, input.venue]
    )
    gameId = game.rows[0].id

    for (const [side, name, roster] of [
      ['home', input.homeName, input.homePlayers],
      ['away', input.awayName, input.awayPlayers],
    ]) {
      const team = await client.query(
        `INSERT INTO teams (game_id, side, name)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [gameId, side, name]
      )
      await client.query(
        `INSERT INTO players (team_id, player_number, name)
         SELECT $1, roster_number::integer, player_name
         FROM unnest($2::text[]) WITH ORDINALITY AS roster(player_name, roster_number)`,
        [team.rows[0].id, roster]
      )
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  return getById(pool, gameId)
}

export async function recordPlay(pool, gameId, input) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const game = await client.query(
      'SELECT status, current_quarter FROM games WHERE id = $1 FOR UPDATE',
      [gameId]
    )
    if (game.rowCount === 0) throw problem(404, 'Game not found')
    if (game.rows[0].status !== 'live') throw problem(409, 'This game is already final')

    const player = await client.query(
      `SELECT p.id, p.team_id
       FROM players p
       JOIN teams t ON t.id = p.team_id
       WHERE p.id = $1 AND t.game_id = $2 AND t.side = $3`,
      [input.playerId, gameId, input.teamSide]
    )
    if (player.rowCount === 0) throw problem(400, 'Player does not belong to that team and game')

    const statColumn = STAT_COLUMNS[input.stat]
    await client.query(
      `UPDATE players SET ${statColumn} = ${statColumn} + $1 WHERE id = $2`,
      [input.amount, input.playerId]
    )
    if (input.stat === 'points') {
      await client.query(
        'UPDATE teams SET score = score + $1 WHERE id = $2',
        [input.amount, player.rows[0].team_id]
      )
    }
    await client.query(
      `INSERT INTO plays (game_id, team_id, player_id, stat, amount, quarter)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [gameId, player.rows[0].team_id, input.playerId, input.stat, input.amount, game.rows[0].current_quarter]
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  return getById(pool, gameId)
}

export async function undoLastPlay(pool, gameId) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const game = await client.query('SELECT status FROM games WHERE id = $1 FOR UPDATE', [gameId])
    if (game.rowCount === 0) throw problem(404, 'Game not found')
    if (game.rows[0].status !== 'live') throw problem(409, 'A final game cannot be changed')

    const play = await client.query(
      `SELECT id, team_id, player_id, stat, amount
       FROM plays
       WHERE game_id = $1
       ORDER BY id DESC
       LIMIT 1
       FOR UPDATE`,
      [gameId]
    )
    if (play.rowCount === 0) throw problem(409, 'There is no play to undo')

    const latest = play.rows[0]
    const statColumn = STAT_COLUMNS[latest.stat]
    await client.query(
      `UPDATE players SET ${statColumn} = GREATEST(0, ${statColumn} - $1) WHERE id = $2`,
      [latest.amount, latest.player_id]
    )
    if (latest.stat === 'points') {
      await client.query(
        'UPDATE teams SET score = GREATEST(0, score - $1) WHERE id = $2',
        [latest.amount, latest.team_id]
      )
    }
    await client.query('DELETE FROM plays WHERE id = $1', [latest.id])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  return getById(pool, gameId)
}

export async function advanceQuarter(pool, gameId) {
  const result = await pool.query(
    `UPDATE games
     SET current_quarter = current_quarter + 1
     WHERE id = $1 AND status = 'live' AND current_quarter < 5
     RETURNING id`,
    [gameId]
  )
  if (result.rowCount === 0) {
    const game = await pool.query('SELECT status, current_quarter FROM games WHERE id = $1', [gameId])
    if (game.rowCount === 0) throw problem(404, 'Game not found')
    throw problem(409, game.rows[0].status === 'final' ? 'This game is already final' : 'The game is already in overtime')
  }
  return getById(pool, gameId)
}

export async function finish(pool, gameId) {
  const result = await pool.query(
    `UPDATE games
     SET status = 'final', finished_at = now()
     WHERE id = $1 AND status = 'live'
     RETURNING id`,
    [gameId]
  )
  if (result.rowCount === 0) {
    const game = await pool.query('SELECT status FROM games WHERE id = $1', [gameId])
    if (game.rowCount === 0) throw problem(404, 'Game not found')
    throw problem(409, 'This game is already final')
  }
  return getById(pool, gameId)
}
