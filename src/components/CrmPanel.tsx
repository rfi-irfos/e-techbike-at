import { useState, useEffect, useRef } from 'react'
import type { Customer } from '../types/crm'
import { ghRead, ghWrite, b64Encode, b64Decode } from '../lib/github'
import { MCTopbarTrees, CrmMobStrip } from './MCMobs'
// eslint-disable-next-line

// ── Achievements (shared storage with LaziPanel) ──────────────────────────────
const ACH_KEY = 'lazi_achievements'
const FIRST_THREE = ['ach-erste-schritte', 'ach-baumeisterin', 'ach-haendlerin']

const ACHIEVEMENTS = [
  { id: 'ach-erste-schritte',   title: 'Erste Schritte',          desc: 'Website zum ersten Mal besucht' },
  { id: 'ach-baumeisterin',     title: 'Baumeisterin',             desc: 'Erste Änderung im Builder gespeichert' },
  { id: 'ach-haendlerin',       title: 'Händlerin',                desc: 'Erstes Produkt hinzugefügt' },
  { id: 'ach-fotografin',       title: 'Fotografin',               desc: 'Erstes Bild hochgeladen' },
  { id: 'ach-schreiberin',      title: 'Schreiberin',              desc: 'Erste Seite erstellt' },
  { id: 'ach-kontaktmeisterin', title: 'Kontaktmeisterin',         desc: 'Kontaktformular ausgefüllt' },
  { id: 'ach-diamant',          title: 'Diamant-Tier',             desc: '10 Produkte im Shop' },
  { id: 'ach-nether',           title: 'Nether-Portal',            desc: 'Zu spät nachts noch am Arbeiten' },
  { id: 'ach-enderdrachen',     title: 'Enderdrachen-Bezwingerin', desc: 'Alles auf der Website fertig' },
  { id: 'ach-schaf',            title: 'Schaf-Flüsterin',          desc: 'Pinkes Schaf entdeckt' },
  { id: 'ach-ferkel',           title: 'Ferkel-Königin',           desc: 'Schwein gestreichelt' },
  { id: 'ach-kuh',              title: 'Kuh-Baronin',              desc: 'Kuh gemolken' },
  { id: 'ach-wolf',             title: 'Wolfsbändigerin',          desc: 'Wolf mit 3 Knochen gezähmt' },
]

function loadAchievements(): Set<string> {
  try {
    const raw = localStorage.getItem(ACH_KEY)
    const set = raw ? new Set<string>(JSON.parse(raw)) : new Set<string>()
    FIRST_THREE.forEach(id => set.add(id))
    localStorage.setItem(ACH_KEY, JSON.stringify([...set]))
    return set
  } catch {
    return new Set(FIRST_THREE)
  }
}

const CUSTOMERS_PATH = 'public/customers.json'

const INTEREST_SUGGESTIONS = [
  'E-Scooter 25km/h',
  'E-Scooter 45km/h',
  'E-Moped',
  'E-Fahrrad',
  'E-Klapprad',
  'E-Mountainbike',
  'Akku',
  'Sonstiges',
]

const STATUS_LABELS: Record<Customer['status'], string> = {
  offen:     'Offen',
  angeboten: 'Angeboten',
  verkauft:  'Verkauft',
  abgesagt:  'Abgesagt',
}

type StatusFilter = Customer['status'] | 'alle'

function emptyForm(): Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> {
  return { name: '', phone: '', email: '', interest: '', budget: '', status: 'offen', notes: '' }
}

