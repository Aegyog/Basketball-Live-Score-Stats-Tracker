const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const SESSION_KEY = 'hoopstat:scorer-session'

function sessionToken() {
  return sessionStorage.getItem(SESSION_KEY)
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
    if (response.status === 401 && path !== '/api/auth/login') {
      sessionStorage.removeItem(SESSION_KEY)
      window.dispatchEvent(new Event('hoopstat:unauthorized'))
    }
    throw new Error(message)
  }
  return response.status === 204 ? null : response.json()
}

export async function login(password) {
  const result = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
  sessionStorage.setItem(SESSION_KEY, result.token)
  return result
}

export const checkSession = () => request('/api/auth/session')
export const logout = () => sessionStorage.removeItem(SESSION_KEY)

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
