import { useState, useRef, useEffect } from 'react'
import type { SiteContent, SectionId, ProductItem, NewsItem, CategoryItem, TrustItem, FeatureItem, PageItem } from '../types/content'
import type { User } from '../hooks/useAuth'
import { PublicSite } from './PublicSite'

interface Props {
  content: SiteContent
  user: User
  saving: boolean
  onSave: (c: SiteContent) => Promise<boolean>
  onUpload: (f: File) => Promise<string | null>
  onLogout: () => void
}

type PanelTab = 'products' | 'hero' | 'categories' | 'trust' | 'usp' | 'news' | 'contact' | 'nav' | 'style' | 'pages'
type DeviceView = 'edit' | 'desktop' | 'tablet' | 'mobile'

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

function EnderDragon({ onCatch }: { onCatch: () => void }) {
  return (
    <div className="ender-dragon-wrap" onClick={onCatch} title="psst...">
      <svg
        viewBox="0 0 88 42"
        width="112"
        height="53"
        style={{ imageRendering: 'pixelated', display: 'block', overflow: 'visible' }}
      >
        {/* tail — tapers left */}
        <rect x="0"  y="26" width="4"  height="4"  fill="#1a0033"/>
        <rect x="3"  y="24" width="5"  height="6"  fill="#1a0033"/>
        <rect x="7"  y="22" width="6"  height="8"  fill="#220044"/>
        {/* body */}
        <rect x="13" y="18" width="34" height="13" rx="1" fill="#1a0033"/>
        {/* wings from MID-back, spread upward */}
        <g className="dragon-wing-l">
          <polygon points="19,18  2,2   17,16  21,18"  fill="#2d004d"/>
          <polygon points="19,18  5,0   1,9    13,15"  fill="#3d0066"/>
        </g>
        <g className="dragon-wing-r">
          <polygon points="39,18  56,2  43,16  37,18"  fill="#2d004d"/>
          <polygon points="39,18  53,0  57,9   45,15"  fill="#3d0066"/>
        </g>
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

// ── Device preview switch (Edit / Desktop / Tablet / Mobile) ──────────────────

function IconEdit() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
}
function IconDesktop() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
}
function IconTablet() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
}
function IconMobile() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
}

const DEVICE_OPTS: { id: DeviceView; label: string; icon: React.ReactNode }[] = [
  { id: 'edit', label: 'Bearbeiten', icon: <IconEdit /> },
  { id: 'desktop', label: 'Web', icon: <IconDesktop /> },
  { id: 'tablet', label: 'Tablet', icon: <IconTablet /> },
  { id: 'mobile', label: 'Mobil', icon: <IconMobile /> },
]

