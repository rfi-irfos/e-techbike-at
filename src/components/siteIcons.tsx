import type { ReactNode } from 'react'

// Symbole für Karten wie "Was uns unterscheidet". Die ersten sechs sind die bisherigen Standard-Symbole.
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const wrap = (children: ReactNode) => <svg {...base}>{children}</svg>

export const ICON_LIBRARY: { id: string; label: string; node: ReactNode }[] = [
  { id: 'tag',      label: 'Preis',      node: wrap(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>) },
  { id: 'shield',   label: 'Garantie',   node: wrap(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></>) },
  { id: 'user',     label: 'Person',     node: wrap(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>) },
  { id: 'pin',      label: 'Standort',   node: wrap(<><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/></>) },
  { id: 'euro',     label: 'Förderung',  node: wrap(<><circle cx="12" cy="12" r="10"/><path d="M14.5 9a3.5 4 0 1 0 0 6"/><line x1="6" y1="10" x2="12" y2="10"/><line x1="6" y1="14" x2="12" y2="14"/></>) },
  { id: 'wrench',   label: 'Werkstatt',  node: wrap(<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>) },
  { id: 'bolt',     label: 'Strom',      node: wrap(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>) },
  { id: 'truck',    label: 'Lieferung',  node: wrap(<><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>) },
  { id: 'star',     label: 'Stern',      node: wrap(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>) },
  { id: 'heart',    label: 'Herz',       node: wrap(<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>) },
  { id: 'check',    label: 'Haken',      node: wrap(<><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></>) },
  { id: 'phone',    label: 'Telefon',    node: wrap(<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>) },
  { id: 'clock',    label: 'Zeit',       node: wrap(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>) },
  { id: 'gift',     label: 'Geschenk',   node: wrap(<><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>) },
  { id: 'leaf',     label: 'Umwelt',     node: wrap(<><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></>) },
  { id: 'battery',  label: 'Akku',       node: wrap(<><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/></>) },
  { id: 'bike',     label: 'Fahrrad',    node: wrap(<><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></>) },
  { id: 'thumbs',   label: 'Empfehlung', node: wrap(<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>) },
]

const DEFAULT_IDS = ['tag', 'shield', 'user', 'pin', 'euro', 'wrench']

export function isImageIcon(v?: string): boolean {
  return !!v && /^(https?:|\/|uploads\/|data:)/.test(v)
}

// Zeigt das gewählte Symbol, ein eigenes Bild oder (ohne Auswahl) das Standard-Symbol der Position.
export function FeatureIcon({ icon, fallbackIndex = 0 }: { icon?: string; fallbackIndex?: number }) {
  if (isImageIcon(icon)) return <img src={icon} alt="" className="feature-icon-img" />
  const id = icon && ICON_LIBRARY.some(i => i.id === icon) ? icon : DEFAULT_IDS[fallbackIndex % DEFAULT_IDS.length]
  return <>{ICON_LIBRARY.find(i => i.id === id)?.node ?? null}</>
}
