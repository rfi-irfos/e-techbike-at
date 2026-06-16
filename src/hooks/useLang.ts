import { useState, useEffect } from 'react'

export type Lang = 'en' | 'de' | 'hu'

const KEY = 'rfi-lang'
const EVENT = 'rfi:lang-change'

function detect(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'en' || saved === 'de' || saved === 'hu') return saved
  } catch { /* localStorage unavailable */ }
  const nav = navigator.language?.toLowerCase() ?? ''
  if (nav.startsWith('de')) return 'de'
  if (nav.startsWith('hu')) return 'hu'
  return 'en'
}

// ── UI chrome strings (everything not stored in content.json) ─────────────────

export const UI = {
  en: {
    namePlaceholder: 'Your name',
    emailPlaceholder: 'Email address',
    phonePlaceholder: 'Phone (optional)',
    messagePlaceholder: "Tell us about your enquiry",
    send: 'Send message',
    sending: 'Sending',
    success: 'Thank you! We will get back to you soon.',
    error: 'Something went wrong. Please try again or email directly.',
    colorScheme: 'Color scheme',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    language: 'Language',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeContrast: 'High contrast',
    close: 'Close',
    back: 'Back',
    readMore: 'Read article',
  },
  de: {
    namePlaceholder: 'Ihr Name',
    emailPlaceholder: 'E-Mail-Adresse',
    phonePlaceholder: 'Telefon (optional)',
    messagePlaceholder: 'Ihr Anliegen …',
    send: 'Nachricht senden',
    sending: 'Wird gesendet',
    success: 'Danke! Wir melden uns bald bei Ihnen.',
    error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie direkt eine E-Mail.',
    colorScheme: 'Farbschema',
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    language: 'Sprache',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    themeContrast: 'Hoher Kontrast',
    close: 'Schließen',
    back: 'Zurück',
    readMore: 'Artikel lesen',
  },
  hu: {
    namePlaceholder: 'Az Ön neve',
    emailPlaceholder: 'E-mail cím',
    phonePlaceholder: 'Telefon (nem kötelező)',
    messagePlaceholder: 'Írja le kérdését …',
    send: 'Üzenet küldése',
    sending: 'Küldés folyamatban',
    success: 'Köszönjük! Hamarosan visszajelzünk.',
    error: 'Valami hiba történt. Kérjük, próbálja újra, vagy írjon közvetlenül e-mailt.',
    colorScheme: 'Színséma',
    openMenu: 'Menü megnyitása',
    closeMenu: 'Menü bezárása',
    language: 'Nyelv',
    themeLight: 'Világos',
    themeDark: 'Sötét',
    themeContrast: 'Magas kontraszt',
    close: 'Bezárás',
    back: 'Vissza',
    readMore: 'Cikk elolvasása',
  },
} as const

export function useLang() {
  const [lang, setLangState] = useState<Lang>(detect)

  useEffect(() => {
    const handler = (e: Event) => setLangState((e as CustomEvent).detail as Lang)
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])

  const setLang = (l: Lang) => {
    try { localStorage.setItem(KEY, l) } catch { /* ignore */ }
    document.documentElement.lang = l
    window.dispatchEvent(new CustomEvent(EVENT, { detail: l }))
  }

  return { lang, setLang, t: UI[lang] }
}
