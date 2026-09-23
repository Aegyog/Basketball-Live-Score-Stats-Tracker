const STAT_KEYS = ['points', 'rebounds', 'assists', 'steals', 'blocks']
const SHORT_LABEL = { points: 'PTS', rebounds: 'REB', assists: 'AST', steals: 'STL', blocks: 'BLK' }

export default function TeamRosterPanel({ side, team, selectedPlayerId, onSelect }) {
  return (
    <section className={`panel roster-panel ${side}`}>
      <div className="panel-heading"><div><span className="eyebrow">{side} team</span><h2>{team.name}</h2></div><strong className="mini-score">{team.score}</strong></div>
      <div className="roster-list">
        {team.players.map((player) => (
          <button type="button" key={player.id} className={selectedPlayerId === player.id ? 'player-row selected' : 'player-row'} onClick={() => onSelect(side, player.id)}>
            <span className="jersey">#{player.number}</span><span className="player-name">{player.name}</span>
            <span className="stat-line">{STAT_KEYS.map((key) => <span key={key}><b>{player.stats[key]}</b><small>{SHORT_LABEL[key]}</small></span>)}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
