// Shared Minecraft mob + landscape components
import { useState, useEffect, useRef, useCallback } from 'react'

export function MCTopbarTrees() {
  return (
    <div className="mc-topbar-trees" aria-hidden="true">
      <svg viewBox="0 0 380 46" width="380" height="46" style={{ imageRendering: 'pixelated', display: 'block' }} preserveAspectRatio="xMidYMax meet">
        <rect x="0"   y="34" width="380" height="4"  fill="#5D9E2E"/>
        <rect x="0"   y="38" width="380" height="8"  fill="#7A5230"/>
        <rect x="6"   y="10" width="18" height="6"  fill="#2D6020"/>
        <rect x="4"   y="16" width="22" height="6"  fill="#3A7D44"/>
        <rect x="2"   y="22" width="26" height="12" fill="#2D6020"/>
        <rect x="12"  y="30" width="8"  height="8"  fill="#6B4A1E"/>
        <rect x="44"  y="18" width="16" height="16" fill="#3A7D44"/>
        <rect x="47"  y="21" width="4"  height="4"  fill="#111"/>
        <rect x="57"  y="21" width="4"  height="4"  fill="#111"/>
        <rect x="51"  y="27" width="2"  height="3"  fill="#111"/>
        <rect x="55"  y="27" width="2"  height="3"  fill="#111"/>
        <rect x="49"  y="30" width="10" height="2"  fill="#111"/>
        <rect x="51"  y="29" width="6"  height="2"  fill="#111"/>
        <rect x="78"  y="6"  width="22" height="8"  fill="#2D6020"/>
        <rect x="76"  y="14" width="26" height="8"  fill="#3A7D44"/>
        <rect x="74"  y="22" width="30" height="12" fill="#2D6020"/>
        <rect x="84"  y="30" width="10" height="8"  fill="#6B4A1E"/>
        <rect x="118" y="26" width="12" height="4"  fill="#5D9E2E"/>
        <rect x="118" y="30" width="12" height="8"  fill="#7A5230"/>
        <rect x="132" y="28" width="12" height="2"  fill="#5D9E2E"/>
        <rect x="132" y="30" width="12" height="8"  fill="#7A5230"/>
        <rect x="160" y="8"  width="20" height="8"  fill="#2D6020"/>
        <rect x="158" y="16" width="24" height="8"  fill="#3A7D44"/>
        <rect x="156" y="24" width="28" height="10" fill="#2D6020"/>
        <rect x="166" y="30" width="8"  height="8"  fill="#6B4A1E"/>
        <rect x="200" y="20" width="16" height="14" fill="#3A7D44"/>
        <rect x="203" y="23" width="4"  height="4"  fill="#111"/>
        <rect x="213" y="23" width="4"  height="4"  fill="#111"/>
        <rect x="207" y="29" width="2"  height="3"  fill="#111"/>
        <rect x="211" y="29" width="2"  height="3"  fill="#111"/>
        <rect x="205" y="32" width="10" height="2"  fill="#111"/>
        <rect x="230" y="10" width="22" height="8"  fill="#2D6020"/>
        <rect x="228" y="18" width="26" height="8"  fill="#3A7D44"/>
        <rect x="226" y="26" width="30" height="8"  fill="#2D6020"/>
        <rect x="236" y="30" width="10" height="8"  fill="#6B4A1E"/>
        <rect x="270" y="24" width="14" height="4"  fill="#5D9E2E"/>
        <rect x="270" y="28" width="14" height="10" fill="#7A5230"/>
        <rect x="296" y="6"  width="20" height="8"  fill="#2D6020"/>
        <rect x="294" y="14" width="24" height="8"  fill="#3A7D44"/>
        <rect x="292" y="22" width="28" height="12" fill="#2D6020"/>
        <rect x="302" y="30" width="8"  height="8"  fill="#6B4A1E"/>
        <rect x="334" y="16" width="16" height="16" fill="#3A7D44"/>
        <rect x="337" y="19" width="4"  height="4"  fill="#111"/>
        <rect x="347" y="19" width="4"  height="4"  fill="#111"/>
        <rect x="341" y="25" width="2"  height="3"  fill="#111"/>
        <rect x="345" y="25" width="2"  height="3"  fill="#111"/>
        <rect x="339" y="28" width="10" height="2"  fill="#111"/>
        <rect x="358" y="12" width="22" height="8"  fill="#2D6020"/>
        <rect x="356" y="20" width="26" height="8"  fill="#3A7D44"/>
        <rect x="354" y="28" width="30" height="10" fill="#2D6020"/>
      </svg>
    </div>
  )
}

export function PigMob() {
  return (
    <div className="lazi-mob lazi-pig" title="Klick mich!">
      <svg viewBox="0 0 20 16" width="40" height="32" style={{ imageRendering: 'pixelated', display: 'block' }}>
        <rect x="2" y="4" width="14" height="10" fill="#ffbbaa"/>
        <rect x="10" y="2" width="8" height="8" fill="#ffbbaa"/>
        <rect x="14" y="5" width="4" height="3" fill="#ff9988"/>
        <rect x="15" y="6" width="1" height="1" fill="#cc6655"/>
        <rect x="17" y="6" width="1" height="1" fill="#cc6655"/>
        <rect x="11" y="3" width="2" height="2" fill="#333"/>
        <rect x="11" y="0" width="2" height="3" fill="#ffbbaa"/>
        <rect x="15" y="0" width="2" height="3" fill="#ffbbaa"/>
        <rect x="3" y="13" width="3" height="3" fill="#ffbbaa"/>
        <rect x="10" y="13" width="3" height="3" fill="#ffbbaa"/>
      </svg>
    </div>
  )
}

