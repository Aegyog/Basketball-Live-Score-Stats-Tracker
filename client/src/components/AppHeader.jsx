export default function AppHeader({ view, onNavigate, onSignOut, user }) {
  return (
    <header className="app-header">
      <button
        className="brand"
        type="button"
        aria-label="HoopStat dashboard"
        onClick={() => onNavigate('dashboard')}
      >
        <img className="brand-logo" src={`${import.meta.env.BASE_URL}hoopstat_logo_transparent.png`} alt="" />
      </button>
      <nav aria-label="Primary navigation">
        <button className={view === 'dashboard' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('dashboard')}>Dashboard</button>
        <button className={view === 'leagues' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('leagues')}>Leagues</button>
        <button className={view === 'history' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('history')}>History</button>
        <button className="button small" onClick={() => onNavigate('setup')}>New game</button>
        {user && <span className="account-name" title={`Signed in as ${user.username}`}>@{user.username}</span>}
        {onSignOut && <button className="text-button sign-out" onClick={onSignOut}>Sign out</button>}
      </nav>
    </header>
  )
}