export function CrmPanel({ mcMode = false }: { mcMode?: boolean }) {
  const [customers, setCustomers]         = useState<Customer[]>([])
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)
  const [saveMsg, setSaveMsg]             = useState<'ok' | 'err' | null>(null)
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>('alle')
  const [modalOpen, setModalOpen]         = useState(false)
  const [editId, setEditId]               = useState<string | null>(null)
  const [form, setForm]                   = useState(emptyForm())
  const [crmTab, setCrmTab]               = useState<'kunden' | 'achievements'>('kunden')
  const [unlocked, setUnlocked]           = useState<Set<string>>(() => mcMode ? loadAchievements() : new Set())
  const [wolfBones, setWolfBones]         = useState(0)
  const [wolfTamed, setWolfTamed]         = useState(false)
  const shaRef = useRef<string | null>(null)

  function handleWolfClick() {
    if (wolfTamed) return
    const next = wolfBones + 1
    setWolfBones(next)
    if (next >= 3) {
      setWolfTamed(true)
      setUnlocked(prev => {
        const s = new Set(prev)
        s.add('ach-wolf')
        localStorage.setItem(ACH_KEY, JSON.stringify([...s]))
        return s
      })
    }
  }

  useEffect(() => { loadCustomers() }, [])

  async function loadCustomers() {
    setLoading(true)
    try {
      const file = await ghRead(CUSTOMERS_PATH)
      shaRef.current = file.sha
      const json = b64Decode(file.content)
      setCustomers(JSON.parse(json))
    } catch {
      setCustomers([])
      shaRef.current = null
    } finally {
      setLoading(false)
    }
  }

  async function persistCustomers(updated: Customer[]): Promise<boolean> {
    setSaving(true)
    try {
      const b64 = b64Encode(JSON.stringify(updated, null, 2))
      const file = await ghWrite(CUSTOMERS_PATH, b64, shaRef.current, 'crm: update customers')
      shaRef.current = file?.sha ?? null
      setCustomers(updated)
      return true
    } catch (e) {
      console.error('CRM save failed:', e)
      return false
    } finally {
      setSaving(false)
    }
  }

  function flash(result: 'ok' | 'err') {
    setSaveMsg(result)
    setTimeout(() => setSaveMsg(null), result === 'ok' ? 2500 : 3500)
  }

  function openAdd() {
    setEditId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(c: Customer) {
    setEditId(c.id)
    setForm({
      name:     c.name,
      phone:    c.phone,
      email:    c.email,
      interest: c.interest,
      budget:   c.budget,
      status:   c.status,
      notes:    c.notes,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    const now = new Date().toISOString()
    let updated: Customer[]
    if (editId) {
      updated = customers.map(c =>
        c.id === editId ? { ...c, ...form, updatedAt: now } : c
      )
    } else {
      const newC: Customer = {
        id:        `c${Date.now()}`,
        ...form,
        createdAt: now,
        updatedAt: now,
      }
      updated = [...customers, newC]
    }
    const ok = await persistCustomers(updated)
    if (ok) {
      setModalOpen(false)
      flash('ok')
    } else {
      flash('err')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Diesen Kontakt wirklich löschen?')) return
    const updated = customers.filter(c => c.id !== id)
    const ok = await persistCustomers(updated)
    if (!ok) flash('err')
  }

  async function handleDeleteFromModal(id: string) {
    if (!confirm('Diesen Kontakt wirklich löschen?')) return
    const updated = customers.filter(c => c.id !== id)
    const ok = await persistCustomers(updated)
    if (ok) {
      setModalOpen(false)
      flash('ok')
    } else {
      flash('err')
    }
  }

  const filtered = customers
    .filter(c => statusFilter === 'alle' || c.status === statusFilter)
    .filter(c => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.interest.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div className={`crm-panel${mcMode ? ' crm-mc' : ''}`}>

      {/* ── MC tree strip at top ── */}
      {mcMode && <MCTopbarTrees />}

      {/* ── Topbar with back link ── */}
      <div className="crm-topbar">
        <a href="#admin" className="crm-back-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          {mcMode ? 'Zurueck zur Workbench' : 'Workbench'}
        </a>
        {mcMode && <span className="crm-mc-badge">Timi's Kundenliste</span>}
      </div>

      {/* ── MC tab bar ── */}
      {mcMode && (
        <div className="crm-mc-tabs">
          <button className={`crm-mc-tab${crmTab === 'kunden' ? ' active' : ''}`} onClick={() => setCrmTab('kunden')}>Kunden</button>
          <button className={`crm-mc-tab${crmTab === 'achievements' ? ' active' : ''}`} onClick={() => setCrmTab('achievements')}>
            Achievements
            <span className="crm-mc-tab-count">{unlocked.size}/13</span>
          </button>
        </div>
      )}

      {/* ── Achievements grid (MC only) ── */}
      {mcMode && crmTab === 'achievements' && (
        <div className="lazi-grid" style={{ padding: '20px 24px' }}>
          {ACHIEVEMENTS.map(a => {
            const isUnlocked = unlocked.has(a.id)
            return (
              <div
                key={a.id}
                className={`lazi-ach-slot${isUnlocked ? ' unlocked' : ''}`}
                title={isUnlocked ? a.desc : '???'}
                onClick={() => {
                  if (!isUnlocked) return
                }}
              >
                <div className="lazi-ach-icon">
                  {isUnlocked ? '★' : '?'}
                </div>
                <div className="lazi-ach-title">{isUnlocked ? a.title : '???'}</div>
                <div className="lazi-ach-desc">{isUnlocked ? a.desc : '???'}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Header ── */}
      {(!mcMode || crmTab === 'kunden') && <div className="crm-header">
        <h2 className="crm-title">
          {mcMode ? (
            <svg viewBox="0 0 16 16" width="18" height="18" style={{ imageRendering: 'pixelated' }}>
              <rect x="0" y="0" width="16" height="16" fill="#3A7D44"/>
              <rect x="3" y="4" width="3" height="3" fill="#111"/>
              <rect x="10" y="4" width="3" height="3" fill="#111"/>
              <rect x="5" y="10" width="6" height="2" fill="#111"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          )}
          Kunden
          <span className="crm-count">{customers.length}</span>
        </h2>

        <div className="crm-header-row">
          <input
            className="crm-search"
            type="search"
            placeholder="Suchen…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="crm-add-btn" onClick={openAdd}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Neuer Kontakt
          </button>
        </div>

        <div className="crm-filter-pills">
          {(['alle', 'offen', 'angeboten', 'verkauft', 'abgesagt'] as const).map(s => (
            <button
              key={s}
              className={`crm-pill crm-pill--${s}${statusFilter === s ? ' active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'alle' ? 'Alle' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>}

      {/* ── Feedback ── */}
      {(!mcMode || crmTab === 'kunden') && saveMsg === 'ok'  && <div className="crm-feedback crm-feedback--ok">Gespeichert.</div>}
      {(!mcMode || crmTab === 'kunden') && saveMsg === 'err' && <div className="crm-feedback crm-feedback--err">Fehler beim Speichern.</div>}

      {/* ── List ── */}
      {(!mcMode || crmTab === 'kunden') && loading ? (
        <div className="crm-empty">Wird geladen…</div>
      ) : (
        <div className="crm-list">
          {filtered.length === 0 && customers.length === 0 && (
            <>
              {(['Max Mustermann', 'Anna Beispiel', 'Thomas K.'] as const).map((name, i) => (
                <div key={i} className="crm-row crm-row-placeholder">
                  <div className="crm-row-main">
                    <span className="crm-row-name crm-placeholder-text">{name}</span>
                    <span className={`crm-status-badge crm-status-badge--${(['offen','angeboten','verkauft'] as const)[i]}`}>
                      {(['Offen','Angeboten','Verkauft'] as const)[i]}
                    </span>
                  </div>
                  <div className="crm-row-detail crm-placeholder-text">{['+43 664 …','…','…'][i]}</div>
                  <div className="crm-row-detail crm-placeholder-text">{['E-Scooter 45km/h · €1.200','E-Fahrrad · €850','E-Moped'][i]}</div>
                </div>
              ))}
              <div className="crm-empty crm-empty-hint">So sehen Ihre Kontakte aus — klick auf + Neuer Kontakt um zu starten.</div>
            </>
          )}
          {filtered.length === 0 && customers.length > 0 && (
            <div className="crm-empty">Keine Treffer für diese Filter.</div>
          )}
          {filtered.map(c => (
            <div key={c.id} className="crm-row">
              <div className="crm-row-main">
                <span className="crm-row-name">{c.name}</span>
                <span className={`crm-status-badge crm-status-badge--${c.status}`}>
                  {STATUS_LABELS[c.status]}
                </span>
              </div>
              {c.phone && (
                <div className="crm-row-detail">{c.phone}</div>
              )}
              {(c.interest || c.budget) && (
                <div className="crm-row-detail">
                  {c.interest}{c.interest && c.budget ? ' · ' : ''}{c.budget}
                </div>
              )}
              <div className="crm-row-foot">
                <span className="crm-row-meta">{c.updatedAt.slice(0, 10)}</span>
                <div className="crm-row-actions">
                  <button
                    className="crm-action-btn"
                    onClick={() => openEdit(c)}
                    title="Bearbeiten"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>
                    </svg>
                  </button>
                  <button
                    className="crm-action-btn crm-action-btn--del"
                    onClick={() => handleDelete(c.id)}
                    title="Löschen"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="pem-overlay" onClick={() => setModalOpen(false)}>
          <div className="pem" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>

            <div className="pem-header">
              <span className="pem-title">{editId ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}</span>
              <button className="pem-close" onClick={() => setModalOpen(false)} title="Schliessen">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="pem-body">
              <div className="crm-modal-grid">

                <div className="pem-field crm-modal-full">
                  <label>Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Vorname Nachname"
                    autoFocus
                  />
                </div>

                <div className="pem-field">
                  <label>Telefon</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+43 664 …"
                  />
                </div>

                <div className="pem-field">
                  <label>E-Mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="name@beispiel.at"
                  />
                </div>

                <div className="pem-field">
                  <label>Interesse</label>
                  <input
                    list="crm-interest-list"
                    value={form.interest}
                    onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}
                    placeholder="z.B. E-Scooter 45km/h"
                  />
                  <datalist id="crm-interest-list">
                    {INTEREST_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>

                <div className="pem-field">
                  <label>Budget</label>
                  <input
                    value={form.budget}
                    onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    placeholder="z.B. €1.200"
                  />
                </div>

                <div className="pem-field crm-modal-full">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Customer['status'] }))}
                  >
                    <option value="offen">Offen</option>
                    <option value="angeboten">Angeboten</option>
                    <option value="verkauft">Verkauft</option>
                    <option value="abgesagt">Abgesagt</option>
                  </select>
                </div>

                <div className="pem-field crm-modal-full">
                  <label>Notizen</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Interne Notizen…"
                  />
                </div>

              </div>
            </div>

            <div className="pem-footer">
              {editId ? (
                <button
                  className="pem-btn-danger"
                  onClick={() => editId && handleDeleteFromModal(editId)}
                  disabled={saving}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Löschen
                </button>
              ) : <span />}
              <div className="pem-footer-right">
                <button className="pem-btn-ghost" onClick={() => setModalOpen(false)}>
                  Abbrechen
                </button>
                <button
                  className="pem-btn-primary"
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                >
                  {saving ? 'Speichern…' : 'Speichern'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MC mob strip + ground at bottom ── */}
      {mcMode && (
        <>
          <CrmMobStrip onWolfClick={handleWolfClick} wolfBones={wolfBones} wolfTamed={wolfTamed} />
          <div className="lazi-ground" />
        </>
      )}

    </div>
  )
}
