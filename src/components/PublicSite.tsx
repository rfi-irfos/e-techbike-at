import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import type { SiteContent, SectionId, CanvasPos, NewsItem } from '../types/content'
import { useTheme, type Theme } from '../hooks/useTheme'
import { useLang, type Lang } from '../hooks/useLang'
import { InquiryModal } from './InquiryModal'

// ── Edit context ─────────────────────────────────────────────────────────────

interface EditCtx {
  editMode: boolean
  onTextChange: (field: string, value: string) => void
  onImageClick: (field: string) => void
  onUpdate: (field: string, value: unknown) => void
  setFocusedEl: (el: HTMLElement | null) => void
}
const Ctx = createContext<EditCtx>({
  editMode: false,
  onTextChange: () => {},
  onImageClick: () => {},
  onUpdate: () => {},
  setFocusedEl: () => {},
})

// ── Inline-edit primitives ────────────────────────────────────────────────────

type TagName = keyof React.JSX.IntrinsicElements

interface EProps {
  field: string
  value: string
  as?: TagName
  className?: string
  style?: React.CSSProperties
  href?: string
  title?: string
}

function E({ field, value, as, className, style, href, title }: EProps) {
  const { editMode, onTextChange, setFocusedEl } = useContext(Ctx)
  const Tag = (as ?? 'span') as TagName
  // Freeze innerHTML while the element is focused so re-renders don't reset selection/cursor
  const isEditingRef = useRef(false)
  const htmlRef = useRef({ __html: value })
  if (!isEditingRef.current) htmlRef.current = { __html: value }

  if (!editMode) {
    const props: Record<string, unknown> = { className, style, dangerouslySetInnerHTML: { __html: value }, 'data-cid': field }
    if (href) props.href = href
    if (title) props.title = title
    return <Tag {...props} />
  }

  const editProps: Record<string, unknown> = {
    className: `${className ?? ''} editable-text`,
    style,
    'data-cid': field,
    contentEditable: true,
    suppressContentEditableWarning: true,
    dangerouslySetInnerHTML: htmlRef.current,
    onFocus: (e: React.FocusEvent<HTMLElement>) => { isEditingRef.current = true; setFocusedEl(e.currentTarget) },
    onInput: (e: React.FormEvent<HTMLElement>) => { onTextChange(field, e.currentTarget.innerHTML) },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      isEditingRef.current = false
      setFocusedEl(null)
      onTextChange(field, e.currentTarget.innerHTML)
    },
  }
  if (href) editProps.href = href
  return <Tag {...editProps} />
}

interface EImgProps {
  field: string
  src: string
  alt?: string
  className?: string
  style?: React.CSSProperties
}

function EImg({ field, src, alt = '', className, style }: EImgProps) {
  const { editMode, onImageClick } = useContext(Ctx)
  if (!src && !editMode) return null
  if (!editMode) return <img src={src} alt={alt} className={className} style={style} data-cid={field} />
  return (
    <div className="editable-img-wrap" style={{ display: 'contents' }} onClick={() => onImageClick(field)} data-cid={field}>
      {src
        ? <img src={src} alt={alt} className={`${className ?? ''} editable-img`} style={style} />
        : <div className={`editable-img-placeholder ${className ?? ''}`} style={style}>Bild hochladen</div>}
      <div className="editable-img-badge">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      </div>
    </div>
  )
}

// ── Format toolbar ────────────────────────────────────────────────────────────

// Module-level saved range — survives re-renders between mousedown and click
let _fmtSavedRange: Range | null = null

function FormatToolbar({ anchorEl }: { anchorEl: HTMLElement | null }) {
  if (!anchorEl) return null
  const rect = anchorEl.getBoundingClientRect()
  const tbW = 330
  const left = Math.max(8, Math.min(rect.left + rect.width / 2 - tbW / 2, window.innerWidth - tbW - 8))
  const top = rect.top < 60 ? rect.bottom + 6 : rect.top - 48

  const exec = (cmd: string, val?: string) => {
    // Restore focus and selection before applying command
    anchorEl.focus()
    if (_fmtSavedRange) {
      const sel = window.getSelection()
      if (sel) { sel.removeAllRanges(); sel.addRange(_fmtSavedRange) }
    }
    // produce CSS spans (not legacy <font>) so colour/size actually render
    if (cmd === 'foreColor' || cmd === 'fontSize') { try { document.execCommand('styleWithCSS', false, 'true') } catch { /* noop */ } }
    document.execCommand(cmd, false, val)
  }

  const onTbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault() // prevent focus loss
    // Save the current selection so we can restore it in exec()
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) _fmtSavedRange = sel.getRangeAt(0).cloneRange()
  }

  return (
    <div className="format-toolbar" style={{ position: 'fixed', top, left, width: tbW, zIndex: 9999 }} onMouseDown={onTbMouseDown}>
      <button type="button" className="fmt-btn fmt-b" onClick={() => exec('bold')}>B</button>
      <button type="button" className="fmt-btn fmt-i" onClick={() => exec('italic')}>I</button>
      <button type="button" className="fmt-btn fmt-u" onClick={() => exec('underline')}>U</button>
      <button type="button" className="fmt-btn fmt-s" onClick={() => exec('strikeThrough')}>S</button>
      <div className="fmt-sep" />
      <button type="button" className="fmt-btn" onClick={() => exec('justifyLeft')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg></button>
      <button type="button" className="fmt-btn" onClick={() => exec('justifyCenter')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg></button>
      <div className="fmt-sep" />
      <button type="button" className="fmt-btn fmt-size-s" onClick={() => exec('fontSize', '2')}>S</button>
      <button type="button" className="fmt-btn" onClick={() => exec('fontSize', '4')}>M</button>
      <button type="button" className="fmt-btn fmt-size-l" onClick={() => exec('fontSize', '5')}>L</button>
      <div className="fmt-sep" />
      <label className="fmt-color-btn" onMouseDown={e => e.stopPropagation()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
        <input type="color" defaultValue="#111111" onChange={e => { exec('foreColor', e.target.value) }} className="fmt-color-input" />
      </label>
    </div>
  )
}

// ── Canvas element (drag wrapper) ─────────────────────────────────────────────

interface CanvasElProps {
  id: string
  pos: CanvasPos
  onMove: (p: CanvasPos) => void
  children: React.ReactNode
  minWidth?: number
  noPad?: boolean
  label?: string
}

function CanvasEl({ id, pos, onMove, children, minWidth = 160, noPad, label }: CanvasElProps) {
  const elRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ mx: number; my: number; sx: number; sy: number } | null>(null)

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragState.current = { mx: e.clientX, my: e.clientY, sx: pos.x, sy: pos.y }

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragState.current || !elRef.current) return
      elRef.current.style.left = `${dragState.current.sx + ev.clientX - dragState.current.mx}px`
      elRef.current.style.top  = `${dragState.current.sy + ev.clientY - dragState.current.my}px`
    }
    const onMouseUp = (ev: MouseEvent) => {
      if (!dragState.current) return
      const nx = dragState.current.sx + ev.clientX - dragState.current.mx
      const ny = dragState.current.sy + ev.clientY - dragState.current.my
      dragState.current = null
      onMove({ x: nx, y: ny })
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      ref={elRef}
      data-cid={id}
      className={`canvas-el${noPad ? ' canvas-el-nopad' : ''}`}
      style={{ position: 'absolute', left: pos.x, top: pos.y, minWidth }}
    >
      {label && <div className="canvas-el-label">{label}</div>}
      <div className="canvas-el-grip" onMouseDown={startDrag} title="Ziehen zum Verschieben">
        <svg width="10" height="16" viewBox="0 0 10 24" fill="currentColor">
          <circle cx="3" cy="4"  r="1.8"/><circle cx="7" cy="4"  r="1.8"/>
          <circle cx="3" cy="12" r="1.8"/><circle cx="7" cy="12" r="1.8"/>
          <circle cx="3" cy="20" r="1.8"/><circle cx="7" cy="20" r="1.8"/>
        </svg>
      </div>
      {children}
    </div>
  )
}

