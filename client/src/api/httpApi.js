const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const SESSION_KEY = 'hoopstat:user-session'
const LEGACY_SESSION_KEY = 'hoopstat:scorer-session'

function sessionToken() {
  const token = sessionStorage.getItem(SESSION_KEY)
  if (!token) sessionStorage.removeItem(LEGACY_SESSION_KEY)
  return token
}

async function request(path, options = {}) {
  const token = sessionToken()
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`
    try {
      const body = await response.json()
      if (body?.error) message = body.error
    } catch {
      // The status line remains the fallback when the response is not JSON.
    }
    if (token && response.status === 401 && !['/api/auth/login', '/api/auth/register'].includes(path)) {
      sessionStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(LEGACY_SESSION_KEY)
      window.dispatchEvent(new Event('hoopstat:unauthorized'))
    }
    throw new Error(message)
  }
  return response.status === 204 ? null : response.json()
}

function saveSession(result) {
  sessionStorage.removeItem(LEGACY_SESSION_KEY)
  sessionStorage.setItem(SESSION_KEY, result.token)
  return result
}

export async function login(username, password) {
  const result = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  return saveSession(result)
}

export async function register(username, password) {
  const result = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  return saveSession(result)
}

export const checkSession = () => request('/api/auth/session')
export const logout = () => {
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(LEGACY_SESSION_KEY)
}

export const listGames = () => request('/api/games')
export const getGame = (id) => request(`/api/games/${id}`)
export const createGame = (input) => request('/api/games', { method: 'POST', body: JSON.stringify(input) })
export const listLeagues = () => request('/api/leagues')
export const createLeague = (input) => request('/api/leagues', { method: 'POST', body: JSON.stringify(input) })
export const createLeagueTeam = (leagueId, input) => request(`/api/leagues/${leagueId}/teams`, { method: 'POST', body: JSON.stringify(input) })
export const updateLeagueTeam = (teamId, input) => request(`/api/league-teams/${teamId}`, { method: 'PUT', body: JSON.stringify(input) })
export const recordPlay = (gameId, input) => request(`/api/games/${gameId}/plays`, { method: 'POST', body: JSON.stringify(input) })
export const undoLastPlay = (gameId) => request(`/api/games/${gameId}/plays/latest`, { method: 'DELETE' })
export const advanceQuarter = (gameId) => request(`/api/games/${gameId}/quarter`, { method: 'PATCH' })
export const undoQuarter = (gameId) => request(`/api/games/${gameId}/quarter/undo`, { method: 'PATCH' })
export const finishGame = (gameId) => request(`/api/games/${gameId}/finish`, { method: 'PATCH' })
export const resetDemoData = async () => { throw new Error('Reset is available only in demo mode') }
