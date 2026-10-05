import { isObjectBody } from './requestBody.js'
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64
const EMPTY_HASH = `scrypt$${'00'.repeat(16)}$${'00'.repeat(KEY_LENGTH)}`

function problem(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

export function validateCredentials(input = {}) {
  if (!isObjectBody(input)) return { errors: ['Request body must be a JSON object'], value: {} }
  const username = typeof input.username === 'string' ? input.username.trim().toLowerCase() : ''
  const password = typeof input.password === 'string' ? input.password : ''
  const errors = []

  if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
    errors.push('username must be 3–30 characters using letters, numbers, dots, underscores, or hyphens')
  }
  if (password.length < 8 || password.length > 128) {
    errors.push('password must be 8–128 characters')
  }

  return { errors, value: { username, password } }
}

export async function hashPassword(password) {
  const salt = randomBytes(16)
  const derived = await scrypt(password, salt, KEY_LENGTH)
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`
}

export async function verifyPassword(password, encodedHash) {
  const [algorithm, saltHex, expectedHex] = String(encodedHash || EMPTY_HASH).split('$')
  if (algorithm !== 'scrypt' || !saltHex || !expectedHex) return false

  try {
    const expected = Buffer.from(expectedHex, 'hex')
    const derived = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length)
    return expected.length === derived.length && timingSafeEqual(expected, derived)
  } catch {
    return false
  }
}

export async function create(pool, input) {
  const passwordHash = await hashPassword(input.password)
  try {
    const result = await pool.query(
      `INSERT INTO app_users (username, password_hash)
       VALUES ($1, $2)
       RETURNING id, username, created_at`,
      [input.username, passwordHash]
    )
    return {
      id: String(result.rows[0].id),
      username: result.rows[0].username,
      createdAt: result.rows[0].created_at,
    }
  } catch (error) {
    if (error.code === '23505') throw problem(409, 'That username is already taken')
    throw error
  }
}

export async function authenticate(pool, input) {
  const result = await pool.query(
    'SELECT id, username, password_hash FROM app_users WHERE lower(username) = $1',
    [input.username]
  )
  const row = result.rows[0]
  const matches = await verifyPassword(input.password, row?.password_hash || EMPTY_HASH)
  if (!row || !matches) throw problem(401, 'Incorrect username or password')
  return { id: String(row.id), username: row.username }
}