// ── SVG icons ─────────────────────────────────────────────────────────────────

function IconDelivery() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
}
function IconShield() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
}
function IconTag() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2.5"/></svg>
}
function IconLocation() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function IconPhone() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.95-.96a2 2 0 0 1 2.1-.45c.908.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
}
function IconMail() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
}

function TrustIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'delivery': return <IconDelivery />
    case 'shield':   return <IconShield />
    case 'tag':      return <IconTag />
    case 'location': return <IconLocation />
    default:         return <IconShield />
  }
}

// ── Contact form ──────────────────────────────────────────────────────────────

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const key = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined
    if (!key) {
      // Fallback: open mailto pre-filled
      const body = encodeURIComponent(`Name: ${form.name}\nTelefon: ${form.phone}\n\n${form.message}`)
      window.location.href = `mailto:graz@bikelyshop.at?subject=Kontaktanfrage von ${encodeURIComponent(form.name)}&body=${body}`
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: key,
          subject: `Kontaktanfrage von ${form.name}`,
          ...form,
        }),
      })
      const data = await res.json()
      setStatus(data.success ? 'ok' : 'err')
    } catch {
      setStatus('err')
    }
  }

  if (status === 'ok') {
    return (
      <div className="site-contact-form-success">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p>Danke! Wir melden uns bald bei Ihnen.</p>
      </div>
    )
  }

  return (
    <form className="site-contact-form" onSubmit={submit}>
      <div className="site-contact-form-row">
        <input placeholder="Ihr Name" required value={form.name} onChange={e => set('name', e.target.value)} />
        <input placeholder="E-Mail-Adresse" type="email" required value={form.email} onChange={e => set('email', e.target.value)} />
      </div>
      <input placeholder="Telefon (optional)" value={form.phone} onChange={e => set('phone', e.target.value)} />
      <textarea placeholder="Ihre Nachricht …" rows={4} required value={form.message} onChange={e => set('message', e.target.value)} />
      <button type="submit" disabled={status === 'sending'} className="site-contact-form-btn">
        {status === 'sending' ? 'Wird gesendet…' : 'Nachricht senden'}
      </button>
      {status === 'err' && <p className="site-contact-form-err">Fehler beim Senden. Bitte versuchen Sie es erneut.</p>}
    </form>
  )
}

// ── WhatsApp button ───────────────────────────────────────────────────────────

