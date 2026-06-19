import { useState } from 'react'
import { setGhToken, hasGhToken } from '../lib/github'

interface Props { onLogin: (pw: string) => Promise<boolean> }

export function LoginPage({ onLogin }: Props) {
  const [pw, setPw] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const tokenCached = hasGhToken()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const ok = await onLogin(pw)
    if (ok && token.trim()) setGhToken(token)
    setBusy(false)
    if (!ok) {
      setError(true)
      setPw('')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="#0099CC"/>
            <path d="M11 20h18M20 11v18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="login-title">Website Admin</h1>
        <p className="login-sub">Geben Sie Ihr Passwort ein.</p>
        <form onSubmit={submit} className="login-form">
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false) }}
            placeholder="Passwort"
            autoFocus
            className="login-pw-input"
          />
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder={tokenCached ? 'GitHub-Token (gespeichert — leer lassen)' : 'GitHub-Token (für Bearbeiten)'}
            className="login-pw-input"
            style={{ marginTop: 8 }}
            autoComplete="off"
          />
          <p className="login-sub" style={{ fontSize: 11, marginTop: 6, textAlign: 'left', color: '#888' }}>
            Fine-grained Token, nur dieses Repo, „Contents: Read and write". Wird nur in diesem Tab gespeichert, nie veröffentlicht.
          </p>
          {error && <p className="login-error">Falsches Passwort. Bitte nochmal.</p>}
          <button type="submit" disabled={busy} className="login-submit-btn">
            {busy ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}
