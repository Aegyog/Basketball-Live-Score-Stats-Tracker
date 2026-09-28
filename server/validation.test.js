import test from 'node:test'
import assert from 'node:assert/strict'
import { parseId, validateGame, validateLeague, validateLeagueTeam, validatePlay } from './validation.js'

const validGame = {
  date: '2026-09-26',
  venue: 'HAU Gym',
  homeName: 'Blue Hawks',
  awayName: 'Orange Lions',
  homePlayers: [{ number: 7, name: 'Ana' }, { number: 12, name: 'Bea' }],
  awayPlayers: [{ number: 4, name: 'Carlo' }, { number: 9, name: 'Diego' }],
}

test('validateGame accepts and trims a complete game', () => {
  const result = validateGame({ ...validGame, venue: '  HAU Gym  ' })
  assert.deepEqual(result.errors, [])
  assert.equal(result.value.venue, 'HAU Gym')
  assert.deepEqual(result.value.homePlayers[0], { number: 7, name: 'Ana' })
})

test('validateGame rejects invalid dates, duplicate teams, and empty rosters', () => {
  const result = validateGame({ ...validGame, date: '2026-02-31', awayName: 'blue hawks', homePlayers: [] })
  assert.ok(result.errors.some((error) => error.includes('real date')))
  assert.ok(result.errors.some((error) => error.includes('different')))
  assert.ok(result.errors.some((error) => error.includes('homePlayers')))
})

test('validateGame rejects invalid and duplicate jersey numbers', () => {
  const result = validateGame({
    ...validGame,
    homePlayers: [{ number: 0, name: 'Ana' }, { number: 0, name: 'Bea' }],
    awayPlayers: [{ number: 8, name: 'Carlo' }, { number: 8, name: 'Diego' }],
  })
  assert.ok(result.errors.some((error) => error.includes('whole numbers')))
  assert.ok(result.errors.some((error) => error.includes('unique')))
})

test('validateGame accepts saved league teams', () => {
  const result = validateGame({
    mode: 'league',
    date: '2026-09-26',
    venue: 'HAU Gym',
    leagueId: '4',
    homeLeagueTeamId: '10',
    awayLeagueTeamId: '11',
  })
  assert.deepEqual(result.errors, [])
  assert.equal(result.value.mode, 'league')
  assert.equal(result.value.homeLeagueTeamId, '10')
})

test('validateGame rejects duplicate or invalid saved league teams', () => {
  const result = validateGame({
    mode: 'league',
    date: '2026-09-26',
    venue: 'HAU Gym',
    leagueId: 'bad',
    homeLeagueTeamId: '10',
    awayLeagueTeamId: '10',
  })
  assert.ok(result.errors.some((error) => error.includes('leagueId')))
  assert.ok(result.errors.some((error) => error.includes('different')))
})

test('league validators accept trimmed league and roster data', () => {
  assert.deepEqual(validateLeague({ name: '  HAU Intramurals  ', season: ' 2026 ' }).value, {
    name: 'HAU Intramurals',
    season: '2026',
  })
  const team = validateLeagueTeam({ name: ' Blue Hawks ', players: [{ number: 7, name: ' Ana ' }] })
  assert.deepEqual(team.errors, [])
  assert.deepEqual(team.value.players[0], { number: 7, name: 'Ana' })
})

test('validatePlay accepts scoring and one-count box-score events', () => {
  assert.deepEqual(validatePlay({ teamSide: 'home', playerId: '7', stat: 'points', amount: 3 }).errors, [])
  assert.deepEqual(validatePlay({ teamSide: 'away', playerId: 8, stat: 'rebounds', amount: 1 }).errors, [])
})

test('validatePlay rejects unknown players, stats, and inflated non-scoring events', () => {
  const result = validatePlay({ teamSide: 'bench', playerId: 'abc', stat: 'turnovers', amount: 2 })
  assert.equal(result.errors.length, 4)
})

test('parseId accepts positive integer strings only', () => {
  assert.equal(parseId('42').value, '42')
  assert.match(parseId('0').error, /positive integer/)
  assert.match(parseId('1 OR 1=1').error, /positive integer/)
})