function WhatsAppButton({ number, message, hidden }: { number: string; message: string; hidden?: boolean }) {
  const href = `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
  return (
    <a className={`site-whatsapp-btn${hidden ? ' site-whatsapp-btn--hidden' : ''}`} href={href} target="_blank" rel="noopener noreferrer" title="WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.118 1.533 5.851L0 24l6.335-1.513A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.843 0-3.57-.49-5.062-1.346L2.5 21.5l.854-3.375A9.944 9.944 0 0 1 2 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    </a>
  )
}

// ── Theme toggle (light / dark / high-contrast) ───────────────────────────────

function IconSun() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
}
function IconMoon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
}
function IconContrast() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18z" fill="currentColor"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>
}
function IconMenu() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
}
function IconClose() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}

const THEME_OPTS: { id: Theme; label: string; icon: React.ReactNode }[] = [
  { id: 'light', label: 'Helles Design', icon: <IconSun /> },
  { id: 'dark', label: 'Dunkles Design', icon: <IconMoon /> },
  { id: 'hc', label: 'Hoher Kontrast', icon: <IconContrast /> },
]

function ThemeToggle({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  return (
    <div className="theme-toggle" role="group" aria-label="Farbschema wählen">
      {THEME_OPTS.map(o => (
        <button
          key={o.id}
          type="button"
          className={`theme-toggle-btn ${theme === o.id ? 'active' : ''}`}
          aria-pressed={theme === o.id}
          aria-label={o.label}
          title={o.label}
          onClick={() => setTheme(o.id)}
        >
          {o.icon}
        </button>
      ))}
    </div>
  )
}

// ── Category Browser (3-level drill-down) ────────────────────────────────────

type BrowserLevel = 'categories' | 'subcategories' | 'products'

function IconChevron() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
}
function IconBack() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
}

function CategoryBrowser({ categories, products }: {
  categories: SiteContent['categories']
  products: SiteContent['products']
}) {
  const [level, setLevel] = useState<BrowserLevel>('categories')
  const [activeCatId, setActiveCatId] = useState<string | null>(null)
  const [activeSubId, setActiveSubId] = useState<string | null>(null)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)

  const activeCat = categories.items.find(c => c.id === activeCatId)
  const subcats = activeCat?.subcategories ?? []

  const visibleProducts = products.items.filter(p => {
    if (!activeCat) return false
    if (p.category !== activeCat.name) return false
    if (activeSubId && p.subcategory !== activeSubId) return false
    return true
  })

  const activeSub = subcats.find(s => s.id === activeSubId)

  function drillCat(catId: string) {
    const cat = categories.items.find(c => c.id === catId)
    setActiveCatId(catId)
    setActiveSubId(null)
    if (cat?.subcategories?.length) {
      setLevel('subcategories')
    } else {
      setLevel('products')
    }
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function drillSub(subId: string) {
    setActiveSubId(subId)
    setLevel('products')
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function goBack() {
    if (level === 'products' && subcats.length > 0) {
      setActiveSubId(null)
      setLevel('subcategories')
    } else {
      setActiveCatId(null)
      setActiveSubId(null)
      setLevel('categories')
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (level === 'categories') return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (dx > 60 && Math.abs(dy) < Math.abs(dx)) goBack()
  }

  return (
    <section
      className="site-section site-browser"
      id="products"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {categories.eyebrow && level === 'categories' && <div className="site-eyebrow">{categories.eyebrow}</div>}
      <div className="site-browser-header">
        {level !== 'categories' && (
          <button className="site-browser-back" onClick={goBack}>
            <IconBack />
            Zurück
          </button>
        )}
        <h2 className="site-browser-title">
          {level === 'categories' && categories.title}
          {level === 'subcategories' && activeCat?.name}
          {level === 'products' && (activeSub?.name ?? activeCat?.name)}
        </h2>
        {level !== 'categories' && (
          <nav className="site-browser-breadcrumb" aria-label="Breadcrumb">
            <button onClick={() => { setActiveCatId(null); setActiveSubId(null); setLevel('categories') }}>Sortiment</button>
            {activeCat && (
              <>
                <IconChevron />
                {level === 'products' && subcats.length > 0
                  ? <button onClick={() => { setActiveSubId(null); setLevel('subcategories') }}>{activeCat.name}</button>
                  : <span>{activeCat.name}</span>
                }
              </>
            )}
            {activeSub && (
              <>
                <IconChevron />
                <span>{activeSub.name}</span>
              </>
            )}
          </nav>
        )}
      </div>

      {/* Level 1: Main categories */}
      {level === 'categories' && (
        <div className="site-browser-cat-grid">
          {categories.items.map(c => (
            <button key={c.id} className="site-browser-cat-tile" onClick={() => drillCat(c.id)}>
              <div className="site-browser-cat-img-wrap">
                {c.image
                  ? <img src={c.image} alt={c.name} className="site-browser-cat-img" />
                  : <div className="site-browser-cat-img-ph" />
                }
                <div className="site-browser-cat-overlay">
                  <span className="site-browser-cat-name">{c.name}</span>
                  <span className="site-browser-cat-sub">{c.sub}</span>
                  {(c.subcategories?.length ?? 0) === 0 && (
                    <span className="site-browser-cat-count">
                      {products.items.filter(p => p.category === c.name).length} Artikel
                    </span>
                  )}
                </div>
              </div>
              <div className="site-browser-cat-foot">
                <span className="site-browser-cat-foot-name">{c.name}</span>
                <span className="site-browser-cat-foot-arrow"><IconChevron /></span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Level 2: Subcategories */}
      {level === 'subcategories' && (
        <div className="site-browser-subcat-grid">
          {subcats.map(sc => {
            const count = products.items.filter(p => p.subcategory === sc.id).length
            return (
              <button key={sc.id} className="site-browser-subcat-tile" onClick={() => drillSub(sc.id)}>
                <div className="site-browser-subcat-img-wrap">
                  {sc.image
                    ? <img src={sc.image} alt={sc.name} className="site-browser-subcat-img" />
                    : <div className="site-browser-subcat-img-ph" />
                  }
                </div>
                <div className="site-browser-subcat-body">
                  <span className="site-browser-subcat-name">{sc.name}</span>
                  {sc.description && <span className="site-browser-subcat-desc">{sc.description}</span>}
                  {count > 0 && <span className="site-browser-subcat-count">{count} Artikel</span>}
                </div>
                <IconChevron />
              </button>
            )
          })}
        </div>
      )}

      {/* Level 3: Product list */}
      {level === 'products' && (
        visibleProducts.length === 0
          ? <p className="site-browser-empty">Keine Produkte in dieser Kategorie. Bitte kontaktieren Sie uns für eine persönliche Beratung.</p>
          : (
            <div className="site-browser-prodlist">
              {visibleProducts.map(p => (
                <a key={p.id} className="site-browser-prodcard" href={`#product/${p.id}`}>
                  <div className="site-browser-prodcard-img-wrap">
                    {p.badge && <span className="site-browser-prodcard-badge">{p.badge}</span>}
                    {p.image
                      ? <img src={p.image} alt={p.name} className="site-browser-prodcard-img" />
                      : <div className="site-browser-prodcard-img-ph" />
                    }
                  </div>
                  <div className="site-browser-prodcard-body">
                    <span className="site-browser-prodcard-name">{p.name}</span>
                    {(p.specs?.length ?? 0) > 0 && (
                      <div className="site-browser-prodcard-specs">
                        {p.specs!.slice(0, 3).map((s, i) => <span key={i} className="site-spec">{s}</span>)}
                      </div>
                    )}
                    <div className="site-browser-prodcard-price-row">
                      <span className="site-browser-prodcard-price">{p.price}</span>
                      {p.regularPrice && <span className="site-browser-prodcard-price-old">{p.regularPrice}</span>}
                    </div>
                    <span className="site-browser-prodcard-cta">Details &amp; Anfrage</span>
                  </div>
                </a>
              ))}
            </div>
          )
      )}
    </section>
  )
}

// ── GDPR Cookie Banner ───────────────────────────────────────────────────────

const GDPR_KEY = 'cookieConsent'

function GdprBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(GDPR_KEY))
  if (!visible) return null
  const accept = () => { localStorage.setItem(GDPR_KEY, 'accepted'); setVisible(false) }
  const decline = () => { localStorage.setItem(GDPR_KEY, 'declined'); setVisible(false) }
  return (
    <div className="gdpr-banner" role="dialog" aria-label="Cookie-Einstellungen">
      <p className="gdpr-text">
        Wir verwenden Cookies für eine bessere Nutzererfahrung.{' '}
        <a href="#p/datenschutz" className="gdpr-link">Datenschutz</a>
      </p>
      <div className="gdpr-actions">
        <button type="button" className="gdpr-btn gdpr-btn-accept" onClick={accept}>Akzeptieren</button>
        <button type="button" className="gdpr-btn gdpr-btn-decline" onClick={decline}>Ablehnen</button>
      </div>
    </div>
  )
}

// ── USP Icons ────────────────────────────────────────────────────────────────

const USP_ICONS = [
  <svg key="u1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  <svg key="u2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  <svg key="u3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  <svg key="u4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  <svg key="u5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.5 9a3.5 4 0 1 0 0 6"/><line x1="6" y1="10" x2="12" y2="10"/><line x1="6" y1="14" x2="12" y2="14"/></svg>,
  <svg key="u6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
]

// ── Language toggle ────────────────────────────────────────────────────────────

const LANG_OPTS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'de', label: 'DE' },
  { id: 'hu', label: 'HU' },
]

