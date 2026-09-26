import test from 'node:test'
import assert from 'node:assert/strict'
import { parseId, validateGame, validatePlay } from './validation.js'

const validGame = {
  date: '2026-09-26',
  venue: 'HAU Gym',
  homeName: 'Blue Hawks',
  awayName: 'Orange Lions',
  homePlayers: ['Ana', 'Bea'],
  awayPlayers: ['Carlo', 'Diego'],
}

test('validateGame accepts and trims a complete game', () => {
  const result = validateGame({ ...validGame, venue: '  HAU Gym  ' })
  assert.deepEqual(result.errors, [])
  assert.equal(result.value.venue, 'HAU Gym')
})

test('validateGame rejects invalid dates, duplicate teams, and empty rosters', () => {
  const result = validateGame({ ...validGame, date: '2026-02-31', awayName: 'blue hawks', homePlayers: [] })
  assert.ok(result.errors.some((error) => error.includes('real date')))
  assert.ok(result.errors.some((error) => error.includes('different')))
  assert.ok(result.errors.some((error) => error.includes('homePlayers')))
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
