import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { getNavLinks } from '../lib/navLinks'
import type { SiteContent, SectionId, ProductItem, NewsItem, CategoryItem, TrustItem, FeatureItem, PageItem, AboutStat, CertificateItem } from '../types/content'
import type { User } from '../hooks/useAuth'
import { PublicSite } from './PublicSite'
import { useTestimonials } from '../lib/useTestimonials'
import type { Testimonial } from '../types/testimonials'
import { sanitizeHtml } from '../lib/sanitize'
import { FeatureIcon, ICON_LIBRARY } from './siteIcons'

interface Props {
  content: SiteContent
  user: User
  saving: boolean
  onSave: (c: SiteContent) => Promise<boolean>
  onUpload: (f: File) => Promise<string | null>
  uploadErrorMsg?: string | null
  onLogout: () => void
}

type PanelTab = 'products' | 'hero' | 'categories' | 'trust' | 'usp' | 'news' | 'contact' | 'style' | 'pages' | 'inbox' | 'about' | 'pricing' | 'reviews'

interface ContactInboxItem { name: string; email: string; phone?: string; message: string; ts: string }
function loadInbox(): ContactInboxItem[] { try { return JSON.parse(localStorage.getItem('rfi_contact_inbox') || '[]') } catch { return [] } }
type DeviceView = 'desktop' | 'tablet' | 'mobile'

// ── Minecraft Easter Eggs ──────────────────────────────────────────────────────

function MCToast({ text }: { text: string }) {
  return (
    <div className="mc-toast" role="status" aria-live="polite">
      <div className="mc-toast-icon">
        <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
          {/* dragon egg icon (pixelated diamond shape) */}
          <rect x="6" y="0" width="4" height="2" fill="#330066"/>
          <rect x="4" y="2" width="8" height="2" fill="#440088"/>
          <rect x="2" y="4" width="12" height="4" fill="#5500aa"/>
          <rect x="4" y="8" width="8" height="4" fill="#440088"/>
          <rect x="6" y="12" width="4" height="2" fill="#330066"/>
          <rect x="6" y="5" width="2" height="2" fill="#cc00ff"/>
          <rect x="9" y="5" width="2" height="2" fill="#cc00ff"/>
        </svg>
      </div>
      <div className="mc-toast-body">
        <div className="mc-toast-label">Achievement Get!</div>
        <div className="mc-toast-text">{text}</div>
      </div>
    </div>
  )
}

function ErrorToast({ text }: { text: string }) {
  return (
    <div className="upload-error-toast" role="alert" aria-live="assertive">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12" y2="16.01"/>
      </svg>
      <span>{text}</span>
    </div>
  )
}

function EnderDragon({ onCatch }: { onCatch: () => void }) {
  return (
    <div className="ender-dragon-wrap" style={{ overflow: 'hidden' }} onClick={onCatch} title="psst...">
      <svg
        viewBox="0 0 88 42"
        width="112"
        height="53"
        style={{ imageRendering: 'pixelated', display: 'block', overflow: 'hidden' }}
      >
        {/* tail — tapers left */}
        <rect x="0"  y="26" width="4"  height="4"  fill="#1a0033"/>
        <rect x="3"  y="24" width="5"  height="6"  fill="#1a0033"/>
        <rect x="7"  y="22" width="6"  height="8"  fill="#220044"/>
        {/* body */}
        <rect x="13" y="18" width="34" height="13" rx="1" fill="#1a0033"/>
        {/* Left wing - 3 layers */}
        <polygon points="20,20 0,2 5,12 20,18" fill="#3d0066"/>
        <polygon points="20,20 2,0 6,8 20,18" fill="#220044"/>
        <polygon points="15,22 1,8 8,16 16,22" fill="#4d0088" opacity="0.6"/>
        {/* Right wing - 3 layers */}
        <polygon points="40,20 58,2 53,12 40,18" fill="#3d0066"/>
        <polygon points="40,20 56,0 52,8 40,18" fill="#220044"/>
        <polygon points="45,22 57,8 50,16 44,22" fill="#4d0088" opacity="0.6"/>
        {/* spine spikes */}
        <rect x="18" y="14" width="3" height="5" fill="#220044"/>
        <rect x="25" y="13" width="3" height="6" fill="#220044"/>
        <rect x="33" y="14" width="3" height="5" fill="#220044"/>
        <rect x="41" y="13" width="3" height="6" fill="#220044"/>
        {/* neck */}
        <rect x="47" y="11" width="10" height="14" rx="1" fill="#220044"/>
        {/* head */}
        <rect x="54" y="7"  width="22" height="16" rx="1" fill="#2a0055"/>
        {/* eyes */}
        <rect x="57" y="10" width="4" height="4" fill="#cc00ff"/>
        <rect x="67" y="10" width="4" height="4" fill="#cc00ff"/>
        {/* eye glow */}
        <rect x="58" y="11" width="2" height="2" fill="#ff88ff"/>
        <rect x="68" y="11" width="2" height="2" fill="#ff88ff"/>
        {/* nostrils */}
        <rect x="75" y="15" width="2" height="2" fill="#440077"/>
        {/* horns */}
        <rect x="58" y="4"  width="2" height="5" fill="#1a0033"/>
        <rect x="69" y="2"  width="2" height="7" fill="#1a0033"/>
        {/* Fire breath from mouth */}
        <rect x="76" y="14" width="5" height="2" fill="#f97316"/>
        <rect x="78" y="13" width="4" height="1" fill="#fbbf24"/>
        <rect x="77" y="15" width="6" height="2" fill="#dc2626" opacity="0.7"/>
        <rect x="80" y="14" width="5" height="1" fill="#fef08a" opacity="0.8"/>
      </svg>
    </div>
  )
}

function MCTopbarTrees() {
  return (
    <div className="mc-topbar-trees" aria-hidden="true">
      <svg viewBox="0 0 380 46" width="380" height="46" style={{ imageRendering: 'pixelated', display: 'block' }} preserveAspectRatio="xMidYMax meet">
        {/* ground */}
        <rect x="0"   y="34" width="380" height="4"  fill="#5D9E2E"/>
        <rect x="0"   y="38" width="380" height="8"  fill="#7A5230"/>
        {/* tree 1 */}
        <rect x="6"   y="10" width="18" height="6"  fill="#2D6020"/>
        <rect x="4"   y="16" width="22" height="6"  fill="#3A7D44"/>
        <rect x="2"   y="22" width="26" height="12" fill="#2D6020"/>
        <rect x="12"  y="30" width="8"  height="8"  fill="#6B4A1E"/>
        {/* creeper */}
        <rect x="44"  y="18" width="16" height="16" fill="#3A7D44"/>
        <rect x="47"  y="21" width="4"  height="4"  fill="#111"/>
        <rect x="57"  y="21" width="4"  height="4"  fill="#111"/>
        <rect x="51"  y="27" width="2"  height="3"  fill="#111"/>
        <rect x="55"  y="27" width="2"  height="3"  fill="#111"/>
        <rect x="49"  y="30" width="10" height="2"  fill="#111"/>
        <rect x="51"  y="29" width="6"  height="2"  fill="#111"/>
        {/* tree 2 */}
        <rect x="78"  y="6"  width="22" height="8"  fill="#2D6020"/>
        <rect x="76"  y="14" width="26" height="8"  fill="#3A7D44"/>
        <rect x="74"  y="22" width="30" height="12" fill="#2D6020"/>
        <rect x="84"  y="30" width="10" height="8"  fill="#6B4A1E"/>
        {/* grass blocks */}
        <rect x="118" y="26" width="12" height="4"  fill="#5D9E2E"/>
        <rect x="118" y="30" width="12" height="8"  fill="#7A5230"/>
        <rect x="132" y="28" width="12" height="2"  fill="#5D9E2E"/>
        <rect x="132" y="30" width="12" height="8"  fill="#7A5230"/>
        {/* tree 3 small */}
        <rect x="154" y="14" width="16" height="6"  fill="#2D6020"/>
        <rect x="152" y="20" width="20" height="6"  fill="#3A7D44"/>
        <rect x="150" y="26" width="24" height="8"  fill="#2D6020"/>
        <rect x="158" y="30" width="8"  height="8"  fill="#6B4A1E"/>
        {/* stone/cobble blocks */}
        <rect x="186" y="22" width="10" height="12" fill="#7F7F7F"/>
        <rect x="196" y="18" width="10" height="16" fill="#9A9A9A"/>
        <rect x="206" y="22" width="10" height="12" fill="#7F7F7F"/>
        <rect x="188" y="22" width="2"  height="2"  fill="#6A6A6A"/>
        <rect x="198" y="18" width="2"  height="2"  fill="#AAAAAA"/>
        {/* tree 4 */}
        <rect x="228" y="8"  width="20" height="8"  fill="#2D6020"/>
        <rect x="226" y="16" width="24" height="8"  fill="#3A7D44"/>
        <rect x="224" y="24" width="28" height="10" fill="#2D6020"/>
        <rect x="233" y="30" width="10" height="8"  fill="#6B4A1E"/>
        {/* TNT */}
        <rect x="266" y="18" width="16" height="16" fill="#C03030"/>
        <rect x="268" y="18" width="12" height="4"  fill="#EEEEEE"/>
        <rect x="268" y="30" width="12" height="4"  fill="#EEEEEE"/>
        <rect x="270" y="20" width="2"  height="12" fill="#C03030"/>
        <rect x="278" y="20" width="2"  height="12" fill="#C03030"/>
        {/* tree 5 */}
        <rect x="298" y="10" width="18" height="6"  fill="#2D6020"/>
        <rect x="296" y="16" width="22" height="6"  fill="#3A7D44"/>
        <rect x="294" y="22" width="26" height="12" fill="#2D6020"/>
        <rect x="303" y="30" width="8"  height="8"  fill="#6B4A1E"/>
        {/* diamond ore block */}
        <rect x="336" y="20" width="16" height="16" fill="#7F7F7F"/>
        <rect x="338" y="22" width="4"  height="4"  fill="#4FC3D0"/>
        <rect x="346" y="22" width="4"  height="4"  fill="#4FC3D0"/>
        <rect x="342" y="28" width="4"  height="4"  fill="#4FC3D0"/>
        {/* tree 6 */}
        <rect x="360" y="12" width="16" height="6"  fill="#2D6020"/>
        <rect x="358" y="18" width="20" height="6"  fill="#3A7D44"/>
        <rect x="356" y="24" width="24" height="10" fill="#2D6020"/>
        <rect x="364" y="30" width="8"  height="8"  fill="#6B4A1E"/>
      </svg>
    </div>
  )
}

// ── Device preview switch (Desktop / Tablet / Mobile) ─────────────────────────

function IconDesktop() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
}
function IconTablet() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
}
function IconMobile() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
}

// ── Hinzufügen: ein Einstieg für alles ─────────────────────────────────────────

type AddType = 'product' | 'category' | 'news' | 'page' | 'navlink' | 'trust' | 'usp' | 'testimonial' | 'stat' | 'certificate'

const ADD_MENU: Array<Array<{ type: AddType; label: string; hint: string }>> = [
  [
    { type: 'product',  label: 'Produkt',   hint: 'Neues Fahrzeug im Sortiment' },
    { type: 'category', label: 'Kategorie', hint: 'Neue Gruppe auf der Startseite' },
    { type: 'news',     label: 'Neuigkeit', hint: 'Beitrag unter „Aktuelles“' },
  ],
  [
    { type: 'page',    label: 'Seite',     hint: 'Eigene Unterseite, z. B. Versand' },
    { type: 'navlink', label: 'Menüpunkt', hint: 'Link oben in der Navigation' },
  ],
  [
    { type: 'trust',       label: 'Vorteil',    hint: 'Kurzer Pluspunkt im dunklen Band' },
    { type: 'usp',         label: 'Pluspunkt',  hint: 'Karte unter „Was uns unterscheidet“' },
    { type: 'testimonial', label: 'Review',  hint: 'Stimme eines Kunden' },
    { type: 'stat',        label: 'Kennzahl',   hint: 'Zahl im Bereich „Über uns“' },
    { type: 'certificate', label: 'Zertifikat', hint: 'Nachweis oder Siegel' },
  ],
]

interface AddField {
  key: string; label: string
  kind?: 'text' | 'textarea' | 'select'
  placeholder?: string; required?: boolean; hint?: string
  options?: Array<{ value: string; label: string }>
}
interface AddFormDef { title: string; hint?: string; submit: string; fields: AddField[] }

const TRUST_ICON_OPTIONS = [
  { value: 'shield', label: 'Schild' }, { value: 'truck', label: 'Lieferwagen' }, { value: 'star', label: 'Stern' },
  { value: 'check', label: 'Haken' }, { value: 'phone', label: 'Telefon' }, { value: 'heart', label: 'Herz' },
  { value: 'bolt', label: 'Blitz' }, { value: 'tag', label: 'Preisschild' }, { value: 'location', label: 'Standort' },
]

