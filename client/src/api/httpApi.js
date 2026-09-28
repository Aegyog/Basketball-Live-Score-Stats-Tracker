const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`
    try {
      const body = await response.json()
      if (body?.error) message = body.error
    } catch {
      // The status line remains the fallback when the response is not JSON.
    }
    throw new Error(message)
  }
  return response.status === 204 ? null : response.json()
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
