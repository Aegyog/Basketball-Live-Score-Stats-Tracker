import test from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'

// These requests must fail before any database access.
process.env.DATABASE_URL = 'postgresql://test:test@localhost:1/test'
process.env.VERCEL = '1'
const { default: app } = await import('./server.js')
const { createSessionToken } = await import('./auth.js')
process.env.SESSION_SECRET = 'request-body-test-secret-at-least-32-characters'

test('HTTP routes reject invalid JSON bodies with safe client errors', async (t) => {
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const base = `http://127.0.0.1:${server.address().port}`
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${createSessionToken({ id: '1', username: 'test.user' })}`,
  }
  try {
    for (const path of ['/api/auth/register', '/api/auth/login', '/api/games', '/api/leagues', '/api/leagues/1/teams', '/api/games/1/plays']) {
      for (const body of ['null', '[]', '"text"', '42', 'true']) {
        await t.test(`${path} rejects ${body}`, async () => {
          const response = await fetch(`${base}${path}`, { method: 'POST', headers, body })
          assert.equal(response.status, 400)
          const result = await response.json()
          assert.match(result.error, /JSON/)
          assert.doesNotMatch(result.error, /TypeError|SyntaxError|at |postgres|node_modules/)
        })
      }
    }
    const malformed = await fetch(`${base}/api/auth/login`, { method: 'POST', headers, body: '{"password":"private-marker"' })
    assert.equal(malformed.status, 400)
    assert.deepEqual(await malformed.json(), { error: 'Request body must contain valid JSON' })
    const oversized = await fetch(`${base}/api/auth/login`, { method: 'POST', headers, body: JSON.stringify({ username: 'x'.repeat(110_000) }) })
    assert.equal(oversized.status, 413)
    assert.deepEqual(await oversized.json(), { error: 'Request body exceeds the 100 KB limit' })
    const invalidCredentials = await fetch(`${base}/api/auth/login`, { method: 'POST', headers, body: '{}' })
    assert.equal(invalidCredentials.status, 400)
    assert.match((await invalidCredentials.json()).error, /username/)
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
})
