import { useState } from 'react'

const today = new Date().toISOString().slice(0, 10)

export default function GameSetup({ onCancel, onCreate, saving }) {
  const [form, setForm] = useState({ date: today, venue: 'Barangay Sports Center', homeName: '', awayName: '', homeRoster: '', awayRoster: '' })
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  function submit(event) {
    event.preventDefault()
    onCreate({
      date: form.date,
      venue: form.venue,
      homeName: form.homeName,
      awayName: form.awayName,
      homePlayers: form.homeRoster.split(',').map((name) => name.trim()).filter(Boolean),
      awayPlayers: form.awayRoster.split(',').map((name) => name.trim()).filter(Boolean),
    })
  }

  return (
    <main className="content narrow">
      <div className="page-heading"><div><span className="eyebrow">Game setup</span><h1>Start a new game</h1></div><p>Add both teams and at least one player per side. Rosters can be expanded later.</p></div>
      <form className="setup-form" onSubmit={submit}>
        <section className="panel form-grid"><h2>Game details</h2><label>Date<input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} required /></label><label>Venue<input value={form.venue} onChange={(e) => update('venue', e.target.value)} maxLength="120" required /></label></section>
        <div className="team-setup-grid">
          <section className="panel team-setup home-accent"><span className="eyebrow">Home team</span><label>Team name<input value={form.homeName} onChange={(e) => update('homeName', e.target.value)} placeholder="Blue Hawks" required /></label><label>Players, separated by commas<textarea value={form.homeRoster} onChange={(e) => update('homeRoster', e.target.value)} placeholder="Marco Reyes, Paolo Cruz, Luis Santos" rows="4" required /></label></section>
          <section className="panel team-setup away-accent"><span className="eyebrow">Away team</span><label>Team name<input value={form.awayName} onChange={(e) => update('awayName', e.target.value)} placeholder="Orange Lions" required /></label><label>Players, separated by commas<textarea value={form.awayRoster} onChange={(e) => update('awayRoster', e.target.value)} placeholder="Nico Ramos, Andre Garcia, Miguel Lim" rows="4" required /></label></section>
        </div>
        <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button className="button" disabled={saving}>{saving ? 'Creating game...' : 'Start game'}</button></div>
      </form>
    </main>
  )
}
