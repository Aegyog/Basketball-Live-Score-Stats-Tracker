import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_TTL_SECONDS = 8 * 60 * 60

function requiredEnvironment(name) {
  const value = process.env[name]
  if (!value) {
    const error = new Error(`${name} is not configured`)
    error.status = 503
    throw error
  }
  return value
}

function sign(encodedPayload) {
  return createHmac('sha256', requiredEnvironment('SESSION_SECRET'))
    .update(encodedPayload)
    .digest('base64url')
}

export function createSessionToken(user, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({
    userId: String(user.id),
    username: user.username,
    exp: Math.floor(now / 1000) + TOKEN_TTL_SECONDS,
  })).toString('base64url')

  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token, now = Date.now()) {
  if (typeof token !== 'string') return null
  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra) return null

  const expected = Buffer.from(sign(payload))
  const provided = Buffer.from(signature)
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!/^\d+$/.test(decoded.userId) || typeof decoded.username !== 'string') return null
    if (!Number.isInteger(decoded.exp) || decoded.exp <= Math.floor(now / 1000)) return null
    return { id: decoded.userId, username: decoded.username }
  } catch {
    return null
  }
}

export function requireUser(request, response, next) {
  const authorization = request.get('authorization') || ''
  const [scheme, token] = authorization.split(' ')

  try {
    const user = scheme === 'Bearer' ? verifySessionToken(token) : null
    if (!user) {
      return response.status(401).json({ error: 'Sign in to continue' })
    }
    request.user = user
    next()
  } catch (error) {
    next(error)
  }
}
