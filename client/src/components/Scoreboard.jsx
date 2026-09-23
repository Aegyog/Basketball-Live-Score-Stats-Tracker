export default function Scoreboard({ game }) {
  return (
    <section className="scoreboard" aria-label="Current score">
      <div className="score-team home"><span>{game.home.name}</span><strong>{game.home.score}</strong></div>
      <div className="period"><span>Quarter</span><strong>{game.quarter > 4 ? 'OT' : game.quarter}</strong><small>{game.status === 'live' ? 'Game in progress' : 'Final score'}</small></div>
      <div className="score-team away"><span>{game.away.name}</span><strong>{game.away.score}</strong></div>
    </section>
  )
}
