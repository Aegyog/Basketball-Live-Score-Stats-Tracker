import test from 'node:test'
import assert from 'node:assert/strict'
import { createSessionToken, verifySessionToken } from './auth.js'

process.env.SESSION_SECRET = 'test-session-secret-that-is-long-enough'

test('session tokens are signed and expire after eight hours', () => {
  const issuedAt = Date.UTC(2026, 8, 30, 8)
  const token = createSessionToken({ id: '42', username: 'sample.user' }, issuedAt)

  assert.deepEqual(verifySessionToken(token, issuedAt + 60_000), { id: '42', username: 'sample.user' })
  assert.equal(verifySessionToken(token, issuedAt + (8 * 60 * 60 * 1000) + 1_000), null)
})

test('session tokens reject tampering', () => {
  const token = createSessionToken({ id: '42', username: 'sample.user' })
  const [payload, signature] = token.split('.')

  assert.equal(verifySessionToken(`${payload}.${signature.slice(0, -1)}x`), null)
  assert.equal(verifySessionToken(`eyJyb2xlIjoiYWRtaW4ifQ.${signature}`), null)
})
