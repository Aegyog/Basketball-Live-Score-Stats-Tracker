import test from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, validateCredentials, verifyPassword } from './usersRepo.js'

test('credentials normalize valid usernames', () => {
  const result = validateCredentials({ username: '  Score.Keeper_7  ', password: 'strong passphrase' })
  assert.deepEqual(result.errors, [])
  assert.equal(result.value.username, 'score.keeper_7')
})

test('credentials reject unsafe usernames and short passwords', () => {
  const result = validateCredentials({ username: 'not allowed!', password: 'short' })
  assert.equal(result.errors.length, 2)
})

test('password hashes are salted and verifiable', async () => {
  const first = await hashPassword('correct horse battery staple')
  const second = await hashPassword('correct horse battery staple')

  assert.notEqual(first, second)
  assert.equal(await verifyPassword('correct horse battery staple', first), true)
  assert.equal(await verifyPassword('wrong password', first), false)
})


test('credential validation rejects non-object bodies without throwing', () => {
  for (const body of [null, [], 'text', 42, true]) {
    assert.deepEqual(validateCredentials(body).errors, ['Request body must be a JSON object'])
  }
})
