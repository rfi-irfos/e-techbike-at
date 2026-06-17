import { useState, useEffect } from 'react'

// ── localStorage helpers ──────────────────────────────────────────────────────
const STORAGE_KEY = 'lazi_achievements'

function loadUnlocked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set(['ach-erste-schritte'])
    return new Set(JSON.parse(raw))
  } catch {
    return new Set(['ach-erste-schritte'])
  }
}

function saveUnlocked(s: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...s]))
}

// ── Achievement definitions ───────────────────────────────────────────────────
interface Achievement {
  id: string
  title: string
  desc: string
  icon: string
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-erste-schritte',  title: 'Erste Schritte',        desc: 'Website zum ersten Mal besucht',              icon: 'BOOT' },
  { id: 'ach-baumeisterin',    title: 'Baumeisterin',           desc: 'Erste Änderung im Builder gespeichert',        icon: 'WRCH' },
  { id: 'ach-haendlerin',      title: 'Händlerin',              desc: 'Erstes Produkt hinzugefügt',                  icon: 'CART' },
  { id: 'ach-fotografin',      title: 'Fotografin',             desc: 'Erstes Bild hochgeladen',                     icon: 'FOTO' },
  { id: 'ach-schreiberin',     title: 'Schreiberin',            desc: 'Erste Seite erstellt',                        icon: 'SEITE' },
  { id: 'ach-kontaktmeisterin',title: 'Kontaktmeisterin',       desc: 'Kontaktformular ausgefüllt',                  icon: 'MAIL' },
  { id: 'ach-diamant',         title: 'Diamant-Tier',           desc: '10 Produkte im Shop',                         icon: 'DIAM' },
  { id: 'ach-nether',          title: 'Nether-Portal',          desc: 'Zu spät nachts noch am Arbeiten',             icon: 'NETH' },
  { id: 'ach-enderdrachen',    title: 'Enderdrachen-Bezwingerin',desc: 'Alles auf der Website fertig',               icon: 'DRAG' },
  { id: 'ach-schaf',           title: 'Schaf-Flüsterin',        desc: 'Pinkes Schaf entdeckt',                       icon: 'SCHF' },
  { id: 'ach-ferkel',          title: 'Ferkel-Königin',         desc: 'Schwein gestreichelt',                        icon: 'FRKL' },
  { id: 'ach-kuh',             title: 'Kuh-Baronin',            desc: 'Kuh gemolken',                                icon: 'KUH' },
]

