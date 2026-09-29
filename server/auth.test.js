import test from 'node:test'
import assert from 'node:assert/strict'
import { createSessionToken, passwordMatches, verifySessionToken } from './auth.js'

process.env.SCORER_PASSWORD = 'test-password'
process.env.SESSION_SECRET = 'test-session-secret-that-is-long-enough'

test('passwordMatches accepts only the configured scorer password', () => {
  assert.equal(passwordMatches('test-password'), true)
  assert.equal(passwordMatches('wrong-password'), false)
})

test('session tokens are signed and expire after eight hours', () => {
  const issuedAt = Date.UTC(2026, 8, 30, 8)
  const token = createSessionToken(issuedAt)

  assert.equal(verifySessionToken(token, issuedAt + 60_000), true)
  assert.equal(verifySessionToken(token, issuedAt + (8 * 60 * 60 * 1000) + 1_000), false)
})

test('session tokens reject tampering', () => {
  const token = createSessionToken()
  const [payload, signature] = token.split('.')

  assert.equal(verifySessionToken(`${payload}.${signature.slice(0, -1)}x`), false)
  assert.equal(verifySessionToken(`eyJyb2xlIjoiYWRtaW4ifQ.${signature}`), false)
})
