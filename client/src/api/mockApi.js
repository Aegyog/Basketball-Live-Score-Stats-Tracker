import seed from './seed.json'

const STORAGE_KEY = 'basketball-tracker:games:v1'
const LEAGUES_STORAGE_KEY = 'basketball-tracker:leagues:v1'
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms))

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function readGames() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
  const initial = clone(seed)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  return initial
}

function writeGames(games) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
  return games
}

function readLeagues() {
  const stored = localStorage.getItem(LEAGUES_STORAGE_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    localStorage.removeItem(LEAGUES_STORAGE_KEY)
    return []
  }
}

function writeLeagues(leagues) {
  localStorage.setItem(LEAGUES_STORAGE_KEY, JSON.stringify(leagues))
  return leagues
}

function playerFromInput(player, side, index) {
  const name = typeof player === 'string' ? player : player.name
  const number = typeof player === 'string' ? index + 1 : Number(player.number)
  return {
    id: `${side}-${crypto.randomUUID()}`,
    number,
    name: name.trim(),
    stats: { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0 },
  }
}

function findGame(games, id) {
  const game = games.find((item) => String(item.id) === String(id))
  if (!game) throw new Error('Game not found')
  return game
}

export async function listGames() {
  await delay()
  return clone(readGames().sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
}

export async function getGame(id) {
  await delay()
  return clone(findGame(readGames(), id))
}

export async function createGame(input) {
  await delay()
  const games = readGames()
  let homeName = input.homeName
  let awayName = input.awayName
  let homePlayers = input.homePlayers
  let awayPlayers = input.awayPlayers

  if (input.mode === 'league') {
    const league = readLeagues().find((item) => item.id === input.leagueId)
    if (!league) throw new Error('League not found')
    const home = league.teams.find((team) => team.id === input.homeLeagueTeamId)
    const away = league.teams.find((team) => team.id === input.awayLeagueTeamId)
    if (!home || !away || home.id === away.id) throw new Error('Select two different teams from that league')
    homeName = home.name
    awayName = away.name
    homePlayers = home.players
    awayPlayers = away.players
  }

  const game = {
    id: crypto.randomUUID(),
    leagueId: input.mode === 'league' ? input.leagueId : null,
    date: input.date,
    venue: input.venue.trim(),
    status: 'live',
    quarter: 1,
    createdAt: new Date().toISOString(),
    home: { name: homeName.trim(), score: 0, players: homePlayers.map((player, index) => playerFromInput(player, 'home', index)) },
    away: { name: awayName.trim(), score: 0, players: awayPlayers.map((player, index) => playerFromInput(player, 'away', index)) },
    plays: [],
  }
  writeGames([game, ...games])
  return clone(game)
}

export async function listLeagues() {
  await delay()
  return clone(readLeagues())
}

export async function createLeague(input) {
  await delay()
  const leagues = readLeagues()
  const name = input.name.trim()
  const season = input.season.trim()
  const duplicate = leagues.some((league) => league.name.toLowerCase() === name.toLowerCase() && league.season.toLowerCase() === season.toLowerCase())
  if (duplicate) throw new Error('A league with that name and season already exists')
  const league = { id: crypto.randomUUID(), name, season, createdAt: new Date().toISOString(), teams: [] }
  writeLeagues([...leagues, league])
  return clone(league)
}

export async function createLeagueTeam(leagueId, input) {
  await delay()
  const leagues = readLeagues()
  const league = leagues.find((item) => item.id === leagueId)
  if (!league) throw new Error('League not found')
  const name = input.name.trim()
  if (league.teams.some((team) => team.name.toLowerCase() === name.toLowerCase())) throw new Error('That team already exists in this league')
  league.teams.push({
    id: crypto.randomUUID(),
    name,
    players: input.players.map((player) => ({ id: crypto.randomUUID(), number: Number(player.number), name: player.name.trim() })),
  })
  writeLeagues(leagues)
  return clone(league)
}

export async function updateLeagueTeam(teamId, input) {
  await delay()
  const leagues = readLeagues()
  const league = leagues.find((item) => item.teams.some((team) => team.id === teamId))
  if (!league) throw new Error('League team not found')
  const team = league.teams.find((item) => item.id === teamId)
  const name = input.name.trim()
  if (league.teams.some((item) => item.id !== teamId && item.name.toLowerCase() === name.toLowerCase())) throw new Error('That team already exists in this league')
  team.name = name
  team.players = input.players.map((player) => ({ id: crypto.randomUUID(), number: Number(player.number), name: player.name.trim() }))
  writeLeagues(leagues)
  return clone(league)
}

export async function recordPlay(gameId, input) {
  await delay()
  const games = readGames()
  const game = findGame(games, gameId)
  if (game.status !== 'live') throw new Error('This game is already final')
  const team = game[input.teamSide]
  const player = team.players.find((item) => item.id === input.playerId)
  if (!player) throw new Error('Player not found')
  const amount = Number(input.amount)
  player.stats[input.stat] += amount
  if (input.stat === 'points') team.score += amount
  game.plays.unshift({
    id: crypto.randomUUID(),
    teamSide: input.teamSide,
    playerId: player.id,
    playerName: player.name,
    stat: input.stat,
    amount,
    quarter: game.quarter,
    createdAt: new Date().toISOString(),
  })
  writeGames(games)
  return clone(game)
}

export async function undoLastPlay(gameId) {
  await delay()
  const games = readGames()
  const game = findGame(games, gameId)
  const play = game.plays.shift()
  if (!play) throw new Error('There is no play to undo')
  const team = game[play.teamSide]
  const player = team.players.find((item) => item.id === play.playerId)
  player.stats[play.stat] = Math.max(0, player.stats[play.stat] - play.amount)
  if (play.stat === 'points') team.score = Math.max(0, team.score - play.amount)
  writeGames(games)
  return clone(game)
}

export async function advanceQuarter(gameId) {
  await delay()
  const games = readGames()
  const game = findGame(games, gameId)
  game.quarter = Math.min(5, game.quarter + 1)
  writeGames(games)
  return clone(game)
}

export async function undoQuarter(gameId) {
  await delay()
  const games = readGames()
  const game = findGame(games, gameId)
  if (game.status !== 'live') throw new Error('A final game cannot be changed')
  if (game.quarter <= 1) throw new Error('The game is already in quarter 1')
  if (game.plays.some((play) => play.quarter === game.quarter)) {
    throw new Error('Undo the plays recorded in this quarter before moving back')
  }
  game.quarter -= 1
  writeGames(games)
  return clone(game)
}

export async function finishGame(gameId) {
  await delay()
  const games = readGames()
  const game = findGame(games, gameId)
  game.status = 'final'
  writeGames(games)
  return clone(game)
}

export async function resetDemoData() {
  await delay(80)
  const initial = clone(seed)
  writeGames(initial)
  return initial
}