// ── Pixel-art icon renderer ───────────────────────────────────────────────────
function AchIcon({ icon, locked }: { icon: string; locked: boolean }) {
  const color = locked ? '#444' : undefined
  switch (icon) {
    case 'BOOT': return (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="2" width="8" height="2" fill={color ?? '#5B8731'}/>
        <rect x="2" y="4" width="12" height="6" fill={color ?? '#4a7028'}/>
        <rect x="0" y="10" width="16" height="2" fill={color ?? '#6B4226'}/>
        <rect x="2" y="8" width="4" height="4" fill={color ?? '#5B8731'}/>
      </svg>
    )
    case 'WRCH': return (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
        <rect x="6" y="0" width="4" height="4" fill={color ?? '#888'}/>
        <rect x="4" y="4" width="8" height="2" fill={color ?? '#aaa'}/>
        <rect x="6" y="6" width="4" height="8" fill={color ?? '#888'}/>
        <rect x="4" y="12" width="8" height="2" fill={color ?? '#6B4226'}/>
      </svg>
    )
    case 'CART': return (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="2" width="2" height="2" fill={color ?? '#888'}/>
        <rect x="2" y="2" width="12" height="2" fill={color ?? '#aaa'}/>
        <rect x="4" y="4" width="10" height="6" fill={color ?? '#888'}/>
        <rect x="4" y="12" width="3" height="3" fill={color ?? '#555'}/>
        <rect x="11" y="12" width="3" height="3" fill={color ?? '#555'}/>
      </svg>
    )
    case 'FOTO': return (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="4" width="16" height="10" fill={color ?? '#555'}/>
        <rect x="4" y="2" width="8" height="2" fill={color ?? '#555'}/>
        <circle cx="8" cy="9" r="3" fill={color ?? '#45D3E8'}/>
        <circle cx="8" cy="9" r="1.5" fill={color ?? '#fff'}/>
      </svg>
    )
    case 'SEITE': return (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="0" width="12" height="16" fill={color ?? '#ddd'}/>
        <rect x="4" y="4" width="8" height="1" fill={color ?? '#888'}/>
        <rect x="4" y="6" width="6" height="1" fill={color ?? '#888'}/>
        <rect x="4" y="8" width="7" height="1" fill={color ?? '#888'}/>
      </svg>
    )
    case 'MAIL': return (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="2" width="16" height="12" fill={color ?? '#555'}/>
        <rect x="0" y="2" width="16" height="2" fill={color ?? '#45D3E8'}/>
        <polygon points="0,2 8,8 16,2" fill={color ?? '#45D3E8'}/>
      </svg>
    )
    case 'DIAM': return (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="0" width="8" height="2" fill={color ?? '#45D3E8'}/>
        <rect x="2" y="2" width="12" height="6" fill={color ?? '#5DE4F5'}/>
        <rect x="4" y="8" width="8" height="4" fill={color ?? '#45D3E8'}/>
        <rect x="6" y="12" width="4" height="2" fill={color ?? '#2ab8cc'}/>
        <rect x="5" y="2" width="2" height="2" fill={color ?? '#fff'}/>
      </svg>
    )
    case 'NETH': return (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="0" width="16" height="16" fill={color ?? '#1a0033'}/>
        <rect x="4" y="2" width="8" height="12" fill={color ?? '#6600cc'}/>
        <rect x="5" y="4" width="6" height="8" fill={color ?? '#9933ff'}/>
        <rect x="6" y="6" width="4" height="4" fill={color ?? '#cc66ff'}/>
      </svg>
    )
    case 'DRAG': return (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="6" width="10" height="6" fill={color ?? '#220044'}/>
        <rect x="10" y="4" width="6" height="6" fill={color ?? '#2a0055'}/>
        <rect x="11" y="5" width="2" height="2" fill={color ?? '#cc00ff'}/>
        <rect x="14" y="5" width="2" height="2" fill={color ?? '#cc00ff'}/>
        <rect x="3" y="4" width="2" height="3" fill={color ?? '#1a0033'}/>
        <rect x="7" y="3" width="2" height="4" fill={color ?? '#1a0033'}/>
      </svg>
    )
    case 'SCHF': return (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="2" width="12" height="8" fill={color ?? '#ffaadd'}/>
        <rect x="0" y="4" width="4" height="6" fill={color ?? '#ffaadd'}/>
        <rect x="12" y="4" width="4" height="6" fill={color ?? '#ffaadd'}/>
        <rect x="4" y="8" width="3" height="6" fill={color ?? '#555'}/>
        <rect x="9" y="8" width="3" height="6" fill={color ?? '#555'}/>
        <rect x="6" y="2" width="4" height="2" fill={color ?? '#333'}/>
        <rect x="5" y="4" width="2" height="2" fill={color ?? '#fff'}/>
        <rect x="9" y="4" width="2" height="2" fill={color ?? '#fff'}/>
      </svg>
    )
    case 'FRKL': return (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="4" width="12" height="8" fill={color ?? '#ffbbaa'}/>
        <rect x="4" y="10" width="2" height="4" fill={color ?? '#cc8877'}/>
        <rect x="10" y="10" width="2" height="4" fill={color ?? '#cc8877'}/>
        <rect x="5" y="2" width="6" height="4" fill={color ?? '#ffbbaa'}/>
        <rect x="6" y="5" width="4" height="3" fill={color ?? '#ffccbb'}/>
        <rect x="5" y="6" width="2" height="1" fill={color ?? '#333'}/>
        <rect x="9" y="6" width="2" height="1" fill={color ?? '#333'}/>
        <rect x="6" y="8" width="4" height="1" fill={color ?? '#cc8877'}/>
      </svg>
    )
    case 'KUH': return (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="4" width="12" height="8" fill={color ?? '#fff'}/>
        <rect x="4" y="4" width="4" height="4" fill={color ?? '#333'}/>
        <rect x="10" y="6" width="3" height="3" fill={color ?? '#333'}/>
        <rect x="4" y="10" width="2" height="4" fill={color ?? '#888'}/>
        <rect x="10" y="10" width="2" height="4" fill={color ?? '#888'}/>
        <rect x="5" y="2" width="6" height="3" fill={color ?? '#fff'}/>
        <rect x="5" y="3" width="2" height="1" fill={color ?? '#333'}/>
        <rect x="9" y="3" width="2" height="1" fill={color ?? '#333'}/>
      </svg>
    )
    default: return (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="2" width="12" height="12" fill={color ?? '#FFD700'}/>
      </svg>
    )
  }
}