function addFormFor(type: Exclude<AddType, 'product'>, draft: SiteContent): AddFormDef {
  switch (type) {
    case 'category': return {
      title: 'Neue Kategorie', submit: 'Kategorie anlegen',
      hint: 'Kategorien erscheinen als Kacheln auf der Startseite. Das Bild wählst du danach.',
      fields: [
        { key: 'name', label: 'Name', required: true, placeholder: 'z. B. Kinder-E-Bikes' },
        { key: 'sub', label: 'Untertitel', placeholder: 'z. B. Für die Kleinsten' },
      ],
    }
    case 'news': return {
      title: 'Neue Neuigkeit', submit: 'Neuigkeit anlegen',
      fields: [
        { key: 'title', label: 'Überschrift', required: true, placeholder: 'z. B. Neue Modelle ab Dezember' },
        { key: 'body', label: 'Text', kind: 'textarea', placeholder: 'Was gibt es Neues?' },
      ],
    }
    case 'page': return {
      title: 'Neue Seite', submit: 'Seite anlegen',
      hint: 'Eine eigene Unterseite, zum Beispiel für Versand oder Garantie.',
      fields: [
        { key: 'title', label: 'Titel der Seite', required: true, placeholder: 'z. B. Versand und Lieferung' },
        { key: 'body', label: 'Text', kind: 'textarea', placeholder: 'Der Inhalt der Seite. Absätze mit Leerzeile trennen.' },
      ],
    }
    case 'navlink': return {
      title: 'Neuer Menüpunkt', submit: 'Menüpunkt anlegen',
      hint: 'Der Punkt erscheint oben in der Navigation der Website.',
      fields: [
        { key: 'label', label: 'Beschriftung', required: true, placeholder: 'z. B. Versand' },
        {
          key: 'href', label: 'Führt zu', kind: 'select', options: [
            { value: '#products', label: 'Sortiment' },
            { value: '#location', label: 'Standort' },
            ...(draft.pages ?? []).map(pg => ({ value: `#p/${pg.slug}`, label: `Seite: ${pg.title}` })),
          ],
        },
        { key: 'custom', label: 'Oder eigene Adresse', placeholder: 'https://…', hint: 'Nur ausfüllen, wenn der Punkt auf eine andere Website zeigen soll.' },
      ],
    }
    case 'trust': return {
      title: 'Neuer Vorteil', submit: 'Vorteil anlegen',
      hint: 'Vorteile stehen als kurzes Band direkt unter dem Titelbild.',
      fields: [
        { key: 'bold', label: 'Fett gedruckt', required: true, placeholder: 'z. B. 2 Jahre' },
        { key: 'text', label: 'Dazu', placeholder: 'z. B. Garantie' },
        { key: 'icon', label: 'Symbol', kind: 'select', options: TRUST_ICON_OPTIONS },
      ],
    }
    case 'usp': return {
      title: 'Neues Verkaufsargument', submit: 'Anlegen',
      fields: [
        { key: 'title', label: 'Überschrift', required: true, placeholder: 'z. B. Persönliche Beratung' },
        { key: 'description', label: 'Text', kind: 'textarea', placeholder: 'Ein bis zwei Sätze.' },
      ],
    }
    case 'testimonial': return {
      title: 'Neue Review', submit: 'Review anlegen',
      hint: 'Reviews werden sofort gespeichert und erscheinen auf der Website.',
      fields: [
        { key: 'name', label: 'Name des Kunden', required: true, placeholder: 'z. B. Maria K.' },
        { key: 'rating', label: 'Sterne', kind: 'select', options: [5, 4, 3, 2, 1].map(n => ({ value: String(n), label: `${n} von 5` })) },
        { key: 'text', label: 'Text', kind: 'textarea', required: true, placeholder: 'Was hat die Kundin oder der Kunde gesagt?' },
        { key: 'date', label: 'Datum', placeholder: 'z. B. Juni 2026' },
      ],
    }
    case 'stat': return {
      title: 'Neue Kennzahl', submit: 'Kennzahl anlegen',
      fields: [
        { key: 'value', label: 'Zahl', required: true, placeholder: 'z. B. 500+' },
        { key: 'label', label: 'Beschriftung', required: true, placeholder: 'z. B. zufriedene Kunden' },
      ],
    }
    case 'certificate': return {
      title: 'Neues Zertifikat', submit: 'Zertifikat anlegen',
      fields: [
        { key: 'title', label: 'Titel', required: true, placeholder: 'z. B. Händlerzertifikat' },
        { key: 'subtitle', label: 'Untertitel', placeholder: 'z. B. Bikely Partner Graz' },
      ],
    }
  }
}

function AddIcon({ type }: { type: AddType }) {
  const paths: Record<AddType, React.ReactNode> = {
    product: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>,
    category: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    news: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    page: <><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></>,
    navlink: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    trust: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    usp: <><circle cx="12" cy="12" r="9"/><polyline points="8 12 11 15 16 9"/></>,
    testimonial: <polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3"/>,
    stat: <><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></>,
    certificate: <><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/></>,
  }
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>
}