export function SheepMob() {
  return (
    <div className="lazi-mob lazi-sheep" title="Baa!">
      <svg viewBox="0 0 22 18" width="44" height="36" style={{ imageRendering: 'pixelated', display: 'block' }}>
        <rect x="2" y="4" width="14" height="8" fill="#ffaadd"/>
        <rect x="0" y="6" width="4" height="4" fill="#ffaadd"/>
        <rect x="14" y="6" width="4" height="4" fill="#ffaadd"/>
        <rect x="14" y="2" width="6" height="8" fill="#888"/>
        <rect x="15" y="4" width="1" height="1" fill="#fff"/>
        <rect x="18" y="4" width="1" height="1" fill="#fff"/>
        <rect x="16" y="7" width="3" height="1" fill="#555"/>
        <rect x="4" y="12" width="2" height="4" fill="#888"/>
        <rect x="8" y="12" width="2" height="4" fill="#888"/>
        <rect x="12" y="12" width="2" height="4" fill="#888"/>
      </svg>
    </div>
  )
}

export function CowMob() {
  return (
    <div className="lazi-mob lazi-cow" title="Muh!">
      <svg viewBox="0 0 22 18" width="44" height="36" style={{ imageRendering: 'pixelated', display: 'block' }}>
        <rect x="2" y="4" width="14" height="10" fill="#fff"/>
        <rect x="4" y="5" width="4" height="4" fill="#333"/>
        <rect x="10" y="7" width="3" height="3" fill="#333"/>
        <rect x="14" y="2" width="7" height="9" fill="#fff"/>
        <rect x="14" y="3" width="2" height="2" fill="#333"/>
        <rect x="19" y="5" width="3" height="3" fill="#ffbbaa"/>
        <rect x="19" y="6" width="1" height="1" fill="#cc8877"/>
        <rect x="21" y="6" width="1" height="1" fill="#cc8877"/>
        <rect x="15" y="0" width="2" height="3" fill="#888"/>
        <rect x="19" y="0" width="2" height="3" fill="#888"/>
        <rect x="3" y="14" width="2" height="4" fill="#888"/>
        <rect x="8" y="14" width="2" height="4" fill="#888"/>
        <rect x="12" y="14" width="2" height="4" fill="#888"/>
      </svg>
    </div>
  )
}

export function DragonMob() {
  return (
    <div className="lazi-mob lazi-dragon" title="Raaawr!">
      <svg viewBox="0 0 64 32" width="128" height="64" style={{ imageRendering: 'pixelated', display: 'block', overflow: 'visible' }}>
        <rect x="0"  y="18" width="4" height="4" fill="#1a0033"/>
        <rect x="4"  y="16" width="6" height="6" fill="#220044"/>
        <rect x="10" y="12" width="24" height="10" fill="#1a0033"/>
        <polygon points="14,12 2,2 12,10 16,12" fill="#2d004d"/>
        <polygon points="28,12 38,2 30,10 26,12" fill="#2d004d"/>
        <rect x="34" y="8" width="8" height="10" fill="#220044"/>
        <rect x="40" y="4" width="18" height="14" fill="#2a0055"/>
        <rect x="42" y="7" width="3" height="3" fill="#cc00ff"/>
        <rect x="52" y="7" width="3" height="3" fill="#cc00ff"/>
        <rect x="43" y="8" width="1" height="1" fill="#ff88ff"/>
        <rect x="53" y="8" width="1" height="1" fill="#ff88ff"/>
        <rect x="42" y="1" width="2" height="5" fill="#1a0033"/>
        <rect x="52" y="0" width="2" height="6" fill="#1a0033"/>
      </svg>
    </div>
  )
}

export function EndermanMob() {
  return (
    <div className="lazi-mob lazi-creeper" title="Hallo! :)">
      <svg viewBox="0 0 10 32" width="24" height="64" style={{ imageRendering: 'pixelated', display: 'block' }}>
        <rect x="1" y="0" width="8" height="8" fill="#1a1a2e"/>
        <rect x="2" y="2" width="2" height="2" fill="#aa44ff"/>
        <rect x="6" y="2" width="2" height="2" fill="#aa44ff"/>
        <rect x="3" y="6" width="4" height="1" fill="#aa44ff"/>
        <rect x="3" y="8" width="4" height="10" fill="#1a1a2e"/>
        <rect x="3" y="18" width="1" height="8" fill="#1a1a2e"/>
        <rect x="6" y="18" width="1" height="8" fill="#1a1a2e"/>
        <rect x="1" y="9" width="2" height="7" fill="#1a1a2e"/>
        <rect x="7" y="9" width="2" height="7" fill="#1a1a2e"/>
        <rect x="0" y="4" width="1" height="1" fill="#aa44ff"/>
        <rect x="9" y="6" width="1" height="1" fill="#aa44ff"/>
      </svg>
    </div>
  )
}

export function CreeperMob() {
  return (
    <div className="lazi-mob lazi-creeper" title="Ssss...">
      <svg viewBox="0 0 16 24" width="32" height="48" style={{ imageRendering: 'pixelated', display: 'block' }}>
        <rect x="0" y="0" width="16" height="16" fill="#3A7D44"/>
        <rect x="2" y="4" width="4" height="4" fill="#111"/>
        <rect x="10" y="4" width="4" height="4" fill="#111"/>
        <rect x="4" y="10" width="2" height="3" fill="#111"/>
        <rect x="10" y="10" width="2" height="3" fill="#111"/>
        <rect x="6" y="11" width="4" height="2" fill="#111"/>
        <rect x="4" y="13" width="8" height="1" fill="#111"/>
        <rect x="2" y="16" width="12" height="8" fill="#3A7D44"/>
        <rect x="2" y="24" width="4" height="4" fill="#2D6020"/>
        <rect x="10" y="24" width="4" height="4" fill="#2D6020"/>
      </svg>
    </div>
  )
}

export function MCMobStrip({ onMobClick }: { onMobClick?: (mob: string) => void }) {
  return (
    <div className="lazi-mob-area">
      <div className="lazi-mob-wrap" onClick={() => onMobClick?.('pig')}><PigMob /></div>
      <div className="lazi-mob-wrap" onClick={() => onMobClick?.('sheep')}><SheepMob /></div>
      <div className="lazi-mob-wrap" onClick={() => onMobClick?.('cow')}><CowMob /></div>
      <div className="lazi-mob-wrap lazi-mob-dragon" onClick={() => onMobClick?.('dragon')}><DragonMob /></div>
      <div className="lazi-mob-wrap lazi-mob-creeper" onClick={() => onMobClick?.('enderman')}><EndermanMob /></div>
    </div>
  )
}