// ── Mob components ────────────────────────────────────────────────────────────

function PigMob() {
  return (
    <div className="lazi-mob lazi-pig" title="Klick mich!">
      <svg viewBox="0 0 20 16" width="40" height="32" style={{ imageRendering: 'pixelated', display: 'block' }}>
        {/* body */}
        <rect x="2" y="4" width="14" height="10" fill="#ffbbaa"/>
        {/* head */}
        <rect x="10" y="2" width="8" height="8" fill="#ffbbaa"/>
        {/* snout */}
        <rect x="14" y="5" width="4" height="3" fill="#ff9988"/>
        <rect x="15" y="6" width="1" height="1" fill="#cc6655"/>
        <rect x="17" y="6" width="1" height="1" fill="#cc6655"/>
        {/* eyes */}
        <rect x="11" y="3" width="2" height="2" fill="#333"/>
        {/* ears */}
        <rect x="11" y="0" width="2" height="3" fill="#ffbbaa"/>
        <rect x="15" y="0" width="2" height="3" fill="#ffbbaa"/>
        {/* legs */}
        <rect x="3" y="13" width="3" height="3" fill="#ffbbaa"/>
        <rect x="10" y="13" width="3" height="3" fill="#ffbbaa"/>
      </svg>
    </div>
  )
}

function SheepMob() {
  return (
    <div className="lazi-mob lazi-sheep" title="Baa!">
      <svg viewBox="0 0 22 18" width="44" height="36" style={{ imageRendering: 'pixelated', display: 'block' }}>
        {/* woolly body — pink */}
        <rect x="2" y="4" width="14" height="8" fill="#ffaadd"/>
        <rect x="0" y="6" width="4" height="4" fill="#ffaadd"/>
        <rect x="14" y="6" width="4" height="4" fill="#ffaadd"/>
        {/* head */}
        <rect x="14" y="2" width="6" height="8" fill="#888"/>
        {/* eyes */}
        <rect x="15" y="4" width="1" height="1" fill="#fff"/>
        <rect x="18" y="4" width="1" height="1" fill="#fff"/>
        {/* mouth */}
        <rect x="16" y="7" width="3" height="1" fill="#555"/>
        {/* legs */}
        <rect x="4" y="12" width="2" height="4" fill="#888"/>
        <rect x="8" y="12" width="2" height="4" fill="#888"/>
        <rect x="12" y="12" width="2" height="4" fill="#888"/>
      </svg>
    </div>
  )
}

function CowMob() {
  return (
    <div className="lazi-mob lazi-cow" title="Muh!">
      <svg viewBox="0 0 22 18" width="44" height="36" style={{ imageRendering: 'pixelated', display: 'block' }}>
        {/* body */}
        <rect x="2" y="4" width="14" height="10" fill="#fff"/>
        <rect x="4" y="5" width="4" height="4" fill="#333"/>
        <rect x="10" y="7" width="3" height="3" fill="#333"/>
        {/* head */}
        <rect x="14" y="2" width="7" height="9" fill="#fff"/>
        <rect x="14" y="3" width="2" height="2" fill="#333"/>
        {/* snout */}
        <rect x="19" y="5" width="3" height="3" fill="#ffbbaa"/>
        <rect x="19" y="6" width="1" height="1" fill="#cc8877"/>
        <rect x="21" y="6" width="1" height="1" fill="#cc8877"/>
        {/* horns */}
        <rect x="15" y="0" width="2" height="3" fill="#888"/>
        <rect x="19" y="0" width="2" height="3" fill="#888"/>
        {/* legs */}
        <rect x="3" y="14" width="2" height="4" fill="#888"/>
        <rect x="8" y="14" width="2" height="4" fill="#888"/>
        <rect x="12" y="14" width="2" height="4" fill="#888"/>
      </svg>
    </div>
  )
}