export function AdminPanel({ content, user, saving, onSave, onUpload, onLogout }: Props) {
  const [draft, setDraft] = useState<SiteContent>(content)
  const [activeTab, setActiveTab] = useState<PanelTab>('products')
  const [saved, setSaved] = useState(false)
  const [uploadTarget, setUploadTarget] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editingNews, setEditingNews] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [device, setDevice] = useState<DeviceView>('edit')
  const [productModal, setProductModal] = useState<string | null>(null)
  const [specsInput, setSpecsInput] = useState('')
  const [panelWidth, setPanelWidth] = useState(340)
  const [editingPage, setEditingPage] = useState<string | null>(null)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [mcAchievement, setMcAchievement] = useState<string | null>(null)
  const [saveError, setSaveError] = useState(false)
  const [mcTheme, setMcTheme] = useState(() => localStorage.getItem('mc-theme') !== 'false')
  const mcTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function triggerAchievement(text: string) {
    if (mcTimerRef.current) clearTimeout(mcTimerRef.current)
    setMcAchievement(text)
    mcTimerRef.current = setTimeout(() => setMcAchievement(null), 3800)
  }

  const toggleMcTheme = () => {
    setMcTheme(t => {
      const next = !t
      localStorage.setItem('mc-theme', String(next))
      if (next) triggerAchievement('Minecraft-Mode AN! Lets go Timea!')
      return next
    })
  }
  const fileRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const panelBodyRef = useRef<HTMLDivElement>(null)
  const addMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setSpecsInput('') }, [editingProduct])
  useEffect(() => {
    if (!addMenuOpen) return
    const onDown = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setAddMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [addMenuOpen])

  const startPanelResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = panelWidth
    const onMove = (ev: MouseEvent) => setPanelWidth(Math.max(240, Math.min(640, startW + startX - ev.clientX)))
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Double-click = text selection intent, never navigate
    if (e.detail >= 2) return
    const target = e.target as HTMLElement
    // Skip if the element is already being actively edited
    if (target.isContentEditable && document.activeElement === target) return
    const el = target.closest('[data-cid]') as HTMLElement | null
    if (!el) return
    const cid = el.dataset.cid ?? ''
    if (cid.startsWith('hero.') || cid.startsWith('nav.')) {
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
        cur = cur[keys[i]] as Record<string, unknown>
      }
      cur[keys[keys.length - 1]] = value
      return next as unknown as SiteContent
    })
  }

  const handleSave = async () => {
    setSaveError(false)
    const ok = await onSave(draft)
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      triggerAchievement('Achievement Get!  Website gespeichert — Live in ~2 Min aktuell')
    } else {
      setSaveError(true)
      setTimeout(() => setSaveError(false), 3500)
    }
  }

  const handleImageClick = (field: string) => {
    setUploadTarget(field)
    fileRef.current?.click()
  }

  // ── Product helpers ───────────────────────────────────────────────────────

  const addProduct = () => {
    const id = `p${Date.now()}`
    const newProduct: ProductItem = { id, name: 'Neues Produkt', description: '', price: '', image: '', category: 'E-Bikes', specs: [] }
    update('products.items', [...(draft.products?.items ?? []), newProduct])
    setEditingProduct(id)
  }

  const deleteProduct = (id: string) => {
    update('products.items', draft.products.items.filter(p => p.id !== id))
    if (editingProduct === id) setEditingProduct(null)
  }

  const updateProduct = (id: string, field: keyof ProductItem, value: unknown) => {
    update('products.items', draft.products.items.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const uploadProductImage = async (id: string) => {
    setUploadTarget(`product:${id}`)
    fileRef.current?.click()
  }

  // ── News helpers ──────────────────────────────────────────────────────────

  const addNews = () => {
    const id = `n${Date.now()}`
    const today = new Date().toISOString().split('T')[0]
    const newItem: NewsItem = { id, date: today, title: 'Neue Neuigkeit', body: '', image: '' }
    update('news.items', [...(draft.news?.items ?? []), newItem])
    setEditingNews(id)
  }

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
    setUploading(true)
    const url = await onUpload(file)
    if (url) {
      if (uploadTarget.startsWith('product:')) {
        const pid = uploadTarget.replace('product:', '')
        updateProduct(pid, 'image', url)
      } else if (uploadTarget.startsWith('category:')) {
        const cid = uploadTarget.replace('category:', '')
        updateCategory(cid, 'image', url)
      } else if (uploadTarget.startsWith('news:')) {
        const nid = uploadTarget.replace('news:', '')
        updateNews(nid, 'image', url)
      } else {
        update(uploadTarget, url)
      }
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

  const addCategory = () => {
    const id = `c${Date.now()}`
    const newCat: CategoryItem = { id, name: 'Neue Kategorie', sub: '', image: '' }
    update('categories.items', [...(draft.categories?.items ?? []), newCat])
    setEditingCategory(id)
  }
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

  const addTrustItem = () => {
    const id = `tr${Date.now()}`
    const newItem: TrustItem = { id, icon: 'shield', bold: 'Vorteil', text: 'Kurzbeschreibung' }
    update('trust.items', [...(draft.trust?.items ?? []), newItem])
  }
  const deleteTrustItem = (id: string) => {
    update('trust.items', draft.trust.items.filter(t => t.id !== id))
  }
  const updateTrustItem = (id: string, field: keyof TrustItem, value: string) => {
    update('trust.items', draft.trust.items.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  // ── USP helpers ───────────────────────────────────────────────────────────

  const addUspItem = () => {
    const id = `u${Date.now()}`
    const newItem: FeatureItem = { id, title: 'Vorteil', description: 'Beschreibung' }
    update('usp.items', [...(draft.usp?.items ?? []), newItem])
  }
  const deleteUspItem = (id: string) => {
    update('usp.items', draft.usp.items.filter(u => u.id !== id))
  }
  const updateUspItem = (id: string, field: keyof FeatureItem, value: string) => {
    update('usp.items', draft.usp.items.map(u => u.id === id ? { ...u, [field]: value } : u))
  }

  // ── Nav link helpers ──────────────────────────────────────────────────────

  const addNavLink = () => {
    update('nav.links', [...(draft.nav?.links ?? []), { label: 'Link', href: '#' }])
  }
  const deleteNavLink = (i: number) => {
    update('nav.links', draft.nav.links.filter((_, idx) => idx !== i))
  }
  const updateNavLink = (i: number, field: 'label' | 'href', value: string) => {
    update('nav.links', draft.nav.links.map((l, idx) => idx === i ? { ...l, [field]: value } : l))
  }

  // ── Page helpers ──────────────────────────────────────────────────────────

  const addPage = () => {
    const id = `pg${Date.now()}`
    const newPage: PageItem = { id, title: 'Neue Seite', slug: `neue-seite-${id.slice(-4)}`, body: '<p>Hier kommt der Seiteninhalt.</p>', showInNav: false }
    update('pages', [...(draft.pages ?? []), newPage])
    setEditingPage(id)
    setActiveTab('pages')
  }
  const deletePage = (id: string) => {
    update('pages', (draft.pages ?? []).filter(p => p.id !== id))
    if (editingPage === id) setEditingPage(null)
  }
  const updatePage = (id: string, field: keyof PageItem, value: unknown) => {
    update('pages', (draft.pages ?? []).map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  // ── Quick-add handler ─────────────────────────────────────────────────────

  const handleQuickAdd = (action: string) => {
    setAddMenuOpen(false)
    if (action === 'product') { addProduct(); setActiveTab('products') }
    else if (action === 'category') { addCategory(); setActiveTab('categories') }
    else if (action === 'page') { addPage() }
    else if (action === 'news') { addNews(); setActiveTab('news') }
    else if (action === 'navlink') { addNavLink(); setActiveTab('nav') }
  }

  const tabs: Array<{ id: PanelTab; label: string }> = [
    { id: 'products',   label: 'Produkte' },
    { id: 'categories', label: 'Kategorien' },
    { id: 'hero',       label: 'Hero' },
    { id: 'trust',      label: 'Vorteile' },
    { id: 'usp',        label: 'USPs' },
    { id: 'news',       label: 'Aktuelles' },
    { id: 'pages',      label: 'Seiten' },
    { id: 'contact',    label: 'Kontakt' },
    { id: 'nav',        label: 'Navigation' },
    { id: 'style',      label: 'Stil' },
  ]

  const editingProd = editingProduct ? draft.products?.items?.find(p => p.id === editingProduct) : null
  const editingNewsItem = editingNews ? draft.news?.items?.find(n => n.id === editingNews) : null
  const editingCat = editingCategory ? draft.categories?.items?.find(c => c.id === editingCategory) : null

  return (
    <div className={`builder${mcTheme ? ' mc-theme' : ''}`}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChangeAll} />

      {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
      <div className="builder-topbar">
        {mcTheme && <MCTopbarTrees />}
        <EnderDragon onCatch={() => triggerAchievement('Achievement Get!  Enderdrachen gefangen!')} />
        <div className="builder-brand">
          <span className="builder-brand-dot" />
          <strong>{draft.nav?.brand || 'Meine Website'}</strong>
          <span className="builder-crafting-badge">Crafting Table Edition</span>
        </div>
        <div className="builder-device-switch" role="group" aria-label="Ansicht wählen">
          {DEVICE_OPTS.map(d => (
            <button
              key={d.id}
              type="button"
              className={`builder-device-btn ${device === d.id ? 'active' : ''}`}
              aria-pressed={device === d.id}
              title={d.id === 'edit' ? 'Canvas bearbeiten' : `${d.label}-Vorschau`}
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
            title={mcTheme ? 'Minecraft-Theme ausschalten' : 'Minecraft-Theme einschalten'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.71 5.63l-2.34-2.34a1 1 0 0 0-1.41 0l-3 3-1.42-1.42-1.41 1.42 1.41 1.41L3 17.25V21h3.75l9.96-9.96 1.41 1.42 1.42-1.42-1.42-1.41 3-3a1 1 0 0 0 0-1.42z"/>
            </svg>
            {mcTheme ? 'MC: AN' : 'MC: AUS'}
          </button>
          <span className="builder-user">{user.name || user.email}</span>
          <div className="builder-add-wrap" ref={addMenuRef}>
            <button className="builder-add-btn" onClick={() => setAddMenuOpen(o => !o)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Hinzufügen
            </button>
            {addMenuOpen && (
              <div className="builder-add-menu">
                <button className="builder-add-item" onClick={() => handleQuickAdd('product')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                  Neues Produkt
                </button>
                <button className="builder-add-item" onClick={() => handleQuickAdd('category')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  Neue Kategorie
                </button>
                <button className="builder-add-item" onClick={() => handleQuickAdd('news')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Neue Neuigkeit
                </button>
                <div className="builder-add-sep" />
                <button className="builder-add-item" onClick={() => handleQuickAdd('page')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                  Neue Seite
                </button>
                <button className="builder-add-item" onClick={() => handleQuickAdd('navlink')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Nav-Link
                </button>
              </div>
            )}
          </div>
          <button
            className={`builder-save-btn-top ${saving ? 'loading' : ''} ${saved ? 'done' : ''} ${saveError ? 'error' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Speichern…' : saved ? 'Gespeichert' : saveError ? 'Fehler!' : 'Speichern'}
          </button>
          <button className="builder-btn-ghost" onClick={onLogout}>Logout</button>
        </div>
      </div>
      {mcAchievement && <MCToast text={mcAchievement} />}

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div className="builder-body">

        {/* LEFT: Canvas editor OR device preview */}
        {device === 'edit' ? (
          <div className="builder-canvas-pane" ref={previewRef} onClick={handleCanvasClick}>
            <PublicSite
              content={draft}
              editMode={true}
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
              onProductDblClick={(id: string) => {
                setEditingProduct(id)
                setProductModal(id)
              }}
              onSectionClick={(tab: string) => setActiveTab(tab as PanelTab)}
            />
          </div>
        ) : (
          <div className="builder-device-stage">
            <div className="device-frame-wrap">
              <div className={`device-frame device-${device}`}>
                <PublicSite content={draft} />
              </div>
              <div className="device-frame-label">
                {device === 'desktop' ? 'Web · 1280 px' : device === 'tablet' ? 'Tablet · 834 px' : 'Mobil · 390 px'}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT: Panel */}
        <aside className="builder-panel" style={{ width: panelWidth }}>
          <div className="builder-panel-resize" onMouseDown={startPanelResize} />
          {/* Tab bar */}
          <div className="builder-tabs">
            {tabs.map(t => (
              <button key={t.id} className={`builder-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="builder-panel-body" ref={panelBodyRef}>

            {/* ── PRODUCTS TAB ──────────────────────────────────────────── */}
            {activeTab === 'products' && (
              <div className="panel-products">

                {editingProd ? (
                  /* ─ Product edit form ─ */
                  <div className="panel-product-form">
                    <button className="panel-back-btn" onClick={() => setEditingProduct(null)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                      Zur Liste
                    </button>

                    {/* Image */}
                    <div className="panel-product-img-area" onClick={() => uploadProductImage(editingProd.id)}>
                      {editingProd.image
                        ? <img src={editingProd.image} alt={editingProd.name} />
                        : <div className="panel-product-img-empty">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <span>Bild hochladen</span>
                          </div>
                      }
                      <div className="panel-product-img-overlay">Bild ändern</div>
                    </div>

                    <Field label="Name">
                      <input value={editingProd.name} onChange={e => updateProduct(editingProd.id, 'name', e.target.value)} placeholder="Produktname" />
                    </Field>
                    <Field label="Preis">
                      <input value={editingProd.price} onChange={e => updateProduct(editingProd.id, 'price', e.target.value)} placeholder="ab €799" />
                    </Field>
                    <Field label="Kategorie">
                      <select value={editingProd.category} onChange={e => updateProduct(editingProd.id, 'category', e.target.value)}>
                        {(draft.products?.tabs?.filter(t => t !== 'Alle') ?? ['E-Bikes']).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Bezeichnung">
                      <input value={editingProd.badge ?? ''} onChange={e => updateProduct(editingProd.id, 'badge', e.target.value)} placeholder="Bestseller, Beliebt …" />
                    </Field>
                    <Field label="Spezifikationen">
                      <div className="pem-tags" style={{ marginBottom: 6 }}>
                        {(editingProd.specs ?? []).map((s, i) => (
                          <span key={i} className="pem-tag">
                            {s}
                            <button onClick={() => updateProduct(editingProd.id, 'specs', (editingProd.specs ?? []).filter((_, idx) => idx !== i))} title="Entfernen">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="pem-tag-input-row">
                        <input
                          value={specsInput}
                          onChange={e => setSpecsInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { e.preventDefault(); const v = specsInput.trim(); if (v) { updateProduct(editingProd.id, 'specs', [...(editingProd.specs ?? []), v]); setSpecsInput('') } }
                          }}
                          placeholder="Spec + Enter"
                        />
                        <button className="pem-tag-add" onClick={() => { const v = specsInput.trim(); if (v) { updateProduct(editingProd.id, 'specs', [...(editingProd.specs ?? []), v]); setSpecsInput('') } }}>+</button>
                      </div>
                    </Field>
                    <Field label="Beschreibung">
                      <textarea rows={3} value={editingProd.description} onChange={e => updateProduct(editingProd.id, 'description', e.target.value)} placeholder="Kurze Produktbeschreibung" />
                    </Field>

                    <button className="panel-delete-btn" onClick={() => deleteProduct(editingProd.id)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      Produkt löschen
                    </button>
                  </div>
                ) : (
                  /* ─ Product list ─ */
                  <>
                    <div className="panel-product-list">
                      {(draft.products?.items ?? []).map(p => (
                        <div
                          key={p.id}
                          className={`panel-product-row${editingProduct === p.id ? ' panel-product-row--active' : ''}`}
                          data-prod-selected={editingProduct === p.id ? true : undefined}
                          onClick={() => setEditingProduct(p.id)}
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
                    <button className="panel-add-big-btn" onClick={addProduct}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Produkt hinzufügen
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── HERO TAB ──────────────────────────────────────────────── */}
            {activeTab === 'hero' && (
              <>
                <PanelSection title="Hintergrundbild">
                  <UploadRow src={draft.hero?.image ?? ''} onUpload={() => handleImageClick('hero.image')} uploading={uploading && uploadTarget === 'hero.image'} />
                </PanelSection>
                <PanelSection title="Tag (oben)">
                  <Field label="Tag-Text">
                    <input value={draft.hero?.tag ?? ''} onChange={e => update('hero.tag', e.target.value)} placeholder="Direktimporteur · Graz · Österreich" />
                  </Field>
                </PanelSection>
                <PanelSection title="Überschrift">
                  <Field label="H1">
                    <input value={draft.hero?.headline ?? ''} onChange={e => update('hero.headline', e.target.value)} placeholder="Elektromobilität. Jetzt." />
                  </Field>
                  <Field label="Unterzeile">
                    <textarea rows={2} value={draft.hero?.subheadline ?? ''} onChange={e => update('hero.subheadline', e.target.value)} />
                  </Field>
                </PanelSection>
                <PanelSection title="Buttons">
                  <Field label="Button 1 Text">
                    <input value={draft.hero?.ctaLabel ?? ''} onChange={e => update('hero.ctaLabel', e.target.value)} />
                  </Field>
                  <Field label="Button 1 Link">
                    <input value={draft.hero?.ctaHref ?? ''} onChange={e => update('hero.ctaHref', e.target.value)} placeholder="#products" />
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
                    <button className="panel-add-big-btn" onClick={addNews}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Neuigkeit hinzufügen
                    </button>
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
                  <Field label="Google Maps Embed-URL">
                    <textarea rows={2} value={draft.contact?.mapSrc ?? ''} onChange={e => update('contact.mapSrc', e.target.value)} placeholder="https://maps.google.com/maps?q=…&output=embed" />
                  </Field>
                  <Field label="">
                    <label className="panel-checkbox">
                      <input type="checkbox" checked={draft.contact?.formEnabled ?? false} onChange={e => update('contact.formEnabled', e.target.checked)} />
                      Kontaktformular anzeigen
                    </label>
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
                    <button className="panel-add-big-btn" onClick={addCategory}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Kategorie hinzufügen
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── TRUST TAB ─────────────────────────────────────────────── */}
            {activeTab === 'trust' && (
              <div className="panel-products">
                <div className="panel-inline-list">
                  {(draft.trust?.items ?? []).map(t => (
                    <div key={t.id} className="panel-inline-item">
                      <div className="panel-inline-item-fields">
                        <Field label="Fett">
                          <input value={t.bold} onChange={e => updateTrustItem(t.id, 'bold', e.target.value)} placeholder="Direktimporteur" />
                        </Field>
                        <Field label="Text">
                          <input value={t.text} onChange={e => updateTrustItem(t.id, 'text', e.target.value)} placeholder="seit 2019" />
                        </Field>
                        <Field label="Icon">
                          <select value={t.icon} onChange={e => updateTrustItem(t.id, 'icon', e.target.value)}>
                            {['shield', 'truck', 'star', 'check', 'phone', 'heart', 'bolt', 'tag'].map(ic => (
                              <option key={ic} value={ic}>{ic}</option>
                            ))}
                          </select>
                        </Field>
                      </div>
                      <button className="panel-inline-delete" onClick={() => deleteTrustItem(t.id)} title="Entfernen">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button className="panel-add-big-btn" onClick={addTrustItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Vorteil hinzufügen
                </button>
              </div>
            )}

            {/* ── USP TAB ───────────────────────────────────────────────── */}
            {activeTab === 'usp' && (
              <div className="panel-products">
                <div className="panel-inline-list">
                  {(draft.usp?.items ?? []).map(u => (
                    <div key={u.id} className="panel-inline-item">
                      <div className="panel-inline-item-fields">
                        <Field label="Titel">
                          <input value={u.title} onChange={e => updateUspItem(u.id, 'title', e.target.value)} />
                        </Field>
                        <Field label="Beschreibung">
                          <textarea rows={2} value={u.description} onChange={e => updateUspItem(u.id, 'description', e.target.value)} />
                        </Field>
                      </div>
                      <button className="panel-inline-delete" onClick={() => deleteUspItem(u.id)} title="Entfernen">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button className="panel-add-big-btn" onClick={addUspItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  USP hinzufügen
                </button>
              </div>
            )}

            {/* ── NAV TAB ───────────────────────────────────────────────── */}
            {activeTab === 'nav' && (
              <>
                <PanelSection title="Markenname">
                  <Field label="Anzeigename">
                    <input value={draft.nav?.brand ?? ''} onChange={e => update('nav.brand', e.target.value)} />
                  </Field>
                </PanelSection>
                <PanelSection title="Logo">
                  <UploadRow src={draft.nav?.logo ?? ''} onUpload={() => handleImageClick('nav.logo')} uploading={uploading && uploadTarget === 'nav.logo'} />
                </PanelSection>
                <PanelSection title="Telefonnummer (Nav)">
                  <Field label="Nummer">
                    <input value={draft.nav?.phone ?? ''} onChange={e => update('nav.phone', e.target.value)} placeholder="+43 664 000 0000" />
                  </Field>
                </PanelSection>
                <PanelSection title="Navigation Links">
                  <div className="panel-inline-list">
                    {(draft.nav?.links ?? []).map((l, i) => (
                      <div key={i} className="panel-inline-item panel-inline-item--compact">
                        <div className="panel-inline-item-fields">
                          <Field label="Label">
                            <input value={l.label} onChange={e => updateNavLink(i, 'label', e.target.value)} placeholder="Startseite" />
                          </Field>
                          <Field label="Link">
                            <input value={l.href} onChange={e => updateNavLink(i, 'href', e.target.value)} placeholder="#products" />
                          </Field>
                        </div>
                        <button className="panel-inline-delete" onClick={() => deleteNavLink(i)} title="Entfernen">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="panel-add-big-btn" style={{ marginTop: 8 }} onClick={addNavLink}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Link hinzufügen
                  </button>
                </PanelSection>
                <PanelSection title="CTA Button">
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
              </>
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
                <PanelSection title="SEO / Meta">
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
                    { id: 'usp' as SectionId, label: 'Vorteile (USPs)' },
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
                      <Field label="URL-Slug (nach #p/)">
                        <input value={editingPageItem.slug} onChange={e => updatePage(editingPageItem.id, 'slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="meine-seite" />
                      </Field>
                      <Field label="">
                        <div style={{ padding: '7px 10px', background: '#f5f9ff', borderRadius: 7, fontSize: 12, color: '#0099CC', fontFamily: 'monospace' }}>
                          Link: <strong>#p/{editingPageItem.slug}</strong>
                        </div>
                      </Field>
                      <Field label="">
                        <label className="panel-checkbox">
                          <input type="checkbox" checked={editingPageItem.showInNav ?? false} onChange={e => updatePage(editingPageItem.id, 'showInNav', e.target.checked)} />
                          In Navigation anzeigen
                        </label>
                      </Field>
                      <Field label="SEO-Titel (optional)">
                        <input value={editingPageItem.metaTitle ?? ''} onChange={e => updatePage(editingPageItem.id, 'metaTitle', e.target.value)} placeholder={`${editingPageItem.title} — ${draft.meta?.title ?? ''}`} />
                      </Field>
                      <Field label="Seiteninhalt (HTML)">
                        <textarea
                          rows={10}
                          value={editingPageItem.body}
                          onChange={e => updatePage(editingPageItem.id, 'body', e.target.value)}
                          placeholder="<p>Hier kommt Ihr Text...</p>"
                          style={{ fontFamily: 'monospace', fontSize: 12 }}
                        />
                      </Field>
                      <button className="panel-delete-btn" onClick={() => deletePage(editingPageItem.id)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        Seite löschen
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="panel-product-list">
                        {(draft.pages ?? []).length === 0 && (
                          <div style={{ padding: '20px 16px', color: '#aaa', fontSize: 13, textAlign: 'center' }}>
                            Noch keine Seiten. Erstell eine mit dem Button unten.
                          </div>
                        )}
                        {(draft.pages ?? []).map(p => (
                          <div key={p.id} className="panel-product-row" onClick={() => setEditingPage(p.id)}>
                            <div className="panel-product-info">
                              <div className="panel-product-name">{p.title}</div>
                              <div className="panel-product-meta">#p/{p.slug}{p.showInNav ? ' · Nav' : ''}</div>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                          </div>
                        ))}
                      </div>
                      <button className="panel-add-big-btn" onClick={addPage}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Seite hinzufügen
                      </button>
                    </>
                  )}
                </div>
              )
            })()}

          </div>

          {/* SAVE FOOTER */}
          <div className="builder-panel-foot">
            <button
              className={`builder-save-btn ${saving ? 'loading' : ''} ${saved ? 'done' : ''} ${saveError ? 'error' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Speichern…' : saved ? 'Gespeichert!' : saveError ? 'Fehler beim Speichern' : 'Speichern'}
            </button>
          </div>
        </aside>
      </div>

      {/* ── PRODUCT EDIT MODAL ──────────────────────────────────────────── */}
      {productModal && (() => {
        const mp = draft.products?.items?.find(p => p.id === productModal)
        if (!mp) return null
        return (
          <ProductEditModal
            product={mp}
            draft={draft}
            saving={saving}
            onUpdate={updateProduct}
            onDelete={(id) => { deleteProduct(id); setProductModal(null) }}
            onUpload={uploadProductImage}
            onClose={() => setProductModal(null)}
            onPublish={handleSave}
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

// ── Product Edit Modal ─────────────────────────────────────────────────────────

function ProductEditModal({
  product, draft, saving, onUpdate, onDelete, onUpload, onClose, onPublish,
}: {
  product: ProductItem
  draft: SiteContent
  saving: boolean
  onUpdate: (id: string, field: keyof ProductItem, value: unknown) => void
  onDelete: (id: string) => void
  onUpload: (id: string) => void
  onClose: () => void
  onPublish: () => Promise<void>
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [specsInput, setSpecsInput] = useState('')

  const categories = draft.categories?.items?.map(c => c.name) ?? []
  const u = (field: keyof ProductItem, val: unknown) => onUpdate(product.id, field, val)

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
    setPublishing(true)
    await onPublish()
    setPublishing(false)
    onClose()
  }

  return (
    <div className="pem-overlay" onClick={onClose}>
      <div className="pem" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="pem-header">
          <span className="pem-title">Produkt bearbeiten</span>
          <button className="pem-close" onClick={onClose} title="Schliessen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="pem-body">

          {/* Image */}
          <div className="pem-img-area">
            {product.image
              ? <img src={product.image} alt={product.name} className="pem-img" />
              : <div className="pem-img-placeholder">Kein Bild</div>
            }
            <button className="pem-img-btn" onClick={() => onUpload(product.id)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Bild tauschen
            </button>
          </div>

          {/* Fields */}
          <div className="pem-fields">
            <div className="pem-field">
              <label>Name</label>
              <input value={product.name} onChange={e => u('name', e.target.value)} />
            </div>

            <div className="pem-row">
              <div className="pem-field">
                <label>Preis</label>
                <input value={product.price} onChange={e => u('price', e.target.value)} placeholder="z.B. 1.299 €" />
              </div>
              <div className="pem-field">
                <label>Streichpreis</label>
                <input value={product.regularPrice ?? ''} onChange={e => u('regularPrice', e.target.value)} placeholder="optional" />
              </div>
              <div className="pem-field">
                <label>Badge</label>
                <input value={product.badge ?? ''} onChange={e => u('badge', e.target.value)} placeholder="z.B. NEU" />
              </div>
            </div>

            <div className="pem-field">
              <label>Kategorie</label>
              <select value={product.category} onChange={e => u('category', e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                {!categories.includes(product.category) && (
                  <option value={product.category}>{product.category}</option>
                )}
              </select>
            </div>

            <div className="pem-field">
              <label>Beschreibung</label>
              <textarea rows={3} value={product.description} onChange={e => u('description', e.target.value)} />
            </div>

            <div className="pem-field">
              <label>Details (HTML erlaubt)</label>
              <textarea rows={3} value={product.details ?? ''} onChange={e => u('details', e.target.value)} placeholder="Optionale Detailinfos…" />
            </div>

            <div className="pem-field">
              <label>Lieferung</label>
              <textarea rows={2} value={product.delivery ?? ''} onChange={e => u('delivery', e.target.value)} placeholder="Lieferinfos…" />
            </div>

            <div className="pem-field">
              <label>Specs (Tags)</label>
              <div className="pem-tags">
                {(product.specs ?? []).map((s, i) => (
                  <span key={i} className="pem-tag">
                    {s}
                    <button onClick={() => removeSpec(i)} title="Entfernen">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="pem-tag-input-row">
                <input
                  value={specsInput}
                  onChange={e => setSpecsInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpec() } }}
                  placeholder="Spec eingeben + Enter"
                />
                <button className="pem-tag-add" onClick={addSpec}>+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pem-footer">
          {confirmDelete ? (
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
            <button className="pem-btn-ghost" onClick={onClose}>Schliessen</button>
            <button className="pem-btn-primary" onClick={handlePublish} disabled={saving || publishing}>
              {publishing ? 'Veröffentlichen…' : 'Speichern & Veröffentlichen'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
