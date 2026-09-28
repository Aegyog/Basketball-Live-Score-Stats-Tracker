import { useMemo, useState } from 'react'

const blankPlayer = (number = '') => ({ id: crypto.randomUUID(), number, name: '' })

function TeamEditor({ league, team, busy, onCancel, onSave }) {
  const [name, setName] = useState(team?.name ?? '')
  const [players, setPlayers] = useState(team?.players.map((player) => ({ ...player })) ?? [blankPlayer(1)])

  function updatePlayer(id, field, value) {
    setPlayers((current) => current.map((player) => player.id === id ? { ...player, [field]: value } : player))
  }

  function addPlayer() {
    if (players.length < 15) setPlayers((current) => [...current, blankPlayer(current.length + 1)])
  }

  async function submit(event) {
    event.preventDefault()
    const saved = await onSave({
      name: name.trim(),
      players: players.map((player) => ({ number: Number(player.number), name: player.name.trim() })),
    })
    if (saved) onCancel()
  }

  return (
    <form className="panel library-editor" onSubmit={submit}>
      <div className="panel-heading"><div><span className="eyebrow">{team ? 'Edit saved roster' : 'Add saved team'}</span><h2>{league.name}</h2></div><button type="button" className="text-button" onClick={onCancel}>Cancel</button></div>
      <label>Team name<input value={name} onChange={(event) => setName(event.target.value)} maxLength="80" placeholder="Blue Hawks" required /></label>
      <div className="library-player-list">
        <div className="roster-editor-heading"><span>Players</span><small>1–15 players · Unique numbers from 1–99</small></div>
        {players.map((player, index) => (
          <div className="roster-entry" key={player.id}>
            <label>Number<input type="number" inputMode="numeric" min="1" max="99" value={player.number} onChange={(event) => updatePlayer(player.id, 'number', event.target.value)} aria-label={`Saved player ${index + 1} number`} required /></label>
            <label>Player name<input value={player.name} onChange={(event) => updatePlayer(player.id, 'name', event.target.value)} maxLength="80" aria-label={`Saved player ${index + 1} name`} required /></label>
            {players.length > 1 && <button type="button" className="remove-player" onClick={() => setPlayers((current) => current.filter((item) => item.id !== player.id))}>Remove</button>}
          </div>
        ))}
        <button type="button" className="add-player" onClick={addPlayer} disabled={players.length >= 15}>+ Add player</button>
      </div>
      <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button className="button" disabled={busy}>{busy ? 'Saving roster...' : 'Save roster'}</button></div>
    </form>
  )
}

export default function LeagueLibrary({ leagues, busy, onCreateLeague, onSaveTeam, onStartGame }) {
  const [selectedLeagueId, setSelectedLeagueId] = useState(leagues[0]?.id ?? '')
  const [leagueName, setLeagueName] = useState('')
  const [season, setSeason] = useState('')
  const [editingTeam, setEditingTeam] = useState(undefined)
  const selectedLeague = useMemo(() => leagues.find((league) => league.id === selectedLeagueId) ?? leagues[0] ?? null, [leagues, selectedLeagueId])

  async function createLeague(event) {
    event.preventDefault()
    const created = await onCreateLeague({ name: leagueName.trim(), season: season.trim() })
    if (created) {
      setLeagueName('')
      setSeason('')
      setSelectedLeagueId(created.id)
    }
  }

  return (
    <main className="content">
      <div className="page-heading"><div><span className="eyebrow">Reusable rosters</span><h1>League library</h1></div><p>Save teams once, then load their names, players, and jersey numbers into future games.</p></div>

      <section className="league-library-layout">
        <aside className="league-sidebar">
          <form className="panel create-league-form" onSubmit={createLeague}>
            <span className="eyebrow">New folder</span><h2>Create league</h2>
            <label>League name<input value={leagueName} onChange={(event) => setLeagueName(event.target.value)} maxLength="80" placeholder="HAU Intramurals" required /></label>
            <label>Season or year <span className="optional">Optional</span><input value={season} onChange={(event) => setSeason(event.target.value)} maxLength="40" placeholder="2026" /></label>
            <button className="button" disabled={busy}>{busy ? 'Creating...' : 'Create league'}</button>
          </form>

          <div className="league-folder-list" aria-label="Saved leagues">
            {leagues.map((league) => (
              <button type="button" key={league.id} className={selectedLeague?.id === league.id ? 'league-folder active' : 'league-folder'} onClick={() => { setSelectedLeagueId(league.id); setEditingTeam(undefined) }}>
                <strong>{league.name}</strong><span>{league.season || 'No season'} · {league.teams.length} {league.teams.length === 1 ? 'team' : 'teams'}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="league-workspace">
          {!selectedLeague ? (
            <div className="empty-state"><h3>No leagues saved yet</h3><p>Create your first league using the form. It will appear here like a reusable roster folder.</p></div>
          ) : editingTeam !== undefined ? (
            <TeamEditor
              key={editingTeam?.id ?? 'new-team'}
              league={selectedLeague}
              team={editingTeam}
              busy={busy}
              onCancel={() => setEditingTeam(undefined)}
              onSave={(input) => onSaveTeam(selectedLeague.id, editingTeam?.id, input)}
            />
          ) : (
            <>
              <section className="panel league-overview">
                <div><span className="eyebrow">League folder</span><h2>{selectedLeague.name}</h2><p>{selectedLeague.season || 'No season specified'} · {selectedLeague.teams.reduce((total, team) => total + team.players.length, 0)} saved players</p></div>
                <div><button type="button" className="button secondary" onClick={() => setEditingTeam(null)}>+ Add team</button><button type="button" className="button" onClick={() => onStartGame(selectedLeague.id)} disabled={selectedLeague.teams.length < 2}>Start a game</button></div>
              </section>
              <div className="league-team-grid">
                {selectedLeague.teams.length ? selectedLeague.teams.map((team) => (
                  <article className="panel league-team-card" key={team.id}>
                    <div className="panel-heading"><div><span className="eyebrow">Saved team</span><h3>{team.name}</h3></div><button type="button" className="text-button" onClick={() => setEditingTeam(team)}>Edit roster</button></div>
                    <div className="saved-roster-list">{team.players.map((player) => <span key={player.id}><b>#{player.number}</b> {player.name}</span>)}</div>
                  </article>
                )) : <div className="empty-state"><h3>No teams in this league</h3><p>Add the first team and its player numbers.</p><button type="button" className="button" onClick={() => setEditingTeam(null)}>Add team</button></div>}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