function DragonMob() {
  return (
    <div className="lazi-mob lazi-dragon" title="Raaawr!">
      <svg viewBox="0 0 64 32" width="128" height="64" style={{ imageRendering: 'pixelated', display: 'block', overflow: 'visible' }}>
        {/* tail */}
        <rect x="0"  y="18" width="4" height="4" fill="#1a0033"/>
        <rect x="4"  y="16" width="6" height="6" fill="#220044"/>
        {/* body */}
        <rect x="10" y="12" width="24" height="10" fill="#1a0033"/>
        {/* wing left */}
        <polygon points="14,12 2,2 12,10 16,12" fill="#2d004d"/>
        {/* wing right */}
        <polygon points="28,12 38,2 30,10 26,12" fill="#2d004d"/>
        {/* neck */}
        <rect x="34" y="8" width="8" height="10" fill="#220044"/>
        {/* head */}
        <rect x="40" y="4" width="18" height="14" fill="#2a0055"/>
        {/* eyes */}
        <rect x="42" y="7" width="3" height="3" fill="#cc00ff"/>
        <rect x="52" y="7" width="3" height="3" fill="#cc00ff"/>
        {/* eye glow */}
        <rect x="43" y="8" width="1" height="1" fill="#ff88ff"/>
        <rect x="53" y="8" width="1" height="1" fill="#ff88ff"/>
        {/* horns */}
        <rect x="42" y="1" width="2" height="5" fill="#1a0033"/>
        <rect x="52" y="0" width="2" height="6" fill="#1a0033"/>
      </svg>
    </div>
  )
}

function EndermanMob() {
  return (
    <div className="lazi-mob lazi-creeper" title="Hallo! :)">
      <svg viewBox="0 0 10 32" width="24" height="64" style={{ imageRendering: 'pixelated', display: 'block' }}>
        {/* head — small and cute */}
        <rect x="1" y="0" width="8" height="8" fill="#1a1a2e"/>
        {/* big cute purple eyes */}
        <rect x="2" y="2" width="2" height="2" fill="#aa44ff"/>
        <rect x="6" y="2" width="2" height="2" fill="#aa44ff"/>
        {/* little smile */}
        <rect x="3" y="6" width="4" height="1" fill="#aa44ff"/>
        {/* long thin body */}
        <rect x="3" y="8" width="4" height="10" fill="#1a1a2e"/>
        {/* long thin legs */}
        <rect x="3" y="18" width="1" height="8" fill="#1a1a2e"/>
        <rect x="6" y="18" width="1" height="8" fill="#1a1a2e"/>
        {/* long thin arms */}
        <rect x="1" y="9" width="2" height="7" fill="#1a1a2e"/>
        <rect x="7" y="9" width="2" height="7" fill="#1a1a2e"/>
        {/* purple particle sparkles */}
        <rect x="0" y="4" width="1" height="1" fill="#aa44ff"/>
        <rect x="9" y="6" width="1" height="1" fill="#aa44ff"/>
      </svg>
    </div>
  )
}

// ── Main LaziPanel ────────────────────────────────────────────────────────────
type LaziTab = 'achievements' | 'kontakte' | 'rechnungen'