export function WolfMob({ tamed, bones }: { tamed: boolean; bones: number }) {
  return (
    <div className="lazi-mob lazi-wolf" title={tamed ? 'Guter Wolf! Sitz!' : bones > 0 ? `${bones} Knochen — noch ${3 - bones} bis zahm!` : 'Klick um Knochen zu geben!'}>
      <svg viewBox="0 0 24 20" width="48" height="40" style={{ imageRendering: 'pixelated', display: 'block' }}>
        {/* body */}
        <rect x="4" y="6" width="14" height="9" fill={tamed ? '#aaa' : '#888'}/>
        {/* head */}
        <rect x="14" y="2" width="9" height="8" fill={tamed ? '#aaa' : '#888'}/>
        {/* snout */}
        <rect x="20" y="5" width="4" height="3" fill="#ccc"/>
        {/* nose */}
        <rect x="22" y="4" width="2" height="2" fill="#333"/>
        {/* eye */}
        <rect x="16" y="3" width="2" height="2" fill="#333"/>
        {/* ear */}
        <rect x="15" y="0" width="3" height="4" fill={tamed ? '#aaa' : '#888'}/>
        <rect x="20" y="0" width="3" height="4" fill={tamed ? '#aaa' : '#888'}/>
        {/* tail */}
        <rect x="0" y="4" width="4" height="3" fill={tamed ? '#aaa' : '#888'}/>
        <rect x="0" y="2" width="3" height="3" fill={tamed ? '#aaa' : '#888'}/>
        {/* legs */}
        <rect x="5" y="14" width="3" height="4" fill={tamed ? '#999' : '#777'}/>
        <rect x="10" y="14" width="3" height="4" fill={tamed ? '#999' : '#777'}/>
        <rect x="14" y="14" width="3" height="4" fill={tamed ? '#999' : '#777'}/>
        {/* collar when tamed */}
        {tamed && <rect x="14" y="7" width="5" height="2" fill="#0099CC"/>}
        {/* bone if feeding */}
        {!tamed && bones > 0 && <rect x="18" y="10" width="6" height="2" fill="#eee"/>}
      </svg>
    </div>
  )
}

export function CrmMobStrip({ onWolfClick, wolfBones, wolfTamed }: {
  onWolfClick?: () => void
  wolfBones?: number
  wolfTamed?: boolean
}) {
  return (
    <div className="lazi-mob-area">
      <div className="lazi-mob-wrap"><PigMob /></div>
      <div className="lazi-mob-wrap"><SheepMob /></div>
      <div className="lazi-mob-wrap"><CowMob /></div>
      <div className="lazi-mob-wrap lazi-mob-creeper"><CreeperMob /></div>
      <div className="lazi-mob-wrap lazi-mob-creeper"><EndermanMob /></div>
      <div className="lazi-mob-wrap" onClick={onWolfClick} style={{ cursor: 'pointer' }}>
        <WolfMob tamed={wolfTamed ?? false} bones={wolfBones ?? 0} />
      </div>
    </div>
  )
}

// ── Pixel sprite helpers ──────────────────────────────────────────────────────
type PR = { x: number; y: number; w: number; h: number; f: string }
const pb = (x: number, y: number, w: number, h: number, f: string): PR => ({ x, y, w, h, f })

function wolfWalkPx(tick: number, tamed: boolean, howling = false): PR[] {
  const leg = Math.sin(tick * 0.45) * 2
  const collar = tamed ? '#0099CC' : 'transparent'
  const w = '#d1d5db', d = '#9ca3af', e = '#111' // colors
  
  if (howling) return [
    pb(0, 8, 3, 7, d), // tail
    pb(3, 7, 18, 10, w), // body
    ...(tamed ? [pb(18, 9, 4, 2, collar)] : []),
    pb(21, 6, 8, 8, w), // head
    pb(29, 9, 3, 3, '#eee'), // snout
    pb(31, 8, 2, 2, e), // nose
    pb(25, 8, 2, 2, e), // eye
    pb(22, 3, 2, 3, w), pb(27, 3, 2, 3, w), // ears
    pb(5, 17, 3, 6, d), pb(11, 17, 3, 6, d), // legs
    pb(15, 17, 3, 6, d), pb(21, 17, 3, 6, d),
  ]

  return [
    pb(0, 8, 3, 7, d), // tail
    pb(3, 8, 18, 10, w), // body
    ...(tamed ? [pb(18, 10, 4, 2, collar)] : []),
    pb(21, 5, 8, 8, w), // head
    pb(29, 9, 3, 3, '#eee'), // snout
    pb(31, 8, 2, 2, e), // nose
    pb(24, 7, 2, 2, e), // eye
    pb(22, 2, 2, 3, w), pb(27, 2, 2, 3, w), // ears
    pb(5, 18, 3, 6 + leg, d), pb(11, 18, 3, 6 - leg, d), // legs
    pb(15, 18, 3, 6 - leg, d), pb(21, 18, 3, 6 + leg, d),
  ]
}

function wolfSitPx(tamed: boolean, eating = false): PR[] {
  const collar = tamed ? '#0099CC' : 'transparent'
  const w = '#d1d5db', d = '#9ca3af', e = '#111'
  return [
    pb(2, 14, 14, 10, w), // body
    ...(tamed ? [pb(16, 11, 4, 2, collar)] : []),
    pb(16, 6, 8, 8, w), // head
    pb(24, 10, 3, 3, '#eee'), // snout
    pb(26, 9, 2, 2, e), // nose
    pb(19, 8, 2, 2, e), // eye
    pb(17, 3, 2, 3, w), pb(22, 3, 2, 3, w), // ears
    pb(4, 24, 3, 6, d), pb(10, 24, 3, 6, d), // back legs
    pb(16, 24, 3, 6, d), pb(21, 24, 3, 6, d), // front legs
    pb(0, 6, 3, 10, d), // tail
    ...(eating ? [pb(26, 7, 5, 4, '#fbbf24'), pb(28, 9, 3, 2, '#92400e')] : []),
  ]
}

