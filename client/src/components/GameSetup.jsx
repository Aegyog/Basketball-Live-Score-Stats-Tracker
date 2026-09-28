import { useMemo, useState } from 'react'

const now = new Date()
const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
const newPlayer = (number = '') => ({ id: crypto.randomUUID(), number, name: '' })

function RosterEditor({ side, players, onChange, onAdd, onRemove }) {
  return (
    <div className="roster-editor">
      <div className="roster-editor-heading"><span>Players</span><small>Jersey numbers must be unique per team.</small></div>
      {players.map((player, index) => (
        <div className="roster-entry" key={player.id}>
          <label>
            Number
            <input type="number" inputMode="numeric" min="1" max="99" value={player.number} onChange={(event) => onChange(player.id, 'number', event.target.value)} aria-label={`${side} player ${index + 1} number`} required />
          </label>
          <label>
            Player name
            <input value={player.name} onChange={(event) => onChange(player.id, 'name', event.target.value)} maxLength="80" placeholder={index === 0 ? 'Marco Reyes' : 'Player name'} aria-label={`${side} player ${index + 1} name`} required />
          </label>
          {players.length > 1 && <button type="button" className="remove-player" onClick={() => onRemove(player.id)} aria-label={`Remove ${side} player ${index + 1}`}>Remove</button>}
        </div>
      ))}
      <button type="button" className="add-player" onClick={onAdd} disabled={players.length >= 15}>+ Add player</button>
    </div>
  )
}

