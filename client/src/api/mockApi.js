import seed from './seed.json'

const STORAGE_KEY = 'basketball-tracker:games:v1'
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

function playerFromName(name, side, index) {
  return {
    id: `${side}-${crypto.randomUUID()}`,
    number: index + 1,
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
  const game = {
    id: crypto.randomUUID(),
    date: input.date,
    venue: input.venue.trim(),
    status: 'live',
    quarter: 1,
    createdAt: new Date().toISOString(),
    home: { name: input.homeName.trim(), score: 0, players: input.homePlayers.map((name, index) => playerFromName(name, 'home', index)) },
    away: { name: input.awayName.trim(), score: 0, players: input.awayPlayers.map((name, index) => playerFromName(name, 'away', index)) },
    plays: [],
  }
  writeGames([game, ...games])
  return clone(game)
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
