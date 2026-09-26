import express from 'express'
import cors from 'cors'
import { pool } from './db/pool.js'
import * as games from './gamesRepo.js'
import { parseId, validateGame, validatePlay } from './validation.js'

const app = express()
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.disable('x-powered-by')
app.use(cors({ origin: allowedOrigins }))
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

app.get('/api/games', async (request, response, next) => {
  try { response.json(await games.getAll(pool)) } catch (error) { next(error) }
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

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`CORS allows: ${allowedOrigins.join(', ')}`)
})
