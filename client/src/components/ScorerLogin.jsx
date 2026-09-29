import { useState } from 'react'

export default function ScorerLogin({ busy, error, onLogin }) {
  const [password, setPassword] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (!password) return
    const succeeded = await onLogin(password)
    if (!succeeded) setPassword('')
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <img className="login-logo" src="/hoopstat_logo_transparent.png" alt="HoopStat" />
        <span className="eyebrow">Protected scorekeeping</span>
        <h1 id="login-title">Scorer sign in</h1>
        <p>Enter the scorer password to access shared leagues, games, and live statistics.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Scorer password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="button large" type="submit" disabled={busy || !password}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <small>Your session stays in this browser tab and expires after eight hours.</small>
      </section>
    </main>
  )
}