export function LaziPanel() {
  const [tab, setTab] = useState<LaziTab>('achievements')
  const [unlocked, setUnlocked] = useState<Set<string>>(loadUnlocked)
  const [clickedMob, setClickedMob] = useState<string | null>(null)
  const [showRechnungen, setShowRechnungen] = useState(false)

  // Unlock "Erste Schritte" on first visit
  useEffect(() => {
    if (!unlocked.has('ach-erste-schritte')) {
      const next = new Set(unlocked)
      next.add('ach-erste-schritte')
      setUnlocked(next)
      saveUnlocked(next)
    }
  }, [])

  // Check if it's late (Nether Portal achievement)
  useEffect(() => {
    const h = new Date().getHours()
    if ((h >= 22 || h < 4) && !unlocked.has('ach-nether')) {
      const next = new Set(unlocked)
      next.add('ach-nether')
      setUnlocked(next)
      saveUnlocked(next)
    }
  }, [])

  function handleMobClick(mobId: string, achId: string) {
    setClickedMob(mobId)
    setTimeout(() => setClickedMob(null), 600)
    if (!unlocked.has(achId)) {
      const next = new Set(unlocked)
      next.add(achId)
      setUnlocked(next)
      saveUnlocked(next)
    }
  }

  const unlockedCount = ACHIEVEMENTS.filter(a => unlocked.has(a.id)).length

  return (
    <div className="lazi-panel">
      {/* Header */}
      <div className="lazi-header">
        <div className="lazi-header-dirt" />
        <div className="lazi-header-inner">
          <a href="#" className="lazi-back-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Zurueck
          </a>
          <span className="lazi-title">Timi's Welt</span>
          <span className="lazi-score">{unlockedCount}/{ACHIEVEMENTS.length} Achievements</span>
        </div>
      </div>

      {/* Inventory tab bar */}
      <div className="lazi-tabs">
        {(['achievements', 'kontakte', 'rechnungen'] as LaziTab[]).map(t => (
          <button
            key={t}
            className={`lazi-tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'achievements' ? 'Achievements' : t === 'kontakte' ? 'Kontakte' : 'Rechnungen'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="lazi-content">

        {tab === 'achievements' && (
          <div className="lazi-achievements">
            <div className="lazi-ach-grid">
              {ACHIEVEMENTS.map(ach => {
                const isUnlocked = unlocked.has(ach.id)
                return (
                  <div key={ach.id} className={`lazi-ach-slot${isUnlocked ? ' unlocked' : ' locked'}`} title={ach.desc}>
                    <div className="lazi-ach-icon">
                      <AchIcon icon={ach.icon} locked={!isUnlocked} />
                    </div>
                    <div className="lazi-ach-title">{ach.title}</div>
                    <div className="lazi-ach-desc">{isUnlocked ? ach.desc : '???'}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'kontakte' && (
          <div className="lazi-kontakte">
            <div className="lazi-contact-card">
              <div className="lazi-contact-name">Mama</div>
              <div className="lazi-contact-email">lauzitimi2@gmail.com</div>
            </div>
            <div className="lazi-contact-card">
              <div className="lazi-contact-name">Bikely Wien</div>
              <div className="lazi-contact-email">graz@bikelyshop.at</div>
            </div>
          </div>
        )}

        {tab === 'rechnungen' && (
          <div className="lazi-rechnungen">
            <div className="lazi-toggle-row">
              <span className="lazi-toggle-label">Rechnungen anzeigen</span>
              <button
                className={`lazi-toggle-btn ${showRechnungen ? 'on' : 'off'}`}
                onClick={() => setShowRechnungen(v => !v)}
              >{showRechnungen ? 'AN' : 'AUS'}</button>
            </div>
            {showRechnungen ? (
              <div className="lazi-empty-card">
                <div className="lazi-empty-chest">
                  <svg viewBox="0 0 32 24" width="64" height="48" style={{ imageRendering: 'pixelated' }}>
                    <rect x="0" y="8" width="32" height="16" fill="#6B4226"/>
                    <rect x="0" y="0" width="32" height="10" fill="#7A5230"/>
                    <rect x="2" y="1" width="28" height="8" fill="#8B6340"/>
                    <rect x="0" y="8" width="32" height="2" fill="#5A3618"/>
                    <rect x="12" y="7" width="8" height="4" fill="#888"/>
                    <rect x="14" y="8" width="4" height="2" fill="#FFD700"/>
                  </svg>
                </div>
                <div className="lazi-empty-text">Noch keine Rechnungen. Wenn du gross bist!</div>
              </div>
            ) : (
              <div className="lazi-empty-text" style={{ marginTop: 24 }}>Truhe ist zu. Drück AN um reinzuschauen.</div>
            )}
          </div>
        )}

      </div>

      {/* Mob area */}
      <div className="lazi-mob-area">
        <div className={`lazi-mob-wrap${clickedMob === 'pig' ? ' clicked' : ''}`} onClick={() => handleMobClick('pig', 'ach-ferkel')}>
          <PigMob />
        </div>
        <div className={`lazi-mob-wrap${clickedMob === 'sheep' ? ' clicked' : ''}`} onClick={() => handleMobClick('sheep', 'ach-schaf')}>
          <SheepMob />
        </div>
        <div className={`lazi-mob-wrap${clickedMob === 'cow' ? ' clicked' : ''}`} onClick={() => handleMobClick('cow', 'ach-kuh')}>
          <CowMob />
        </div>
        <div className={`lazi-mob-wrap lazi-mob-dragon${clickedMob === 'dragon' ? ' clicked' : ''}`} onClick={() => handleMobClick('dragon', 'ach-enderdrachen')}>
          <DragonMob />
        </div>
        <div className={`lazi-mob-wrap lazi-mob-creeper${clickedMob === 'enderman' ? ' clicked' : ''}`} onClick={() => handleMobClick('enderman', 'ach-enderdrachen')}>
          <EndermanMob />
        </div>
      </div>

      {/* Ground decoration */}
      <div className="lazi-ground" />
    </div>
  )
}
