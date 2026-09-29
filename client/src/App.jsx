import { useEffect, useMemo, useState } from 'react'
import {
  advanceQuarter,
  AUTH_REQUIRED,
  checkSession,
  createLeague,
  createLeagueTeam,
  createGame,
  finishGame,
  listGames,
  listLeagues,
  login,
  logout,
  recordPlay,
  resetDemoData,
  undoLastPlay,
  undoQuarter,
  updateLeagueTeam,
  USING_MOCK_API,
} from './api'
import AppHeader from './components/AppHeader.jsx'
import DemoNotice from './components/DemoNotice.jsx'
import GameCard from './components/GameCard.jsx'
import GameSetup from './components/GameSetup.jsx'
import LeagueLibrary from './components/LeagueLibrary.jsx'
import PlayLog from './components/PlayLog.jsx'
import Scoreboard from './components/Scoreboard.jsx'
import ScorerLogin from './components/ScorerLogin.jsx'
import TeamRosterPanel from './components/TeamRosterPanel.jsx'

export default function App() {
  const [view, setView] = useState('dashboard')
  const [games, setGames] = useState([])
  const [leagues, setLeagues] = useState([])
  const [setupDefaults, setSetupDefaults] = useState({ mode: 'manual', leagueId: '' })
  const [activeGame, setActiveGame] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [authStatus, setAuthStatus] = useState(AUTH_REQUIRED ? 'checking' : 'authenticated')
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)

  async function loadData() {
    setStatus('loading')
    setError('')
    try {
      const [loadedGames, loadedLeagues] = await Promise.all([listGames(), listLeagues()])
      setGames(loadedGames)
      setLeagues(loadedLeagues)
      setStatus('ready')
    } catch (caught) {
      setError(caught.message)
      setStatus('error')
    }
  }

  useEffect(() => {
    let active = true

    async function start() {
      if (AUTH_REQUIRED) {
        try {
          await checkSession()
        } catch {
          if (active) setAuthStatus('signed-out')
          return
        }
      }
      if (active) {
        setAuthStatus('authenticated')
        await loadData()
      }
    }

    function handleUnauthorized() {
      setGames([])
      setLeagues([])
      setActiveGame(null)
      setAuthStatus('signed-out')
      setAuthError('Your scorer session expired. Sign in again.')
    }

    window.addEventListener('hoopstat:unauthorized', handleUnauthorized)
    start()
    return () => {
      active = false
      window.removeEventListener('hoopstat:unauthorized', handleUnauthorized)
    }
  }, [])

  const liveGames = useMemo(() => games.filter((game) => game.status === 'live'), [games])
  const finalGames = useMemo(() => games.filter((game) => game.status === 'final'), [games])

  function syncGame(updated) {
    setActiveGame(updated)
    setGames((current) => current.map((game) => game.id === updated.id ? updated : game))
  }

  function openGame(game) {
    setActiveGame(game)
    setView(game.status === 'live' ? 'live' : 'summary')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function navigate(nextView) {
    setError('')
    if (nextView === 'setup') setSetupDefaults({ mode: 'manual', leagueId: '' })
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleCreate(input) {
    if (input.mode !== 'league' && (input.homePlayers.length === 0 || input.awayPlayers.length === 0)) {
      setError('Add at least one player to each team.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const game = await createGame(input)
      setGames((current) => [game, ...current])
      openGame(game)
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
    }
  }

  function startLeagueGame(leagueId) {
    setError('')
    setSetupDefaults({ mode: 'league', leagueId })
    setView('setup')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleCreateLeague(input) {
    setBusy(true)
    setError('')
    try {
      const created = await createLeague(input)
      setLeagues((current) => [...current, created])
      return created
    } catch (caught) {
      setError(caught.message)
      return null
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveLeagueTeam(leagueId, teamId, input) {
    setBusy(true)
    setError('')
    try {
      const updatedLeague = teamId
        ? await updateLeagueTeam(teamId, input)
        : await createLeagueTeam(leagueId, input)
      setLeagues((current) => current.map((league) => league.id === updatedLeague.id ? updatedLeague : league))
      return true
    } catch (caught) {
      setError(caught.message)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function mutateGame(action) {
    setBusy(true)
    setError('')
    try {
      syncGame(await action())
      return true
    } catch (caught) {
      setError(caught.message)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function handleFinish() {
    const finished = await mutateGame(() => finishGame(activeGame.id))
    if (finished) setView('summary')
  }

  async function handleReset() {
    setBusy(true)
    const reset = await resetDemoData()
    setGames(reset)
    setActiveGame(null)
    setView('dashboard')
    setBusy(false)
  }

  async function handleLogin(password) {
    setAuthBusy(true)
    setAuthError('')
    try {
      await login(password)
      setAuthStatus('authenticated')
      await loadData()
      return true
    } catch (caught) {
      setAuthStatus('signed-out')
      setAuthError(caught.message)
      return false
    } finally {
      setAuthBusy(false)
    }
  }

  function handleSignOut() {
    logout()
    setGames([])
    setLeagues([])
    setActiveGame(null)
    setView('dashboard')
    setAuthError('')
    setAuthStatus('signed-out')
  }

  const canUndoQuarter = activeGame?.status === 'live' && activeGame.quarter > 1 && !activeGame.plays.some((play) => play.quarter === activeGame.quarter)

  if (AUTH_REQUIRED && authStatus !== 'authenticated') {
    return <ScorerLogin busy={authBusy || authStatus === 'checking'} error={authError} onLogin={handleLogin} />
  }

  return (
    <div className="app-shell">
      <AppHeader view={view} onNavigate={navigate} onSignOut={AUTH_REQUIRED ? handleSignOut : null} />
      {error && <div className="global-error" role="alert"><span>{error}</span><button onClick={() => setError('')}>Dismiss</button></div>}

      {view === 'setup' && <GameSetup leagues={leagues} initialMode={setupDefaults.mode} initialLeagueId={setupDefaults.leagueId} onCancel={() => navigate('dashboard')} onCreate={handleCreate} onManageLeagues={() => navigate('leagues')} saving={busy} />}

      {view === 'dashboard' && (
        <main className="content">
          <section className="hero">
            <div><span className="eyebrow">Live basketball statistics</span><h1>Every play. Every player.<br />One accurate record.</h1><p>Replace paper score sheets with a focused tracker for local leagues and barangay tournaments.</p><button className="button large" onClick={() => navigate('setup')}>Start a new game</button></div>
            <div className="hero-card" aria-label="Game counts">
              <div><b>{liveGames.length}</b><small>active</small><b>{finalGames.length}</b><small>completed</small></div>
            </div>
          </section>
          <DemoNotice />
          {status === 'loading' && <p className="loading">Loading games...</p>}
          {status === 'error' && <button className="button" onClick={loadData}>Try again</button>}
          {status === 'ready' && (
            <>
              <section className="section-block"><div className="section-heading"><div><span className="eyebrow">In progress</span><h2>Active game</h2></div><span>{liveGames.length} active</span></div>{liveGames.length ? liveGames.map((game) => <GameCard key={game.id} game={game} onOpen={openGame} />) : <div className="empty-state"><h3>No active game</h3><p>Create a game when the teams are ready.</p></div>}</section>
              <section className="section-block"><div className="section-heading"><div><span className="eyebrow">Reusable rosters</span><h2>Your leagues</h2></div><button className="text-button" onClick={() => navigate('leagues')}>Manage leagues</button></div>{leagues.length ? <div className="league-dashboard-grid">{leagues.slice(0, 3).map((league) => <button type="button" className="league-dashboard-card" key={league.id} onClick={() => navigate('leagues')}><span className="folder-mark" aria-hidden="true">L</span><span><strong>{league.name}</strong><small>{league.season || 'No season'} · {league.teams.length} {league.teams.length === 1 ? 'team' : 'teams'} · {league.teams.reduce((total, team) => total + team.players.length, 0)} players</small></span></button>)}</div> : <div className="empty-state"><h3>No saved leagues</h3><p>Create a league folder so teams and jersey numbers can be reused.</p><button className="button secondary" onClick={() => navigate('leagues')}>Create league</button></div>}</section>
              <section className="section-block"><div className="section-heading"><div><span className="eyebrow">Recently completed</span><h2>Game history</h2></div><button className="text-button" onClick={() => navigate('history')}>View all</button></div><div className="card-stack">{finalGames.slice(0, 2).map((game) => <GameCard key={game.id} game={game} onOpen={openGame} />)}</div></section>
              {USING_MOCK_API && <button className="reset-link" onClick={handleReset} disabled={busy}>Reset demo data</button>}
            </>
          )}
        </main>
      )}

      {view === 'history' && (
        <main className="content narrow">
          <div className="page-heading"><div><span className="eyebrow">Saved records</span><h1>Game history</h1></div><p>Open any completed game to review its score and player totals.</p></div>
          <div className="card-stack">{finalGames.length ? finalGames.map((game) => <GameCard key={game.id} game={game} onOpen={openGame} />) : <div className="empty-state"><h3>No finished games yet</h3><p>Completed games will appear here.</p></div>}</div>
        </main>
      )}

      {view === 'live' && activeGame && (
        <main className="content game-page">
          <div className="game-toolbar"><div><span className="eyebrow">{activeGame.date} · {activeGame.venue}</span><h1>Live game tracker</h1></div><div><button className="button secondary" onClick={() => navigate('dashboard')}>Save and exit</button><button className="button danger" onClick={handleFinish} disabled={busy}>End game</button></div></div>
          <Scoreboard game={activeGame} />
          <div className="tap-hint"><strong>Tap a stat to record it</strong><span>PTS supports +1, +2, or +3 · Other stats add +1</span></div>
          <div className="rosters direct-rosters"><TeamRosterPanel side="home" team={activeGame.home} onAddStat={(side, playerId, stat, amount = 1) => mutateGame(() => recordPlay(activeGame.id, { teamSide: side, playerId, stat, amount }))} busy={busy} /><TeamRosterPanel side="away" team={activeGame.away} onAddStat={(side, playerId, stat, amount = 1) => mutateGame(() => recordPlay(activeGame.id, { teamSide: side, playerId, stat, amount }))} busy={busy} /></div>
          <section className="panel quarter-panel"><div className="panel-heading"><div><span className="eyebrow">Game progress</span><h2>Quarter controls</h2></div><div className="quarter-actions"><button className="quarter-button" onClick={() => mutateGame(() => advanceQuarter(activeGame.id))} disabled={busy || activeGame.quarter >= 5}>Advance to {activeGame.quarter >= 4 ? 'overtime' : `quarter ${activeGame.quarter + 1}`}</button><button className="quarter-undo" onClick={() => mutateGame(() => undoQuarter(activeGame.id))} disabled={busy || !canUndoQuarter} title={activeGame.plays.some((play) => play.quarter === activeGame.quarter) ? 'Undo this quarter’s plays first' : ''}>Undo quarter</button></div></div></section>
          <PlayLog plays={activeGame.plays} busy={busy} onUndo={() => mutateGame(() => undoLastPlay(activeGame.id))} />
        </main>
      )}

      {view === 'summary' && activeGame && (
        <main className="content game-page">
          <div className="page-heading"><div><span className="eyebrow">Completed game</span><h1>Game summary</h1></div><button className="button secondary" onClick={() => navigate('history')}>Back to history</button></div>
          <Scoreboard game={activeGame} />
          <div className="rosters summary-rosters"><TeamRosterPanel side="home" team={activeGame.home} /><TeamRosterPanel side="away" team={activeGame.away} /></div>
          <PlayLog plays={activeGame.plays} defaultExpanded />
        </main>
      )}

      {view === 'leagues' && <LeagueLibrary leagues={leagues} busy={busy} onCreateLeague={handleCreateLeague} onSaveTeam={handleSaveLeagueTeam} onStartGame={startLeagueGame} />}

      <footer className="site-footer"><span>Courtside Ledger</span></footer>
    </div>
  )
}
