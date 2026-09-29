import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

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

function digest(value) {
  return createHash('sha256').update(String(value)).digest()
}

function sign(encodedPayload) {
  return createHmac('sha256', requiredEnvironment('SESSION_SECRET'))
    .update(encodedPayload)
    .digest('base64url')
}

export function passwordMatches(password) {
  const configuredPassword = requiredEnvironment('SCORER_PASSWORD')
  return timingSafeEqual(digest(password ?? ''), digest(configuredPassword))
}

export function createSessionToken(now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({
    role: 'scorer',
    exp: Math.floor(now / 1000) + TOKEN_TTL_SECONDS,
  })).toString('base64url')

  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token, now = Date.now()) {
  if (typeof token !== 'string') return false
  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra) return false

  const expected = Buffer.from(sign(payload))
  const provided = Buffer.from(signature)
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return false

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return decoded.role === 'scorer' && Number.isInteger(decoded.exp) && decoded.exp > Math.floor(now / 1000)
  } catch {
    return false
  }
}

export function requireScorer(request, response, next) {
  const authorization = request.get('authorization') || ''
  const [scheme, token] = authorization.split(' ')

  try {
    if (scheme !== 'Bearer' || !verifySessionToken(token)) {
      return response.status(401).json({ error: 'Sign in as a scorer to continue' })
    }
    next()
  } catch (error) {
    next(error)
  }
}
