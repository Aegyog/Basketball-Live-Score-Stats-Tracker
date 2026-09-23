export default function AppHeader({ view, onNavigate }) {
  return (
    <header className="app-header">
      <button className="brand" type="button" onClick={() => onNavigate('dashboard')}><span className="brand-mark" aria-hidden="true">B</span><span>Courtside Ledger</span></button>
      <nav aria-label="Primary navigation">
        <button className={view === 'dashboard' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('dashboard')}>Dashboard</button>
        <button className={view === 'history' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('history')}>History</button>
        <button className="button small" onClick={() => onNavigate('setup')}>New game</button>
      </nav>
    </header>
  )
}