const TREE_PX: PR[] = [
  pb(11, 30, 8, 20, '#92400e'),
  pb(5, 20, 20, 14, '#15803d'), pb(1, 12, 28, 12, '#16a34a'),
  pb(5, 4, 20, 12, '#15803d'), pb(9, 0, 12, 8, '#166534'),
  pb(3, 14, 4, 4, '#166534'), pb(23, 14, 4, 4, '#166534'),
]

const CRAFTING_TABLE_PX: PR[] = [
  pb(0, 4, 24, 20, '#78350f'), // body
  pb(0, 0, 24, 4, '#92400e'),  // top
  pb(2, 2, 2, 2, '#451a03'),   // top dot
  pb(20, 2, 2, 2, '#451a03'),  // top dot
  pb(2, 6, 6, 6, '#451a03'),   // side tool
  pb(16, 8, 4, 12, '#451a03'), // side tool
]

const CHEST_PX: PR[] = [
  pb(2, 4, 20, 16, '#78350f'), // body
  pb(0, 2, 24, 4, '#5d3a1a'),  // lid
  pb(10, 6, 4, 4, '#ca8a04'),  // lock
]

const CAMPFIRE_PX: PR[] = [
  pb(4, 16, 16, 4, '#5a3010'), // logs
  pb(2, 14, 20, 2, '#451a03'), // logs
  pb(8, 4, 8, 10, '#f97316'),  // flame
  pb(10, 0, 4, 8, '#fbbf24'),  // inner flame
]

const HOUSE_PX: PR[] = [
  pb(0, 26, 72, 8, '#dc2626'), pb(4, 18, 64, 12, '#dc2626'),
  pb(8, 10, 56, 12, '#ef4444'), pb(14, 4, 44, 10, '#ef4444'), pb(20, 0, 32, 8, '#fca5a5'),
  pb(4, 34, 64, 44, '#78716c'),
  pb(28, 50, 16, 28, '#92400e'), pb(30, 52, 12, 14, '#78350f'), pb(36, 56, 2, 4, '#ca8a04'),
  pb(8, 40, 14, 12, '#93c5fd'), pb(50, 40, 14, 12, '#93c5fd'),
  pb(9, 41, 12, 10, '#bfdbfe'), pb(51, 41, 12, 10, '#bfdbfe'),
  pb(14, 41, 2, 10, '#57534e'), pb(56, 41, 2, 10, '#57534e'),
  pb(9, 46, 12, 2, '#57534e'), pb(51, 46, 12, 2, '#57534e'),
  pb(50, 0, 10, 18, '#78716c'), pb(52, 0, 6, 4, '#374151'),
]

function creeperScenePx(scared: boolean): PR[] {
  const c = scared ? '#86efac' : '#4ade80', d = '#111' // dark for face
  return [
    pb(0, 0, 16, 16, c), // head
    pb(2, 3, 4, 4, d), pb(10, 3, 4, 4, d), // eyes
    pb(6, 7, 4, 4, d), // nose
    pb(4, 9, 8, 4, d), // mouth top
    pb(4, 13, 2, 3, d), pb(10, 13, 2, 3, d), // mouth drops
    pb(2, 16, 12, 12, c), // body
    pb(0, 28, 6, 6, c), pb(10, 28, 6, 6, c), // feet
  ]
}

function Sprite({ px, vw, vh, scale = 1, flip = false, style }: {
  px: PR[]; vw: number; vh: number; scale?: number; flip?: boolean; style?: React.CSSProperties
}) {
  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} width={vw * scale} height={vh * scale}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block',
        transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      {px.map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.f} />)}
    </svg>
  )
}

// ── Name dialog ───────────────────────────────────────────────────────────────
function WolfNameDialog({ onName }: { onName: (n: string) => void }) {
  const [val, setVal] = useState('')
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#1a1206', border: '4px solid #5D9E2E', borderRadius: 8, padding: '20px 24px',
        width: 300, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', fontFamily: 'monospace',
      }}>
        <div style={{ color: '#FFD700', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Ein Wolf erscheint!</div>
        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 16 }}>Gib deinem neuen Begleiter einen Namen.</div>
        <input autoFocus maxLength={20} value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && val.trim()) onName(val.trim()) }}
          style={{
            width: '100%', background: '#2a2010', border: '2px solid #5D9E2E', borderRadius: 4,
            color: '#fff', padding: '8px 10px', fontSize: 14, fontFamily: 'monospace',
            boxSizing: 'border-box', marginBottom: 10, outline: 'none',
          }} placeholder="Name..." />
        <button onClick={() => { if (val.trim()) onName(val.trim()) }} disabled={!val.trim()}
          style={{
            width: '100%', background: val.trim() ? '#5D9E2E' : '#333', border: 'none',
            color: '#fff', fontWeight: 700, fontSize: 14, padding: '8px', borderRadius: 4,
            cursor: val.trim() ? 'pointer' : 'not-allowed', fontFamily: 'monospace',
          }}>Zähmen!</button>
      </div>
    </div>
  )
}

// ── Achievement toast ─────────────────────────────────────────────────────────
function AchievementToast({ title, onDone }: { title: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{
      position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, background: '#1a1206', border: '3px solid #FFD700', borderRadius: 8,
      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: 'monospace', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      whiteSpace: 'nowrap', animation: 'lazi-slide-up 0.35s ease-out',
    }}>
      <div style={{ fontSize: 20 }}>&#x1F3C6;</div>
      <div>
        <div style={{ fontSize: 10, color: '#FFD700', fontWeight: 700, letterSpacing: 1 }}>ACHIEVEMENT FREIGESCHALTET</div>
        <div style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>{title}</div>
      </div>
    </div>
  )
}

