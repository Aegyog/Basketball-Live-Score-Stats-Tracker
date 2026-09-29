import { useState } from 'react'

export default function ScorerLogin({ busy, error, onAuthenticate, onClearError }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [localError, setLocalError] = useState('')

  function switchMode(nextMode) {
    setMode(nextMode)
    setPassword('')
    setConfirmation('')
    setLocalError('')
    onClearError()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')
    if (mode === 'register' && password !== confirmation) {
      setLocalError('Passwords do not match.')
      return
    }
    const succeeded = await onAuthenticate({ mode, username, password })
    if (!succeeded) {
      setPassword('')
      setConfirmation('')
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <img className="login-logo" src="/hoopstat_logo_transparent.png" alt="HoopStat" />
        <span className="eyebrow">Your private scorekeeping workspace</span>
        <h1 id="login-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p>{mode === 'login' ? 'Sign in to continue to your leagues, games, and live statistics.' : 'Anyone can create an account. Your leagues and games stay separate from every other user.'}</p>
        <div className="auth-mode" aria-label="Account access">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Sign in</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Create account</button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => { setUsername(event.target.value); onClearError() }}
              autoComplete="username"
              minLength={3}
              maxLength={30}
              pattern="[A-Za-z0-9._-]+"
              title="Use 3–30 letters, numbers, dots, underscores, or hyphens."
              autoFocus
              required
            />
            {mode === 'register' && <small className="field-help">3–30 letters, numbers, dots, underscores, or hyphens.</small>}
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); onClearError() }}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              minLength={8}
              maxLength={128}
              required
            />
          </label>
          {mode === 'register' && (
            <label>
              Confirm password
              <input
                type="password"
                value={confirmation}
                onChange={(event) => { setConfirmation(event.target.value); onClearError() }}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />
            </label>
          )}
          {(localError || error) && <p className="login-error" role="alert">{localError || error}</p>}
          <button className="button large" type="submit" disabled={busy || !username || !password || (mode === 'register' && !confirmation)}>
            {busy ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>
        <small>Your session stays in this browser tab and expires after eight hours. Do not use a password you use elsewhere.</small>
      </section>
    </main>
  )
}