function AddModal({ form, onClose, onSubmit, initial, onDelete, deleteWhat }: { form: AddFormDef; onClose: () => void; onSubmit: (v: Record<string, string>) => void; initial?: Record<string, string>; onDelete?: () => void; deleteWhat?: string }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(form.fields.map(f => [f.key, initial?.[f.key] ?? (f.kind === 'select' ? (f.options?.[0]?.value ?? '') : '')])))
  const [askDelete, setAskDelete] = useState(false)
  const [touched, setTouched] = useState(false)
  const missing = form.fields.filter(f => f.required && !values[f.key]?.trim())

  const submit = () => {
    setTouched(true)
    if (missing.length === 0) onSubmit(values)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="pem-overlay" onClick={onClose}>
      <div className="pem pem-add" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={form.title}>
        <div className="pem-header">
          <span className="pem-title">{form.title}</span>
          <button className="pem-close" onClick={onClose} title="Schließen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="pem-body pem-add-body">
          {form.hint && <p className="pem-add-hint">{form.hint}</p>}
          <div className="pem-fields">
            {form.fields.map((f, i) => (
              <div className="pem-field" key={f.key}>
                <label htmlFor={`add-${f.key}`}>{f.label}{f.required ? ' *' : ''}</label>
                {f.kind === 'textarea' ? (
                  <textarea id={`add-${f.key}`} rows={3} placeholder={f.placeholder} value={values[f.key]}
                    onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} />
                ) : f.kind === 'select' ? (
                  <select id={`add-${f.key}`} value={values[f.key]} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}>
                    {(f.options ?? []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input id={`add-${f.key}`} type="text" autoFocus={i === 0} placeholder={f.placeholder} value={values[f.key]}
                    onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') submit() }} />
                )}
                {f.hint && <span className="pem-add-field-hint">{f.hint}</span>}
                {touched && f.required && !values[f.key]?.trim() && <span className="pem-add-error">Bitte ausfüllen</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="pem-footer">
          {onDelete && (askDelete ? (
            <div className="entry-delete-confirm pem-delete-confirm">
              <span>{deleteWhat ?? 'Eintrag'} wirklich entfernen?</span>
              <button type="button" className="entry-delete-yes" onClick={onDelete}>Ja, entfernen</button>
              <button type="button" className="entry-delete-no" onClick={() => setAskDelete(false)}>Abbrechen</button>
            </div>
          ) : (
            <button type="button" className="pem-delete-btn" onClick={() => setAskDelete(true)}>Entfernen</button>
          ))}
          <div className="pem-footer-right">
            <button className="pem-btn-ghost" onClick={onClose}>Abbrechen</button>
            <button className="pem-btn-primary pem-btn-green" onClick={submit}>{form.submit}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const slugifyTitle = (t: string) => t.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const textToHtml = (t: string) => t.trim()
  ? t.trim().split(/\n+/).map(line => `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`).join('')
  : '<p>Hier kommt der Seiteninhalt.</p>'

// "1490" -> "€ 1.490,00"; Eingaben, die keine Zahl sind, bleiben unverändert
const formatPriceEuro = (raw: string) => {
  const s = raw.replace(/[€\s]/g, '')
  if (!s) return ''
  const n = s.includes(',') ? parseFloat(s.replace(/\./g, '').replace(',', '.'))
    : /^\d{1,3}(\.\d{3})+$/.test(s) ? parseFloat(s.replace(/\./g, ''))
    : parseFloat(s)
  return Number.isNaN(n) ? raw.trim() : `€ ${n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const RAIL_ICON_PATHS: Record<PanelTab, React.ReactNode> = {
  products:   <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
  categories: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  hero:       <><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></>,
  about:      <><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="7.8" r=".6"/></>,
  trust:      <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></>,
  usp:        <><circle cx="12" cy="12" r="9"/><polyline points="8 12 11 15 16 9"/></>,
  news:       <><path d="M4 4h13a1 1 0 0 1 1 1v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M18 8h3v11a2 2 0 0 1-2 2"/><line x1="8" y1="8" x2="14" y2="8"/><line x1="8" y1="12" x2="14" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></>,
  pricing:    <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.3"/></>,
  reviews:    <><polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3"/></>,
  pages:      <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  contact:    <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></>,
  style:      <><path d="M12 22a10 10 0 1 1 10-10c0 2.5-2 3-4 3h-2a2 2 0 0 0-1.5 3.3c.6.8.2 3.7-2.5 3.7z"/><circle cx="7.5" cy="11" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16.5" cy="11" r="1"/></>,
  inbox:      <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z"/></>,
}

function RailIcon({ id }: { id: PanelTab }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {RAIL_ICON_PATHS[id]}
    </svg>
  )
}

const HERO_LINK_TARGETS = [
  { href: '#products', label: 'Sortiment (Produktübersicht)' },
  { href: '#foerderung', label: 'Förderungen' },
  { href: '#wie-kaufen', label: 'Wie kaufen?' },
  { href: '#akku-pflege', label: 'Akku-Pflege' },
  { href: '#uber-uns', label: 'Über uns' },
]
const PANEL_HINTS: Record<PanelTab, string> = {
  products:   'Erscheint im Bereich Sortiment, dort sind alle Fahrzeuge aufgelistet.',
  categories: 'Erscheint als Kacheln unter „Für jeden das richtige Fahrzeug“, direkt unter dem Titelbild.',
  hero:       'Das große Titelbild ganz oben mit Überschrift und Knöpfen.',
  about:      'Eigener Abschnitt direkt unter dem schwarzen Streifen. Erscheint erst, wenn hier Text steht.',
  trust:      'Der schwarze Streifen direkt unter dem Titelbild.',
  usp:        'Die Karten „Was uns unterscheidet“, weiter unten nach dem Sortiment.',
  news:       'Der Bereich Aktuelles, weiter unten auf der Seite.',
  pricing:    'Der Bereich Preise, weiter unten auf der Seite.',
  reviews:    'Die Reviews, weiter unten auf der Seite. Die Überschrift klickst du direkt in der Vorschau an.',
  pages:      'Das Menü ganz oben. Zum Sortieren am Griff ziehen, der Pfeil öffnet die Seite.',
  contact:    'Der Bereich Standort und Kontakt ganz unten.',
  style:      'Farben, Schrift und Google-Texte, gelten für die ganze Seite.',
  inbox:      'Anfragen von Besuchern.',
}
function TrashIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
}

// Eine Karte pro Eintrag: Nummer, optional Symbol, Titelfeld und Löschknopf oben, Inhalt darunter.
function EntryCard({ index, what, lead, head, extra, onDelete, children }: {
  index: number; what: string; lead?: React.ReactNode; head: React.ReactNode; extra?: React.ReactNode; onDelete: () => void; children?: React.ReactNode
}) {
  const [ask, setAsk] = useState(false)
  return (
    <div className="entry-card">
      <div className="entry-card-head">
        <span className="entry-card-num">{index}</span>
        {lead}
        <div className="entry-card-headfield">{head}</div>
        <button type="button" className="entry-card-trash" title={`${what} entfernen`} aria-label={`${what} entfernen`} onClick={() => setAsk(true)}><TrashIcon /></button>
      </div>
      {ask && (
        <div className="entry-delete-confirm">
          <span>{what} wirklich entfernen?</span>
          <button type="button" className="entry-delete-yes" onClick={onDelete}>Ja, entfernen</button>
          <button type="button" className="entry-delete-no" onClick={() => setAsk(false)}>Abbrechen</button>
        </div>
      )}
      {extra}
      {children ? <div className="entry-card-body">{children}</div> : null}
    </div>
  )
}

// Pluspunkt-Karte mit wählbarem Symbol (aus der Bibliothek oder eigenes Bild).
function FeatureCard({ index, item, what, onChange, onUploadIcon, uploading, onDelete }: {
  index: number; item: FeatureItem; what: string; onChange: (field: keyof FeatureItem, value: string) => void
  onUploadIcon: () => void; uploading: boolean; onDelete: () => void
}) {
  const [pick, setPick] = useState(false)
  return (
    <EntryCard
      index={index} what={what} onDelete={onDelete}
      lead={
        <button type="button" className={`icon-picker-btn${pick ? ' open' : ''}`} onClick={() => setPick(v => !v)} title="Symbol ändern" aria-label="Symbol ändern">
          <span className="icon-picker-glyph"><FeatureIcon icon={item.icon} fallbackIndex={index - 1} /></span>
          <span className="icon-picker-edit">Ändern</span>
        </button>
      }
      head={<input className="entry-title-input" value={item.title} placeholder="Überschrift der Karte" onChange={e => onChange('title', e.target.value)} />}
      extra={pick ? (
        <div className="icon-picker-panel">
          <div className="icon-picker-grid">
            {ICON_LIBRARY.map(ic => (
              <button key={ic.id} type="button" title={ic.label} className={`icon-picker-opt${item.icon === ic.id ? ' selected' : ''}`} onClick={() => { onChange('icon', ic.id); setPick(false) }}>
                {ic.node}<span>{ic.label}</span>
              </button>
            ))}
          </div>
          <div className="icon-picker-actions">
            <button type="button" className="icon-picker-upload" onClick={onUploadIcon} disabled={uploading}>{uploading ? 'Lädt hoch …' : 'Eigenes Bild hochladen'}</button>
            <button type="button" className="icon-picker-reset" onClick={() => { onChange('icon', ''); setPick(false) }}>Standard</button>
          </div>
        </div>
      ) : null}
    >
      <textarea className="entry-desc-input" rows={3} value={item.description} placeholder="Beschreibung" onChange={e => onChange('description', e.target.value)} />
    </EntryCard>
  )
}

const TRUST_ICON_OPTS = [
  { id: 'shield', label: 'Schild' }, { id: 'truck', label: 'Lieferwagen' }, { id: 'star', label: 'Stern' },
  { id: 'check', label: 'Haken' }, { id: 'phone', label: 'Telefon' }, { id: 'heart', label: 'Herz' },
  { id: 'bolt', label: 'Blitz' }, { id: 'tag', label: 'Preisschild' }, { id: 'location', label: 'Standort' },
]
// Wo ein Bereich in der Vorschau liegt, damit ein Klick in der Leiste dorthin scrollt.
const PREVIEW_SECTION: Partial<Record<PanelTab, string>> = {
  categories: '.site-browser', products: '#products', trust: '#trust', about: '#about',
  usp: '#usp', news: '#news', contact: '#location', reviews: '#reviews',
}
const SOFT_HYPHEN = '\u00AD'
// Die Hauptüberschrift liegt als HTML vor (Umbruch + farbiges span). Im Feld zeigen wir nur Klartext.
function splitHeadline(html: string): { line1: string; accent: string } {
  const plain = (h: string) => h.replace(/&shy;/g, SOFT_HYPHEN).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  const m = html.match(/^([\s\S]*?)(?:<br\s*\/?>)?\s*<span[^>]*>([\s\S]*?)<\/span>\s*$/i)
  return m ? { line1: plain(m[1]), accent: plain(m[2]) } : { line1: plain(html), accent: '' }
}
function joinHeadline(line1: string, accent: string): string {
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return accent.trim() ? `${esc(line1)}<br><span>${esc(accent)}</span>` : esc(line1)
}

const DEVICE_OPTS: { id: DeviceView; label: string; icon: React.ReactNode }[] = [
  { id: 'desktop', label: 'Web', icon: <IconDesktop /> },
  { id: 'tablet', label: 'Tablet', icon: <IconTablet /> },
  { id: 'mobile', label: 'Mobil', icon: <IconMobile /> },
]

export function AdminPanel({ content, user: _user, saving, onSave, onUpload, uploadErrorMsg, onLogout }: Props) {
  const [draft, setDraft] = useState<SiteContent>(content)
  const [activeTab, setActiveTab] = useState<PanelTab>('products')
  const [panelOpen, setPanelOpen] = useState(true)
  const [saved, setSaved] = useState(false)
  const [uploadTarget, setUploadTarget] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(false)
  const [errorToast, setErrorToast] = useState<string | null>(null)
  useEffect(() => {
    if (!uploadErrorMsg) return
    setErrorToast(uploadErrorMsg)
    const t = setTimeout(() => setErrorToast(null), 5000)
    return () => clearTimeout(t)
  }, [uploadErrorMsg])
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editingNews, setEditingNews] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [device, setDevice] = useState<DeviceView>('desktop')
  const [productModal, setProductModal] = useState<string | null>(null)
  const [newProductId, setNewProductId] = useState<string | null>(null)
  const [addModal, setAddModal] = useState<Exclude<AddType, 'product'> | null>(null)
  const [panelWidth, setPanelWidth] = useState(400)
  const [editingPage, setEditingPage] = useState<string | null>(null)
  const [menuDrag, setMenuDrag] = useState<{ from: number; over: number } | null>(null)
  const menuListRef = useRef<HTMLDivElement>(null)
  const [contactInbox, setContactInbox] = useState<ContactInboxItem[]>(() => loadInbox())
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [mcAchievement, setMcAchievement] = useState<string | null>(null)
  const [saveError, setSaveError] = useState(false)
  const { testimonials, saving: testimonialsSaving, saveError: testimonialsSaveError, justSaved: testimonialsJustSaved, add: addTestimonial, update: updateTestimonial, remove: removeTestimonial } = useTestimonials()
  const [editReview, setEditReview] = useState<Testimonial | null>(null)
  const [mcTheme, setMcTheme] = useState(() => localStorage.getItem('mc-theme') !== 'false')
  const mcTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDirty = JSON.stringify(draft) !== JSON.stringify(content)

  function triggerAchievement(text: string) {
    if (mcTimerRef.current) clearTimeout(mcTimerRef.current)
    setMcAchievement(text)
    mcTimerRef.current = setTimeout(() => setMcAchievement(null), 3800)
  }

  const toggleMcTheme = () => setMcTheme(t => {
    const next = !t
    localStorage.setItem('mc-theme', String(next))
    return next
  })
  const fileRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const panelBodyRef = useRef<HTMLDivElement>(null)
  const addMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!addMenuOpen) return
    const onDown = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setAddMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [addMenuOpen])

  useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (!isDirty) return
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warnBeforeLeave)
    return () => window.removeEventListener('beforeunload', warnBeforeLeave)
  }, [isDirty])

  const startPanelResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = panelWidth
    document.body.classList.add('is-resizing-panel')
    const onMove = (ev: MouseEvent) => setPanelWidth(Math.max(240, Math.min(640, startW + startX - ev.clientX)))
    const onUp = () => { document.body.classList.remove('is-resizing-panel'); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // Gleitendes Glas-Highlight: wandert sanft zum aktiven Eintrag der Leiste
  const railRef = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const place = () => {
      const el = rail.querySelector<HTMLElement>('.builder-rail-item.active')
      rail.style.setProperty('--pill-on', el ? '1' : '0')
      if (!el) return
      rail.style.setProperty('--pill-y', `${el.offsetTop}px`)
      rail.style.setProperty('--pill-h', `${el.offsetHeight}px`)
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [activeTab, panelOpen])

  const scrollPreviewTo = (tab: PanelTab) => {
    const pane = previewRef.current
    if (!pane) return
    const sel = PREVIEW_SECTION[tab]
    const el = sel ? pane.querySelector<HTMLElement>(sel) : null
    if (!el) { pane.scrollTo({ top: 0, behavior: 'smooth' }); return }
    // Bereich mittig in die Vorschau holen; ist er höher als die Vorschau, oben mit etwas Luft
    const rect = el.getBoundingClientRect()
    const paneRect = pane.getBoundingClientRect()
    const elTop = rect.top - paneRect.top + pane.scrollTop
    const top = rect.height < pane.clientHeight - 40 ? elTop - (pane.clientHeight - rect.height) / 2 : elTop - 24
    pane.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    // Weiches Leuchten als eigene Ebene über dem Bereich, damit der Rahmen rundum sichtbar bleibt
    pane.querySelectorAll('.preview-glow').forEach(g => g.remove())
    const glow = document.createElement('div')
    glow.className = 'preview-glow'
    glow.style.top = `${elTop + 4}px`
    glow.style.left = `${rect.left - paneRect.left + 6}px`
    glow.style.width = `${rect.width - 12}px`
    glow.style.height = `${rect.height - 8}px`
    pane.appendChild(glow)
    window.setTimeout(() => glow.remove(), 3300)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Double-click = text selection intent, never navigate
    if (e.detail >= 2) return
    const target = e.target as HTMLElement
    // Menüpunkte in der Vorschau führen nicht aus dem Baukasten hinaus, sondern öffnen rechts ihre Detailansicht
    const navA = target.closest('.site-nav a[href^="#"], .site-mobile-drawer a[href^="#"]') as HTMLAnchorElement | null
    if (navA) {
      const href = navA.getAttribute('href') ?? ''
      const pg = pageOfHref(href)
      e.preventDefault()
      setPanelOpen(true)
      if (pg) { setEditingPage(pg.id); setActiveTab('pages') }
      else if (href === '#products') { setActiveTab('products'); scrollPreviewTo('products') }
      else if (href === '#location' || href === '#contact') { setActiveTab('contact'); scrollPreviewTo('contact') }
      else { setEditingPage(null); setActiveTab('pages') }
      return
    }
    // Kein Schutz gegen aktive Textfelder: der erste Klick fokussiert das Feld,
    // und das Umschalten der Sidebar soll trotzdem passieren.
    const el = target.closest('[data-cid]') as HTMLElement | null
    if (!el) return
    setPanelOpen(true)
    const cid = el.dataset.cid ?? ''
    if (cid.startsWith('nav.')) {
      setActiveTab('pages'); setEditingPage(null)
    } else if (cid.startsWith('hero.')) {
      setActiveTab('hero')
    } else if (cid.startsWith('products.items.')) {
      const idx = parseInt(cid.split('.')[2])
      const item = draft.products?.items?.[idx]
      if (item) { setActiveTab('products'); setEditingProduct(item.id) }
    } else if (cid.startsWith('products.')) {
      setActiveTab('products')
    } else if (cid.startsWith('news.items.') || cid.startsWith('news.')) {
      const idx = parseInt(cid.split('.')[2])
      const item = draft.news?.items?.[idx]
      if (item) { setActiveTab('news'); setEditingNews(item.id) }
      else setActiveTab('news')
    } else if (cid.startsWith('contact.') || cid.startsWith('whatsapp.')) {
      setActiveTab('contact')
    } else if (cid.startsWith('meta.') || cid.startsWith('footer.')) {
      setActiveTab('style')
    } else if (cid.startsWith('categories.items.')) {
      const idx = parseInt(cid.split('.')[2])
      const item = draft.categories?.items?.[idx]
      if (item) { setActiveTab('categories'); setEditingCategory(item.id) }
    } else if (cid.startsWith('trust.')) {
      setActiveTab('trust')
    } else if (cid.startsWith('usp.')) {
      setActiveTab('usp')
    }
  }

  // ── State helpers ─────────────────────────────────────────────────────────

  const update = (path: string, value: unknown) => {
    const keys = path.split('.')
    setDraft(prev => {
      const next = structuredClone(prev) as unknown as Record<string, unknown>
      let cur = next
      for (let i = 0; i < keys.length - 1; i++) {
        if (cur[keys[i]] == null) cur[keys[i]] = {}
        cur = cur[keys[i]] as Record<string, unknown>
      }
      cur[keys[keys.length - 1]] = value
      return next as unknown as SiteContent
    })
  }

  const handleSave = async () => {
    if (!isDirty || saving) return
    setSaveError(false)
    const ok = await onSave(draft)
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      if (mcTheme) triggerAchievement('Website gespeichert — Veröffentlichung läuft')
    } else {
      setSaveError(true)
      setTimeout(() => setSaveError(false), 3500)
    }
  }

  const handleDiscard = () => {
    if (!isDirty || !window.confirm('Alle ungespeicherten Änderungen verwerfen?')) return
    setDraft(structuredClone(content))
    setEditingProduct(null)
    setEditingNews(null)
    setEditingCategory(null)
    setEditingPage(null)
    setSaved(false)
    setSaveError(false)
  }

  const handleLogout = () => {
    if (isDirty && !window.confirm('Es gibt ungespeicherte Änderungen. Trotzdem abmelden?')) return
    onLogout()
  }

  const handleImageClick = (field: string) => {
    setUploadTarget(field)
    fileRef.current?.click()
  }

  // ── Product helpers ───────────────────────────────────────────────────────


  const deleteProduct = (id: string) => {
    update('products.items', draft.products.items.filter(p => p.id !== id))
    if (editingProduct === id) setEditingProduct(null)
  }

  const updateProduct = (id: string, field: keyof ProductItem, value: unknown) => {
    update('products.items', draft.products.items.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  // Galerie und Hauptbild in einem Schritt setzen; das erste Bild ist immer das Hauptbild
  const setProductImages = (id: string, images: string[]) => {
    setDraft(prev => ({
      ...prev,
      products: { ...prev.products, items: prev.products.items.map(p => p.id === id ? { ...p, images, image: images[0] ?? '' } : p) },
    }))
  }

  const addProductImages = async (id: string, files: File[]) => {
    const imgs = files.filter(f => f.type.startsWith('image/'))
    if (imgs.length === 0) return
    setUploading(true)
    const urls: string[] = []
    for (const f of imgs) {
      const url = await onUpload(f)
      if (url) urls.push(url)
    }
    setUploading(false)
    setUploadError(urls.length < imgs.length)
    if (urls.length === 0) return
    setDraft(prev => ({
      ...prev,
      products: {
        ...prev.products,
        items: prev.products.items.map(p => {
          if (p.id !== id) return p
          const current = p.images?.length ? p.images : (p.image ? [p.image] : [])
          const images = [...current, ...urls]
          return { ...p, images, image: images[0] }
        }),
      },
    }))
  }

  const uploadProductImage = async (id: string) => {
    setUploadTarget(`product:${id}`)
    fileRef.current?.click()
  }

  // ── News helpers ──────────────────────────────────────────────────────────


  const deleteNews = (id: string) => {
    update('news.items', draft.news.items.filter(n => n.id !== id))
    if (editingNews === id) setEditingNews(null)
  }

  const updateNews = (id: string, field: keyof NewsItem, value: string) => {
    update('news.items', draft.news.items.map(n => n.id === id ? { ...n, [field]: value } : n))
  }

  // Custom file handler that can handle product image uploads
  const handleFileChangeAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadTarget) return
    if (uploadTarget.startsWith('product:')) {
      const files = Array.from(e.target.files ?? [])
      e.target.value = ''
      const pid = uploadTarget.replace('product:', '')
      setUploadTarget(null)
      await addProductImages(pid, files)
      return
    }
    setUploading(true)
    const url = await onUpload(file)
    if (url) {
      setUploadError(false)
      if (uploadTarget.startsWith('category:')) {
        const cid = uploadTarget.replace('category:', '')
        updateCategory(cid, 'image', url)
      } else if (uploadTarget.startsWith('news:')) {
        const nid = uploadTarget.replace('news:', '')
        updateNews(nid, 'image', url)
      } else {
        update(uploadTarget, url)
      }
    } else {
      setUploadError(true)
    }
    setUploading(false)
    e.target.value = ''
    setUploadTarget(null)
  }

  const uploadNewsImage = async (id: string) => {
    setUploadTarget(`news:${id}`)
    fileRef.current?.click()
  }

  // ── Category helpers ──────────────────────────────────────────────────────

  const deleteCategory = (id: string) => {
    update('categories.items', draft.categories.items.filter(c => c.id !== id))
    if (editingCategory === id) setEditingCategory(null)
  }
  const updateCategory = (id: string, field: keyof CategoryItem, value: unknown) => {
    update('categories.items', draft.categories.items.map(c => c.id === id ? { ...c, [field]: value } : c))
  }
  const uploadCategoryImage = async (id: string) => {
    setUploadTarget(`category:${id}`)
    fileRef.current?.click()
  }

  // ── Trust helpers ─────────────────────────────────────────────────────────

  const deleteTrustItem = (id: string) => {
    update('trust.items', draft.trust.items.filter(t => t.id !== id))
  }
  const updateTrustItem = (id: string, field: keyof TrustItem, value: string) => {
    update('trust.items', draft.trust.items.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  // ── USP helpers ───────────────────────────────────────────────────────────

  const deleteUspItem = (id: string) => {
    update('usp.items', draft.usp.items.filter(u => u.id !== id))
  }
  const updateUspItem = (id: string, field: keyof FeatureItem, value: string) => {
    update('usp.items', draft.usp.items.map(u => u.id === id ? { ...u, [field]: value } : u))
  }

  // ── Nav link helpers ──────────────────────────────────────────────────────

  // ── Page helpers ──────────────────────────────────────────────────────────

  // Das Menü ist eine einzige geordnete Liste (nav.links). Seiten stehen darin als #p/kurzname.
  const pageHrefs = (pg: PageItem) => [`#p/${pg.slug}`, `#${pg.slug}`]
  const menuItems = getNavLinks(draft)
  const pageOfHref = (href: string) => (draft.pages ?? []).find(pg => pageHrefs(pg).includes(href))
  const pageInMenu = (pg: PageItem) => menuItems.some(l => pageHrefs(pg).includes(l.href))
  const writeMenu = (items: { label: string; href: string }[]) => {
    setDraft(prev => ({
      ...prev,
      nav: { ...prev.nav, links: items },
      pages: (prev.pages ?? []).map(x => x.showInNav ? { ...x, showInNav: false } : x),
    }))
  }
  // Eine Liste für alles: über der Trennlinie steht im Menü, darunter nicht
  type NavEntry = { kind: 'item'; label: string; href: string; page?: PageItem } | { kind: 'divider' }
  const navEntries: NavEntry[] = [
    ...menuItems.map(l => ({ kind: 'item' as const, label: l.label, href: l.href, page: pageOfHref(l.href) })),
    { kind: 'divider' as const },
    ...(draft.nav?.hiddenLinks ?? []).map(l => ({ kind: 'item' as const, label: l.label, href: l.href, page: pageOfHref(l.href) })),
    ...(draft.pages ?? []).filter(pg => !pageInMenu(pg) && !(draft.nav?.hiddenLinks ?? []).some(l => pageHrefs(pg).includes(l.href)))
      .map(pg => ({ kind: 'item' as const, label: pg.title, href: `#p/${pg.slug}`, page: pg })),
  ]
  const reorderNav = (from: number, to: number) => {
    if (from === to) return
    const next = [...navEntries]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    const cut = next.findIndex(e => e.kind === 'divider')
    const pick = (list: NavEntry[]) => list.flatMap(e => e.kind === 'item' ? [{ label: e.label, href: e.href }] : [])
    const above = pick(next.slice(0, cut))
    // Seiten unter der Linie brauchen keinen Eintrag, sie sind ohnehin da; nur reine Links werden aufgehoben
    const below = next.slice(cut + 1).flatMap(e => e.kind === 'item' && !e.page ? [{ label: e.label, href: e.href }] : [])
    setDraft(prev => ({
      ...prev,
      nav: { ...prev.nav, links: above, hiddenLinks: below },
      pages: (prev.pages ?? []).map(x => x.showInNav ? { ...x, showInNav: false } : x),
    }))
  }
  const navDragRef = useRef<{ from: number; over: number } | null>(null)
  const navOverAt = (clientY: number, from: number) => {
    const rows = [...(menuListRef.current?.querySelectorAll<HTMLElement>(':scope > [data-nav-row]') ?? [])]
    let k = rows.findIndex(r => { const b = r.getBoundingClientRect(); return clientY < b.top + b.height / 2 })
    if (k === -1) k = rows.length
    return Math.max(0, Math.min(rows.length - 1, k > from ? k - 1 : k))
  }
  const renameMenuItem = (i: number, label: string) => writeMenu(menuItems.map((l, idx) => idx === i ? { ...l, label } : l))
  const addPageToMenu = (pg: PageItem) => writeMenu([...menuItems, { label: pg.title, href: `#p/${pg.slug}` }])
  const setPageInMenu = (id: string, on: boolean) => {
    const pg = (draft.pages ?? []).find(x => x.id === id)
    if (!pg) return
    if (on) addPageToMenu(pg)
    else writeMenu(menuItems.filter(l => !pageHrefs(pg).includes(l.href)))
  }

  // ── Page helpers ──────────────────────────────────────────────────────────

  const deletePage = (id: string) => {
    update('pages', (draft.pages ?? []).filter(p => p.id !== id))
    if (editingPage === id) setEditingPage(null)
  }
  const updatePage = (id: string, field: keyof PageItem, value: unknown) => {
    const old = (draft.pages ?? []).find(p => p.id === id)
    if (field === 'title' && old) {
      // Steht die Seite unter ihrem Titel im Menü, zieht der Menüname mit
      const links = (draft.nav?.links ?? []).map(l => pageHrefs(old).includes(l.href) && l.label === old.title ? { ...l, label: String(value) } : l)
      update('nav.links', links)
    }
    update('pages', (draft.pages ?? []).map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  // ── Inbox helpers ─────────────────────────────────────────────────────────
  const dismissInboxItem = (ts: string) => {
    const next = contactInbox.filter(i => i.ts !== ts)
    setContactInbox(next)
    localStorage.setItem('rfi_contact_inbox', JSON.stringify(next))
  }

  // ── Hinzufügen: Menü öffnet Maske, angelegt wird erst beim Bestätigen ──────

  const handleQuickAdd = (type: AddType) => {
    setAddMenuOpen(false)
    if (type === 'product') {
      // Neues Produkt: direkt die volle Maske öffnen; erst beim Veröffentlichen bleibt es bestehen
      const id = `p${Date.now()}`
      const item: ProductItem = { id, name: '', description: '', price: '', image: '', category: draft.categories?.items?.[0]?.name ?? '', specs: [] }
      update('products.items', [...(draft.products?.items ?? []), item])
      setActiveTab('products'); setNewProductId(id); setProductModal(id)
      return
    }
    setAddModal(type)
  }

  const openProduct = (id: string) => {
    setActiveTab('products')
    setPanelOpen(true)
    setEditingProduct(id)
    setProductModal(id)
  }

  const closeProductModal = () => {
    if (productModal && productModal === newProductId) {
      update('products.items', (draft.products?.items ?? []).filter(p => p.id !== productModal))
    }
    setNewProductId(null)
    setProductModal(null)
  }

  const createItem = (type: Exclude<AddType, 'product'>, v: Record<string, string>) => {
    setAddModal(null)
    const stamp = Date.now()
    if (type === 'category') {
      const id = `c${stamp}`
      update('categories.items', [...(draft.categories?.items ?? []), { id, name: v.name.trim(), sub: v.sub?.trim() ?? '', image: '' } as CategoryItem])
      setActiveTab('categories'); setEditingCategory(id)
    } else if (type === 'news') {
      const id = `n${stamp}`
      const item: NewsItem = { id, date: new Date().toISOString().split('T')[0], title: v.title.trim(), body: v.body?.trim() ?? '', image: '' }
      update('news.items', [...(draft.news?.items ?? []), item])
      setActiveTab('news'); setEditingNews(id)
    } else if (type === 'page') {
      const id = `pg${stamp}`
      const base = slugifyTitle(v.title) || 'seite'
      const slug = (draft.pages ?? []).some(pg => pg.slug === base) ? `${base}-${id.slice(-4)}` : base
      const page: PageItem = { id, title: v.title.trim(), slug, body: textToHtml(v.body ?? ''), showInNav: false }
      update('pages', [...(draft.pages ?? []), page])
      setActiveTab('pages'); setEditingPage(id)
    } else if (type === 'navlink') {
      update('nav.links', [...(draft.nav?.links ?? []), { label: v.label.trim(), href: v.custom?.trim() || v.href || '#' }])
      setActiveTab('pages'); setEditingPage(null)
    } else if (type === 'trust') {
      const item: TrustItem = { id: `tr${stamp}`, icon: v.icon || 'shield', bold: v.bold.trim(), text: v.text?.trim() ?? '' }
      update('trust.items', [...(draft.trust?.items ?? []), item])
      setActiveTab('trust')
    } else if (type === 'usp') {
      const item: FeatureItem = { id: `u${stamp}`, title: v.title.trim(), description: v.description?.trim() ?? '' }
      update('usp.items', [...(draft.usp?.items ?? []), item])
      setActiveTab('usp')
    } else if (type === 'testimonial') {
      addTestimonial({ name: v.name.trim(), rating: Number(v.rating) || 5, text: v.text.trim(), date: v.date?.trim() ?? '' })
      setActiveTab('reviews')
    } else if (type === 'stat') {
      setDraft(d => ({ ...d, about: { ...(d.about ?? { headline: '', bio: '' }), stats: [...(d.about?.stats ?? []), { value: v.value.trim(), label: v.label.trim() }] } }))
      setActiveTab('about')
    } else if (type === 'certificate') {
      setDraft(d => ({ ...d, certificates: { ...(d.certificates ?? { items: [] }), items: [...(d.certificates?.items ?? []), { id: crypto.randomUUID(), title: v.title.trim(), subtitle: v.subtitle?.trim() ?? '', file: '' }] } }))
      setActiveTab('pricing')
    }
  }

  // Reihenfolge nach Nutzung: erst was man am meisten pflegt (Kategorien, Produkte), dann der Rest
  const tabGroups: Array<{ group: string; tabs: Array<{ id: PanelTab; label: string; badge?: number }> }> = [
    { group: 'Seite', tabs: [
      { id: 'categories', label: 'Kategorien' },
      { id: 'products',   label: 'Produkte' },
      { id: 'hero',       label: 'Startseite' },
      ...(draft.about ? [{ id: 'about' as PanelTab, label: 'Über uns' }] : []),
      { id: 'trust',      label: 'Vorteile' },
      { id: 'usp',        label: 'Pluspunkte' },
      { id: 'news',       label: 'Aktuelles' },
      { id: 'reviews',    label: 'Reviews' },
      { id: 'pages',      label: 'Navigation' },
      { id: 'contact',    label: 'Kontakt' },
      { id: 'style',      label: 'Stil' },
    ] },
  ]

  const editingNewsItem = editingNews ? draft.news?.items?.find(n => n.id === editingNews) : null
  const editingCat = editingCategory ? draft.categories?.items?.find(c => c.id === editingCategory) : null

  return (
    <div className={`builder${mcTheme ? ' mc-theme' : ''}`}>
      <input ref={fileRef} type="file" accept="image/*" multiple={!!uploadTarget?.startsWith('product:')} style={{ display: 'none' }} onChange={handleFileChangeAll} />

      {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
      <div className="builder-topbar">
        {mcTheme && <MCTopbarTrees />}
        {mcTheme && <EnderDragon onCatch={() => triggerAchievement('Achievement Get!  Enderdrachen gefangen!')} />}
        <div className="builder-brand">
          <span className="builder-brand-dot" />
          <strong>{draft.nav?.brand || 'Meine Website'}</strong>
          {mcTheme && <span className="builder-crafting-badge">Crafting Table Edition</span>}
        </div>
        <div className="builder-device-switch" role="group" aria-label="Ansicht wählen">
          {DEVICE_OPTS.map(d => (
            <button
              key={d.id}
              type="button"
              className={`builder-device-btn ${device === d.id ? 'active' : ''}`}
              aria-pressed={device === d.id}
              title={`Ansicht: ${d.label}`}
              onClick={() => setDevice(d.id)}
            >
              {d.icon}
              {d.label}
            </button>
          ))}
        </div>
        <div className="builder-topbar-right">
          <button
            className={`builder-mc-toggle ${mcTheme ? 'active' : ''}`}
            onClick={toggleMcTheme}
            title={mcTheme ? 'Minecraft-Modus ausschalten' : 'Minecraft-Modus einschalten'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.71 5.63l-2.34-2.34a1 1 0 0 0-1.41 0l-3 3-1.42-1.42-1.41 1.42 1.41 1.41L3 17.25V21h3.75l9.96-9.96 1.41 1.42 1.42-1.42-1.42-1.41 3-3a1 1 0 0 0 0-1.42z"/>
            </svg>
            {mcTheme ? 'MC: AN' : 'MC: AUS'}
          </button>
          <a
            href="#crm"
            className="builder-crm-btn"
            title="Kunden"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Kunden
          </a>
          <div className="builder-add-wrap" ref={addMenuRef}>
            <button className="builder-add-btn" onClick={() => setAddMenuOpen(o => !o)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Hinzufügen
            </button>
            {addMenuOpen && (
              <div className="builder-add-menu" role="menu">
                {ADD_MENU.map(g => g.filter(i => i.type !== 'certificate' && (i.type !== 'stat' || !!draft.about))).filter(g => g.length).map((group, gi) => (
                  <div key={gi}>
                    {gi > 0 && <div className="builder-add-sep" />}
                    {group.map(m => (
                      <button key={m.type} className="builder-add-item" role="menuitem" onClick={() => handleQuickAdd(m.type)}>
                        <AddIcon type={m.type} />
                        <span className="builder-add-text"><strong>{m.label}</strong><small>{m.hint}</small></span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="builder-logout-btn" onClick={handleLogout} title="Abmelden">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
      {mcAchievement && <MCToast text={mcAchievement} />}
      {errorToast && <ErrorToast text={errorToast} />}

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div className="builder-body">

        {/* LEFT: Canvas editor OR device preview */}
        <div className="builder-canvas-pane" ref={previewRef} onClick={handleCanvasClick}>
          <div className="builder-canvas-frame">
            <div className={`device-frame device-${device}`}>
            <PublicSite
              content={draft}
              editMode={true}
              reviews={testimonials}
              onTextChange={(field, value) => update(field, value)}
              onImageClick={handleImageClick}
              onUpdate={(field, value) => update(field, value)}
              selectedProductId={editingProduct ?? undefined}
              onProductClick={(id) => {
                setEditingProduct(id)
                setActiveTab('products')
                setTimeout(() => {
                  panelBodyRef.current?.querySelector('[data-prod-selected]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }, 60)
              }}
              onProductDblClick={openProduct}
              onSectionClick={(tab: string) => { setActiveTab(tab as PanelTab); setPanelOpen(true) }}
            />
            </div>
          </div>
        </div>

        {/* RIGHT: zweites Feld (Inhalt des gewählten Bereichs) */}
        <aside className={`builder-panel builder-flyout${panelOpen ? '' : ' is-closed'}`} style={{ width: panelOpen ? panelWidth : 0, ['--flyout-w' as string]: `${panelWidth}px` }} aria-hidden={!panelOpen} inert={!panelOpen}>
          <div className="builder-panel-resize" onMouseDown={startPanelResize} />
          <div className="builder-flyout-head">
            <div className="builder-flyout-heading">
              <span className="builder-flyout-title">{tabGroups.flatMap(g => g.tabs).find(t => t.id === activeTab)?.label}</span>
              <span className="builder-flyout-hint">{PANEL_HINTS[activeTab]}</span>
            </div>
            <button className="builder-flyout-close" onClick={() => setPanelOpen(false)} title="Zuklappen" aria-label="Zuklappen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Panel content */}
          {uploadError && <div className="panel-saving-error" style={{ padding: '6px 12px' }}>{uploadErrorMsg || 'Bild-Upload fehlgeschlagen — bitte nochmal versuchen'}</div>}
          <div className="builder-panel-body" ref={panelBodyRef} key={activeTab}>

            {/* ── PRODUCTS TAB ──────────────────────────────────────────── */}
            {activeTab === 'products' && (
              <div className="panel-products">

                <div className="panel-product-list">
                  {(draft.products?.items ?? []).map(p => (
                    <div
                      key={p.id}
                      className={`panel-product-row${editingProduct === p.id ? ' panel-product-row--active' : ''}`}
                      data-prod-selected={editingProduct === p.id ? true : undefined}
                      onClick={() => openProduct(p.id)}
                    >
                      <div className="panel-product-thumb">
                        {p.image ? <img src={p.image} alt={p.name} /> : <div className="panel-product-thumb-empty" />}
                      </div>
                      <div className="panel-product-info">
                        <div className="panel-product-name">{p.name}</div>
                        <div className="panel-product-meta">{p.category} &nbsp;·&nbsp; {p.price}</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── HERO TAB ──────────────────────────────────────────────── */}
            {activeTab === 'hero' && (
              <>
                <PanelSection title="Hintergrundbild">
                  <UploadRow src={draft.hero?.image ?? ''} onUpload={() => handleImageClick('hero.image')} uploading={uploading && uploadTarget === 'hero.image'} />
                </PanelSection>
                <PanelSection title="Kleiner Text über der Überschrift">
                  <Field label="Text">
                    <input value={draft.hero?.tag ?? ''} onChange={e => update('hero.tag', e.target.value)} placeholder="Direktimporteur · Graz · Österreich" />
                  </Field>
                </PanelSection>
                <PanelSection title="Hauptüberschrift">
                  {(() => {
                    const h = splitHeadline(draft.hero?.headline ?? '')
                    return (
                      <>
                        <Field label="Erste Zeile">
                          <input value={h.line1} onChange={e => update('hero.headline', joinHeadline(e.target.value, h.accent))} placeholder="Elektromobilität." />
                        </Field>
                        <Field label="Zweite Zeile (farbig hervorgehoben)">
                          <input value={h.accent} onChange={e => update('hero.headline', joinHeadline(h.line1, e.target.value))} placeholder="Jetzt." />
                        </Field>
                      </>
                    )
                  })()}
                  <Field label="Text darunter">
                    <textarea rows={3} value={draft.hero?.subheadline ?? ''} onChange={e => update('hero.subheadline', e.target.value)} />
                  </Field>
                </PanelSection>
                <PanelSection title="Buttons">
                  <Field label="Button 1 Text">
                    <input value={draft.hero?.ctaLabel ?? ''} onChange={e => update('hero.ctaLabel', e.target.value)} />
                  </Field>
                  <Field label="Button 1 führt zu">
                    <select value={draft.hero?.ctaHref ?? ''} onChange={e => update('hero.ctaHref', e.target.value)}>
                      {HERO_LINK_TARGETS.some(t => t.href === (draft.hero?.ctaHref ?? '')) ? null : <option value={draft.hero?.ctaHref ?? ''}>{draft.hero?.ctaHref ? `Eigener Link (${draft.hero.ctaHref})` : 'Bitte wählen'}</option>}
                      {HERO_LINK_TARGETS.map(t => <option key={t.href} value={t.href}>{t.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Button 2 Text">
                    <input value={draft.hero?.ctaSecLabel ?? ''} onChange={e => update('hero.ctaSecLabel', e.target.value)} placeholder="optional" />
                  </Field>
                </PanelSection>
                <PanelSection title="Logo">
                  <UploadRow src={draft.nav?.logo ?? ''} onUpload={() => handleImageClick('nav.logo')} uploading={uploading && uploadTarget === 'nav.logo'} />
                </PanelSection>
                <PanelSection title="Telefon (Nav)">
                  <Field label="Nummer">
                    <input value={draft.nav?.phone ?? ''} onChange={e => update('nav.phone', e.target.value)} />
                  </Field>
                </PanelSection>
              </>
            )}

            {/* ── NEWS TAB ──────────────────────────────────────────────── */}
            {activeTab === 'news' && (
              <div className="panel-products">
                {editingNewsItem ? (
                  <div className="panel-product-form">
                    <button className="panel-back-btn" onClick={() => setEditingNews(null)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                      Zur Liste
                    </button>
                    <div className="panel-product-img-area" onClick={() => uploadNewsImage(editingNewsItem.id)}>
                      {editingNewsItem.image
                        ? <img src={editingNewsItem.image} alt={editingNewsItem.title} />
                        : <div className="panel-product-img-empty">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <span>Bild (optional)</span>
                          </div>
                      }
                      <div className="panel-product-img-overlay">Bild ändern</div>
                    </div>
                    <Field label="Datum">
                      <input type="date" value={editingNewsItem.date} onChange={e => updateNews(editingNewsItem.id, 'date', e.target.value)} />
                    </Field>
                    <Field label="Titel">
                      <input value={editingNewsItem.title} onChange={e => updateNews(editingNewsItem.id, 'title', e.target.value)} />
                    </Field>
                    <Field label="Text">
                      <textarea rows={4} value={editingNewsItem.body} onChange={e => updateNews(editingNewsItem.id, 'body', e.target.value)} />
                    </Field>
                    <button className="panel-delete-btn" onClick={() => deleteNews(editingNewsItem.id)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      Eintrag löschen
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="panel-product-list">
                      {(draft.news?.items ?? []).map(n => (
                        <div key={n.id} className="panel-product-row" onClick={() => setEditingNews(n.id)}>
                          <div className="panel-product-info">
                            <div className="panel-product-name">{n.title}</div>
                            <div className="panel-product-meta">{n.date}</div>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── CONTACT TAB ───────────────────────────────────────────── */}
            {activeTab === 'contact' && (
              <>
                <PanelSection title="Kontaktdaten">
                  <Field label="Titel">
                    <input value={draft.contact?.title ?? ''} onChange={e => update('contact.title', e.target.value)} />
                  </Field>
                  <Field label="E-Mail">
                    <input type="email" value={draft.contact?.email ?? ''} onChange={e => update('contact.email', e.target.value)} />
                  </Field>
                  <Field label="Telefon">
                    <input value={draft.contact?.phone ?? ''} onChange={e => update('contact.phone', e.target.value)} />
                  </Field>
                  <Field label="Adresse">
                    <textarea rows={2} value={draft.contact?.address ?? ''} onChange={e => update('contact.address', e.target.value)} />
                  </Field>
                </PanelSection>
                <PanelSection title="WhatsApp">
                  <Field label="Nummer (int. Format)">
                    <input value={draft.whatsapp?.number ?? ''} onChange={e => update('whatsapp.number', e.target.value)} placeholder="+436641234567" />
                  </Field>
                  <Field label="Vorausgefüllte Nachricht">
                    <textarea rows={2} value={draft.whatsapp?.message ?? ''} onChange={e => update('whatsapp.message', e.target.value)} />
                  </Field>
                  <Field label="">
                    <label className="panel-checkbox">
                      <input type="checkbox" checked={draft.whatsapp?.enabled ?? false} onChange={e => update('whatsapp.enabled', e.target.checked)} />
                      WhatsApp-Button anzeigen
                    </label>
                  </Field>
                </PanelSection>
                <PanelSection title="Karte">
                  <Field label="Google-Maps-Link zum Einbetten">
                    <textarea rows={2} value={draft.contact?.mapSrc ?? ''} onChange={e => update('contact.mapSrc', e.target.value)} placeholder="https://maps.google.com/maps?q=…&output=embed" />
                  </Field>
                  <Field label="">
                    <label className="panel-checkbox">
                      <input type="checkbox" checked={draft.contact?.formEnabled ?? false} onChange={e => update('contact.formEnabled', e.target.checked)} />
                      Kontaktformular anzeigen
                    </label>
                  </Field>
                </PanelSection>
                <PanelSection title="Partner-Standort (optional)">
                  <Field label="Name">
                    <input value={draft.contact?.partnerShop?.name ?? ''} onChange={e => update('contact.partnerShop', { ...(draft.contact?.partnerShop ?? {}), name: e.target.value })} placeholder="z.B. Bikely Wien" />
                  </Field>
                  <Field label="Telefon">
                    <input value={draft.contact?.partnerShop?.phone ?? ''} onChange={e => update('contact.partnerShop', { ...(draft.contact?.partnerShop ?? {}), phone: e.target.value })} placeholder="+43 …" />
                  </Field>
                  <Field label="Adresse">
                    <textarea rows={2} value={draft.contact?.partnerShop?.address ?? ''} onChange={e => update('contact.partnerShop', { ...(draft.contact?.partnerShop ?? {}), address: e.target.value })} placeholder="Straße Nr, PLZ Ort" />
                  </Field>
                  <Field label="Google-Maps-Link zum Einbetten">
                    <textarea rows={2} value={draft.contact?.partnerShop?.mapSrc ?? ''} onChange={e => update('contact.partnerShop', { ...(draft.contact?.partnerShop ?? {}), mapSrc: e.target.value })} placeholder="https://maps.google.com/maps?q=…&output=embed" />
                  </Field>
                </PanelSection>
              </>
            )}

            {/* ── CATEGORIES TAB ────────────────────────────────────────── */}
            {activeTab === 'categories' && (
              <div className="panel-products">
                {editingCat ? (
                  <div className="panel-product-form">
                    <button className="panel-back-btn" onClick={() => setEditingCategory(null)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                      Zur Liste
                    </button>
                    <div className="panel-product-img-area" onClick={() => uploadCategoryImage(editingCat.id)}>
                      {editingCat.image
                        ? <img src={editingCat.image} alt={editingCat.name} />
                        : <div className="panel-product-img-empty">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <span>Kategoriebild hochladen</span>
                          </div>
                      }
                      <div className="panel-product-img-overlay">Bild ändern</div>
                    </div>
                    <Field label="Name">
                      <input value={editingCat.name} onChange={e => updateCategory(editingCat.id, 'name', e.target.value)} />
                    </Field>
                    <Field label="Untertitel">
                      <input value={editingCat.sub ?? ''} onChange={e => updateCategory(editingCat.id, 'sub', e.target.value)} placeholder="z.B. 12 Modelle" />
                    </Field>
                    <Field label="Link (optional)">
                      <input value={editingCat.href ?? ''} onChange={e => updateCategory(editingCat.id, 'href', e.target.value)} placeholder="#ebikes" />
                    </Field>
                    <button className="panel-delete-btn" onClick={() => deleteCategory(editingCat.id)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      Kategorie löschen
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="panel-product-list">
                      {(draft.categories?.items ?? []).map(c => (
                        <div key={c.id} className="panel-product-row" onClick={() => setEditingCategory(c.id)}>
                          <div className="panel-product-thumb">
                            {c.image ? <img src={c.image} alt={c.name} /> : <div className="panel-product-thumb-empty" />}
                          </div>
                          <div className="panel-product-info">
                            <div className="panel-product-name">{c.name}</div>
                            <div className="panel-product-meta">{c.sub}</div>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── TRUST TAB ─────────────────────────────────────────────── */}
            {activeTab === 'trust' && (
              <div className="panel-products">
                <div className="panel-inline-list">
                  {(draft.trust?.items ?? []).map((t, i) => (
                    <EntryCard
                      key={t.id} index={i + 1} what="Dieser Vorteil" onDelete={() => deleteTrustItem(t.id)}
                      head={<input className="entry-title-input" value={t.bold} placeholder="Hervorgehobenes Wort, z. B. 5–7 Tage" onChange={e => updateTrustItem(t.id, 'bold', e.target.value)} />}
                    >
                      <Field label="Text dahinter">
                        <input value={t.text} onChange={e => updateTrustItem(t.id, 'text', e.target.value)} placeholder="Versand österreichweit" />
                      </Field>
                      <Field label="Symbol">
                        <select value={t.icon} onChange={e => updateTrustItem(t.id, 'icon', e.target.value)}>
                          {TRUST_ICON_OPTS.map(ic => (
                            <option key={ic.id} value={ic.id}>{ic.label}</option>
                          ))}
                        </select>
                      </Field>
                    </EntryCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── USP TAB ───────────────────────────────────────────────── */}
            {activeTab === 'usp' && (
              <div className="panel-products">
                <div className="panel-inline-list">
                  {(draft.usp?.items ?? []).map((u, i) => (
                    <FeatureCard
                      key={u.id} index={i + 1} item={u} what="Dieser Pluspunkt"
                      onChange={(f, v) => updateUspItem(u.id, f, v)}
                      onUploadIcon={() => handleImageClick(`usp.items.${i}.icon`)}
                      uploading={uploading && uploadTarget === `usp.items.${i}.icon`}
                      onDelete={() => deleteUspItem(u.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── STYLE TAB ─────────────────────────────────────────────── */}
            {activeTab === 'style' && (
              <>
                <PanelSection title="Farben">
                  <ColorRow label="Primärfarbe" value={draft.meta?.primaryColor ?? '#0099CC'} onChange={v => update('meta.primaryColor', v)} />
                  <ColorRow label="Akzentfarbe" value={draft.meta?.accentColor ?? '#B3E600'} onChange={v => update('meta.accentColor', v)} />
                </PanelSection>
                <PanelSection title="Schrift">
                  <div className="panel-field">
                    <select value={draft.meta?.font ?? ''} onChange={e => update('meta.font', e.target.value)}>
                      <option value="system-ui, -apple-system, sans-serif">System Standard</option>
                      <option value="'Inter', sans-serif">Inter</option>
                      <option value="'Georgia', serif">Georgia</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica Neue</option>
                    </select>
                  </div>
                </PanelSection>
                <PanelSection title="Google-Suche">
                  <Field label="Seitentitel">
                    <input value={draft.meta?.title ?? ''} onChange={e => update('meta.title', e.target.value)} />
                  </Field>
                  <Field label="Beschreibung">
                    <textarea rows={2} value={draft.meta?.description ?? ''} onChange={e => update('meta.description', e.target.value)} />
                  </Field>
                </PanelSection>
                <PanelSection title="Sichtbarkeit">
                  {([
                    { id: 'trust' as SectionId, label: 'Vertrauensleiste' },
                    { id: 'categories' as SectionId, label: 'Kategorien' },
                    { id: 'products' as SectionId, label: 'Produkte (Rasteransicht)' },
                    { id: 'usp' as SectionId, label: 'Pluspunkte' },
                    { id: 'news' as SectionId, label: 'Aktuelles (News)' },
                    { id: 'location' as SectionId, label: 'Standort & Kontakt' },
                  ] as { id: SectionId; label: string }[]).map(s => {
                    const hidden = (draft.hiddenSections ?? []).includes(s.id)
                    return (
                      <label key={s.id} className="panel-checkbox" style={{ justifyContent: 'space-between' }}>
                        <span>{s.label}</span>
                        <input
                          type="checkbox"
                          checked={!hidden}
                          onChange={e => {
                            const cur = draft.hiddenSections ?? []
                            update('hiddenSections', e.target.checked ? cur.filter(x => x !== s.id) : [...cur, s.id])
                          }}
                        />
                      </label>
                    )
                  })}
                </PanelSection>
                <PanelSection title="Footer">
                  <Field label="Copyright">
                    <input value={draft.footer?.copyright ?? ''} onChange={e => update('footer.copyright', e.target.value)} />
                  </Field>
                  <Field label="Tagline">
                    <input value={draft.footer?.tagline ?? ''} onChange={e => update('footer.tagline', e.target.value)} />
                  </Field>
                </PanelSection>
              </>
            )}

            {/* ── PAGES TAB ─────────────────────────────────────────────── */}
            {activeTab === 'pages' && (() => {
              const editingPageItem = editingPage ? (draft.pages ?? []).find(p => p.id === editingPage) : null
              return (
                <div className="panel-products">
                  {editingPageItem ? (
                    <div className="panel-product-form">
                      <button className="panel-back-btn" onClick={() => setEditingPage(null)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Zur Liste
                      </button>
                      <Field label="Titel">
                        <input value={editingPageItem.title} onChange={e => updatePage(editingPageItem.id, 'title', e.target.value)} />
                      </Field>
                      <label className="menu-switch-row">
                        <span>Im Menü oben anzeigen</span>
                        <span className="menu-switch">
                          <input type="checkbox" checked={pageInMenu(editingPageItem)} onChange={e => setPageInMenu(editingPageItem.id, e.target.checked)} />
                          <span className="menu-switch-track" />
                        </span>
                      </label>
                      <Field label="Seiteninhalt">
                        <RteField value={editingPageItem.body} onChange={html => updatePage(editingPageItem.id, 'body', html)} />
                      </Field>
                      <details className="nav-more">
                        <summary>Erweitert: Kurzname und Google-Titel</summary>
                      <Field label="Kurzname der Seite (Teil des Links)">
                        <input value={editingPageItem.slug} onChange={e => updatePage(editingPageItem.id, 'slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="meine-seite" />
                      </Field>
                      <Field label="">
                        <div style={{ padding: '7px 10px', background: '#f5f9ff', borderRadius: 7, fontSize: 12, color: '#0099CC', fontFamily: 'monospace' }}>
                          Link: <strong>#p/{editingPageItem.slug}</strong>
                        </div>
                      </Field>
                      <Field label="Titel in der Google-Suche (optional)">
                        <input value={editingPageItem.metaTitle ?? ''} onChange={e => updatePage(editingPageItem.id, 'metaTitle', e.target.value)} placeholder={`${editingPageItem.title} — ${draft.meta?.title ?? ''}`} />
                      </Field>
                      </details>
                      <button className="panel-delete-btn" onClick={() => deletePage(editingPageItem.id)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        Seite löschen
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={`menu-list${menuDrag ? ' is-sorting' : ''}`} ref={menuListRef}>
                        {navEntries.map((en, i) => {
                          const dragging = menuDrag?.from === i
                          const shift = menuDrag && !dragging
                            ? (menuDrag.from < i && i <= menuDrag.over ? -1 : menuDrag.over <= i && i < menuDrag.from ? 1 : 0)
                            : 0
                          const style = shift ? { transform: `translateY(${shift * 100}%) translateY(${shift * 8}px)` } : undefined
                          if (en.kind === 'divider') return (
                            <div key="divider" data-nav-row className="menu-divider" style={style}><span>Nicht im Menü</span></div>
                          )
                          const inMenu = i < navEntries.findIndex(e => e.kind === 'divider')
                          return (
                            <div key={en.href + i} data-nav-row className={`menu-row${inMenu ? '' : ' menu-row--idle'}${dragging ? ' is-dragging' : ''}`} style={style}>
                              <span
                                className="menu-grip" title="Ziehen zum Verschieben" aria-hidden="true"
                                onPointerDown={e => {
                                  e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId)
                                  navDragRef.current = { from: i, over: i }; setMenuDrag({ from: i, over: i })
                                }}
                                onPointerMove={e => {
                                  const d = navDragRef.current; if (!d) return
                                  const over = navOverAt(e.clientY, d.from)
                                  if (over !== d.over) { navDragRef.current = { ...d, over }; setMenuDrag({ ...d, over }) }
                                }}
                                onPointerUp={e => {
                                  const d = navDragRef.current; navDragRef.current = null; setMenuDrag(null)
                                  if (d) reorderNav(d.from, navOverAt(e.clientY, d.from))
                                }}
                                onPointerCancel={() => { navDragRef.current = null; setMenuDrag(null) }}
                              >
                                <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor"><circle cx="3" cy="3" r="1.6"/><circle cx="9" cy="3" r="1.6"/><circle cx="3" cy="9" r="1.6"/><circle cx="9" cy="9" r="1.6"/><circle cx="3" cy="15" r="1.6"/><circle cx="9" cy="15" r="1.6"/></svg>
                              </span>
                              {inMenu
                                ? <input className="menu-row-name" value={en.label} placeholder="Name im Menü" onChange={e => renameMenuItem(i, e.target.value)} aria-label="Name im Menü" />
                                : <span className="menu-row-name menu-row-name--static">{en.label}</span>}
                              {en.page && (
                                <button type="button" className="menu-row-edit" onClick={() => setEditingPage(en.page!.id)} aria-label={`${en.label} bearbeiten`} title="Seite bearbeiten">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="menu-actions">
                        <button type="button" className="review-add-btn" onClick={() => setAddModal('page')}>+ Neue Seite</button>
                      </div>

                      <details className="nav-more">
                        <summary>Logo, Telefon, Knopf und Fußzeile</summary>
                <PanelSection title="Name oben links">
                  <Field label="Anzeigename">
                    <input value={draft.nav?.brand ?? ''} onChange={e => update('nav.brand', e.target.value)} />
                  </Field>
                </PanelSection>
                <PanelSection title="Logo">
                  <UploadRow src={draft.nav?.logo ?? ''} onUpload={() => handleImageClick('nav.logo')} uploading={uploading && uploadTarget === 'nav.logo'} />
                </PanelSection>
                <PanelSection title="Telefonnummer oben">
                  <Field label="Nummer">
                    <input value={draft.nav?.phone ?? ''} onChange={e => update('nav.phone', e.target.value)} placeholder="+43 664 000 0000" />
                  </Field>
                </PanelSection>
                <PanelSection title="Hauptknopf">
                  <Field label="Button Text">
                    <input value={draft.nav?.ctaLabel ?? ''} onChange={e => update('nav.ctaLabel', e.target.value)} placeholder="Jetzt kontaktieren" />
                  </Field>
                  <Field label="Button Link">
                    <input value={draft.nav?.ctaHref ?? ''} onChange={e => update('nav.ctaHref', e.target.value)} placeholder="#contact" />
                  </Field>
                </PanelSection>
                <PanelSection title="Footer">
                  <Field label="Copyright">
                    <input value={draft.footer?.copyright ?? ''} onChange={e => update('footer.copyright', e.target.value)} />
                  </Field>
                  <Field label="Tagline">
                    <input value={draft.footer?.tagline ?? ''} onChange={e => update('footer.tagline', e.target.value)} />
                  </Field>
                  <Field label="Beschreibung">
                    <textarea rows={2} value={draft.footer?.description ?? ''} onChange={e => update('footer.description', e.target.value)} />
                  </Field>
                </PanelSection>
                      </details>
                    </>
                  )}
                </div>
              )
            })()}

            {/* ── INBOX TAB ─────────────────────────────────────────────── */}
            {activeTab === 'inbox' && (
              <div style={{ padding: 14 }}>
                {contactInbox.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
                    Keine neuen Anfragen.
                  </div>
                ) : (
                  contactInbox.map(item => (
                    <div key={item.ts} style={{ background: 'var(--panel-surface, #f8f8f8)', borderRadius: 10, padding: 14, marginBottom: 12, border: '1px solid var(--panel-border, #e8e8e8)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                          <a href={`mailto:${item.email}`} style={{ fontSize: 12, color: '#0099CC' }}>{item.email}</a>
                          {item.phone && <div style={{ fontSize: 12, color: '#666' }}>{item.phone}</div>}
                        </div>
                        <div style={{ fontSize: 10, color: '#aaa', whiteSpace: 'nowrap' }}>{new Date(item.ts).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      {item.message && <p style={{ fontSize: 12, margin: '8px 0 10px', color: '#444', lineHeight: 1.5 }}>{item.message}</p>}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a href={`mailto:${item.email}?subject=Re: Ihre Anfrage`} className="panel-add-btn" style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none' }}>Antworten</a>
                        <button className="panel-delete-btn" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => dismissInboxItem(item.ts)}>Erledigt</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}


            {/* ── ABOUT TAB ─────────────────────────────────────────────── */}
            {activeTab === 'about' && (
              <div className="panel-sections">
                <PanelSection title="Text">
                  <Field label="Kleiner Text darüber">
                    <input className="panel-input" value={draft.about?.eyebrow ?? ''} onChange={e => setDraft(d => ({ ...d, about: { ...(d.about ?? { headline: '', bio: '' }), eyebrow: e.target.value } }))} />
                  </Field>
                  <Field label="Überschrift">
                    <input className="panel-input" value={draft.about?.headline ?? ''} onChange={e => setDraft(d => ({ ...d, about: { ...(d.about ?? { headline: '', bio: '' }), headline: e.target.value } }))} />
                  </Field>
                  <Field label="Bio / Text">
                    <textarea className="panel-input panel-textarea" rows={5} value={draft.about?.bio ?? ''} onChange={e => setDraft(d => ({ ...d, about: { ...(d.about ?? { headline: '', bio: '' }), bio: e.target.value } }))} />
                  </Field>
                </PanelSection>
                <PanelSection title="Foto">
                  <UploadRow src={draft.about?.photo ?? ''} onUpload={() => handleImageClick('about.photo')} uploading={uploading && uploadTarget === 'about.photo'} />
                  {draft.about?.photo && <button className="panel-back-btn" style={{ marginTop: 6 }} onClick={() => setDraft(d => ({ ...d, about: { ...(d.about ?? { headline: '', bio: '' }), photo: '' } }))}>Foto entfernen</button>}
                </PanelSection>
                <PanelSection title="Kennzahlen">
                  {(draft.about?.stats ?? []).map((s: AboutStat, i: number) => (
                    <div key={i} className="panel-row-inline">
                      <input className="panel-input" style={{ width: 80 }} placeholder="Wert" value={s.value}
                        onChange={e => setDraft(d => { const stats = [...(d.about?.stats ?? [])]; stats[i] = { ...stats[i], value: e.target.value }; return { ...d, about: { ...(d.about ?? { headline: '', bio: '' }), stats } } })} />
                      <input className="panel-input" placeholder="Bezeichnung" value={s.label}
                        onChange={e => setDraft(d => { const stats = [...(d.about?.stats ?? [])]; stats[i] = { ...stats[i], label: e.target.value }; return { ...d, about: { ...(d.about ?? { headline: '', bio: '' }), stats } } })} />
                      <button className="panel-remove-btn" onClick={() => setDraft(d => { const stats = (d.about?.stats ?? []).filter((_: AboutStat, j: number) => j !== i); return { ...d, about: { ...(d.about ?? { headline: '', bio: '' }), stats } } })}>Entf.</button>
                    </div>
                  ))}
                </PanelSection>
              </div>
            )}

            {/* ── PRICING TAB ───────────────────────────────────────────── */}
            {activeTab === 'pricing' && (
              <div className="panel-sections">
                <PanelSection title="Preisübersicht">
                  <Field label="Überschrift">
                    <input className="panel-input" value={draft.pricing?.title ?? ''} onChange={e => setDraft(d => ({ ...d, pricing: { ...(d.pricing ?? { title: '', body: '' }), title: e.target.value } }))} />
                  </Field>
                  <Field label="Text / Preistabelle">
                    <RteField value={draft.pricing?.body ?? ''} onChange={html => setDraft(d => ({ ...d, pricing: { ...(d.pricing ?? { title: '', body: '' }), body: html } }))} />
                  </Field>
                </PanelSection>
                <PanelSection title="Zertifikate / Auszeichnungen">
                  {(draft.certificates?.items ?? []).map((cert: CertificateItem, i: number) => (
                    <div key={cert.id} className="panel-cert-row">
                      <input className="panel-input" placeholder="Titel" value={cert.title}
                        onChange={e => setDraft(d => { const items = [...(d.certificates?.items ?? [])]; items[i] = { ...items[i], title: e.target.value }; return { ...d, certificates: { ...(d.certificates ?? { items: [] }), items } } })} />
                      <input className="panel-input" placeholder="Untertitel" value={cert.subtitle}
                        onChange={e => setDraft(d => { const items = [...(d.certificates?.items ?? [])]; items[i] = { ...items[i], subtitle: e.target.value }; return { ...d, certificates: { ...(d.certificates ?? { items: [] }), items } } })} />
                      <button className="panel-remove-btn" onClick={() => setDraft(d => { const items = (d.certificates?.items ?? []).filter((_: CertificateItem, j: number) => j !== i); return { ...d, certificates: { ...(d.certificates ?? { items: [] }), items } } })}>Entf.</button>
                    </div>
                  ))}
                </PanelSection>
              </div>
            )}

            {/* ── REVIEWS TAB ───────────────────────────────────────────── */}
            {activeTab === 'reviews' && (
              <div className="panel-products">
                {testimonialsSaving && <div className="review-status review-status--busy">Speichert…</div>}
                {testimonialsSaveError && <div className="review-status review-status--error">Speichern hat nicht geklappt. Bitte gleich nochmal versuchen.</div>}
                {testimonialsJustSaved && !testimonialsSaving && !testimonialsSaveError && <div className="review-status">Gespeichert. In etwa zwei Minuten steht es auf der Website.</div>}
                {testimonials.length === 0 && <p className="review-empty">Noch keine Reviews. Mit dem grünen Knopf legst du die erste an.</p>}
                <div className="panel-inline-list">
                  {testimonials.map(r => (
                    <button key={r.id} type="button" className="review-row" onClick={() => setEditReview(r)} title="Zum Bearbeiten anklicken">
                      <span className="review-row-stars" aria-label={`${r.rating} von 5 Sternen`}>{'★'.repeat(r.rating)}<i>{'★'.repeat(5 - r.rating)}</i></span>
                      <span className="review-row-name">{r.name}</span>
                      <span className="review-row-text">{r.text}</span>
                      <span className="review-row-edit">Bearbeiten</span>
                    </button>
                  ))}
                </div>
                <button type="button" className="review-add-btn" onClick={() => setAddModal('testimonial')}>+ Review hinzufügen</button>
              </div>
            )}

          </div>

        </aside>

        {/* RIGHT: schmale Icon-Leiste wie in einem Betriebssystem */}
        <nav className="builder-rail" aria-label="Bereiche" ref={railRef}>
          <span className="builder-rail-pill" aria-hidden="true" />
          {tabGroups.flatMap(g => g.tabs).map(t => (
            <button
              key={t.id}
              className={`builder-rail-item${activeTab === t.id && panelOpen ? ' active' : ''}`}
              onClick={() => {
                if (activeTab === t.id && panelOpen) { setPanelOpen(false); return }
                if (t.id === 'pages') setEditingPage(null)
                setActiveTab(t.id); setPanelOpen(true); scrollPreviewTo(t.id)
              }}
            >
              <RailIcon id={t.id} />
              <span className="builder-rail-label">{t.label}</span>
              {(t.badge ?? 0) > 0 && <span className="builder-rail-badge">{t.badge}</span>}
            </button>
          ))}
        </nav>
      </div>

      {(isDirty || saved || saveError) && (
        <div className="builder-savebar" role="status" aria-live="polite">
          <span className="builder-savebar-text">
            {saveError ? 'Speichern fehlgeschlagen' : saved && !isDirty ? 'Gespeichert, die Seite wird aktualisiert' : 'Noch nicht gespeichert'}
          </span>
          <button className="builder-discard-btn" onClick={handleDiscard} disabled={!isDirty || saving}>Verwerfen</button>
          <button
            className={`builder-save-btn ${saving ? 'loading' : ''} ${saved ? 'done' : ''} ${saveError ? 'error' : ''}`}
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            {saving ? 'Speichern …' : saveError ? 'Nochmal versuchen' : 'Speichern'}
          </button>
        </div>
      )}

      {editReview && (
        <AddModal
          key={`review-${editReview.id}`}
          form={{ ...addFormFor('testimonial', draft), title: 'Review bearbeiten', submit: 'Speichern', hint: 'Änderungen werden sofort gespeichert und erscheinen auf der Website.' }}
          initial={{ name: editReview.name, rating: String(editReview.rating), text: editReview.text, date: editReview.date }}
          deleteWhat="Diese Review"
          onClose={() => setEditReview(null)}
          onDelete={() => { removeTestimonial(editReview.id); setEditReview(null) }}
          onSubmit={v => { updateTestimonial({ ...editReview, name: v.name.trim(), rating: Number(v.rating) || 5, text: v.text.trim(), date: v.date?.trim() ?? '' }); setEditReview(null) }}
        />
      )}
      {addModal && (
        <AddModal key={addModal} form={addFormFor(addModal, draft)} onClose={() => setAddModal(null)} onSubmit={v => createItem(addModal, v)} />
      )}

      {/* ── PRODUCT EDIT MODAL ──────────────────────────────────────────── */}
      {productModal && (() => {
        const mp = draft.products?.items?.find(p => p.id === productModal)
        if (!mp) return null
        return (
          <ProductEditModal
            product={mp}
            draft={draft}
            saving={saving}
            isNew={mp.id === newProductId}
            onUpdate={updateProduct}
            onDelete={(id) => { deleteProduct(id); setProductModal(null) }}
            onUpload={uploadProductImage}
            onDropFiles={addProductImages}
            onSetImages={setProductImages}
            uploading={uploading}
            onClose={closeProductModal}
            onPublish={async () => { await handleSave(); setNewProductId(null) }}
          />
        )
      })()}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel-section">
      {title && <div className="panel-section-title">{title}</div>}
      {children}
    </div>
  )
}

function RteField({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  return (
    <div className="rte-wrap">
      <div className="rte-toolbar">
        {[
          { cmd: 'bold', label: 'Fett', title: 'Markierten Text fett machen' },
          { cmd: 'italic', label: 'Kursiv', title: 'Markierten Text kursiv machen' },
          { cmd: 'insertUnorderedList', label: 'Liste', title: 'Aufzählung mit Punkten' },
        ].map(({ cmd, label, title }) => (
          <button key={cmd} type="button" title={title}
            onMouseDown={e => { e.preventDefault(); document.execCommand(cmd, false) }}
          >{label}</button>
        ))}
      </div>
      <div
        className="rte-body"
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
        onBlur={e => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="panel-field">
      {label && <label>{label}</label>}
      {children}
    </div>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="panel-color-row">
      <input type="color" value={value} onChange={e => onChange(e.target.value)} />
      <span className="panel-color-label">{label}</span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className="panel-color-hex" />
    </div>
  )
}

function UploadRow({ src, onUpload, uploading }: { src: string; onUpload: () => void; uploading: boolean }) {
  return (
    <div className="panel-upload-row">
      {src && <img src={src} alt="" className="panel-upload-thumb" />}
      <button className="panel-upload-btn" onClick={onUpload} disabled={uploading}>
        {uploading ? 'Hochladen…' : src ? 'Ändern' : 'Hochladen'}
      </button>
    </div>
  )
}

function SpecsTableField({ rows, onChange }: { rows: { label: string; value: string }[]; onChange: (rows: { label: string; value: string }[]) => void }) {
  const [labelInput, setLabelInput] = useState('')
  const [valueInput, setValueInput] = useState('')

  const addRow = () => {
    const label = labelInput.trim()
    const value = valueInput.trim()
    if (!label && !value) return
    onChange([...rows, { label: label || '...', value: value || '' }])
    setLabelInput('')
    setValueInput('')
  }

  const updateRow = (idx: number, field: 'label' | 'value', val: string) => {
    onChange(rows.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }

  const removeRow = (idx: number) => {
    onChange(rows.filter((_, i) => i !== idx))
  }

  return (
    <div className="pem-specs-table-field">
      <div className="pem-specs-table-rows">
        {(rows ?? []).map((row, idx) => (
          <div key={idx} className="pem-specs-table-row">
            <input
              className="pem-variant-label-input"
              value={row.label}
              placeholder="Bezeichnung"
              onChange={e => updateRow(idx, 'label', e.target.value)}
            />
            <input
              className="pem-variant-opt-value-input"
              value={row.value}
              placeholder="Wert"
              onChange={e => updateRow(idx, 'value', e.target.value)}
            />
            <button
              className="pem-variant-del"
              type="button"
              title="Zeile entfernen"
              onClick={() => removeRow(idx)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ))}
      </div>
      <div className="pem-specs-add-row" style={{ marginTop: 10 }}>
        <input
          value={labelInput}
          onChange={e => setLabelInput(e.target.value)}
          placeholder="Bezeichnung"
          style={{ flex: 1, minWidth: 0 }}
        />
        <input
          value={valueInput}
          onChange={e => setValueInput(e.target.value)}
          placeholder="Wert"
          style={{ flex: 1.2, minWidth: 0 }}
        />
        <button className="pem-tag-add" onClick={addRow} type="button">+</button>
      </div>
    </div>
  )
}

// ── Product Edit Modal ─────────────────────────────────────────────────────────

function ProductEditModal({
  product, draft, saving, isNew, onUpdate, onDelete, onUpload, onDropFiles, onSetImages, uploading, onClose, onPublish,
}: {
  product: ProductItem
  draft: SiteContent
  saving: boolean
  isNew: boolean
  onUpdate: (id: string, field: keyof ProductItem, value: unknown) => void
  onDelete: (id: string) => void
  onUpload: (id: string) => void
  onDropFiles: (id: string, files: File[]) => void
  onSetImages: (id: string, images: string[]) => void
  uploading: boolean
  onClose: () => void
  onPublish: () => Promise<void>
}) {
  const gallery = product.images?.length ? product.images : (product.image ? [product.image] : [])
  const [shown, setShown] = useState(0)
  const [dropHover, setDropHover] = useState(false)
  const mainImg = gallery[Math.min(shown, gallery.length - 1)] ?? ''
  const dropProps = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDropHover(true) },
    onDragLeave: () => setDropHover(false),
    onDrop: (e: React.DragEvent) => { e.preventDefault(); setDropHover(false); onDropFiles(product.id, Array.from(e.dataTransfer.files)) },
  }
  const makeMain = (i: number) => { onSetImages(product.id, [gallery[i], ...gallery.filter((_, j) => j !== i)]); setShown(0) }
  const removeImg = (i: number) => { onSetImages(product.id, gallery.filter((_, j) => j !== i)); setShown(0) }
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [specsInput, setSpecsInput] = useState('')
  const [showMissing, setShowMissing] = useState(false)

  const categories = draft.categories?.items?.map(c => c.name) ?? []
  const subcats = draft.categories?.items?.find(c => c.name === product.category)?.subcategories ?? []
  const u = (field: keyof ProductItem, val: unknown) => onUpdate(product.id, field, val)
  const nameMissing = !product.name.trim()

  const addSpec = () => {
    const val = specsInput.trim()
    if (!val) return
    u('specs', [...(product.specs ?? []), val])
    setSpecsInput('')
  }

  const removeSpec = (i: number) => {
    u('specs', (product.specs ?? []).filter((_, idx) => idx !== i))
  }

  const handlePublish = async () => {
    if (nameMissing) { setShowMissing(true); return }
    setPublishing(true)
    await onPublish()
    setPublishing(false)
    onClose()
  }

  const iconX = <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

  return (
    <div className="pem-overlay" onClick={onClose}>
      <div className="pem pem-wide" onClick={e => e.stopPropagation()}>

        <div className="pem-header">
          <span className="pem-title">{isNew ? 'Neues Produkt' : 'Produkt bearbeiten'}</span>
          <button className="pem-close" onClick={onClose} title="Schließen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="pem-body">

          <div className="pem-gallery">
            <button type="button" className={`pem-img-drop${mainImg ? ' has-img' : ''}${dropHover ? ' is-drop' : ''}`} {...dropProps}
              onClick={() => onUpload(product.id)} title="Fotos hinzufügen">
              {mainImg
                ? <img src={mainImg} alt={product.name} />
                : <span className="pem-img-empty">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <strong>Fotos hochladen</strong>
                    <small>Klicken oder Fotos hierher ziehen, auch mehrere auf einmal</small>
                  </span>}
              {uploading && <span className="pem-img-busy">Lädt hoch…</span>}
              {mainImg && !uploading && <span className="pem-img-change">Weitere Fotos hinzufügen</span>}
            </button>
            {gallery.length > 0 && (
              <div className="pem-thumbs" {...dropProps}>
                {gallery.map((src, i) => (
                  <div key={src + i} className={`pem-thumb${i === shown ? ' is-shown' : ''}`} onMouseEnter={() => setShown(i)}>
                    <img src={src} alt="" />
                    {i === 0
                      ? <span className="pem-thumb-main">Hauptbild</span>
                      : <button type="button" className="pem-thumb-make" onClick={() => makeMain(i)}>Als Hauptbild</button>}
                    <button type="button" className="pem-thumb-del" onClick={() => removeImg(i)} title="Foto entfernen" aria-label="Foto entfernen">{iconX}</button>
                  </div>
                ))}
                <button type="button" className="pem-thumb pem-thumb-add" onClick={() => onUpload(product.id)} title="Fotos hinzufügen">+</button>
              </div>
            )}
          </div>

          <div className="pem-fields">

            <section className="pem-section">
              <div className="pem-field">
                <label>Titel</label>
                <input
                  autoFocus={isNew}
                  className={showMissing && nameMissing ? 'is-invalid' : ''}
                  value={product.name}
                  onChange={e => u('name', e.target.value)}
                  placeholder="z. B. E-Bike City Plus"
                />
                {showMissing && nameMissing && <span className="pem-add-error">Bitte einen Titel eingeben</span>}
              </div>
              <div className="pem-row pem-row-2">
                <div className="pem-field">
                  <label>Preis</label>
                  <input value={product.price} onChange={e => u('price', e.target.value)} onBlur={e => u('price', formatPriceEuro(e.target.value))} placeholder="z. B. 1299" />
                </div>
                <div className="pem-field">
                  <label>Statt-Preis (durchgestrichen)</label>
                  <input value={product.regularPrice ?? ''} onChange={e => u('regularPrice', e.target.value)} onBlur={e => u('regularPrice', formatPriceEuro(e.target.value))} placeholder="nur wenn reduziert" />
                </div>
              </div>
              <div className={subcats.length > 0 ? 'pem-row pem-row-2' : ''}>
                <div className="pem-field">
                  <label>Kategorie</label>
                  <select value={product.category} onChange={e => { u('category', e.target.value); u('subcategory', '') }}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    {!categories.includes(product.category) && (
                      <option value={product.category}>{product.category}</option>
                    )}
                  </select>
                </div>
                {subcats.length > 0 && (
                  <div className="pem-field">
                    <label>Unterkategorie</label>
                    <select value={product.subcategory ?? ''} onChange={e => u('subcategory', e.target.value)}>
                      <option value="">keine</option>
                      {subcats.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="pem-field">
                <label>Hinweis auf dem Foto (optional)</label>
                <input value={product.badge ?? ''} onChange={e => u('badge', e.target.value)} placeholder="z. B. Neu, Bestseller, Aktion" />
              </div>
            </section>

            <section className="pem-section">
              <h4>Beschreibung</h4>
              <div className="pem-field">
                <label>Kurzbeschreibung</label>
                <RteField value={product.description} onChange={html => u('description', html)} />
              </div>
              <div className="pem-field">
                <label>Details</label>
                <RteField value={product.details ?? ''} onChange={html => u('details', html)} />
              </div>
              <div className="pem-field">
                <label>Lieferung</label>
                <RteField value={product.delivery ?? ''} onChange={html => u('delivery', html)} />
              </div>
            </section>

            <section className="pem-section">
              <h4>Ausführungen</h4>
              <p className="pem-section-hint">Zum Beispiel Farben oder Batterien, auf Wunsch mit Aufpreis.</p>
              {(product.variants ?? []).map((v, vi) => (
                <div key={vi} className="pem-variant-group">
                  <div className="pem-variant-row">
                    <input
                      className="pem-variant-label-input"
                      value={v.label}
                      placeholder="Bezeichnung, z. B. Batterie"
                      onChange={e => u('variants', (product.variants ?? []).map((vv, i) => i === vi ? { ...vv, label: e.target.value } : vv))}
                    />
                    <button type="button" className="pem-variant-del" onClick={() => u('variants', (product.variants ?? []).filter((_, i) => i !== vi))} title="Ausführung entfernen">{iconX}</button>
                  </div>
                  {v.options.map((opt, oi) => (
                    <div key={oi} className="pem-variant-opt-row">
                      <input
                        className="pem-variant-opt-value-input"
                        value={opt.value}
                        placeholder="z. B. 40Ah"
                        onChange={e => u('variants', (product.variants ?? []).map((vv, i) => i === vi ? { ...vv, options: vv.options.map((oo, j) => j === oi ? { ...oo, value: e.target.value } : oo) } : vv))}
                      />
                      <input
                        className="pem-variant-opt-price-input"
                        value={opt.price ?? ''}
                        placeholder="Aufpreis, z. B. +150 €"
                        onChange={e => u('variants', (product.variants ?? []).map((vv, i) => i === vi ? { ...vv, options: vv.options.map((oo, j) => j === oi ? { ...oo, price: e.target.value } : oo) } : vv))}
                      />
                      <button type="button" className="pem-variant-del" title="Option entfernen"
                        onClick={() => u('variants', (product.variants ?? []).map((vv, i) => i === vi ? { ...vv, options: vv.options.filter((_, j) => j !== oi) } : vv))}
                      >{iconX}</button>
                    </div>
                  ))}
                  <button type="button" className="pem-variant-opt-add"
                    onClick={() => u('variants', (product.variants ?? []).map((vv, i) => i === vi ? { ...vv, options: [...vv.options, { value: '', price: '' }] } : vv))}
                  >Option hinzufügen</button>
                </div>
              ))}
              <button type="button" className="pem-variant-add" onClick={() => u('variants', [...(product.variants ?? []), { label: '', options: [{ value: '', price: '' }] }])}>
                Ausführung hinzufügen
              </button>
            </section>

            <section className="pem-section">
              <h4>Technische Daten</h4>
              <div className="pem-field">
                <label>Kurze Merkmale</label>
                <div className="pem-tags">
                  {(product.specs ?? []).map((s, i) => (
                    <span key={i} className="pem-tag">
                      {s}
                      <button type="button" onClick={() => removeSpec(i)} title="Entfernen">{iconX}</button>
                    </span>
                  ))}
                </div>
                <div className="pem-tag-input-row">
                  <input
                    value={specsInput}
                    onChange={e => setSpecsInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpec() } }}
                    placeholder="z. B. 45 km/h, dann Enter"
                  />
                  <button type="button" className="pem-tag-add" onClick={addSpec}>+</button>
                </div>
              </div>
              <div className="pem-field">
                <label>Tabelle Produktinformationen</label>
                <SpecsTableField rows={product.specsTable ?? []} onChange={rows => u('specsTable', rows)} />
              </div>
            </section>
          </div>
        </div>

        <div className="pem-footer">
          {isNew ? (
            <button className="pem-btn-ghost" onClick={onClose}>Abbrechen</button>
          ) : confirmDelete ? (
            <div className="pem-delete-confirm">
              <span>Wirklich löschen?</span>
              <button className="pem-btn-danger" onClick={() => onDelete(product.id)}>Ja, löschen</button>
              <button className="pem-btn-ghost" onClick={() => setConfirmDelete(false)}>Abbrechen</button>
            </div>
          ) : (
            <button className="pem-btn-danger" onClick={() => setConfirmDelete(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Löschen
            </button>
          )}
          <div className="pem-footer-right">
            {!isNew && <button className="pem-btn-ghost" onClick={onClose}>Schließen</button>}
            <button className="pem-btn-primary pem-btn-green" onClick={handlePublish} disabled={saving || publishing}>
              {publishing ? 'Wird gespeichert …' : isNew ? 'Produkt veröffentlichen' : 'Speichern & veröffentlichen'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