// ── CrmScene — full gamified scene ────────────────────────────────────────────
const WK = { name: 'lazi_w_name', xp: 'lazi_w_xp', hunger: 'lazi_w_hunger', bones: 'lazi_w_bones', tp: 'lazi_w_tp', tb: 'lazi_w_tb' }
const lsGet = (k: string, fb = '') => { try { return localStorage.getItem(k) ?? fb } catch { return fb } }
const lsNum = (k: string, fb = 0) => { const v = parseInt(lsGet(k)); return isNaN(v) ? fb : v }
const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch {} }

export function CrmScene({ onAchUnlock }: { onAchUnlock: (id: string, title: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(700)

  const [wolfName, setWolfName] = useState(() => lsGet(WK.name))
  const tamed = wolfName !== ''
  const [wolfBones, setWolfBones] = useState(() => lsNum(WK.bones))
  const [xp, setXp] = useState(() => lsNum(WK.xp))
  const [hunger, setHunger] = useState(() => Math.max(20, lsNum(WK.hunger, 80)))
  const [totalPets, setTotalPets] = useState(() => lsNum(WK.tp))
  const [totalBones, setTotalBones] = useState(() => lsNum(WK.tb))

  const [wolfX, setWolfX] = useState(80)
  const [wolfDir, setWolfDir] = useState<'r' | 'l'>('r')
  const [wolfState, setWolfState] = useState<'idle' | 'walking' | 'sitting' | 'eating' | 'happy' | 'howling' | 'fetching'>('idle')
  const [tick, setTick] = useState(0)

  const [pigX, setPigX] = useState(220)
  const [pigDir, setPigDir] = useState<'r' | 'l'>('r')
  const [sheepX, setSheepX] = useState(150)
  const [sheepDir, setSheepDir] = useState<'r' | 'l'>('l')
  const [sheepBob, setSheepBob] = useState(false)

  const [creeperX, setCreeperX] = useState(W + 30)
  const [creeperVisible, setCreeperVisible] = useState(false)
  const [creeperScared, setCreeperScared] = useState(false)
  const [boom, setBoom] = useState<number | null>(null)

  const [ballX, setBallX] = useState<number | null>(null)
  const fetchTargetRef = useRef(0)

  const [particles, setParticles] = useState<{ id: number; x: number; char: string; color: string }[]>([])
  const pidRef = useRef(0)

  const [showNameDialog, setShowNameDialog] = useState(false)
  const [achToast, setAchToast] = useState<{ id: string; title: string } | null>(null)

  const wsRef = useRef(wolfState); wsRef.current = wolfState
  const wxRef = useRef(wolfX); wxRef.current = wolfX
  const wdRef = useRef(wolfDir); wdRef.current = wolfDir
  const pdRef = useRef(pigDir); pdRef.current = pigDir
  const sdRef = useRef(sheepDir); sdRef.current = sheepDir

  useEffect(() => {
    const ro = new ResizeObserver(e => setW(e[0].contentRect.width))
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => { lsSet(WK.xp, String(xp)) }, [xp])
  useEffect(() => { lsSet(WK.hunger, String(Math.round(hunger))) }, [hunger])
  useEffect(() => { lsSet(WK.tp, String(totalPets)) }, [totalPets])
  useEffect(() => { lsSet(WK.tb, String(totalBones)) }, [totalBones])

  const unlock = useCallback((id: string, title: string) => {
    onAchUnlock(id, title)
    setAchToast(prev => prev?.id === id ? prev : { id, title })
  }, [onAchUnlock])

  const level = Math.max(1, Math.floor(Math.sqrt(xp / 35)) + 1)
  const xpForLv = (l: number) => Math.max(0, (l - 1) * (l - 1) * 35)
  const xpInLv = xp - xpForLv(level)
  const xpToNext = Math.max(1, xpForLv(level + 1) - xpForLv(level))

  useEffect(() => {
    const h = new Date().getHours()
    if (h >= 23 || h < 4) unlock('ach-night-owl', 'Nacht-Eule')
    if (h >= 5 && h < 8) unlock('ach-early-bird', 'Früher Vogel')
  }, [unlock])

  useEffect(() => {
    if (wolfX > W - 100) unlock('ach-adventurer', 'Adventurer')
  }, [wolfX, W, unlock])

  const spawnPt = useCallback((x: number, char: string, color: string) => {
    const id = ++pidRef.current
    setParticles(ps => [...ps, { id, x: x + (Math.random() - 0.5) * 28, char, color }])
    setTimeout(() => setParticles(ps => ps.filter(p => p.id !== id)), 1500)
  }, [])

  const spawnPts = useCallback((x: number, items: [string, string][]) => {
    items.forEach(([c, col]) => spawnPt(x, c, col))
  }, [spawnPt])

  const gainXp = useCallback((n: number) => setXp(p => p + n), [])

  // Game loop
  useEffect(() => {
    let idleT = 0, animalT = 0, bobT = 0
    const loop = setInterval(() => {
      setTick(t => t + 1)
      if (wsRef.current === 'walking' || wsRef.current === 'fetching') {
        const speed = wsRef.current === 'fetching' ? 2.5 : 1.3
        const nx = wxRef.current + (wdRef.current === 'r' ? speed : -speed)
        const maxX = W - 72, minX = 10
        if (nx >= maxX) {
          setWolfX(maxX); setWolfState('idle')
          setTimeout(() => { setWolfDir('l'); setWolfState('walking') }, 1100)
        } else if (nx <= minX) {
          setWolfX(minX); setWolfState('idle')
          setTimeout(() => { setWolfDir('r'); setWolfState('walking') }, 1100)
        } else {
          setWolfX(nx)
          if (wsRef.current === 'fetching' && Math.abs(nx - fetchTargetRef.current) < 12) {
            setBallX(null); setWolfDir('l')
            setTimeout(() => {
              setWolfState('happy')
              setTimeout(() => setWolfState('idle'), 1400)
            }, 100)
          }
        }
      } else {
        idleT++
        if (idleT > 55 + Math.random() * 90 && wsRef.current === 'idle') {
          idleT = 0
          const r = Math.random()
          if (r < 0.28) { setWolfDir('r'); setWolfState('walking') }
          else if (r < 0.52) { setWolfDir('l'); setWolfState('walking') }
          else if (r < 0.68) {
            setWolfState('sitting')
            setTimeout(() => setWolfState('idle'), 1600 + Math.random() * 2000)
          }
        }
      }
      animalT++
      if (animalT % 5 === 0) {
        if (Math.random() < 0.3) setPigDir(() => Math.random() < 0.5 ? 'r' : 'l')
        if (Math.random() < 0.25) setSheepDir(() => Math.random() < 0.5 ? 'r' : 'l')
        setPigX(px => Math.max(50, Math.min(W * 0.38, px + (pdRef.current === 'r' ? 0.55 : -0.55))))
        setSheepX(sx => Math.max(30, Math.min(W * 0.32, sx + (sdRef.current === 'r' ? 0.4 : -0.4))))
      }
      bobT++
      if (bobT % 9 === 0) setSheepBob(b => !b)
    }, 80)
    return () => clearInterval(loop)
  }, [W])

  // Hunger drain
  useEffect(() => {
    const t = setInterval(() => setHunger(h => {
      return Math.max(0, h - 0.5)
    }), 30_000)
    return () => clearInterval(t)
  }, [])

  // Creeper spawn + explosion
  useEffect(() => {
    const spawn = () => { setCreeperX(W + 30); setCreeperVisible(true); setCreeperScared(false) }
    spawn()
    const walk = setInterval(() => setCreeperX(x => x <= W * 0.62 ? x : x - 0.65), 80)
    const explode = setInterval(() => {
      setCreeperScared(true)
      setTimeout(() => {
        setCreeperX(cx => { setBoom(cx); return cx })
        setCreeperVisible(false)
        unlock('ach-creeper', 'Das War Knapp!')
        setTimeout(() => { setBoom(null); spawn() }, 5000)
      }, 1500)
    }, 180_000)
    return () => { clearInterval(walk); clearInterval(explode) }
  }, [W, unlock])

  // Interactions
  const petWolf = () => {
    if (!tamed) { setShowNameDialog(true); return }
    const next = totalPets + 1
    setTotalPets(next)
    setWolfState('happy'); setTimeout(() => setWolfState('idle'), 1400)
    spawnPts(wolfX + 24, [['&#x2665;', '#f472b6'], ['&#x2661;', '#f9a8d4'], ['&#x2605;', '#fbbf24']])
    gainXp(5)
    if (next >= 10) unlock('ach-wolf-pet-10', 'Tierlieb')
    if (next >= 50) unlock('ach-wolf-pet-50', 'Bester Freund')
  }

  const feedBone = () => {
    const nextB = totalBones + 1
    setTotalBones(nextB)
    if (nextB === 1) unlock('ach-wolf-bone-first', 'Großzügig!')
    if (nextB >= 5) unlock('ach-wolf-bone-5', 'Futtermeister')
    if (nextB >= 20) unlock('ach-wolf-bone-20', 'Leitwolf')

    if (!tamed) {
      const next = wolfBones + 1
      setWolfBones(next); lsSet(WK.bones, String(next))
      spawnPt(wolfX + 24, '&#x1F9B4;', '#fff')
      if (next >= 3) setShowNameDialog(true)
      return
    }
    setWolfState('eating'); setTimeout(() => setWolfState('idle'), 2500)
    setHunger(h => Math.min(100, h + 30))
    spawnPts(wolfX + 24, [['&#x2665;', '#f472b6'], ['&#x1F9B4;', '#fff'], ['&#x2605;', '#fbbf24']])
    gainXp(12)
  }

  const feedApple = () => {
    if (!tamed) { setShowNameDialog(true); return }
    setWolfState('eating'); setTimeout(() => setWolfState('idle'), 2000)
    setHunger(h => Math.min(100, h + 20))
    spawnPts(wolfX + 24, [['&#x2665;', '#f472b6'], ['&#x1F34E;', '#ef4444']])
    gainXp(8)
  }

  const throwBall = () => {
    if (!tamed || wsRef.current !== 'idle') return
    const target = Math.min(W - 80, wolfX + 140 + Math.random() * 80)
    fetchTargetRef.current = target
    setBallX(wolfX + 30); setWolfDir('r'); setWolfState('fetching')
    gainXp(10)
  }

  const doTrick = (trick: 'sit' | 'howl' | 'spin') => {
    if (!tamed || wsRef.current !== 'idle') return
    if (trick === 'sit') {
      setWolfState('sitting'); setTimeout(() => setWolfState('idle'), 2000)
      spawnPts(wolfX + 24, [['&#x2605;', '#fbbf24'], ['&#x2665;', '#f472b6']]); gainXp(12)
    } else if (trick === 'howl') {
      setWolfState('howling'); setTimeout(() => setWolfState('idle'), 2500)
      spawnPts(wolfX + 24, [['&#x266A;', '#a78bfa'], ['&#x2605;', '#fbbf24']]); gainXp(15)
    } else {
      setWolfState('happy'); setTimeout(() => setWolfState('idle'), 1200)
      spawnPts(wolfX + 24, [['&#x2605;', '#fbbf24'], ['&#x2665;', '#f472b6']]); gainXp(10)
    }
  }

  const [chestOpen, setChestOpen] = useState(false)
  const [campfireOn, setCampfireOn] = useState(true)

  const handleName = (n: string) => {
    setWolfName(n); lsSet(WK.name, n)
    setWolfBones(3); lsSet(WK.bones, '3')
    setShowNameDialog(false)
    unlock('ach-wolf', 'Wolfsbändigerin')
    spawnPts(wolfX + 24, [['&#x2665;', '#f472b6'], ['&#x2605;', '#fbbf24'], ['&#x2665;', '#f472b6']])
  }

  const toggleChest = () => {
    setChestOpen(!chestOpen)
    spawnPt(W - 120, chestOpen ? '&#x1F512;' : '&#x2728;', '#fbbf24')
  }

  const toggleCampfire = () => {
    setCampfireOn(!campfireOn)
    if (!campfireOn) spawnPt(130, '&#x1F525;', '#ef4444')
  }

  const moodColor = hunger > 60 ? '#4ade80' : hunger > 30 ? '#fbbf24' : '#ef4444'
  const moodLabel = hunger > 60 ? 'Satt' : hunger > 30 ? 'Okay' : hunger > 10 ? 'Hungrig!' : 'Verhungert!'
  const isSitting = wolfState === 'sitting' || wolfState === 'eating'
  const wolfPx = isSitting ? wolfSitPx(tamed, wolfState === 'eating') : wolfWalkPx(tick, tamed, wolfState === 'howling')
  const wolfVW = 40; const wolfVH = 40

  const hourNow = new Date().getHours()
  const isNight = hourNow >= 21 || hourNow < 6
  const skyBg = isNight
    ? 'linear-gradient(180deg,#040a14 0%,#0f172a 55%,#1a2e1a 80%,#2a4a28 100%)'
    : 'linear-gradient(180deg,#1a3a6a 0%,#2a5a2a 80%,#2d5a27 100%)'

  return (
    <>
      {showNameDialog && <WolfNameDialog onName={handleName} />}
      {achToast && <AchievementToast title={achToast.title} onDone={() => setAchToast(null)} />}

      <div ref={containerRef} style={{
        position: 'relative', overflow: 'hidden', height: 120,
        background: skyBg, userSelect: 'none', borderTop: '2px solid #5D9E2E',
      }}>
        {isNight && [20, 90, 190, 310, 420, 540, 650].map((sx, i) => (
          <div key={i} style={{
            position: 'absolute', left: sx, top: 4 + (i % 3) * 5, width: 2, height: 2,
            borderRadius: '50%', background: '#fff', opacity: 0.5 + (i % 3) * 0.2,
          }} />
        ))}
        {isNight && (
          <div style={{
            position: 'absolute', right: 50, top: 8, width: 18, height: 18,
            borderRadius: '50%', background: '#fef9c3', border: '2px solid #fef08a',
          }} />
        )}

        <div style={{ position: 'absolute', left: 30, bottom: 20 }}>
          <Sprite px={TREE_PX} vw={30} vh={50} />
        </div>
        <div style={{ position: 'absolute', left: 185, bottom: 20 }}>
          <Sprite px={TREE_PX} vw={30} vh={50} scale={0.8} />
        </div>
        <div style={{ position: 'absolute', right: 6, bottom: 20 }}>
          <Sprite px={HOUSE_PX} vw={72} vh={80} />
        </div>
        <div style={{ position: 'absolute', right: 85, bottom: 20, cursor: 'pointer' }} onClick={() => spawnPt(W-85, '&#x2692;', '#aaa')}>
          <Sprite px={CRAFTING_TABLE_PX} vw={24} vh={24} scale={1.2} />
        </div>
        <div style={{ position: 'absolute', right: 125, bottom: 20, cursor: 'pointer' }} onClick={toggleChest}>
          <Sprite px={CHEST_PX} vw={24} vh={24} scale={1.2} style={{ transform: chestOpen ? 'scaleY(0.9)' : undefined }} />
        </div>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 20, cursor: 'pointer', zIndex: 5 }} onClick={toggleCampfire}>
          {campfireOn && (
            <div style={{ animation: 'lazi-flicker 0.15s infinite alternate' }}>
              <Sprite px={CAMPFIRE_PX} vw={24} vh={20} scale={2} />
            </div>
          )}
          {!campfireOn && <div style={{ width: 40, height: 8, background: '#451a03', borderRadius: 2 }} />}
        </div>

        <div style={{
          position: 'absolute', left: sheepX, bottom: 20, cursor: 'pointer',
          transform: sheepBob ? 'translateY(-3px)' : 'translateY(0)', transition: 'transform 0.2s',
        }} onClick={() => unlock('ach-schaf', 'Schaf-Flüsterin')} title="Baa!">
          <svg viewBox="0 0 22 18" width={33} height={27}
            style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block',
              transform: sheepDir === 'l' ? 'scaleX(-1)' : undefined }}>
            <rect x="2" y="4" width="14" height="8" fill="#e5e7eb"/>
            <rect x="0" y="6" width="4" height="4" fill="#e5e7eb"/>
            <rect x="14" y="6" width="4" height="4" fill="#e5e7eb"/>
            <rect x="14" y="2" width="6" height="8" fill="#6b7280"/>
            <rect x="15" y="4" width="1" height="1" fill="#fff"/>
            <rect x="18" y="4" width="1" height="1" fill="#fff"/>
            <rect x="16" y="7" width="3" height="1" fill="#374151"/>
            <rect x="4" y="12" width="2" height="4" fill="#6b7280"/>
            <rect x="8" y="12" width="2" height="4" fill="#6b7280"/>
            <rect x="12" y="12" width="2" height="4" fill="#6b7280"/>
          </svg>
        </div>

        <div style={{ position: 'absolute', left: pigX, bottom: 20, cursor: 'pointer' }}
          onClick={() => unlock('ach-ferkel', 'Ferkel-Königin')} title="Oink!">
          <svg viewBox="0 0 28 18" width={36} height={23}
            style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block',
              transform: pigDir === 'l' ? 'scaleX(-1)' : undefined }}>
            <rect x="2" y="4" width="14" height="12" fill="#f9a8d4"/>
            <rect x="16" y="0" width="12" height="12" fill="#f9a8d4"/>
            <rect x="22" y="4" width="6" height="4" fill="#ec4899"/>
            <rect x="23" y="5" width="2" height="2" fill="#7f1d1d"/>
            <rect x="27" y="5" width="2" height="2" fill="#7f1d1d"/>
            <rect x="17" y="0" width="3" height="4" fill="#ec4899"/>
            <rect x="25" y="0" width="3" height="4" fill="#ec4899"/>
            <rect x="19" y="2" width="2" height="2" fill="#111"/>
            <rect x="3" y="14" width="3" height="4" fill="#f9a8d4"/>
            <rect x="9" y="14" width="3" height="4" fill="#f9a8d4"/>
          </svg>
        </div>

        {ballX !== null && (
          <div style={{
            position: 'absolute', left: ballX, bottom: 48, width: 10, height: 10,
            borderRadius: '50%', background: '#fff', border: '2px solid #555',
          }} />
        )}

        <div style={{ position: 'absolute', left: wolfX, bottom: 20, cursor: 'pointer' }}
          onClick={petWolf} title={tamed ? `${wolfName} streicheln!` : 'Klick zum Zähmen!'}>
          {tamed && (
            <div style={{
              position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 9, fontWeight: 700,
              fontFamily: 'monospace', padding: '2px 6px', borderRadius: 3, whiteSpace: 'nowrap',
            }}>{wolfName} <span style={{ color: moodColor }}>&#x2665;</span></div>
          )}
          {wolfState === 'happy' && (
            <div style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              background: 'rgba(250,204,21,0.2)', filter: 'blur(4px)',
            }} />
          )}
          <Sprite px={wolfPx} vw={wolfVW} vh={wolfVH} scale={1.4}
            flip={wolfDir === 'l' && !isSitting} />
        </div>

        {creeperVisible && (
          <div style={{
            position: 'absolute', left: creeperX, bottom: 20,
            animation: creeperScared ? 'lazi-shake 0.1s infinite' : undefined,
          }}>
            <Sprite px={creeperScenePx(creeperScared)} vw={16} vh={34} scale={1.8} />
          </div>
        )}

        {boom !== null && (
          <div style={{
            position: 'absolute', left: boom - 65, top: 8, width: 130, height: 100,
            borderRadius: '50%', pointerEvents: 'none',
            background: 'radial-gradient(circle,#fef08a 0%,#f97316 35%,#dc262660 65%,transparent 85%)',
            animation: 'lazi-boom 0.7s ease-out forwards',
          }} />
        )}

        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute', left: p.x, bottom: 52, color: p.color,
            fontSize: 14, fontWeight: 700, pointerEvents: 'none',
            animation: 'lazi-float-up 1.5s ease-out forwards',
          }} dangerouslySetInnerHTML={{ __html: p.char }} />
        ))}

        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 20,
          background: '#5D9E2E', borderTop: '4px solid #3a7010',
        }}>
          <div style={{ height: 8, background: '#4a8c22' }} />
          <div style={{ height: 8, background: '#92400e' }} />
        </div>
      </div>

      {/* HUD */}
      <div style={{
        background: '#1a1206', borderTop: '3px solid #5D9E2E', padding: '6px 12px',
        display: 'flex', flexDirection: 'column', gap: 5, fontFamily: 'monospace',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {tamed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  background: '#5D9E2E', color: '#fff', fontSize: 9, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 3,
                }}>Lv.{level}</span>
                <span style={{ color: '#FFD700', fontSize: 13, fontWeight: 700 }}>{wolfName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#aaa', fontSize: 10 }}>XP</span>
                <div style={{ width: 80, height: 6, background: '#2a2010', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(xpInLv / xpToNext) * 100}%`, height: '100%', background: '#5D9E2E', transition: 'width 0.3s' }} />
                </div>
                <span style={{ color: '#555', fontSize: 9 }}>{xpInLv}/{xpToNext}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: moodColor, fontSize: 10, fontWeight: 700 }}>{moodLabel}</span>
                <div style={{ width: 55, height: 6, background: '#2a2010', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${hunger}%`, height: '100%', background: moodColor, transition: 'width 0.3s' }} />
                </div>
              </div>
            </>
          ) : (
            <span style={{ color: '#888', fontSize: 11 }}>
              {wolfBones < 3
                ? `${wolfBones}/3 Knochen — klick auf den Wolf um ihn zu zähmen!`
                : 'Wolf wartet auf einen Namen — klick auf ihn!'}
            </span>
          )}
          <div style={{ marginLeft: 'auto', color: '#555', fontSize: 10 }}>
            {isNight ? 'Nacht' : 'Tag'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {[
            { emoji: '&#x1F9B4;', label: 'Knochen', action: feedBone, alwaysEnabled: true },
            { emoji: '&#x1F34E;', label: 'Apfel', action: feedApple },
            { emoji: '&#x26BD;', label: 'Ball werfen', action: throwBall },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              title={!item.alwaysEnabled && !tamed ? 'Wolf erst zähmen!' : item.label}
              style={{
                background: '#2a2010', border: '2px solid #5D9E2E', borderRadius: 4,
                color: '#fff', fontSize: 16, width: 34, height: 34, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: !item.alwaysEnabled && !tamed ? 0.35 : 1,
              }}
              dangerouslySetInnerHTML={{ __html: item.emoji }} />
          ))}

          {tamed && (
            <>
              <div style={{ width: 2, height: 26, background: '#3a3028' }} />
              {([
                { key: 'sit', label: 'Sitz' },
                { key: 'howl', label: 'Heulen' },
                { key: 'spin', label: 'Drehen' },
              ] as const).map(t => (
                <button key={t.key} onClick={() => doTrick(t.key)}
                  disabled={wolfState !== 'idle'}
                  style={{
                    background: '#2a2010', border: '2px solid #3a7D44', borderRadius: 4,
                    color: wolfState !== 'idle' ? '#555' : '#aaa', fontSize: 10, fontWeight: 700,
                    padding: '3px 8px', cursor: wolfState !== 'idle' ? 'not-allowed' : 'pointer',
                    fontFamily: 'monospace',
                  }}>{t.label}</button>
              ))}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes lazi-float-up { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-48px) scale(1.3);opacity:0} }
        @keyframes lazi-boom { 0%{transform:scale(0);opacity:1} 60%{transform:scale(1);opacity:.9} 100%{transform:scale(1.6);opacity:0} }
        @keyframes lazi-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3px)} 75%{transform:translateX(3px)} }
        @keyframes lazi-flicker { 0%{transform:scale(1) translateY(0);opacity:1} 100%{transform:scale(1.05) translateY(-2px);opacity:0.9} }
        @keyframes lazi-slide-up { from{transform:translateX(-50%) translateY(14px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
      `}</style>
    </>
  )
}
