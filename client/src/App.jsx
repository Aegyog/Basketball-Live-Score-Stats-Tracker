import { useEffect, useMemo, useState } from 'react'
import {
  advanceQuarter,
  createGame,
  finishGame,
  listGames,
  recordPlay,
  resetDemoData,
  undoLastPlay,
  USING_MOCK_API,
} from './api'
import AppHeader from './components/AppHeader.jsx'
import DemoNotice from './components/DemoNotice.jsx'
import GameCard from './components/GameCard.jsx'
import GameSetup from './components/GameSetup.jsx'
import PlayLog from './components/PlayLog.jsx'
import Scoreboard from './components/Scoreboard.jsx'
import TeamRosterPanel from './components/TeamRosterPanel.jsx'

const statActions = [
  { stat: 'points', amount: 1, label: '+1 Point' },
  { stat: 'points', amount: 2, label: '+2 Points' },
  { stat: 'points', amount: 3, label: '+3 Points' },
  { stat: 'rebounds', amount: 1, label: '+ Rebound' },
  { stat: 'assists', amount: 1, label: '+ Assist' },
  { stat: 'steals', amount: 1, label: '+ Steal' },
  { stat: 'blocks', amount: 1, label: '+ Block' },
]

export default function App() {
  const [view, setView] = useState('dashboard')
  const [games, setGames] = useState([])
  const [activeGame, setActiveGame] = useState(null)
  const [selected, setSelected] = useState({ side: 'home', playerId: null })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadGames() {
    setStatus('loading')
    setError('')
    try {
      setGames(await listGames())
      setStatus('ready')
    } catch (caught) {
      setError(caught.message)
      setStatus('error')
    }
  }

  useEffect(() => { loadGames() }, [])

  const liveGames = useMemo(() => games.filter((game) => game.status === 'live'), [games])
  const finalGames = useMemo(() => games.filter((game) => game.status === 'final'), [games])

  function syncGame(updated) {
    setActiveGame(updated)
    setGames((current) => current.map((game) => game.id === updated.id ? updated : game))
  }

  function openGame(game) {
    setActiveGame(game)
    const first = game.home.players[0]
    setSelected({ side: 'home', playerId: first?.id ?? null })
    setView(game.status === 'live' ? 'live' : 'summary')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function navigate(nextView) {
    setError('')
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleCreate(input) {
    if (input.homePlayers.length === 0 || input.awayPlayers.length === 0) {
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

  const selectedPlayer = activeGame?.[selected.side]?.players.find((player) => player.id === selected.playerId)

  return (
    <div className="app-shell">
      <AppHeader view={view} onNavigate={navigate} />
      {error && <div className="global-error" role="alert"><span>{error}</span><button onClick={() => setError('')}>Dismiss</button></div>}

      {view === 'setup' && <GameSetup onCancel={() => navigate('dashboard')} onCreate={handleCreate} saving={busy} />}

      {view === 'dashboard' && (
        <main className="content">
          <section className="hero">
            <div><span className="eyebrow">Live basketball statistics</span><h1>Every play. Every player.<br />One accurate record.</h1><p>Replace paper score sheets with a focused tracker for local leagues and barangay tournaments.</p><button className="button large" onClick={() => navigate('setup')}>Start a new game</button></div>
            <div className="hero-card" aria-label="Week two project status"><span>Week 2</span><strong>{USING_MOCK_API ? 'Demo mode active' : 'Full stack connected'}</strong><p>The same scoring interface can now use either browser storage or the Express and PostgreSQL API.</p><div><b>5</b><small>screens</small><b>7</b><small>stat actions</small></div></div>
          </section>
          <DemoNotice />
          {status === 'loading' && <p className="loading">Loading games...</p>}
          {status === 'error' && <button className="button" onClick={loadGames}>Try again</button>}
          {status === 'ready' && (
            <>
              <section className="section-block"><div className="section-heading"><div><span className="eyebrow">In progress</span><h2>Active game</h2></div><span>{liveGames.length} active</span></div>{liveGames.length ? liveGames.map((game) => <GameCard key={game.id} game={game} onOpen={openGame} />) : <div className="empty-state"><h3>No active game</h3><p>Create a game when the teams are ready.</p></div>}</section>
              <section className="section-block"><div className="section-heading"><div><span className="eyebrow">Recently completed</span><h2>Game history</h2></div><button className="text-button" onClick={() => navigate('history')}>View all</button></div><div className="card-stack">{finalGames.slice(0, 2).map((game) => <GameCard key={game.id} game={game} onOpen={openGame} />)}</div></section>
              <button className="reset-link" onClick={handleReset} disabled={busy}>Reset demo data</button>
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
          <div className="game-grid">
            <div className="rosters"><TeamRosterPanel side="home" team={activeGame.home} selectedPlayerId={selected.playerId} onSelect={(side, playerId) => setSelected({ side, playerId })} /><TeamRosterPanel side="away" team={activeGame.away} selectedPlayerId={selected.playerId} onSelect={(side, playerId) => setSelected({ side, playerId })} /></div>
            <aside className="tracker-sidebar">
              <section className="panel stat-actions"><span className="eyebrow">Selected player</span><h2>{selectedPlayer?.name ?? 'Choose a player'}</h2><p>{selectedPlayer ? `${activeGame[selected.side].name} · #${selectedPlayer.number}` : 'Select a roster row before recording a stat.'}</p><div className="action-grid">{statActions.map((action) => <button key={`${action.stat}-${action.amount}`} disabled={busy || !selectedPlayer} onClick={() => mutateGame(() => recordPlay(activeGame.id, { teamSide: selected.side, playerId: selected.playerId, stat: action.stat, amount: action.amount }))}>{action.label}</button>)}</div><button className="quarter-button" onClick={() => mutateGame(() => advanceQuarter(activeGame.id))} disabled={busy || activeGame.quarter >= 5}>Advance to {activeGame.quarter >= 4 ? 'overtime' : `quarter ${activeGame.quarter + 1}`}</button></section>
              <PlayLog plays={activeGame.plays} busy={busy} onUndo={() => mutateGame(() => undoLastPlay(activeGame.id))} />
            </aside>
          </div>
        </main>
      )}

      {view === 'summary' && activeGame && (
        <main className="content game-page">
          <div className="page-heading"><div><span className="eyebrow">Completed game</span><h1>Game summary</h1></div><button className="button secondary" onClick={() => navigate('history')}>Back to history</button></div>
          <Scoreboard game={activeGame} />
          <div className="rosters summary-rosters"><TeamRosterPanel side="home" team={activeGame.home} selectedPlayerId={null} onSelect={() => {}} /><TeamRosterPanel side="away" team={activeGame.away} selectedPlayerId={null} onSelect={() => {}} /></div>
        </main>
      )}

      <footer className="site-footer"><span>Courtside Ledger</span><span>{USING_MOCK_API ? 'Demo · React + localStorage' : 'Full stack · React + Express + PostgreSQL'}</span></footer>
    </div>
  )
}
