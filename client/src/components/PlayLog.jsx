import { useId, useState } from 'react'

const labels = { points: 'point', rebounds: 'rebound', assists: 'assist', steals: 'steal', blocks: 'block' }

export default function PlayLog({ plays, onUndo, busy = false, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const listId = useId()
  const visiblePlays = expanded ? plays : plays.slice(0, 8)

  return (
    <section className="panel play-log">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Audit trail</span>
          <h2>{expanded ? 'Full play history' : 'Recent plays'}</h2>
          <p className="audit-count">{plays.length} {plays.length === 1 ? 'record' : 'records'} · Newest first</p>
        </div>
        <div className="play-log-actions">
          {plays.length > 8 && (
            <button className="text-button" type="button" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((current) => !current)}>
              {expanded ? 'Show recent' : `View all ${plays.length}`}
            </button>
          )}
          {onUndo && <button className="text-button" type="button" onClick={onUndo} disabled={busy || plays.length === 0}>Undo latest</button>}
        </div>
      </div>
      {plays.length === 0 ? <p className="empty">No plays recorded yet.</p> : (
        <ol id={listId}>{visiblePlays.map((play) => <li key={play.id}><span className={`play-dot ${play.teamSide}`} aria-hidden="true" /><span><strong>{play.playerName}</strong><small>Q{play.quarter} · {play.amount} {labels[play.stat]}{play.amount > 1 ? 's' : ''}</small></span><time dateTime={play.createdAt}>{new Date(play.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></li>)}</ol>
      )}
    </section>
  )
}
