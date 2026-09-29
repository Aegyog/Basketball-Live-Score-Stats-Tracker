import express from 'express'
import cors from 'cors'
import { pool } from './db/pool.js'
import * as games from './gamesRepo.js'
import * as leagues from './leaguesRepo.js'
import { createSessionToken, passwordMatches, requireScorer } from './auth.js'
import { parseId, validateGame, validateLeague, validateLeagueTeam, validatePlay } from './validation.js'

const app = express()
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.disable('x-powered-by')
app.use(cors({ origin: allowedOrigins, allowedHeaders: ['Content-Type', 'Authorization'] }))
app.use(express.json({ limit: '100kb' }))

app.get('/healthz', (request, response) => response.json({ ok: true }))

app.get('/readyz', async (request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({ ok: true, db: 'up' })
  } catch (error) {
    console.error('readyz failed:', error.message)
    response.status(503).json({ ok: false, db: 'down' })
  }
})

app.post('/api/auth/login', (request, response, next) => {
  try {
    const password = typeof request.body?.password === 'string' ? request.body.password : ''
    if (password.length > 200 || !passwordMatches(password)) {
      return response.status(401).json({ error: 'Incorrect scorer password' })
    }

    response.set('Cache-Control', 'no-store')
    response.json({ token: createSessionToken(), expiresIn: 8 * 60 * 60 })
  } catch (error) {
    next(error)
  }
})

app.get('/api/auth/session', requireScorer, (request, response) => {
  response.set('Cache-Control', 'no-store')
  response.json({ authenticated: true })
})

app.use('/api', requireScorer)

app.get('/api/games', async (request, response, next) => {
  try { response.json(await games.getAll(pool)) } catch (error) { next(error) }
})

app.get('/api/leagues', async (request, response, next) => {
  try { response.json(await leagues.getAll(pool)) } catch (error) { next(error) }
})

app.post('/api/leagues', async (request, response, next) => {
  const { errors, value } = validateLeague(request.body)
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })
  try { response.status(201).json(await leagues.create(pool, value)) } catch (error) { next(error) }
})

app.post('/api/leagues/:id/teams', async (request, response, next) => {
  const id = parseId(request.params.id, 'league id')
  const { errors, value } = validateLeagueTeam(request.body)
  if (id.error) errors.unshift(id.error)
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })
  try { response.status(201).json(await leagues.createTeam(pool, id.value, value)) } catch (error) { next(error) }
})

app.put('/api/league-teams/:id', async (request, response, next) => {
  const id = parseId(request.params.id, 'league team id')
  const { errors, value } = validateLeagueTeam(request.body)
  if (id.error) errors.unshift(id.error)
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })
  try { response.json(await leagues.updateTeam(pool, id.value, value)) } catch (error) { next(error) }
})

app.get('/api/games/:id', async (request, response, next) => {
  const id = parseId(request.params.id, 'game id')
  if (id.error) return response.status(400).json({ error: id.error })
  try {
    const game = await games.getById(pool, id.value)
    if (!game) return response.status(404).json({ error: 'Game not found' })
    response.json(game)
  } catch (error) { next(error) }
})

app.post('/api/games', async (request, response, next) => {
  const { errors, value } = validateGame(request.body)
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })
  try { response.status(201).json(await games.create(pool, value)) } catch (error) { next(error) }
})

app.post('/api/games/:id/plays', async (request, response, next) => {
  const id = parseId(request.params.id, 'game id')
  const { errors, value } = validatePlay(request.body)
  if (id.error) errors.unshift(id.error)
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })
  try { response.status(201).json(await games.recordPlay(pool, id.value, value)) } catch (error) { next(error) }
})

app.delete('/api/games/:id/plays/latest', async (request, response, next) => {
  const id = parseId(request.params.id, 'game id')
  if (id.error) return response.status(400).json({ error: id.error })
  try { response.json(await games.undoLastPlay(pool, id.value)) } catch (error) { next(error) }
})

app.patch('/api/games/:id/quarter', async (request, response, next) => {
  const id = parseId(request.params.id, 'game id')
  if (id.error) return response.status(400).json({ error: id.error })
  try { response.json(await games.advanceQuarter(pool, id.value)) } catch (error) { next(error) }
})

app.patch('/api/games/:id/quarter/undo', async (request, response, next) => {
  const id = parseId(request.params.id, 'game id')
  if (id.error) return response.status(400).json({ error: id.error })
  try { response.json(await games.undoQuarter(pool, id.value)) } catch (error) { next(error) }
})

app.patch('/api/games/:id/finish', async (request, response, next) => {
  const id = parseId(request.params.id, 'game id')
  if (id.error) return response.status(400).json({ error: id.error })
  try { response.json(await games.finish(pool, id.value)) } catch (error) { next(error) }
})

app.use((request, response) => response.status(404).json({ error: 'No such route' }))

app.use((error, request, response, next) => {
  const status = Number.isInteger(error.status) ? error.status : 500
  if (status >= 500) console.error(error)
  response.status(status).json({ error: status >= 500 ? 'Something went wrong on the server' : error.message })
})

if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`)
    console.log(`CORS allows: ${allowedOrigins.join(', ')}`)
  })
}

export default app