function LanguageToggle() {
  const { lang, setLang, t } = useLang()
  return (
    <div className="lang-toggle" role="group" aria-label={t.language}>
      {LANG_OPTS.map(o => (
        <button
          key={o.id}
          type="button"
          className={`lang-toggle-btn ${lang === o.id ? 'active' : ''}`}
          aria-pressed={lang === o.id}
          onClick={() => setLang(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Category icons ────────────────────────────────────────────────────────────

function CategoryIcon({ category }: { category: string }) {
  const c = (category ?? '').toLowerCase()
  const cls = "site-cat-icon"
  if (c === 'english')
    return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  if (c === 'german' || c === 'deutsch')
    return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  if (c === 'exam prep' || c === 'prüfung' || c === 'vizsga')
    return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  if (c === 'hungarian' || c === 'ungarisch' || c === 'magyar' || c === 'gyerekek')
    return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  if (c === 'kids' || c === 'kinder' || c === 'kinder & jugendliche')
    return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}

// ── Public Site ───────────────────────────────────────────────────────────────

interface Props {
  content: SiteContent
  editMode?: boolean
  rearrangeMode?: boolean
  initPositions?: Record<string, CanvasPos>
  onTextChange?: (field: string, value: string) => void
  onImageClick?: (field: string) => void
  onUpdate?: (field: string, value: unknown) => void
  onSectionReorder?: (order: SectionId[]) => void
  onProductClick?: (id: string) => void
  onProductDblClick?: (id: string) => void
  onSectionClick?: (tab: string) => void
  selectedProductId?: string
}

export function PublicSite({
  content, editMode = false, rearrangeMode = false, initPositions = {},
  onTextChange, onImageClick, onUpdate, onProductClick, onProductDblClick, onSectionClick,
  selectedProductId,
}: Props) {
  const { meta, nav, hero, trust, categories, products, usp, news, contact, whatsapp, footer, pages } = content
  const hiddenSections = content.hiddenSections ?? []
  const pageNavLinks = (pages ?? []).filter(p => p.showInNav).map(p => ({ label: p.title, href: `#p/${p.slug}` }))

  const [focusedEl, setFocusedEl] = useState<HTMLElement | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalArticle, setModalArticle] = useState<NewsItem | null>(null)
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [inquiryProductId, setInquiryProductId] = useState<string | undefined>()
  const { t } = useLang()
  const openMenu = () => { history.pushState({ drawer: true }, ''); setMenuOpen(true) }
  const closeMenu = () => { setMenuOpen(false) }
  useEffect(() => {
    const onPop = (e: PopStateEvent) => { if (menuOpen) { e.preventDefault(); closeMenu() } }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [menuOpen])
  useEffect(() => {
    if (!modalArticle) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalArticle(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalArticle])

  const { theme, setTheme } = useTheme()
  const [heroBgPos, setHeroBgPos] = useState({ x: hero.bgX ?? 50, y: hero.bgY ?? 50 })
  const [heroHeight, setHeroHeight] = useState(hero.minHeight ?? 680)
  const heroDragRef  = useRef<{ startX: number; startY: number; startBgX: number; startBgY: number } | null>(null)
  const heightDragRef = useRef<{ startY: number; startH: number } | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)

  const vars = { '--primary': meta.primaryColor, '--accent': meta.accentColor, fontFamily: meta.font } as React.CSSProperties

  const ctx: EditCtx = {
    editMode,
    onTextChange: onTextChange ?? (() => {}),
    onImageClick: onImageClick ?? (() => {}),
    onUpdate:     onUpdate     ?? (() => {}),
    setFocusedEl,
  }

  // Hero bg drag
  useEffect(() => {
    if (rearrangeMode) return
    const onMove = (e: MouseEvent) => {
      if (!heroDragRef.current || !heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      setHeroBgPos({
        x: Math.max(0, Math.min(100, heroDragRef.current.startBgX - (e.clientX - heroDragRef.current.startX) / rect.width * 100)),
        y: Math.max(0, Math.min(100, heroDragRef.current.startBgY - (e.clientY - heroDragRef.current.startY) / rect.height * 100)),
      })
    }
    const onUp = () => {
      if (!heroDragRef.current) return // not a hero-drag mouseup, skip
      heroDragRef.current = null
      setHeroBgPos(p => { onUpdate?.('hero.bgX', p.x); onUpdate?.('hero.bgY', p.y); return p })
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  }, [rearrangeMode, onUpdate])

  // Hero height drag
  useEffect(() => {
    if (!heightDragRef.current) return
    const onMove = (e: MouseEvent) => {
      if (!heightDragRef.current) return
      setHeroHeight(Math.max(300, heightDragRef.current.startH + e.clientY - heightDragRef.current.startY))
    }
    const onUp = () => {
      heightDragRef.current = null
      setHeroHeight(h => { onUpdate?.('hero.minHeight', h); return h })
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  })

  // ── Canvas position helpers ─────────────────────────────────────────────────

  const savedPos = (content.positions ?? {}) as Record<string, CanvasPos>
  const pos = (id: string, fallback: CanvasPos): CanvasPos => savedPos[id] ?? initPositions[id] ?? fallback
  const moveEl = (id: string, p: CanvasPos) => onUpdate?.('positions', { ...savedPos, [id]: p })

  // ── Canvas render ────────────────────────────────────────────────────────────

  if (rearrangeMode) {
    const H = heroHeight
    const canvasBg: React.CSSProperties = {
      position: 'absolute', inset: 0, top: 0, left: 0, right: 0, height: H,
      background: hero.image
        ? `url(${hero.image}) ${heroBgPos.x}% ${heroBgPos.y}% / cover no-repeat`
        : meta.primaryColor,
      zIndex: 0,
    }

    // Section zone markers
    const zone = (label: string, y: number, h: number, color: string) => (
      <div style={{
        position: 'absolute', left: 0, right: 0, top: y, height: h,
        background: color, borderTop: '1px dashed #d0d0d0', pointerEvents: 'none',
        display: 'flex', alignItems: 'flex-start', paddingLeft: 8, paddingTop: 4,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#aaa', background: '#f8f9fa', padding: '2px 6px', borderRadius: 4 }}>{label}</span>
      </div>
    )

    return (
      <div style={vars} className="site-canvas">
        {/* Hero bg */}
        <div className="canvas-bg-band" style={canvasBg}
          onMouseDown={e => {
            e.preventDefault()
            heroDragRef.current = { startX: e.clientX, startY: e.clientY, startBgX: heroBgPos.x, startBgY: heroBgPos.y }
          }}
        >
          <div className="canvas-bg-hint">Hero-Bild ziehen um Position anzupassen</div>
        </div>

        {/* Zone markers */}
        {zone('Hero', 0, H, 'transparent')}
        {zone('Trust Strip', H, 90, 'rgba(17,17,17,.04)')}
        {zone('Kategorien', H + 90, 720, 'rgba(0,153,204,.02)')}
        {zone('Produkte', H + 810, 830, 'rgba(179,230,0,.03)')}
        {zone('Vorteile', H + 1640, 740, 'rgba(0,153,204,.02)')}
        {zone('Neuigkeiten', H + 2380, 580, 'rgba(179,230,0,.03)')}
        {zone('Standort', H + 2960, 500, 'rgba(0,0,0,.02)')}
        {zone('Footer', H + 3460, 250, 'rgba(17,17,17,.04)')}

        {/* NAV */}
        <header className="site-nav" style={{ position: 'sticky', top: 0, zIndex: 200 }}>
          <div className="site-nav-inner">
            {nav.logo ? <img src={nav.logo} alt={nav.brand} className="site-logo-img" /> : <span className="site-logo-text">{nav.brand}</span>}
            <nav className="site-main-nav">{nav.links.map((l, i) => <a key={i} href={l.href}>{l.label}</a>)}</nav>
            <div className="site-nav-right">
              {nav.phone && <span className="site-nav-phone">{nav.phone}</span>}
              {nav.ctaLabel && <a href={nav.ctaHref ?? '#'} className="site-nav-cta">{nav.ctaLabel}</a>}
            </div>
          </div>
        </header>

        {/* HERO ELEMENTS */}
        {hero.tag && (
          <CanvasEl id="hero.tag" pos={pos('hero.tag', { x: 80, y: 200 })} onMove={p => moveEl('hero.tag', p)} minWidth={300} noPad label="Hero Tag">
            <div className="site-hero-tag" dangerouslySetInnerHTML={{ __html: hero.tag }} />
          </CanvasEl>
        )}
        <CanvasEl id="hero.headline" pos={pos('hero.headline', { x: 80, y: 260 })} onMove={p => moveEl('hero.headline', p)} minWidth={400} noPad label="Überschrift">
          <h1 className="site-hero-h1" dangerouslySetInnerHTML={{ __html: hero.headline }} />
        </CanvasEl>
        <CanvasEl id="hero.subheadline" pos={pos('hero.subheadline', { x: 80, y: 390 })} onMove={p => moveEl('hero.subheadline', p)} minWidth={400} noPad label="Unterüberschrift">
          <p className="site-hero-sub" dangerouslySetInnerHTML={{ __html: hero.subheadline }} />
        </CanvasEl>
        <CanvasEl id="hero.cta" pos={pos('hero.cta', { x: 80, y: 490 })} onMove={p => moveEl('hero.cta', p)} minWidth={280} label="Buttons">
          <div className="site-hero-btns">
            <a className="site-btn-lime-lg" dangerouslySetInnerHTML={{ __html: hero.ctaLabel }} />
            {hero.ctaSecLabel && <a className="site-btn-ghost-lg" dangerouslySetInnerHTML={{ __html: hero.ctaSecLabel }} />}
          </div>
        </CanvasEl>

        {/* TRUST ITEMS */}
        {(trust?.items ?? []).map((t, i) => (
          <CanvasEl key={t.id} id={`trust.items.${i}`} pos={pos(`trust.items.${i}`, { x: 60 + i * 290, y: H + 20 })} onMove={p => moveEl(`trust.items.${i}`, p)} minWidth={240} label={`Trust ${i+1}`}>
            <div className="canvas-trust-item">
              <TrustIcon icon={t.icon} />
              <span><strong>{t.bold}</strong> {t.text}</span>
            </div>
          </CanvasEl>
        ))}

        {/* CATEGORIES TITLE */}
        <CanvasEl id="categories.title" pos={pos('categories.title', { x: 80, y: H + 140 })} onMove={p => moveEl('categories.title', p)} minWidth={300} noPad label="Kategorien Titel">
          <h2 className="canvas-section-h2" dangerouslySetInnerHTML={{ __html: categories?.title ?? '' }} />
        </CanvasEl>

        {/* CATEGORY CARDS */}
        {(categories?.items ?? []).map((c, i) => (
          <CanvasEl key={c.id} id={`categories.items.${i}`} pos={pos(`categories.items.${i}`, { x: 40 + (i % 3) * 388, y: H + 230 + Math.floor(i / 3) * 270 })} onMove={p => moveEl(`categories.items.${i}`, p)} minWidth={360} label={c.name}>
            <div className="canvas-cat-card">
              {c.image && <img src={c.image} alt={c.name} style={{ width: '100%', height: 120, objectFit: 'contain', background: '#f0f4f0', borderRadius: 6, padding: 8 }} />}
              <div style={{ padding: '8px 12px' }}>
                <div className="canvas-cat-name">{c.name}</div>
                <div className="canvas-cat-sub">{c.sub}</div>
              </div>
            </div>
          </CanvasEl>
        ))}

        {/* PRODUCTS TITLE */}
        <CanvasEl id="products.title" pos={pos('products.title', { x: 80, y: H + 870 })} onMove={p => moveEl('products.title', p)} minWidth={300} noPad label="Produkte Titel">
          <h2 className="canvas-section-h2" dangerouslySetInnerHTML={{ __html: products?.title ?? '' }} />
        </CanvasEl>

        {/* PRODUCT CARDS */}
        {(products?.items ?? []).map((p, i) => (
          <CanvasEl key={p.id} id={`products.items.${i}`} pos={pos(`products.items.${i}`, { x: 40 + (i % 3) * 388, y: H + 960 + Math.floor(i / 3) * 390 })} onMove={pp => moveEl(`products.items.${i}`, pp)} minWidth={360} label={p.name}>
            <div className="canvas-product-card">
              {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'contain', background: '#f7f7f7', borderRadius: 6, padding: 12 }} /> : <div style={{ height: 80, background: '#f0f0f0', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 12 }}>Kein Bild</div>}
              <div style={{ padding: '10px 12px' }}>
                {p.badge && <div className="canvas-pcard-badge">{p.badge}</div>}
                <div className="canvas-pcard-brand">{p.category}</div>
                <div className="canvas-pcard-name">{p.name}</div>
                <div className="canvas-pcard-price">{p.price}</div>
              </div>
            </div>
          </CanvasEl>
        ))}

        {/* USP TITLE */}
        <CanvasEl id="usp.title" pos={pos('usp.title', { x: 80, y: H + 1700 })} onMove={p => moveEl('usp.title', p)} minWidth={300} noPad label="Vorteile Titel">
          <h2 className="canvas-section-h2" dangerouslySetInnerHTML={{ __html: usp?.title ?? '' }} />
        </CanvasEl>

        {/* USP CARDS */}
        {(usp?.items ?? []).map((u, i) => (
          <CanvasEl key={u.id} id={`usp.items.${i}`} pos={pos(`usp.items.${i}`, { x: 40 + (i % 3) * 388, y: H + 1780 + Math.floor(i / 3) * 190 })} onMove={p => moveEl(`usp.items.${i}`, p)} minWidth={360} label={u.title}>
            <div className="canvas-usp-card">
              <h3>{u.title}</h3>
              <p>{u.description}</p>
            </div>
          </CanvasEl>
        ))}

        {/* NEWS TITLE */}
        <CanvasEl id="news.title" pos={pos('news.title', { x: 80, y: H + 2440 })} onMove={p => moveEl('news.title', p)} minWidth={300} noPad label="Neuigkeiten Titel">
          <h2 className="canvas-section-h2" dangerouslySetInnerHTML={{ __html: news?.title ?? '' }} />
        </CanvasEl>

        {/* NEWS CARDS */}
        {(news?.items ?? []).map((n, i) => (
          <CanvasEl key={n.id} id={`news.items.${i}`} pos={pos(`news.items.${i}`, { x: 40 + i * 388, y: H + 2520 })} onMove={p => moveEl(`news.items.${i}`, p)} minWidth={360} label={n.title}>
            <div className="canvas-news-card">
              <div className="canvas-news-date">{n.date}</div>
              <h3>{n.title}</h3>
              <p>{n.body}</p>
            </div>
          </CanvasEl>
        ))}

        {/* CONTACT BLOCK */}
        <CanvasEl id="contact.block" pos={pos('contact.block', { x: 640, y: H + 3010 })} onMove={p => moveEl('contact.block', p)} minWidth={520} label="Kontakt">
          <div className="canvas-contact-block">
            <h2>{contact?.title}</h2>
            {contact?.phone && <div className="canvas-citem"><IconPhone /> <a href={`tel:${contact.phone}`}>{contact.phone}</a></div>}
            {contact?.email && <div className="canvas-citem"><IconMail /> <a href={`mailto:${contact.email}`}>{contact.email}</a></div>}
            {contact?.address && <div className="canvas-citem"><IconLocation /> <span>{contact.address}</span></div>}
          </div>
        </CanvasEl>

        {/* FOOTER */}
        <CanvasEl id="footer.block" pos={pos('footer.block', { x: 0, y: H + 3520 })} onMove={p => moveEl('footer.block', p)} minWidth={900} noPad label="Footer">
          <footer className="site-footer" style={{ position: 'static', borderRadius: 8 }}>
            <div className="site-footer-bottom">
              <span>{footer?.brand} — {footer?.tagline}</span>
              <div className="site-footer-links">
                {(footer?.links ?? []).map((l, i) => <a key={i} href={l.href}>{l.label}</a>)}
              </div>
              <span>{footer?.copyright}</span>
            </div>
          </footer>
        </CanvasEl>
      </div>
    )
  }

  // ── Normal / Edit render ─────────────────────────────────────────────────────

  const heroStyle: React.CSSProperties = {
    minHeight: heroHeight,
    ...(hero.image ? { backgroundImage: `url(${hero.image})`, backgroundPosition: `${heroBgPos.x}% ${heroBgPos.y}%` } : {}),
  }

  return (
    <Ctx.Provider value={ctx}>
      <div style={vars} className="site" data-theme={theme}>
        {editMode && <FormatToolbar anchorEl={focusedEl} />}

        {/* ── NAV ──────────────────────────────────────────────────────── */}
        <header className="site-nav">
          <div className="site-nav-inner">
            {nav.logo
              ? <EImg field="nav.logo" src={nav.logo} alt={nav.brand} className="site-logo-img" />
              : <E field="nav.brand" value={nav.brand} as="span" className="site-logo-text" />
            }
            <nav className="site-main-nav">
              {nav.links.map((l, i) => (
                <E key={i} field={`nav.links.${i}.label`} value={l.label} as="a" href={l.href} />
              ))}
              {pageNavLinks.map((l, i) => (
                <a key={`page-${i}`} href={l.href}>{l.label}</a>
              ))}
            </nav>
            <div className="site-nav-right">
              <div className="site-nav-desktop">
                <ThemeToggle theme={theme} setTheme={setTheme} />
                {nav.phone && (
                  <a href={`tel:${nav.phone}`} className="site-nav-phone">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.95-.96a2 2 0 0 1 2.1-.45c.908.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <E field="nav.phone" value={nav.phone} as="span" />
                  </a>
                )}
                {nav.ctaLabel && (
                  <E field="nav.ctaLabel" value={nav.ctaLabel} as="a" href={nav.ctaHref ?? '#'} className="site-nav-cta" />
                )}
              </div>
              <div className="site-nav-lang-topbar">
                <LanguageToggle />
              </div>
              <button className="site-nav-burger" aria-label="Menü öffnen" aria-expanded={menuOpen} onClick={() => openMenu()}>
                <IconMenu />
              </button>
            </div>
          </div>
        </header>

        {/* ── MOBILE DRAWER (hamburger menu) ───────────────────────────── */}
        <div className={`site-mobile-scrim ${menuOpen ? 'open' : ''}`} onClick={() => closeMenu()} />
        <aside className={`site-mobile-drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
          {/* Header: brand | theme toggle + close */}
          <div className="site-mobile-drawer-top">
            <span className="site-mobile-drawer-brand">{nav.brand}</span>
            <div className="site-mobile-drawer-top-right">
              <ThemeToggle theme={theme} setTheme={setTheme} />
              <button className="site-mobile-close" aria-label="Menü schließen" onClick={() => closeMenu()}>
                <IconClose />
              </button>
            </div>
          </div>

          {/* Nav links */}
          <nav className="site-mobile-links">
            {nav.links.map((l, i) => (
              <a key={i} href={l.href} onClick={() => closeMenu()}>{l.label}</a>
            ))}
            {pageNavLinks.map((l, i) => (
              <a key={`page-${i}`} href={l.href} onClick={() => closeMenu()}>{l.label}</a>
            ))}
          </nav>

          <div className="site-mobile-divider" />

          {/* Contact: address + 2 CTA buttons */}
          <div className="site-mobile-contact">
            {contact.address && (
              <div className="site-mobile-addr">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {contact.address}
              </div>
            )}
            <div className="site-mobile-cta-row">
              {contact.phone && (
                <a href={`tel:${contact.phone.replace(/\s/g,'')}`} className="site-mobile-btn-call" onClick={() => closeMenu()}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.95-.96a2 2 0 0 1 2.1-.45c.908.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Anrufen
                </a>
              )}
              {contact.whatsapp && (
                <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="site-mobile-btn-wa" onClick={() => closeMenu()}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.118 1.533 5.851L0 24l6.335-1.513A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.843 0-3.57-.49-5.062-1.346L2.5 21.5l.854-3.375A9.944 9.944 0 0 1 2 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  WhatsApp
                </a>
              )}
            </div>
          </div>

        </aside>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section
          className="site-hero"
          style={heroStyle}
          ref={heroRef as React.RefObject<HTMLElement>}
          onMouseDown={e => {
            if (!editMode) return
            // don't hijack the drag when selecting/clicking editable text,
            // buttons or links — only drag from the bare hero background
            const el = e.target as HTMLElement
            if (el.isContentEditable || el.closest('.editable-text, .editable-img-wrap, button, a')) return
            heroDragRef.current = { startX: e.clientX, startY: e.clientY, startBgX: heroBgPos.x, startBgY: heroBgPos.y }
          }}
        >
          {editMode && (
            <div className="site-hero-controls">
              <button className="site-hero-swap-btn" onClick={() => onImageClick?.('hero.image')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Bild ändern
              </button>
            </div>
          )}
          <div className="site-hero-inner">
            {hero.tag && (
              <div className="site-hero-tag-wrap">
                <E field="hero.tag" value={hero.tag} as="div" className="site-hero-tag" />
              </div>
            )}
            <E field="hero.headline" value={hero.headline} as="h1" className="site-hero-h1" />
            <E field="hero.subheadline" value={hero.subheadline} as="p" className="site-hero-sub" />
            <div className="site-hero-btns">
              <E field="hero.ctaLabel" value={hero.ctaLabel} as="a" href={hero.ctaHref} className="site-btn-lime-lg" />
              {hero.ctaSecLabel && editMode && (
                <E field="hero.ctaSecLabel" value={hero.ctaSecLabel} as="a" href={hero.ctaSecHref ?? '#'} className="site-btn-ghost-lg" />
              )}
              {hero.ctaSecLabel && !editMode && (
                <button
                  type="button"
                  className="site-btn-ghost-lg"
                  dangerouslySetInnerHTML={{ __html: hero.ctaSecLabel }}
                  onClick={() => { setInquiryProductId(undefined); setInquiryOpen(true) }}
                />
              )}
            </div>
          </div>
          {editMode && (
            <div className="hero-resize-handle" onMouseDown={e => { e.preventDefault(); heightDragRef.current = { startY: e.clientY, startH: heroHeight } }} />
          )}
        </section>

        {/* ── TRUST STRIP ──────────────────────────────────────────────── */}
        {!hiddenSections.includes('trust') && (trust?.items?.length ?? 0) > 0 && (
          <div className={`site-trust${editMode ? ' site-edit-section' : ''}`} id="trust"
            onClick={editMode ? (e) => { e.stopPropagation(); onSectionClick?.('trust') } : undefined}>
            {editMode && <div className="site-edit-section-badge">Vertrauensleiste</div>}
            {trust.items.map((t, ti) => (
              <div key={t.id} className="site-trust-item">
                <TrustIcon icon={t.icon} />
                <span>
                  <E field={`trust.items.${ti}.bold`} value={t.bold} as="strong" />
                  {' '}<E field={`trust.items.${ti}.text`} value={t.text} as="span" />
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── CATEGORY BROWSER (3-level: cat → subcat → products) ── */}
        {!editMode && !hiddenSections.includes('categories') && (categories?.items?.length ?? 0) > 0 && (
          <CategoryBrowser categories={categories} products={products} />
        )}
        {editMode && !hiddenSections.includes('categories') && (categories?.items?.length ?? 0) > 0 && (
          <div className="site-edit-section site-edit-section--cats"
            onClick={e => { e.stopPropagation(); onSectionClick?.('categories') }}>
            <div className="site-edit-section-badge">Kategorien</div>
            <div className="site-edit-section-preview">
              {categories.items.slice(0, 4).map(c => (
                <div key={c.id} className="site-edit-cat-chip">{c.name}</div>
              ))}
              {categories.items.length > 4 && <div className="site-edit-cat-chip site-edit-cat-chip--more">+{categories.items.length - 4}</div>}
            </div>
          </div>
        )}

        {/* Edit mode: keep flat product grid for admin editing */}
        {editMode && !hiddenSections.includes('products') && (products?.items?.length ?? 0) > 0 && (
          <section className="site-section site-products" id="products">
            <div className="site-products-top">
              <E field="products.title" value={products.title} as="h2" className="site-products-h2" />
            </div>
            <div className="site-product-grid">
              {products.items.map((p, i) => (
                <div
                  key={p.id}
                  className={`site-pcard${selectedProductId === p.id ? ' site-pcard--selected' : ''}${onProductClick ? ' site-pcard--admin' : ''}`}
                  onClick={onProductClick ? (e) => { e.stopPropagation(); onProductClick(p.id) } : undefined}
                  onDoubleClick={onProductDblClick ? (e) => { e.stopPropagation(); onProductDblClick(p.id) } : undefined}
                >
                  <div className="site-pcard-img">
                    {p.badge && <div className="site-pcard-badge">{p.badge}</div>}
                    <EImg field={`products.items.${i}.image`} src={p.image} alt={p.name} className="site-pcard-photo" />
                  </div>
                  <div className="site-pcard-body">
                    <div className="site-pcard-brand">{!editMode && <CategoryIcon category={p.category} />}{p.category}</div>
                    <E field={`products.items.${i}.name`} value={p.name} as="div" className="site-pcard-name" />
                    <E field={`products.items.${i}.description`} value={p.description} as="div" className="site-pcard-desc" />
                    <div className="site-pcard-foot">
                      <E field={`products.items.${i}.price`} value={p.price} as="div" className="site-pcard-price" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── USP ──────────────────────────────────────────────────────── */}
        {!hiddenSections.includes('usp') && (usp?.items?.length ?? 0) > 0 && (
          <section className={`site-section site-section-alt site-usp${editMode ? ' site-edit-section' : ''}`} id="usp"
            onClick={editMode ? (e) => { e.stopPropagation(); onSectionClick?.('usp') } : undefined}>
            {editMode && <div className="site-edit-section-badge">USPs</div>}
            {usp.eyebrow && <div className="site-eyebrow">{usp.eyebrow}</div>}
            <E field="usp.title" value={usp.title} as="h2" className="site-section-title" />
            <div className="site-usp-grid">
              {usp.items.map((u, i) => (
                <div key={u.id} className="site-usp-card">
                  <div className="site-usp-icon">{USP_ICONS[i] ?? null}</div>
                  <E field={`usp.items.${i}.title`} value={u.title} as="h3" />
                  <E field={`usp.items.${i}.description`} value={u.description} as="p" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── NEWS ─────────────────────────────────────────────────────── */}
        {!hiddenSections.includes('news') && (news?.items?.length ?? 0) > 0 && (
          <section className={`site-section site-news${editMode ? ' site-edit-section' : ''}`} id="news"
            onClick={editMode ? (e) => { e.stopPropagation(); onSectionClick?.('news') } : undefined}>
            {editMode && <div className="site-edit-section-badge">Aktuelles</div>}
            {news.eyebrow && <div className="site-eyebrow">{news.eyebrow}</div>}
            <E field="news.title" value={news.title} as="h2" className="site-section-title" />
            <div className="site-news-grid">
              {news.items.map((n, i) => (
                <div
                  key={n.id}
                  className={`site-news-card ${!editMode ? 'clickable' : ''}`}
                  {...(!editMode ? {
                    role: 'button',
                    tabIndex: 0,
                    onClick: () => setModalArticle(n),
                    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setModalArticle(n) } },
                  } : {})}
                >
                  {n.image && <img src={n.image} alt={n.title} className="site-news-img" />}
                  <div className="site-news-body">
                    <div className="site-news-date">{new Date(n.date).toLocaleDateString('de-AT', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <E field={`news.items.${i}.title`} value={n.title} as="h3" className="site-news-title" />
                    <E field={`news.items.${i}.body`} value={n.body} as="p" className="site-news-text" />
                    {!editMode && <span className="site-news-read-more">{t.readMore} →</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── LOCATION ─────────────────────────────────────────────────── */}
        {!hiddenSections.includes('location') && <section className={`site-location${editMode ? ' site-edit-section' : ''}`} id="location"
          onClick={editMode ? (e) => { e.stopPropagation(); onSectionClick?.('contact') } : undefined}>
          {editMode && <div className="site-edit-section-badge">Kontakt</div>}
          <div className="site-location-maps-row">
            {contact?.mapSrc && (
              <div className="site-map">
                <iframe src={contact.mapSrc} allowFullScreen loading="lazy" title="Standort Graz" />
              </div>
            )}
          </div>
          <div className={`site-location-info-row${contact?.partnerShop ? ' site-location-info-two' : ''}`}>
            <div className="site-location-info">
              <E field="contact.title" value={contact?.title ?? ''} as="h2" className="site-location-h2" />
              {contact?.subtitle && <E field="contact.subtitle" value={contact.subtitle} as="p" className="site-location-sub" />}
              <div className="site-cinfo-list">
                {contact?.phone && (
                  <div className="site-cinfo-item">
                    <IconPhone />
                    <E field="contact.phone" value={contact.phone} as="a" href={`tel:${contact.phone}`} />
                  </div>
                )}
                {contact?.email && (
                  <div className="site-cinfo-item">
                    <IconMail />
                    <E field="contact.email" value={contact.email} as="a" href={`mailto:${contact.email}`} />
                  </div>
                )}
                {contact?.address && (
                  <div className="site-cinfo-item">
                    <IconLocation />
                    <E field="contact.address" value={contact.address} as="span" />
                  </div>
                )}
              </div>
              {contact?.formEnabled && !editMode ? (
                <ContactForm />
              ) : (
                <a href={`mailto:${contact?.email ?? ''}`} className="site-btn-lime-solid">Nachricht senden</a>
              )}
            </div>
            {contact?.partnerShop && (
              <div className="site-location-info site-location-partner">
                <div className="site-partner-badge">Unser Partner</div>
                <h2 className="site-location-h2">{contact.partnerShop.name}</h2>
                <div className="site-cinfo-list">
                  <div className="site-cinfo-item">
                    <IconLocation />
                    <span>{contact.partnerShop.address}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>}

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer className="site-footer">
          {(footer?.cols?.length ?? 0) > 0 && (
            <div className="site-footer-grid">
              <div className="site-footer-brand">
                {nav.logo && <img src={nav.logo} alt={footer?.brand} className="site-footer-logo" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                <E field="footer.brand" value={footer?.brand ?? ''} as="strong" className="site-footer-brand-name" />
                {footer?.description && <E field="footer.description" value={footer.description} as="p" className="site-footer-brand-desc" />}
                {(contact.facebook || contact.instagram || contact.whatsapp) && (
                  <div className="site-social-row">
                    {contact.facebook && (
                      <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="site-social-icon" aria-label="Facebook">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                      </a>
                    )}
                    {contact.instagram && (
                      <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="site-social-icon" aria-label="Instagram">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                      </a>
                    )}
                    {contact.whatsapp && (
                      <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="site-social-icon site-social-wa" aria-label="WhatsApp">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.118 1.533 5.851L0 24l6.335-1.513A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.843 0-3.57-.49-5.062-1.346L2.5 21.5l.854-3.375A9.944 9.944 0 0 1 2 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10z"/></svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
              {footer.cols.map((col, ci) => (
                <div key={ci} className="site-footer-col">
                  <h4>{col.title}</h4>
                  {col.links.map((l, li) => <a key={li} href={l.href}>{l.label}</a>)}
                </div>
              ))}
            </div>
          )}
          <div className="site-footer-bottom">
            <E field="footer.copyright" value={footer?.copyright ?? ''} as="span" />
            <div className="site-footer-links">
              {(footer?.links ?? []).map((l, i) => (
                <E key={i} field={`footer.links.${i}.label`} value={l.label} as="a" href={l.href} />
              ))}
              <a href="#lazi" className="site-footer-lazi-link" aria-label="Lazi">Lazi</a>
            </div>
          </div>
        </footer>

        {/* ── ARTICLE MODAL ────────────────────────────────────────────── */}
        {modalArticle && !editMode && (
          <div className="site-modal-scrim" onClick={() => setModalArticle(null)} role="dialog" aria-modal="true" aria-label={modalArticle.title}>
            <div className="site-modal site-modal-article" onClick={e => e.stopPropagation()}>
              <button className="site-modal-close" aria-label={t.close} onClick={() => setModalArticle(null)}><IconClose /></button>
              {modalArticle.image && (
                <div className="site-modal-img"><img src={modalArticle.image} alt={modalArticle.title} /></div>
              )}
              <div className="site-modal-body">
                <div className="site-news-date">{new Date(modalArticle.date).toLocaleDateString('de-AT', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <h3 className="site-modal-title" dangerouslySetInnerHTML={{ __html: modalArticle.title }} />
                <div className="site-modal-article-body" dangerouslySetInnerHTML={{ __html: modalArticle.body }} />
              </div>
            </div>
          </div>
        )}

        {/* ── WHATSAPP FLOAT ───────────────────────────────────────────── */}
        {whatsapp?.enabled && !editMode && (
          <WhatsAppButton number={whatsapp.number} message={whatsapp.message} hidden={menuOpen} />
        )}

        {/* ── GDPR COOKIE BANNER ───────────────────────────────────────── */}
        {!editMode && <GdprBanner />}

        {/* ── INQUIRY MODAL ────────────────────────────────────────────── */}
        {inquiryOpen && !editMode && (
          <InquiryModal
            products={products?.items ?? []}
            preselectedProductId={inquiryProductId}
            onClose={() => { setInquiryOpen(false); setInquiryProductId(undefined) }}
          />
        )}
      </div>
    </Ctx.Provider>
  )
}
