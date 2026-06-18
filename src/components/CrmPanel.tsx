import { useState, useEffect, useRef, useMemo } from 'react'
import type { Customer, Transaction, CRMData } from '../types/crm'
import { ghRead, ghWrite, b64Encode, b64Decode } from '../lib/github'
import { MCTopbarTrees, CrmScene } from './MCMobs'

// ── Achievements (shared storage) ───────────────────────────────────────────
const ACH_KEY = 'lazi_achievements'
const FIRST_THREE = ['ach-erste-schritte']

const ACHIEVEMENTS = [
  { id: 'ach-erste-schritte',   title: 'Erste Schritte',          desc: 'Minecraft-Mode im CRM entdeckt' },
  { id: 'ach-wolf',             title: 'Wolfsbändigerin',          desc: 'Wolf gezähmt und Namen gegeben' },
  { id: 'ach-wolf-bone-first',  title: 'Großzügig!',               desc: 'Den allerersten Knochen gegeben' },
  { id: 'ach-wolf-pet-10',      title: 'Tierlieb',                 desc: 'Den Wolf 10x gestreichelt' },
  { id: 'ach-wolf-pet-50',      title: 'Bester Freund',            desc: 'Den Wolf 50x gestreichelt' },
  { id: 'ach-wolf-bone-5',      title: 'Futtermeister',            desc: '5 Knochen verfüttert' },
  { id: 'ach-wolf-bone-20',     title: 'Leitwolf',                 desc: '20 Knochen verfüttert' },
  { id: 'ach-creeper',          title: 'Das War Knapp!',           desc: 'Creeper-Explosion überlebt' },
  { id: 'ach-night-owl',        title: 'Nacht-Eule',               desc: 'Spät nachts am CRM gearbeitet' },
  { id: 'ach-early-bird',       title: 'Früher Vogel',             desc: 'Früh morgens schon aktiv' },
  { id: 'ach-adventurer',       title: 'Adventurer',               desc: 'Den Wolf ganz nach rechts geführt' },
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

const STATUS_LABELS: Record<Customer['status'], string> = {
  offen:     'Offen',
  angeboten: 'Angeboten',
  verkauft:  'Verkauft',
  abgesagt:  'Abgesagt',
}

type StatusFilter = Customer['status'] | 'alle'

function emptyCustomer(): Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> {
  return { name: '', phone: '', email: '', address: '', interest: '', budget: '', status: 'offen', notes: '' }
}

function emptyTransaction(): Omit<Transaction, 'id' | 'date'> {
  return { type: 'einnahme', amount: 0, category: 'Verkauf', description: '', invoiceNumber: '' }
}

export function CrmPanel({ mcMode = false }: { mcMode?: boolean }) {
  const [data, setData]                   = useState<CRMData>({ customers: [], transactions: [] })
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)
  const [saveMsg, setSaveMsg]             = useState<'ok' | 'err' | null>(null)
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>('alle')
  
  const [modalType, setModalType]         = useState<'customer' | 'transaction' | null>(null)
  const [editId, setEditId]               = useState<string | null>(null)
  const [customerForm, setCustomerForm]   = useState(emptyCustomer())
  const [transactionForm, setTransactionForm] = useState(emptyTransaction())
  
  const [crmTab, setCrmTab]               = useState<'kunden' | 'finanzen' | 'achievements'>('kunden')
  const [unlocked, setUnlocked]           = useState<Set<string>>(() => mcMode ? loadAchievements() : new Set())
  const shaRef = useRef<string | null>(null)

  function handleAchUnlock(id: string) {
    setUnlocked(prev => {
      if (prev.has(id)) return prev
      const s = new Set(prev); s.add(id)
      localStorage.setItem(ACH_KEY, JSON.stringify([...s]))
      return s
    })
  }

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const file = await ghRead(CUSTOMERS_PATH)
      shaRef.current = file.sha
      const json = b64Decode(file.content)
      const parsed = JSON.parse(json)
      // Migration for old structure
      if (Array.isArray(parsed)) {
        setData({ customers: parsed, transactions: [] })
      } else {
        setData(parsed)
      }
    } catch {
      setData({ customers: [], transactions: [] })
      shaRef.current = null
    } finally {
      setLoading(false)
    }
  }

  async function persistData(updated: CRMData): Promise<boolean> {
    setSaving(true)
    try {
      const b64 = b64Encode(JSON.stringify(updated, null, 2))
      const file = await ghWrite(CUSTOMERS_PATH, b64, shaRef.current, 'crm: update data')
      shaRef.current = file?.sha ?? null
      setData(updated)
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

  // --- Customer Handlers ---
  function openAddCustomer() {
    setEditId(null)
    setCustomerForm(emptyCustomer())
    setModalType('customer')
  }

  function openEditCustomer(c: Customer) {
    setEditId(c.id)
    setCustomerForm({ ...c })
    setModalType('customer')
  }

  async function handleSaveCustomer() {
    if (!customerForm.name.trim()) return
    const now = new Date().toISOString()
    let updatedCustomers: Customer[]
    if (editId) {
      updatedCustomers = data.customers.map(c =>
        c.id === editId ? { ...c, ...customerForm, updatedAt: now } : c
      )
    } else {
      const newC: Customer = {
        id:        `c${Date.now()}`,
        ...customerForm,
        createdAt: now,
        updatedAt: now,
      }
      updatedCustomers = [...data.customers, newC]
    }
    const ok = await persistData({ ...data, customers: updatedCustomers })
    if (ok) { setModalType(null); flash('ok') } else flash('err')
  }

  // --- Transaction Handlers ---
  function openAddTransaction() {
    setEditId(null)
    setTransactionForm(emptyTransaction())
    setModalType('transaction')
  }

  async function handleSaveTransaction() {
    if (transactionForm.amount <= 0) return
    const now = new Date().toISOString()
    const newT: Transaction = {
      id: `t${Date.now()}`,
      date: now,
      ...transactionForm
    }
    const ok = await persistData({ ...data, transactions: [...data.transactions, newT] })
    if (ok) { setModalType(null); flash('ok') } else flash('err')
  }

  const filteredCustomers = data.customers
    .filter(c => statusFilter === 'alle' || c.status === statusFilter)
    .filter(c => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.interest && c.interest.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const totals = useMemo(() => {
    const ein = data.transactions.filter(t => t.type === 'einnahme').reduce((sum, t) => sum + t.amount, 0)
    const aus = data.transactions.filter(t => t.type === 'ausgabe').reduce((sum, t) => sum + t.amount, 0)
    return { ein, aus, saldo: ein - aus }
  }, [data.transactions])

  return (
    <div className={`crm-panel${mcMode ? ' crm-mc' : ''}`}>

      {/* ── MC tree strip at top ── */}
      {mcMode && <MCTopbarTrees />}

      {/* ── Topbar with back link ── */}
      <div className="crm-topbar">
        <a href="#admin" className="crm-back-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          {mcMode ? 'Zurück zur Workbench' : 'Workbench'}
        </a>
        {mcMode && <span className="crm-mc-badge">Timi's Kundenliste</span>}
      </div>

      {/* ── Tab bar (Always visible, themed if MC mode) ── */}
      <div className={`crm-tabs ${mcMode ? 'crm-mc-tabs' : 'crm-clean-tabs'}`}>
        <button className={`crm-tab${crmTab === 'kunden' ? ' active' : ''}`} onClick={() => setCrmTab('kunden')}>Kunden</button>
        <button className={`crm-tab${crmTab === 'finanzen' ? ' active' : ''}`} onClick={() => setCrmTab('finanzen')}>Finanzen</button>
        {mcMode && (
          <button className={`crm-tab${crmTab === 'achievements' ? ' active' : ''}`} onClick={() => setCrmTab('achievements')}>
            Achievements
            <span className="crm-tab-count">{unlocked.size}/50</span>
          </button>
        )}
      </div>
      {/* ── Finanzen (Professional KMU dashboard) ── */}
      {crmTab === 'finanzen' && (
        <div className="crm-finanzen" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="crm-fin-dash" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="crm-fin-card" style={{ background: '#fff', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>Einnahmen</label>
              <div className="crm-fin-val crm-fin-val--ein" style={{ fontSize: '28px', fontWeight: 800, color: '#059669' }}>€ {totals.ein.toLocaleString('de-AT')}</div>
            </div>
            <div className="crm-fin-card" style={{ background: '#fff', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>Ausgaben</label>
              <div className="crm-fin-val crm-fin-val--aus" style={{ fontSize: '28px', fontWeight: 800, color: '#dc2626' }}>€ {totals.aus.toLocaleString('de-AT')}</div>
            </div>
            <div className="crm-fin-card" style={{ background: '#fff', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>Saldo</label>
              <div className={`crm-fin-val ${totals.saldo >= 0 ? 'crm-fin-val--ein' : 'crm-fin-val--aus'}`} style={{ fontSize: '28px', fontWeight: 800 }}>
                € {totals.saldo.toLocaleString('de-AT')}
              </div>
            </div>
          </div>

          <div className="crm-list" style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="crm-header-row" style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
              <h3 className="crm-section-title" style={{ fontSize: '18px', fontWeight: 700 }}>Buchungen</h3>
              <button className="crm-add-btn" onClick={openAddTransaction} style={{ padding: '8px 16px', background: '#0099CC', color: '#fff', borderRadius: '6px', border: 'none', fontWeight: 600 }}>
                + Neue Buchung
              </button>
            </div>
            {data.transactions.length === 0 && <div className="crm-empty" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Noch keine Buchungen erfasst.</div>}
            {data.transactions.slice().reverse().map(t => (
              <div key={t.id} className="crm-row crm-row--fin" style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                <div className="crm-row-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="crm-row-date" style={{ fontSize: '13px', color: '#666', width: '100px' }}>{t.date.slice(0, 10)}</span>
                  <span className="crm-row-desc" style={{ flex: 1, fontWeight: 500 }}>{t.description || t.category}</span>
                  <span className={`crm-fin-badge crm-fin-badge--${t.type}`} style={{ fontWeight: 700, color: t.type === 'einnahme' ? '#059669' : '#dc2626' }}>
                    {t.type === 'einnahme' ? '+' : '-'} € {t.amount.toLocaleString('de-AT')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Achievements grid (MC only) ── */}
      {mcMode && crmTab === 'achievements' && (
        <div className="lazi-ach-grid">
          {ACHIEVEMENTS.map(a => {
            const isUnlocked = unlocked.has(a.id)
            return (
              <div key={a.id} className={`lazi-ach-tile${isUnlocked ? ' unlocked' : ''}`} title={a.desc}>
                <div className="lazi-ach-tile-icon">{isUnlocked ? '🏆' : '🔒'}</div>
                <div className="lazi-ach-tile-title">{a.title}</div>
              </div>
            )
          })}
          {/* Fill remaining slots to reach 50 */}
          {Array.from({ length: 50 - ACHIEVEMENTS.length }).map((_, i) => (
            <div key={`empty-${i}`} className="lazi-ach-tile locked">
              <div className="lazi-ach-tile-icon">🔒</div>
              <div className="lazi-ach-tile-title">???</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Kunden Liste (Header) ── */}
      {crmTab === 'kunden' && <div className="crm-header">
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
          <span className="crm-count">{data.customers.length}</span>
        </h2>

        <div className="crm-header-row">
          <input
            className="crm-search"
            type="search"
            placeholder="Suchen…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="crm-add-btn" onClick={openAddCustomer}>
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
      {crmTab === 'kunden' && saveMsg === 'ok'  && <div className="crm-feedback crm-feedback--ok">Gespeichert.</div>}
      {crmTab === 'kunden' && saveMsg === 'err' && <div className="crm-feedback crm-feedback--err">Fehler beim Speichern.</div>}

      {/* ── Kunden List ── */}
      {crmTab === 'kunden' && (loading ? (
        <div className="crm-empty">Wird geladen…</div>
      ) : (
        <div className="crm-list">
          {filteredCustomers.length === 0 && data.customers.length > 0 && (
            <div className="crm-empty">Keine Treffer für diese Filter.</div>
          )}
          {filteredCustomers.map(c => (
            <div key={c.id} className="crm-row" onClick={() => openEditCustomer(c)} style={{ cursor: 'pointer', position: 'relative' }}>
              <div className="crm-row-main">
                <span className="crm-row-name">{c.name}</span>
                <span className={`crm-status-badge crm-status-badge--${c.status}`}>
                  {STATUS_LABELS[c.status]}
                </span>
              </div>
              <div className="crm-row-body-summary">
                {c.phone && <span className="crm-row-detail">{c.phone}</span>}
                {c.email && <span className="crm-row-detail">{c.email}</span>}
              </div>
              {(c.interest || c.budget) && (
                <div className="crm-row-detail crm-row-detail--highlight">
                  {c.interest}{c.interest && c.budget ? ' · ' : ''}{c.budget}
                </div>
              )}
              <div className="crm-row-foot">
                <span className="crm-row-meta">Zuletzt: {c.updatedAt.slice(0, 10)}</span>
                <div className="crm-row-actions">
                  <button className="crm-action-btn" title="Details öffnen">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* ── Modals ── */}
      {modalType === 'customer' && (
        <div className={`pem-overlay${mcMode ? ' crm-mc' : ''}`} onClick={() => setModalType(null)}>
          <div className="pem" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="pem-header">
              <span className="pem-title">{editId ? 'Kunden-Akte' : 'Neuer Kunde'}</span>
              <button className="pem-close" onClick={() => setModalType(null)}>×</button>
            </div>
            <div className="pem-body">
              <div className="crm-modal-grid">
                <div className="pem-field crm-modal-full">
                  <label>Name / Firma</label>
                  <input value={customerForm.name} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} />
                </div>
                <div className="pem-field">
                  <label>Telefon</label>
                  <input value={customerForm.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} />
                </div>
                <div className="pem-field">
                  <label>E-Mail</label>
                  <input value={customerForm.email} onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })} />
                </div>
                <div className="pem-field crm-modal-full">
                  <label>Adresse (AT)</label>
                  <textarea rows={2} value={customerForm.address || ''} onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })} placeholder="Strasse, PLZ Ort" />
                </div>
                <div className="pem-field">
                  <label>Interesse</label>
                  <input list="crm-interest-list" value={customerForm.interest} onChange={e => setCustomerForm({ ...customerForm, interest: e.target.value })} />
                </div>
                <div className="pem-field">
                  <label>Budget</label>
                  <input value={customerForm.budget} onChange={e => setCustomerForm({ ...customerForm, budget: e.target.value })} />
                </div>
                <div className="pem-field crm-modal-full">
                  <label>Status</label>
                  <select value={customerForm.status} onChange={e => setCustomerForm({ ...customerForm, status: e.target.value as Customer['status'] })}>
                    <option value="offen">Offen</option>
                    <option value="angeboten">Angeboten</option>
                    <option value="verkauft">Verkauft</option>
                    <option value="abgesagt">Abgesagt</option>
                  </select>
                </div>
                <div className="pem-field crm-modal-full">
                  <label>Notizen</label>
                  <textarea rows={4} value={customerForm.notes} onChange={e => setCustomerForm({ ...customerForm, notes: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="pem-footer">
              {editId ? (
                <button
                  className="pem-btn-danger"
                  onClick={async () => {
                    if (!confirm('Diesen Kunden wirklich löschen?')) return
                    const updated = data.customers.filter(c => c.id !== editId)
                    const ok = await persistData({ ...data, customers: updated })
                    if (ok) { setModalType(null); flash('ok') } else flash('err')
                  }}
                  disabled={saving}
                >
                  Löschen
                </button>
              ) : <span />}
              <div className="pem-footer-right">
                <button className="pem-btn-ghost" onClick={() => setModalType(null)}>Abbrechen</button>
                <button className="pem-btn-primary" onClick={handleSaveCustomer} disabled={saving}>{saving ? '...' : 'Speichern'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalType === 'transaction' && (
        <div className={`pem-overlay${mcMode ? ' crm-mc' : ''}`} onClick={() => setModalType(null)}>
          <div className="pem" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="pem-header">
              <span className="pem-title">Beleg / Buchung</span>
              <button className="pem-close" onClick={() => setModalType(null)}>×</button>
            </div>
            <div className="pem-body">
              <div className="crm-modal-grid">
                <div className="pem-field crm-modal-full">
                  <label>Typ</label>
                  <select value={transactionForm.type} onChange={e => setTransactionForm({ ...transactionForm, type: e.target.value as any })}>
                    <option value="einnahme">Einnahme (+)</option>
                    <option value="ausgabe">Ausgabe (-)</option>
                  </select>
                </div>
                <div className="pem-field crm-modal-full">
                  <label>Betrag (€)</label>
                  <input type="number" value={transactionForm.amount} onChange={e => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="pem-field crm-modal-full">
                  <label>Rechnungsnummer</label>
                  <input value={transactionForm.invoiceNumber || ''} onChange={e => setTransactionForm({ ...transactionForm, invoiceNumber: e.target.value })} placeholder="z.B. RE-2024-001" />
                </div>
                <div className="pem-field crm-modal-full">
                  <label>Beschreibung</label>
                  <textarea rows={2} value={transactionForm.description} onChange={e => setTransactionForm({ ...transactionForm, description: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="pem-footer">
              <button className="pem-btn-ghost" onClick={() => setModalType(null)}>Abbrechen</button>
              <button className="pem-btn-primary" onClick={handleSaveTransaction}>Buchen</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Gamified MC scene at bottom ── */}
      {mcMode && crmTab === 'kunden' && <CrmScene onAchUnlock={handleAchUnlock} />}

    </div>
  )
}
