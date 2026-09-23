const labels = { points: 'point', rebounds: 'rebound', assists: 'assist', steals: 'steal', blocks: 'block' }

export default function PlayLog({ plays, onUndo, busy }) {
  return (
    <section className="panel play-log">
      <div className="panel-heading"><div><span className="eyebrow">Audit trail</span><h2>Recent plays</h2></div><button className="text-button" onClick={onUndo} disabled={busy || plays.length === 0}>Undo latest</button></div>
      {plays.length === 0 ? <p className="empty">No plays recorded yet.</p> : (
        <ol>{plays.slice(0, 8).map((play) => <li key={play.id}><span className={`play-dot ${play.teamSide}`} aria-hidden="true" /><span><strong>{play.playerName}</strong><small>Q{play.quarter} · {play.amount} {labels[play.stat]}{play.amount > 1 ? 's' : ''}</small></span><time>{new Date(play.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></li>)}</ol>
      )}
    </section>
  )
}
