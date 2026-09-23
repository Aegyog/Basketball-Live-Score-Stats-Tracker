export default function GameCard({ game, onOpen }) {
  return (
    <article className="game-card">
      <div><span className={`status ${game.status}`}>{game.status === 'live' ? 'Live' : 'Final'}</span><p className="game-meta">{game.date} · {game.venue}</p><h3>{game.home.name} <span>vs</span> {game.away.name}</h3></div>
      <div className="game-score" aria-label={`${game.home.score} to ${game.away.score}`}><strong>{game.home.score}</strong><span>-</span><strong>{game.away.score}</strong></div>
      <button className="button secondary" onClick={() => onOpen(game)}>{game.status === 'live' ? 'Continue' : 'View summary'}</button>
    </article>
  )
}
