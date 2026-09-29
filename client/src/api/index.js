import * as mockApi from './mockApi.js'
import * as httpApi from './httpApi.js'

export const USING_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'
export const AUTH_REQUIRED = !USING_MOCK_API
const implementation = USING_MOCK_API ? mockApi : httpApi

export const { listGames, getGame, createGame, listLeagues, createLeague, createLeagueTeam, updateLeagueTeam, recordPlay, undoLastPlay, advanceQuarter, undoQuarter, finishGame, resetDemoData } = implementation
export const login = httpApi.login
export const checkSession = httpApi.checkSession
export const logout = httpApi.logout
