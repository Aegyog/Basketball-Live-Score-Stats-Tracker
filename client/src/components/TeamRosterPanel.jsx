const STAT_KEYS = ['points', 'rebounds', 'assists', 'steals', 'blocks']
const SHORT_LABEL = { points: 'PTS', rebounds: 'REB', assists: 'AST', steals: 'STL', blocks: 'BLK' }
const STAT_NAME = { points: 'point', rebounds: 'rebound', assists: 'assist', steals: 'steal', blocks: 'block' }

export default function TeamRosterPanel({ side, team, onAddStat, busy = false }) {
  return (
    <section className={`panel roster-panel ${side}`}>
      <div className="panel-heading"><div><span className="eyebrow">{side} team</span><h2>{team.name}</h2></div><strong className="mini-score">{team.score}</strong></div>
      <div className="roster-list">
        {team.players.map((player) => (
          <div key={player.id} className="player-row">
            <div className="player-identity">
              <span className="jersey">#{player.number}</span><span className="player-name">{player.name}</span>
            </div>
            <span className="stat-line">{STAT_KEYS.map((key) => {
              if (key === 'points' && onAddStat) {
                return (
                  <span className="point-tap-group" key={key}>
                    <span className="point-total"><b>{player.stats[key]}</b><small>PTS</small></span>
                    <span className="point-adders">
                      {[1, 2, 3].map((amount) => (
                        <button
                          type="button"
                          key={amount}
                          aria-label={`Add ${amount} ${amount === 1 ? 'point' : 'points'} to ${player.name}`}
                          disabled={busy}
                          onClick={() => onAddStat(side, player.id, key, amount)}
                        >
                          +{amount}
                        </button>
                      ))}
                    </span>
                  </span>
                )
              }

              return onAddStat ? (
                <button
                  type="button"
                  key={key}
                  className="stat-tap"
                  aria-label={`Add 1 ${STAT_NAME[key]} to ${player.name}`}
                  disabled={busy}
                  onClick={() => onAddStat(side, player.id, key, 1)}
                >
                  <b>{player.stats[key]}</b><small>{SHORT_LABEL[key]} +1</small>
                </button>
              ) : <span key={key}><b>{player.stats[key]}</b><small>{SHORT_LABEL[key]}</small></span>
            })}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