function SavedTeamPreview({ label, team }) {
  return (
    <section className="saved-team-preview">
      <span className="eyebrow">{label}</span>
      {team ? (
        <>
          <h3>{team.name}</h3>
          <div className="saved-roster-list">{team.players.map((player) => <span key={player.id}><b>#{player.number}</b> {player.name}</span>)}</div>
        </>
      ) : <p>Select a team to preview its saved roster.</p>}
    </section>
  )
}

export default function GameSetup({ leagues = [], initialMode = 'manual', initialLeagueId = '', onCancel, onCreate, onManageLeagues, saving }) {
  const [mode, setMode] = useState(initialMode)
  const [leagueId, setLeagueId] = useState(initialLeagueId || leagues[0]?.id || '')
  const [homeLeagueTeamId, setHomeLeagueTeamId] = useState('')
  const [awayLeagueTeamId, setAwayLeagueTeamId] = useState('')
  const [form, setForm] = useState({
    date: today,
    venue: 'Barangay Sports Center',
    homeName: '',
    awayName: '',
    homePlayers: [newPlayer(1)],
    awayPlayers: [newPlayer(1)],
  })
  const selectedLeague = useMemo(() => leagues.find((league) => league.id === leagueId) ?? leagues[0] ?? null, [leagueId, leagues])
  const homeTeam = selectedLeague?.teams.find((team) => team.id === homeLeagueTeamId)
  const awayTeam = selectedLeague?.teams.find((team) => team.id === awayLeagueTeamId)
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  function selectMode(nextMode) {
    setMode(nextMode)
    if (nextMode === 'league' && !leagueId && leagues[0]) setLeagueId(leagues[0].id)
  }

  function selectLeague(nextLeagueId) {
    setLeagueId(nextLeagueId)
    setHomeLeagueTeamId('')
    setAwayLeagueTeamId('')
  }

  function updatePlayer(team, id, field, value) {
    const key = `${team}Players`
    setForm((current) => ({ ...current, [key]: current[key].map((player) => player.id === id ? { ...player, [field]: value } : player) }))
  }

  function addPlayer(team) {
    const key = `${team}Players`
    setForm((current) => current[key].length >= 15 ? current : { ...current, [key]: [...current[key], newPlayer(current[key].length + 1)] })
  }

  function removePlayer(team, id) {
    const key = `${team}Players`
    setForm((current) => ({ ...current, [key]: current[key].filter((player) => player.id !== id) }))
  }

  function submit(event) {
    event.preventDefault()
    if (mode === 'league') {
      onCreate({ mode, date: form.date, venue: form.venue, leagueId: selectedLeague?.id ?? '', homeLeagueTeamId, awayLeagueTeamId })
      return
    }
    const cleanPlayers = (players) => players.map(({ number, name }) => ({ number: Number(number), name: name.trim() }))
    onCreate({
      mode,
      date: form.date,
      venue: form.venue,
      homeName: form.homeName,
      awayName: form.awayName,
      homePlayers: cleanPlayers(form.homePlayers),
      awayPlayers: cleanPlayers(form.awayPlayers),
    })
  }

  return (
    <main className="content narrow">
      <div className="page-heading"><div><span className="eyebrow">Game setup</span><h1>Start a new game</h1></div><p>Use saved league rosters or enter two teams manually.</p></div>
      <form className="setup-form" onSubmit={submit}>
        <section className="panel setup-choice">
          <div><span className="eyebrow">Setup method</span><h2>Choose your rosters</h2></div>
          <div className="setup-choice-buttons" role="group" aria-label="Game setup method">
            <button type="button" className={mode === 'league' ? 'setup-choice-button active' : 'setup-choice-button'} onClick={() => selectMode('league')}>Use saved league</button>
            <button type="button" className={mode === 'manual' ? 'setup-choice-button active' : 'setup-choice-button'} onClick={() => selectMode('manual')}>Enter manually</button>
          </div>
        </section>

        <section className="panel form-grid"><h2>Game details</h2><label>Date<input type="date" value={form.date} onChange={(event) => update('date', event.target.value)} required /></label><label>Venue<input value={form.venue} onChange={(event) => update('venue', event.target.value)} maxLength="120" required /></label></section>

        {mode === 'league' ? (
          <section className="panel league-game-setup">
            {leagues.length === 0 ? (
              <div className="empty-state"><h3>No saved leagues yet</h3><p>Create a league and add at least two teams before using saved rosters.</p><button type="button" className="button" onClick={onManageLeagues}>Create a league</button></div>
            ) : (
              <>
                <div className="league-game-selectors">
                  <label>League<select value={selectedLeague?.id ?? ''} onChange={(event) => selectLeague(event.target.value)} required>{leagues.map((league) => <option key={league.id} value={league.id}>{league.name}{league.season ? ` · ${league.season}` : ''}</option>)}</select></label>
                  <label>Home team<select value={homeLeagueTeamId} onChange={(event) => setHomeLeagueTeamId(event.target.value)} required><option value="">Select home team</option>{selectedLeague?.teams.map((team) => <option key={team.id} value={team.id} disabled={team.id === awayLeagueTeamId}>{team.name}</option>)}</select></label>
                  <label>Away team<select value={awayLeagueTeamId} onChange={(event) => setAwayLeagueTeamId(event.target.value)} required><option value="">Select away team</option>{selectedLeague?.teams.map((team) => <option key={team.id} value={team.id} disabled={team.id === homeLeagueTeamId}>{team.name}</option>)}</select></label>
                </div>
                {selectedLeague?.teams.length < 2 && <p className="inline-note">This league needs at least two saved teams. <button type="button" className="text-button" onClick={onManageLeagues}>Manage league</button></p>}
                <div className="saved-team-grid"><SavedTeamPreview label="Home roster" team={homeTeam} /><SavedTeamPreview label="Away roster" team={awayTeam} /></div>
              </>
            )}
          </section>
        ) : (
          <div className="team-setup-grid">
            <section className="panel team-setup home-accent"><span className="eyebrow">Home team</span><label>Team name<input value={form.homeName} onChange={(event) => update('homeName', event.target.value)} placeholder="Blue Hawks" required /></label><RosterEditor side="home" players={form.homePlayers} onChange={(id, field, value) => updatePlayer('home', id, field, value)} onAdd={() => addPlayer('home')} onRemove={(id) => removePlayer('home', id)} /></section>
            <section className="panel team-setup away-accent"><span className="eyebrow">Away team</span><label>Team name<input value={form.awayName} onChange={(event) => update('awayName', event.target.value)} placeholder="Orange Lions" required /></label><RosterEditor side="away" players={form.awayPlayers} onChange={(id, field, value) => updatePlayer('away', id, field, value)} onAdd={() => addPlayer('away')} onRemove={(id) => removePlayer('away', id)} /></section>
          </div>
        )}

        <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button className="button" disabled={saving || (mode === 'league' && (!homeTeam || !awayTeam))}>{saving ? 'Creating game...' : 'Start game'}</button></div>
      </form>
    </main>
  )
}
