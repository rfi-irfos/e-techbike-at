import { useEffect, useState } from 'react'

// ── GDPR Cookie Banner ───────────────────────────────────────────────────────

const GDPR_KEY = 'cookieConsent'

export function GdprBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(GDPR_KEY))
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [visible])
  if (!visible) return null
  const choose = (value: 'accepted' | 'declined') => {
    localStorage.setItem(GDPR_KEY, value)
    setLeaving(true)
    window.setTimeout(() => setVisible(false), 260)
  }
  return (
    <div className={`gdpr-overlay${leaving ? ' is-leaving' : ''}`} role="dialog" aria-modal="true" aria-labelledby="gdpr-title">
      <div className="gdpr-card">
        <div className="gdpr-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z"/><circle cx="8.5" cy="9" r=".9" fill="currentColor"/><circle cx="12" cy="15" r=".9" fill="currentColor"/><circle cx="16" cy="13" r=".9" fill="currentColor"/><circle cx="8" cy="14.5" r=".9" fill="currentColor"/></svg>
        </div>
        <h2 id="gdpr-title" className="gdpr-title">Ihre Privatsphäre ist uns wichtig</h2>
        <p className="gdpr-text">
          Diese Seite setzt keine Tracking-Cookies. Wir speichern nur Ihre Einstellungen, etwa das Farbschema, auf Ihrem Gerät.
          Eingebettete Inhalte wie die Karte stammen von Google, dort gelten deren Regeln.
        </p>
        <div className="gdpr-actions">
          <button type="button" className="gdpr-btn gdpr-btn-accept" autoFocus onClick={() => choose('accepted')}>Alle akzeptieren</button>
          <button type="button" className="gdpr-btn gdpr-btn-decline" onClick={() => choose('declined')}>Nur notwendige</button>
        </div>
        <p className="gdpr-legal">
          <a href="#p/datenschutz" className="gdpr-link">Datenschutz</a>
          <span aria-hidden="true"> · </span>
          <a href="#p/impressum" className="gdpr-link">Impressum</a>
        </p>
      </div>
    </div>
  )
}
