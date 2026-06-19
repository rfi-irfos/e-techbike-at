// Shared Minecraft mob + landscape components
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

// ── Pure visual backdrop: sky + mountains + hills + sun/moon + clouds ─────────
export function McBackdrop() {
  const ref = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const ro = new ResizeObserver(e => setW(e[0].contentRect.width))
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 120)
    return () => clearInterval(id)
  }, [])

  // Day/night cycle: 2 min day + 2 min night = 4 min total
  // tick every 120ms → 500 ticks/min → 1000 ticks per half-cycle
  const HALF = 1000
  const totalPhase = tick % (HALF * 2)
  const isDayPhase = totalPhase < HALF
  const arcPct = (totalPhase % HALF) / HALF  // 0→1 across each half
  const sunLeft = `${arcPct * 100}%`
  const sunBottom = `${Math.sin(arcPct * Math.PI) * 80 + 2}%`

  const isNight = !isDayPhase
  const isTransition = isDayPhase && (arcPct < 0.18 || arcPct > 0.82)

  const skyBg = isNight
    ? 'linear-gradient(180deg,#05091a 0%,#0d1a3a 50%,#0f2a0f 80%,#1a3d1a 100%)'
    : isTransition
      ? 'linear-gradient(180deg,#1a0a3e 0%,#c2410c 20%,#f97316 45%,#fbbf24 65%,#4a7c3f 85%,#2d5a27 100%)'
      : 'linear-gradient(180deg,#1e90e8 0%,#4db8ff 25%,#87ceeb 55%,#a8d8a8 75%,#4caf50 88%,#388e3c 100%)'

  const mtFill   = isNight ? '#0d1f0d' : isTransition ? '#3d1a4a' : '#2d6b3a'
  const mt2Fill  = isNight ? '#1a2e1a' : isTransition ? '#5c2d6b' : '#3a7a48'
  const hillFill = isNight ? '#1e3d1e' : '#4a8c3f'

  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, background: skyBg, overflow: 'hidden', transition: 'background 8s ease' }}>
      {/* Stars (night) */}
      {isNight && [0.02,0.06,0.10,0.15,0.20,0.25,0.30,0.36,0.42,0.48,0.54,0.60,0.66,0.72,0.78,0.83,0.88,0.93,0.97,
        0.04,0.14,0.28,0.45,0.58,0.71,0.85,0.91,0.08].map((p, i) => (
        <div key={i} style={{
          position:'absolute', left:`${p*100}%`, top:`${3 + (i % 6) * 4 + (i % 3)}%`,
          width: i%5===0?4:i%3===0?3:2, height: i%5===0?4:i%3===0?3:2,
          borderRadius:'50%', background:'#fff',
          opacity: 0.3 + (i%4)*0.18,
        }}/>
      ))}
      {/* Sun arc (day) */}
      {isDayPhase && (
        <div style={{
          position: 'absolute', left: sunLeft, bottom: sunBottom,
          width: 38, height: 38, borderRadius: '50%', transform: 'translate(-50%, 50%)',
          background: '#FFD700', border: '4px solid #FFA500',
          boxShadow: '0 0 32px #FFD700ee, 0 0 80px #FFD70077',
        }} />
      )}
      {/* Moon arc (night) — crescent */}
      {isNight && (
        <div style={{
          position: 'absolute', left: sunLeft, bottom: sunBottom,
          transform: 'translate(-50%, 50%)',
          width: 32, height: 32,
          overflow: 'hidden',
        }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fef9c3', boxShadow: '0 0 22px #fef08a99, 0 0 55px #fef08a44', position: 'absolute' }} />
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#05091a', position: 'absolute', top: -2, left: 8 }} />
        </div>
      )}
      {/* Clouds (day/transition) */}
      {!isNight && [
        { pct: ((tick * 0.04) % 110) - 5, top: '8%', w: 100, h: 30 },
        { pct: ((tick * 0.025 + 40) % 110) - 5, top: '14%', w: 65, h: 22 },
        { pct: ((tick * 0.06 + 70) % 110) - 5, top: '6%', w: 78, h: 24 },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${c.pct}%`, top: c.top,
          width: c.w, height: c.h, borderRadius: 40,
          background: isTransition ? 'rgba(255,180,120,0.6)' : 'rgba(255,255,255,0.8)',
          filter: 'blur(7px)',
        }} />
      ))}
      {/* Far mountains — stepped triangular peaks */}
      {W > 0 && (
        <svg style={{ position: 'absolute', bottom: 28, left: 0, width: '100%', height: '40%', imageRendering: 'pixelated' }}
          viewBox={`0 0 ${W} 120`} preserveAspectRatio="none" shapeRendering="crispEdges">
          {/* Mountain 1: center~17%W, peak y=35, 4 steps sw=4%W sh=14 */}
          <path d={`M${W*0.01},120 L${W*0.01},90 L${W*0.05},90 L${W*0.05},76 L${W*0.09},76 L${W*0.09},62 L${W*0.13},62 L${W*0.13},48 L${W*0.17},48 L${W*0.17},35 L${W*0.21},35 L${W*0.21},48 L${W*0.25},48 L${W*0.25},62 L${W*0.29},62 L${W*0.29},76 L${W*0.33},76 L${W*0.33},90 L${W*0.33},120 Z`}
            fill={mtFill} opacity={0.65} />
          <path d={`M${W*0.09},62 L${W*0.09},48 L${W*0.13},48 L${W*0.13},35 L${W*0.21},35 L${W*0.21},48 L${W*0.25},48 L${W*0.25},62 Z`}
            fill="#e8edf0" opacity={0.85} />
          {/* Mountain 2: center~43%W, peak y=10, 5 steps sw=4%W sh=16 */}
          <path d={`M${W*0.23},120 L${W*0.23},90 L${W*0.27},90 L${W*0.27},74 L${W*0.31},74 L${W*0.31},58 L${W*0.35},58 L${W*0.35},42 L${W*0.39},42 L${W*0.39},26 L${W*0.43},26 L${W*0.43},10 L${W*0.47},10 L${W*0.47},26 L${W*0.51},26 L${W*0.51},42 L${W*0.55},42 L${W*0.55},58 L${W*0.59},58 L${W*0.59},74 L${W*0.63},74 L${W*0.63},90 L${W*0.63},120 Z`}
            fill={mtFill} opacity={0.75} />
          <path d={`M${W*0.35},42 L${W*0.35},26 L${W*0.39},26 L${W*0.39},10 L${W*0.47},10 L${W*0.47},26 L${W*0.51},26 L${W*0.51},42 Z`}
            fill="#e8edf0" opacity={0.85} />
          {/* Mountain 3: center~65%W, peak y=20, 5 steps sw=4%W sh=14 */}
          <path d={`M${W*0.45},120 L${W*0.45},90 L${W*0.49},90 L${W*0.49},76 L${W*0.53},76 L${W*0.53},62 L${W*0.57},62 L${W*0.57},48 L${W*0.61},48 L${W*0.61},34 L${W*0.65},34 L${W*0.65},20 L${W*0.69},20 L${W*0.69},34 L${W*0.73},34 L${W*0.73},48 L${W*0.77},48 L${W*0.77},62 L${W*0.81},62 L${W*0.81},76 L${W*0.85},76 L${W*0.85},90 L${W*0.85},120 Z`}
            fill={mt2Fill} opacity={0.75} />
          <path d={`M${W*0.57},48 L${W*0.57},34 L${W*0.61},34 L${W*0.61},20 L${W*0.69},20 L${W*0.69},34 L${W*0.73},34 L${W*0.73},48 Z`}
            fill="#e8edf0" opacity={0.85} />
          {/* Mountain 4: center~85%W, peak y=26, 4 steps sw=4%W sh=16 */}
          <path d={`M${W*0.69},120 L${W*0.69},90 L${W*0.73},90 L${W*0.73},74 L${W*0.77},74 L${W*0.77},58 L${W*0.81},58 L${W*0.81},42 L${W*0.85},42 L${W*0.85},26 L${W*0.89},26 L${W*0.89},42 L${W*0.93},42 L${W*0.93},58 L${W*0.97},58 L${W*0.97},74 L${W},74 L${W},90 L${W},120 Z`}
            fill={mt2Fill} opacity={0.70} />
          <path d={`M${W*0.77},58 L${W*0.77},42 L${W*0.81},42 L${W*0.81},26 L${W*0.89},26 L${W*0.89},42 L${W*0.93},42 L${W*0.93},58 Z`}
            fill="#e8edf0" opacity={0.85} />
        </svg>
      )}
      {/* Near hills — stepped triangular peaks, no snow */}
      {W > 0 && (
        <svg style={{ position: 'absolute', bottom: 28, left: 0, width: '100%', height: '25%', imageRendering: 'pixelated' }}
          viewBox={`0 0 ${W} 80`} preserveAspectRatio="none" shapeRendering="crispEdges">
          {/* Hill 1: center~20%W, peak y=26, 4 steps sw=5%W sh=11 */}
          <path d={`M0,80 L0,70 L${W*0.05},70 L${W*0.05},59 L${W*0.10},59 L${W*0.10},48 L${W*0.15},48 L${W*0.15},37 L${W*0.20},37 L${W*0.20},26 L${W*0.25},26 L${W*0.25},37 L${W*0.30},37 L${W*0.30},48 L${W*0.35},48 L${W*0.35},59 L${W*0.40},59 L${W*0.40},70 L${W*0.40},80 Z`}
            fill={hillFill} opacity={0.95} />
          {/* Hill 2: center~55%W, peak y=15, 5 steps sw=5%W sh=11 */}
          <path d={`M${W*0.30},80 L${W*0.30},70 L${W*0.35},70 L${W*0.35},59 L${W*0.40},59 L${W*0.40},48 L${W*0.45},48 L${W*0.45},37 L${W*0.50},37 L${W*0.50},26 L${W*0.55},26 L${W*0.55},15 L${W*0.60},15 L${W*0.60},26 L${W*0.65},26 L${W*0.65},37 L${W*0.70},37 L${W*0.70},48 L${W*0.75},48 L${W*0.75},59 L${W*0.80},59 L${W*0.80},70 L${W*0.80},80 Z`}
            fill={hillFill} opacity={0.95} />
          {/* Hill 3: center~85%W, peak y=31, 3 steps sw=5%W sh=13 */}
          <path d={`M${W*0.70},80 L${W*0.70},70 L${W*0.75},70 L${W*0.75},57 L${W*0.80},57 L${W*0.80},44 L${W*0.85},44 L${W*0.85},31 L${W*0.90},31 L${W*0.90},44 L${W*0.95},44 L${W*0.95},57 L${W},57 L${W},70 L${W},80 Z`}
            fill={hillFill} opacity={0.95} />
        </svg>
      )}
      {/* Ground */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28 }}>
        <div style={{ height: 6, background: '#5D9E2E', borderTop: '3px solid #7DC845' }} />
        <div style={{ height: 6, background: '#4a8c22' }} />
        <div style={{ height: 8, background: '#7c4f1e' }} />
        <div style={{ height: 8, background: '#6b3d10' }} />
      </div>
    </div>
  )
}

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
    <div className="lazi-mob lazi-pig" title="Oink!">
      <svg viewBox="0 0 28 18" width={42} height={27} style={{ imageRendering: 'pixelated', display: 'block' }}>
        <rect x="2" y="4" width="14" height="12" fill="#ffbbaa"/>
        <rect x="16" y="0" width="12" height="12" fill="#ffbbaa"/>
        {/* Shading/Spots */}
        <rect x="4" y="6" width="3" height="3" fill="#ff99aa"/>
        <rect x="18" y="2" width="4" height="4" fill="#ff99aa"/>
        <rect x="22" y="4" width="6" height="4" fill="#ec4899"/>
        <rect x="23" y="5" width="2" height="2" fill="#7f1d1d"/>
        <rect x="27" y="5" width="2" height="2" fill="#7f1d1d"/>
        <rect x="19" y="2" width="2" height="2" fill="#111"/>
        <rect x="3" y="14" width="3" height="4" fill="#ffbbaa"/>
        <rect x="10" y="14" width="3" height="4" fill="#ffbbaa"/>
      </svg>
    </div>
  )
}

export function SheepMob() {
  return (
    <div className="lazi-mob lazi-sheep" title="Baa!">
      <svg viewBox="0 0 22 18" width={44} height={36} style={{ imageRendering: 'pixelated', display: 'block' }}>
        <rect x="2" y="4" width="14" height="8" fill="#fff"/>
        <rect x="0" y="6" width="4" height="4" fill="#fff"/>
        <rect x="14" y="6" width="4" height="4" fill="#fff"/>
        <rect x="14" y="2" width="6" height="8" fill="#a0a0a0"/>
        {/* Face/legs */}
        <rect x="16" y="7" width="3" height="3" fill="#222"/>
        <rect x="4" y="12" width="2" height="4" fill="#555"/>
        <rect x="8" y="12" width="2" height="4" fill="#555"/>
        <rect x="12" y="12" width="2" height="4" fill="#555"/>
      </svg>
    </div>
  )
}

export function CowMob() {
  return (
    <div className="lazi-mob lazi-cow" title="Muh!">
      <svg viewBox="0 0 22 18" width={44} height={36} style={{ imageRendering: 'pixelated', display: 'block' }}>
        <rect x="2" y="4" width="14" height="10" fill="#fff"/>
        <rect x="4" y="5" width="4" height="4" fill="#111"/>
        <rect x="10" y="7" width="3" height="3" fill="#111"/>
        <rect x="14" y="2" width="7" height="9" fill="#fff"/>
        <rect x="19" y="5" width="3" height="3" fill="#ffbbaa"/>
        <rect x="3" y="14" width="2" height="4" fill="#111"/>
        <rect x="12" y="14" width="2" height="4" fill="#111"/>
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

// ... (Rest of file) ...

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

export function CrmMobStrip({ onWolfClick, wolfBones, wolfTamed, feedAnimal }: {
  onWolfClick?: () => void
  wolfBones?: number
  wolfTamed?: boolean
  feedAnimal: (type: 'pig' | 'sheep' | 'cow') => void
}) {
  return (
    <div className="lazi-mob-area">
      <div className="lazi-mob-wrap" onClick={() => feedAnimal('pig')}><PigMob /></div>
      <div className="lazi-mob-wrap" onClick={() => feedAnimal('sheep')}><SheepMob /></div>
      <div className="lazi-mob-wrap" onClick={() => feedAnimal('cow')}><CowMob /></div>
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
  const leg = Math.sin(tick * 0.45) * 3
  const tailY = tamed ? 1 + Math.abs(Math.sin(tick * 0.9)) * 9 : 8
  const collar = tamed ? '#0ea5e9' : 'transparent'
  const bd = '#6b7280', bm = '#9ca3af', bl = '#d4dbe8', pk = '#f9a8d4', bk = '#1f2937', wh = '#ffffff'
  if (howling) return [
    pb(2, 11, 26, 15, bd), pb(5, 13, 20, 11, bm), pb(7, 15, 14, 9, bl),
    ...(tamed ? [pb(26, 14, 6, 3, collar)] : []),
    pb(32, 0, 24, 22, bd), pb(34, 2, 18, 16, bm), pb(36, 4, 14, 12, bl),
    pb(34, -4, 6, 8, bd), pb(35, -3, 4, 6, pk),
    pb(46, -4, 6, 8, bd), pb(47, -3, 4, 6, pk),
    pb(36, 5, 6, 6, bk), pb(36, 5, 3, 3, wh), pb(40, 8, 1, 1, wh),
    pb(50, 4, 5, 4, bl), pb(51, 2, 3, 3, bk), pb(51, 2, 1, 1, wh),
    pb(34, 16, 5, 3, pk), pb(49, 16, 5, 3, pk),
    pb(5, 26, 5, 8, bd), pb(11, 26, 5, 8, bd), pb(17, 26, 5, 8, bd), pb(22, 26, 5, 8, bd),
    pb(0, 4, 5, 14, bd), pb(0, 2, 4, 8, bm), pb(1, 3, 2, 5, bl),
  ]
  return [
    pb(0, tailY, 5, 14, bd), pb(0, tailY - 2, 4, 8, bm), pb(1, tailY - 1, 2, 5, bl),
    pb(4, 10, 26, 16, bd), pb(6, 12, 22, 12, bm), pb(8, 14, 16, 10, bl),
    ...(tamed ? [pb(28, 14, 6, 3, collar)] : []),
    pb(28, 8, 6, 8, bd),
    pb(32, 0, 24, 22, bd), pb(34, 2, 18, 16, bm), pb(36, 4, 14, 12, bl),
    pb(34, -4, 6, 8, bd), pb(35, -3, 4, 6, pk),
    pb(45, -4, 6, 8, bd), pb(46, -3, 4, 6, pk),
    pb(36, 4, 6, 6, bk), pb(36, 4, 3, 3, wh), pb(40, 7, 1, 1, wh),
    pb(52, 8, 7, 6, bl), pb(54, 6, 4, 3, bk), pb(54, 6, 2, 1, wh),
    pb(34, 16, 5, 3, pk), pb(50, 16, 5, 3, pk),
    pb(7, 26, 5, Math.round(8 + leg), bd), pb(13, 26, 5, Math.round(8 - leg), bd),
    pb(19, 26, 5, Math.round(8 - leg), bd), pb(24, 26, 5, Math.round(8 + leg), bd),
  ]
}

function wolfSitPx(tamed: boolean, eating = false): PR[] {
  const collar = tamed ? '#0ea5e9' : 'transparent'
  const bd = '#6b7280', bm = '#9ca3af', bl = '#d4dbe8', pk = '#f9a8d4', bk = '#1f2937', wh = '#ffffff'
  return [
    pb(0, 24, 12, 5, bd), pb(2, 22, 8, 5, bm), pb(3, 23, 5, 3, bl),
    pb(2, 18, 18, 18, bd), pb(4, 20, 14, 14, bm), pb(6, 22, 10, 10, bl),
    pb(16, 26, 5, 10, bd), pb(22, 26, 5, 10, bd),
    pb(14, 8, 16, 18, bd), pb(16, 10, 12, 14, bm), pb(18, 12, 8, 10, bl),
    ...(tamed ? [pb(18, 12, 10, 3, collar)] : []),
    pb(24, 6, 6, 8, bd),
    pb(26, 0, 24, 22, bd), pb(28, 2, 18, 16, bm), pb(30, 4, 14, 12, bl),
    pb(28, -4, 6, 8, bd), pb(29, -3, 4, 6, pk),
    pb(42, -4, 6, 8, bd), pb(43, -3, 4, 6, pk),
    pb(30, 4, 7, 7, bk), pb(30, 4, 3, 3, wh), pb(35, 7, 1, 1, wh),
    pb(46, 8, 7, 6, bl), pb(48, 6, 4, 3, bk), pb(48, 6, 2, 1, wh),
    pb(28, 16, 5, 3, pk), pb(44, 16, 5, 3, pk),
    ...(eating ? [pb(50, 7, 6, 4, '#fbbf24'), pb(52, 9, 4, 2, '#92400e')] : []),
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
  const c = scared ? '#86efac' : '#4ade80', d = '#166534'
  return [
    pb(4, 0, 20, 16, c), pb(6, 4, 4, 4, d), pb(16, 4, 4, 4, d),
    pb(10, 10, 8, 2, d), pb(8, 12, 2, 4, d), pb(18, 12, 2, 4, d), pb(10, 12, 8, 6, d),
    pb(8, 16, 12, 14, c), pb(4, 30, 8, 6, c), pb(16, 30, 8, 6, c),
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
function WolfNameDialog({ onName, onSkip }: { onName: (n: string) => void; onSkip: () => void }) {
  const [val, setVal] = useState('')
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onSkip() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSkip])
  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
    }} onClick={onSkip}>
      <div style={{
        background: '#1a1206', border: '4px solid #5D9E2E', borderRadius: 8, padding: '20px 24px',
        width: 300, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', fontFamily: 'monospace', position: 'relative',
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onSkip} style={{
          position: 'absolute', top: 8, right: 10, background: 'none', border: 'none',
          color: '#666', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '2px 6px',
        }}>×</button>
        <div style={{ color: '#FFD700', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Ein Wolf erscheint!</div>
        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 16 }}>Gib deinem neuen Begleiter einen Namen.</div>
        <input autoFocus maxLength={20} value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && val.trim()) onName(val.trim()) }}
          style={{
            width: '100%', background: '#2a2010', border: '2px solid #5D9E2E', borderRadius: 4,
            color: '#fff', padding: '8px 10px', fontSize: 14, fontFamily: 'monospace',
            boxSizing: 'border-box', marginBottom: 10, outline: 'none',
          }} placeholder="Name..." />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSkip} style={{
            flex: 1, background: '#2a2010', border: '2px solid #5a4020', color: '#888',
            fontWeight: 600, fontSize: 12, padding: '8px', borderRadius: 4,
            cursor: 'pointer', fontFamily: 'monospace',
          }}>Später</button>
          <button onClick={() => { if (val.trim()) onName(val.trim()) }} disabled={!val.trim()}
            style={{
              flex: 2, background: val.trim() ? '#5D9E2E' : '#333', border: 'none',
              color: '#fff', fontWeight: 700, fontSize: 14, padding: '8px', borderRadius: 4,
              cursor: val.trim() ? 'pointer' : 'not-allowed', fontFamily: 'monospace',
            }}>Zähmen!</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Achievement toast ─────────────────────────────────────────────────────────
function AchievementToast({ title, onDone }: { title: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{
      position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999,
      background: 'rgba(255,255,255,0.97)', border: '3px solid #FFD700', borderRadius: 10,
      padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: 'monospace', boxShadow: '0 6px 28px rgba(0,0,0,0.22), 0 0 0 1px #FFD70044',
      whiteSpace: 'nowrap', animation: 'lazi-slide-up 0.35s ease-out',
      cursor: 'pointer',
    }}>
      <div style={{ fontSize: 22 }}>&#x1F3C6;</div>
      <div>
        <div style={{ fontSize: 10, color: '#b45309', fontWeight: 700, letterSpacing: 1 }}>ACHIEVEMENT FREIGESCHALTET</div>
        <div style={{ fontSize: 15, color: '#1a1206', fontWeight: 700 }}>{title}</div>
      </div>
    </div>
  )
}

// ── CrmScene — full gamified scene ────────────────────────────────────────────
const WK = { name: 'lazi_w_name', xp: 'lazi_w_xp', hunger: 'lazi_w_hunger', bones: 'lazi_w_bones', tp: 'lazi_w_tp', tb: 'lazi_w_tb' }
const lsGet = (k: string, fb = '') => { try { return localStorage.getItem(k) ?? fb } catch { return fb } }
const lsNum = (k: string, fb = 0) => { const v = parseInt(lsGet(k)); return isNaN(v) ? fb : v }
const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch {} }

export function CrmScene({ onAchUnlock, noBackdrop }: { onAchUnlock: (id: string, title: string) => void; noBackdrop?: boolean }) {
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
  const [cowX, setCowX] = useState(350)
  const [cowDir, setCowDir] = useState<'r' | 'l'>('l')
  const [chickenX, setChickenX] = useState(280)
  const [chickenDir, setChickenDir] = useState<'r' | 'l'>('r')
  const [chickenBob, setChickenBob] = useState(false)
  const [egg, setEgg] = useState<number | null>(null)
  const [clickEgg, setClickEgg] = useState<number | null>(null)
  const okosRef = useRef(false)
  const [sheepSucked, setSheepSucked] = useState(false)
  const [pigSucked, setPigSucked] = useState(false)
  const [cowSucked, setCowSucked] = useState(false)
  const [chickenSucked, setChickenSucked] = useState(false)
  const cdRef = useRef(cowDir); cdRef.current = cowDir
  const ckdRef = useRef(chickenDir); ckdRef.current = chickenDir

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
  const [tailWag, setTailWag] = useState(false)
  const [wolfSitting, setWolfSitting] = useState(false)
  const netherAchDone = useRef(false)

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

  useEffect(() => {
    if (!tamed) return
    const id = setInterval(() => setTailWag(t => !t), 600)
    return () => clearInterval(id)
  }, [tamed])

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
        if (Math.random() < 0.3)  setPigDir(() => Math.random() < 0.5 ? 'r' : 'l')
        if (Math.random() < 0.25) setSheepDir(() => Math.random() < 0.5 ? 'r' : 'l')
        if (Math.random() < 0.2)  setCowDir(() => Math.random() < 0.5 ? 'r' : 'l')
        if (Math.random() < 0.35) setChickenDir(() => Math.random() < 0.5 ? 'r' : 'l')
        setPigX(px => Math.max(50, Math.min(W * 0.38, px + (pdRef.current === 'r' ? 0.55 : -0.55))))
        setSheepX(sx => Math.max(30, Math.min(W * 0.32, sx + (sdRef.current === 'r' ? 0.4 : -0.4))))
        setCowX(cx => Math.max(W * 0.35, Math.min(W * 0.70, cx + (cdRef.current === 'r' ? 0.45 : -0.45))))
        setChickenX(ck => Math.max(W * 0.20, Math.min(W * 0.55, ck + (ckdRef.current === 'r' ? 0.7 : -0.7))))
      }
      bobT++
      if (bobT % 9 === 0) setSheepBob(b => !b)
      if (bobT % 7 === 0) setChickenBob(b => !b)
      // chicken lays egg occasionally
      if (bobT % 180 === 0 && Math.random() < 0.4) {
        setEgg(chickenX)
        setTimeout(() => setEgg(null), 3000)
      }
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

  // Nether Portal suck effect — every 25s, pull mobs for 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setPortalSuck(true)
      setTimeout(() => setPortalSuck(false), 3000)
    }, 25000)
    return () => clearInterval(interval)
  }, [])

  // Interactions
  const petWolf = () => {
    if (!tamed) { setShowNameDialog(true); return }
    const nextSitting = !wolfSitting
    setWolfSitting(nextSitting)
    if (nextSitting) {
      setWolfState('sitting')
    } else {
      // Unsitting = petting the wolf
      const next = totalPets + 1
      setTotalPets(next)
      setWolfState('happy')
      setTimeout(() => setWolfState('idle'), 1400)
      spawnPts(wolfX + 24, [['&#x2665;', '#f472b6'], ['&#x2661;', '#f9a8d4'], ['&#x2605;', '#fbbf24']])
      gainXp(5)
      if (next >= 10) unlock('ach-wolf-pet-10', 'Tierlieb')
      if (next >= 50) unlock('ach-wolf-pet-50', 'Bester Freund')
    }
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
  const [portalSuck, setPortalSuck] = useState(false)

  useEffect(() => {
    if (!portalSuck) return
    const checkAndSuck = (x: number, set: (v: boolean) => void, setX: (v: number) => void) => {
      if (x < 140) {
        set(true)
        if (!netherAchDone.current) {
          netherAchDone.current = true
          unlock('ach-nether-suck', 'Ins Nether gezogen!')
        }
        setTimeout(() => {
          setX(W - 150)
          set(false)
        }, 2000)
      }
    }
    checkAndSuck(sheepX, setSheepSucked, setSheepX)
    checkAndSuck(pigX, setPigSucked, setPigX)
    checkAndSuck(cowX, setCowSucked, setCowX)
    checkAndSuck(chickenX, setChickenSucked, setChickenX)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portalSuck])

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


  const moodColor = hunger > 60 ? '#4ade80' : hunger > 30 ? '#fbbf24' : '#ef4444'
  const moodLabel = hunger > 60 ? 'Satt' : hunger > 30 ? 'Okay' : hunger > 10 ? 'Hungrig!' : 'Verhungert!'
  const isSitting = wolfSitting || wolfState === 'sitting' || wolfState === 'eating'
  const wolfPx = isSitting ? wolfSitPx(tamed, wolfState === 'eating') : wolfWalkPx(tick, tamed, wolfState === 'howling')
  const wolfVW = isSitting ? 52 : 60; const wolfVH = isSitting ? 38 : 36

  const hourNow = new Date().getHours()
  const isNight  = hourNow >= 21 || hourNow < 6
  const isSunset = !isNight && (hourNow >= 18 || hourNow < 7)

  const skyBg = isNight
    ? 'linear-gradient(180deg,#05091a 0%,#0d1a3a 50%,#0f2a0f 80%,#1a3d1a 100%)'
    : isSunset
      ? 'linear-gradient(180deg,#1a0a3e 0%,#c2410c 25%,#f97316 50%,#fbbf24 70%,#4a7c3f 85%,#2d5a27 100%)'
      : 'linear-gradient(180deg,#4fc3f7 0%,#29b6f6 30%,#81c784 70%,#4caf50 85%,#388e3c 100%)'

  const mtDistFill = isNight ? '#1a2840' : isSunset ? '#5a4060' : '#6a8aa8'
  const mt2DistFill = isNight ? '#233248' : isSunset ? '#6a3870' : '#7a9ab8'

  const bodyX   = W > 0 ? ((tick * 0.12) % (W + 60)) - 30 : 80
  const bodyPct = W > 0 ? bodyX / W : 0.5
  const bodyY   = 8 + Math.sin(Math.max(0, Math.min(1, bodyPct)) * Math.PI) * 30

  return (
    <>
      {showNameDialog && <WolfNameDialog onName={handleName} onSkip={() => setShowNameDialog(false)} />}
      {achToast && <AchievementToast title={achToast.title} onDone={() => setAchToast(null)} />}

      <div ref={containerRef} style={{
        position: 'relative', overflow: 'hidden', width: '100%', height: '100%',
        background: noBackdrop ? 'transparent' : skyBg, userSelect: 'none',
      }}>

        {/* ── Stars (night only, backdrop mode) ── */}
        {!noBackdrop && isNight && [0.03,0.09,0.18,0.28,0.40,0.55,0.68,0.78,0.88,0.95].map((p, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${p * 100}%`, top: `${4 + (i % 4) * 6}%`,
            width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
            borderRadius: '50%', background: '#fff', opacity: 0.4 + (i % 3) * 0.2,
          }} />
        ))}

        {/* ── Sun / Moon (backdrop mode only) ── */}
        {!noBackdrop && (isNight ? (
          <div style={{
            position: 'absolute', left: bodyX, top: bodyY, width: 26, height: 26,
            borderRadius: '50%', background: '#fef9c3', border: '3px solid #fef08a',
            boxShadow: '0 0 18px #fef08a99, 0 0 40px #fef08a44',
          }} />
        ) : (
          <div style={{
            position: 'absolute', left: bodyX, top: bodyY, width: 32, height: 32,
            borderRadius: '50%', background: '#FFD700', border: '4px solid #FFA500',
            boxShadow: '0 0 24px #FFD700cc, 0 0 60px #FFD70055',
          }} />
        ))}

        {/* ── Clouds (backdrop mode, day/sunset only) ── */}
        {!noBackdrop && !isNight && [
          { pct: ((tick * 0.04) % 110) - 5, top: '8%', w: 90, h: 28 },
          { pct: ((tick * 0.025 + 40) % 110) - 5, top: '15%', w: 60, h: 20 },
          { pct: ((tick * 0.06 + 70) % 110) - 5, top: '6%', w: 70, h: 22 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${c.pct}%`, top: c.top,
            width: c.w, height: c.h, borderRadius: 40,
            background: isSunset ? 'rgba(255,200,150,0.55)' : 'rgba(255,255,255,0.75)',
            filter: 'blur(6px)',
          }} />
        ))}

        {/* ── Far mountains — tiny, hazy, razor-sharp spikes ── */}
        {!noBackdrop && W > 0 && (
          <svg style={{ position: 'absolute', bottom: 25, left: 0, width: '100%', height: '16%', filter: 'blur(7px) brightness(1.25) saturate(0.4)' }}
            viewBox={`0 0 ${W} 120`} preserveAspectRatio="none">
            <polygon points={`0,120 0,85 ${W*0.06},40 ${W*0.09},80 ${W*0.14},15 ${W*0.17},75 ${W*0.24},5 ${W*0.27},70 ${W*0.35},30 ${W*0.39},80 ${W*0.46},2 ${W*0.49},65 ${W*0.56},20 ${W*0.60},75 ${W*0.67},8 ${W*0.70},70 ${W*0.78},35 ${W*0.82},80 ${W*0.88},10 ${W*0.92},70 ${W},45 ${W},120`}
              fill={mtDistFill} opacity={0.9} />
            <polygon points={`0,120 0,100 ${W*0.06},55 ${W*0.09},95 ${W*0.14},30 ${W*0.17},90 ${W*0.24},20 ${W*0.27},85 ${W*0.35},45 ${W*0.39},95 ${W*0.46},17 ${W*0.49},80 ${W*0.56},35 ${W*0.60},90 ${W*0.67},23 ${W*0.70},85 ${W*0.78},50 ${W*0.82},95 ${W*0.88},25 ${W*0.92},85 ${W},60 ${W},120`}
              fill={mt2DistFill} opacity={0.85} />
          </svg>
        )}

        {/* ── Waterfalls on far mountains ── */}
        {!noBackdrop && (
          <div style={{ position: 'absolute', left: `${W*0.455}px`, bottom: 25, width: 4, height: '10%', overflow: 'hidden', zIndex: 1 }}>
            <div style={{
              width: '100%', height: '200%',
              background: 'linear-gradient(to bottom, #f97316 0%, #dc2626 40%, #f97316 60%, #dc2626 100%)',
              animation: 'lazi-lavafall 0.6s linear infinite',
            }} />
          </div>
        )}
        {!noBackdrop && (
          <div style={{ position: 'absolute', left: `${W*0.245}px`, bottom: 25, width: 4, height: '8%', overflow: 'hidden', zIndex: 1 }}>
            <div style={{
              width: '100%', height: '200%',
              background: 'linear-gradient(to bottom, #38bdf8 0%, #0284c7 50%, #38bdf8 100%)',
              animation: 'lazi-waterfall 0.8s linear infinite',
            }} />
          </div>
        )}

        {/* ── Near hills — smooth, bigger foreground prominence ── */}
        {!noBackdrop && W > 0 && (
          <svg style={{ position: 'absolute', bottom: 18, left: 0, width: '100%', height: '30%' }}
            viewBox={`0 0 ${W} 80`} preserveAspectRatio="none">
            <path d={`M0,80 Q${W*0.15},5 ${W*0.3},55 Q${W*0.45},5 ${W*0.6},48 Q${W*0.75},8 ${W*0.9},42 Q${W*0.97},30 ${W},38 L${W},80 Z`}
              fill={isNight ? '#1e3d1e' : '#4a8c3f'} opacity={0.95} />
          </svg>
        )}

        {/* ── Pixel-art trees on hill crests ── */}
        {!noBackdrop && W > 0 && (
          <>
            <div style={{ position: 'absolute', left: `${W*0.13}px`, bottom: 72, pointerEvents: 'none' }}>
              <svg viewBox="0 0 22 40" width={22} height={40} style={{ imageRendering: 'pixelated', display: 'block' }}>
                <rect x="9" y="22" width="4" height="18" fill="#7c4f1e"/>
                <rect x="4" y="12" width="14" height="12" fill="#166534"/>
                <rect x="2" y="6" width="18" height="10" fill="#15803d"/>
                <rect x="5" y="2" width="12" height="8" fill="#166534"/>
              </svg>
            </div>
            <div style={{ position: 'absolute', left: `${W*0.30}px`, bottom: 85, pointerEvents: 'none' }}>
              <svg viewBox="0 0 18 44" width={18} height={44} style={{ imageRendering: 'pixelated', display: 'block' }}>
                <rect x="7" y="24" width="4" height="20" fill="#d4d4d4"/>
                <rect x="7" y="20" width="4" height="6" fill="#a3a3a3"/>
                <rect x="7" y="26" width="1" height="2" fill="#525252"/>
                <rect x="3" y="10" width="12" height="12" fill="#4ade80"/>
                <rect x="1" y="6" width="16" height="10" fill="#22c55e"/>
                <rect x="3" y="2" width="12" height="8" fill="#4ade80"/>
                <rect x="6" y="0" width="6" height="6" fill="#16a34a"/>
              </svg>
            </div>
            <div style={{ position: 'absolute', left: `${W*0.43}px`, bottom: 100, pointerEvents: 'none' }}>
              <svg viewBox="0 0 20 48" width={20} height={48} style={{ imageRendering: 'pixelated', display: 'block' }}>
                <rect x="8" y="30" width="4" height="18" fill="#92400e"/>
                <rect x="6" y="22" width="8" height="12" fill="#065f46"/>
                <rect x="4" y="14" width="12" height="12" fill="#047857"/>
                <rect x="2" y="8" width="16" height="10" fill="#065f46"/>
                <rect x="4" y="2" width="12" height="10" fill="#047857"/>
                <rect x="7" y="0" width="6" height="6" fill="#064e3b"/>
              </svg>
            </div>
            <div style={{ position: 'absolute', left: `${W*0.57}px`, bottom: 68, pointerEvents: 'none' }}>
              <svg viewBox="0 0 18 34" width={18} height={34} style={{ imageRendering: 'pixelated', display: 'block' }}>
                <rect x="7" y="18" width="4" height="16" fill="#7c4f1e"/>
                <rect x="3" y="10" width="12" height="10" fill="#166534"/>
                <rect x="1" y="4" width="16" height="10" fill="#15803d"/>
                <rect x="4" y="0" width="10" height="8" fill="#14532d"/>
              </svg>
            </div>
            <div style={{ position: 'absolute', left: `${W*0.71}px`, bottom: 82, pointerEvents: 'none' }}>
              <svg viewBox="0 0 16 38" width={16} height={38} style={{ imageRendering: 'pixelated', display: 'block' }}>
                <rect x="6" y="20" width="4" height="18" fill="#e5e5e5"/>
                <rect x="6" y="24" width="1" height="2" fill="#525252"/>
                <rect x="2" y="8" width="12" height="12" fill="#86efac"/>
                <rect x="0" y="4" width="16" height="10" fill="#4ade80"/>
                <rect x="2" y="0" width="12" height="8" fill="#86efac"/>
              </svg>
            </div>
            <div style={{ position: 'absolute', left: `${W*0.82}px`, bottom: 74, pointerEvents: 'none' }}>
              <svg viewBox="0 0 18 42" width={18} height={42} style={{ imageRendering: 'pixelated', display: 'block' }}>
                <rect x="7" y="26" width="4" height="16" fill="#78350f"/>
                <rect x="5" y="20" width="8" height="8" fill="#064e3b"/>
                <rect x="3" y="12" width="12" height="12" fill="#065f46"/>
                <rect x="1" y="6" width="16" height="10" fill="#047857"/>
                <rect x="4" y="0" width="10" height="10" fill="#065f46"/>
              </svg>
            </div>
          </>
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
        {/* ... (Existing scene elements: Trees, House, Crafting Table, Chest, Campfire) */}
        
        {/* Removed leashed horse */}
        
        <div style={{ position: 'absolute', right: 85, bottom: 20, cursor: 'pointer' }} onClick={() => spawnPt(W-85, '&#x2692;', '#aaa')}>
          <Sprite px={CRAFTING_TABLE_PX} vw={24} vh={24} scale={1.2} />
        </div>
        <div style={{ position: 'absolute', right: 125, bottom: 20, cursor: 'pointer' }} onClick={toggleChest}>
          <Sprite px={CHEST_PX} vw={24} vh={24} scale={1.2} style={{ transform: chestOpen ? 'scaleY(0.9)' : undefined }} />
        </div>

        {/* ── Nether Portal ── */}
        <div style={{ position:'absolute', bottom:28, left:42, zIndex:3 }}>
          <div style={{ position:'relative', width:60, height:90 }}>
            {/* Left column */}
            <div style={{ position:'absolute',left:0,top:0,width:10,height:90,background:'#1a0a2e',border:'1px solid #2d1a4a',imageRendering:'pixelated' }}/>
            {/* Right column */}
            <div style={{ position:'absolute',right:0,top:0,width:10,height:90,background:'#1a0a2e',border:'1px solid #2d1a4a' }}/>
            {/* Top bar */}
            <div style={{ position:'absolute',top:0,left:10,right:10,height:10,background:'#1a0a2e',border:'1px solid #2d1a4a' }}/>
            {/* Bottom bar */}
            <div style={{ position:'absolute',bottom:0,left:10,right:10,height:10,background:'#1a0a2e',border:'1px solid #2d1a4a' }}/>
            {/* Portal interior */}
            <div style={{
              position:'absolute', left:10, top:10, right:10, bottom:10,
              background: 'linear-gradient(135deg, #4b0082 0%, #7b2fbe 30%, #9b59b6 50%, #7b2fbe 70%, #4b0082 100%)',
              animation: 'portal-shimmer 2s ease-in-out infinite alternate',
              boxShadow: 'inset 0 0 20px #7b2fbe, 0 0 30px #7b2fbe88',
            }}/>
            {/* Portal label */}
            <div style={{ position:'absolute', bottom:-18, left:'50%', transform:'translateX(-50%)', fontSize:8, color:'#9b59b6', fontWeight:700, letterSpacing:'.04em', whiteSpace:'nowrap', textShadow:'0 0 6px #7b2fbe' }}>NETHER</div>
          </div>
        </div>

        {/* ── Sheep (cute fluffy) ── */}
        <div style={{
          position: 'absolute',
          left: sheepSucked ? sheepX : (portalSuck && !sheepSucked && sheepX < 180 ? sheepX - 10 : sheepX),
          bottom: 20, cursor: 'pointer',
          transform: sheepSucked ? 'scale(0) translateY(20px)' : (sheepBob ? 'translateY(-4px)' : 'translateY(0)'),
          opacity: sheepSucked ? 0 : 1,
          transition: sheepSucked ? 'all 0.5s ease' : 'transform 0.18s, left 0.8s ease, opacity 0.5s ease',
        }} onClick={() => { unlock('ach-schaf', 'Schaf-Flüsterin'); spawnPt(sheepX + 16, '&#x2665;', '#f472b6') }} title="Baa!">
          <svg viewBox="0 0 32 26" width={52} height={42}
            style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block',
              transform: sheepDir === 'l' ? 'scaleX(-1)' : undefined }}>
            {/* Fluffy wool body — cloud bumps */}
            <rect x="4" y="8" width="18" height="10" fill="#e8eaec"/>
            <rect x="2" y="10" width="4" height="6" fill="#e8eaec"/>
            <rect x="20" y="10" width="4" height="6" fill="#e8eaec"/>
            <rect x="5" y="5" width="5" height="5" fill="#e8eaec"/>
            <rect x="9" y="4" width="5" height="5" fill="#e8eaec"/>
            <rect x="13" y="5" width="5" height="5" fill="#e8eaec"/>
            <rect x="17" y="6" width="4" height="4" fill="#e8eaec"/>
            {/* Shading */}
            <rect x="4" y="15" width="18" height="3" fill="#c9cbcc"/>
            {/* Head */}
            <rect x="22" y="6" width="10" height="10" fill="#6b7280"/>
            {/* Ears */}
            <rect x="23" y="4" width="3" height="3" fill="#9ca3af"/>
            <rect x="28" y="4" width="3" height="3" fill="#9ca3af"/>
            {/* Eyes */}
            <rect x="24" y="8" width="2" height="2" fill="#1f2937"/>
            <rect x="29" y="8" width="2" height="2" fill="#1f2937"/>
            <rect x="24" y="8" width="1" height="1" fill="#fff"/>
            <rect x="29" y="8" width="1" height="1" fill="#fff"/>
            {/* Mouth */}
            <rect x="26" y="13" width="4" height="1" fill="#374151"/>
            {/* Legs */}
            <rect x="6" y="18" width="3" height="7" fill="#6b7280"/>
            <rect x="11" y="18" width="3" height="7" fill="#6b7280"/>
            <rect x="16" y="18" width="3" height="7" fill="#6b7280"/>
          </svg>
        </div>

        {/* ── Pig (cute chubby) ── */}
        <div style={{
          position: 'absolute',
          left: pigSucked ? pigX : (portalSuck && !pigSucked && pigX < 180 ? pigX - 10 : pigX),
          bottom: 20, cursor: 'pointer',
          opacity: pigSucked ? 0 : 1,
          transform: pigSucked ? 'scale(0) translateY(20px)' : undefined,
          transition: pigSucked ? 'all 0.5s ease' : 'left 0.8s ease, opacity 0.5s ease',
        }}
          onClick={() => { unlock('ach-ferkel', 'Ferkel-Königin'); spawnPt(pigX + 18, '&#x2665;', '#f472b6') }} title="Oink!">
          <svg viewBox="0 0 36 28" width={56} height={44}
            style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block',
              transform: pigDir === 'l' ? 'scaleX(-1)' : undefined }}>
            {/* Body */}
            <rect x="2" y="6" width="20" height="14" fill="#fbb6c8"/>
            <rect x="2" y="9" width="20" height="2" fill="#f9a8d4"/>
            {/* Body shade */}
            <rect x="2" y="17" width="20" height="3" fill="#f472b6" opacity="0.4"/>
            {/* Head */}
            <rect x="20" y="2" width="14" height="14" fill="#fbb6c8"/>
            {/* Snout */}
            <rect x="28" y="7" width="8" height="6" fill="#f472b6"/>
            <rect x="29" y="8" width="2" height="2" fill="#9f1239"/>
            <rect x="33" y="8" width="2" height="2" fill="#9f1239"/>
            {/* Eyes */}
            <rect x="21" y="4" width="3" height="3" fill="#1f2937"/>
            <rect x="28" y="4" width="3" height="3" fill="#1f2937"/>
            <rect x="21" y="4" width="1" height="1" fill="#fff"/>
            <rect x="28" y="4" width="1" height="1" fill="#fff"/>
            {/* Ears */}
            <rect x="22" y="0" width="4" height="4" fill="#f472b6"/>
            <rect x="30" y="0" width="4" height="4" fill="#f472b6"/>
            {/* Legs */}
            <rect x="4" y="20" width="4" height="7" fill="#fbb6c8"/>
            <rect x="10" y="20" width="4" height="7" fill="#fbb6c8"/>
            <rect x="16" y="20" width="4" height="7" fill="#fbb6c8"/>
            {/* Curly tail */}
            <rect x="0" y="8" width="3" height="3" fill="#fbb6c8"/>
            <rect x="0" y="10" width="2" height="2" fill="#f472b6"/>
          </svg>
        </div>

        {/* ── Cow (cute blocky) ── */}
        <div style={{
          position: 'absolute',
          left: cowSucked ? cowX : (portalSuck && !cowSucked && cowX < 180 ? cowX - 10 : cowX),
          bottom: 20, cursor: 'pointer',
          opacity: cowSucked ? 0 : 1,
          transform: cowSucked ? 'scale(0) translateY(20px)' : undefined,
          transition: cowSucked ? 'all 0.5s ease' : 'left 0.8s ease, opacity 0.5s ease',
        }}
          onClick={() => { spawnPt(cowX + 28, '&#x1F95B;', '#fff'); spawnPt(cowX + 22, '&#x2665;', '#f472b6'); unlock('ach-kuh', 'Milch-Meisterin') }}
          title="Muh!">
          <svg viewBox="0 0 44 30" width={66} height={45}
            style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block',
              transform: cowDir === 'l' ? 'scaleX(-1)' : undefined }}>
            {/* Body */}
            <rect x="4" y="8" width="24" height="14" fill="#f5f5f5"/>
            {/* Spots */}
            <rect x="7" y="10" width="5" height="4" fill="#1f2937"/>
            <rect x="18" y="13" width="4" height="5" fill="#1f2937"/>
            <rect x="12" y="8" width="3" height="3" fill="#1f2937"/>
            {/* Udder */}
            <rect x="10" y="22" width="10" height="4" fill="#fda4af"/>
            {/* Head */}
            <rect x="26" y="4" width="16" height="14" fill="#f5f5f5"/>
            {/* Snout */}
            <rect x="36" y="9" width="8" height="6" fill="#fda4af"/>
            <rect x="37" y="10" width="2" height="2" fill="#9f1239"/>
            <rect x="41" y="10" width="2" height="2" fill="#9f1239"/>
            {/* Eyes */}
            <rect x="28" y="6" width="3" height="3" fill="#1f2937"/>
            <rect x="28" y="6" width="1" height="1" fill="#fff"/>
            {/* Horns */}
            <rect x="28" y="1" width="2" height="4" fill="#d4a017"/>
            <rect x="36" y="1" width="2" height="4" fill="#d4a017"/>
            {/* Ears */}
            <rect x="27" y="4" width="3" height="3" fill="#fda4af"/>
            {/* Legs */}
            <rect x="6"  y="22" width="4" height="8" fill="#d1d5db"/>
            <rect x="12" y="22" width="4" height="8" fill="#d1d5db"/>
            <rect x="18" y="22" width="4" height="8" fill="#d1d5db"/>
            <rect x="24" y="22" width="3" height="6" fill="#d1d5db"/>
            {/* Tail */}
            <rect x="2" y="10" width="3" height="2" fill="#9ca3af"/>
            <rect x="1" y="11" width="2" height="3" fill="#6b7280"/>
          </svg>
        </div>

        {/* ── Chicken (cute little) ── */}
        <div style={{
          position: 'absolute',
          left: chickenSucked ? chickenX : (portalSuck && !chickenSucked && chickenX < 180 ? chickenX - 10 : chickenX),
          bottom: 20, cursor: 'pointer',
          transform: chickenSucked ? 'scale(0) translateY(20px)' : (chickenBob ? 'translateY(-2px)' : 'translateY(0)'),
          opacity: chickenSucked ? 0 : 1,
          transition: chickenSucked ? 'all 0.5s ease' : 'transform 0.1s, left 0.8s ease, opacity 0.5s ease',
        }} onClick={() => {
          spawnPt(chickenX + 8, '&#x1F95A;', '#fbbf24')
          spawnPt(chickenX + 8, '&#x2665;', '#f472b6')
          unlock('ach-huhn', 'Hühner-Flüsterin')
          if (!okosRef.current) { okosRef.current = true; unlock('ach-okostojas', 'Okostojás') }
          setClickEgg(chickenX)
          setTimeout(() => setClickEgg(null), 2000)
        }}
          title="Gak!">
          <svg viewBox="0 0 18 22" width={27} height={33}
            style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block',
              transform: chickenDir === 'l' ? 'scaleX(-1)' : undefined }}>
            {/* Body */}
            <rect x="2" y="8" width="13" height="10" fill="#fef9c3"/>
            {/* Wing */}
            <rect x="3" y="9" width="5" height="6" fill="#fde68a"/>
            {/* Head */}
            <rect x="8" y="2" width="8" height="7" fill="#fef9c3"/>
            {/* Comb */}
            <rect x="9" y="0" width="2" height="3" fill="#ef4444"/>
            <rect x="12" y="1" width="2" height="2" fill="#ef4444"/>
            {/* Wattle */}
            <rect x="14" y="5" width="3" height="3" fill="#ef4444"/>
            {/* Beak */}
            <rect x="15" y="4" width="3" height="2" fill="#f59e0b"/>
            {/* Eye */}
            <rect x="10" y="3" width="2" height="2" fill="#1f2937"/>
            <rect x="10" y="3" width="1" height="1" fill="#fff"/>
            {/* Tail feathers */}
            <rect x="0" y="7" width="3" height="2" fill="#fde68a"/>
            <rect x="0" y="6" width="2" height="2" fill="#fef9c3"/>
            {/* Legs */}
            <rect x="5" y="18" width="2" height="4" fill="#f59e0b"/>
            <rect x="5" y="22" width="4" height="1" fill="#f59e0b"/>
            <rect x="9" y="18" width="2" height="4" fill="#f59e0b"/>
            <rect x="9" y="22" width="4" height="1" fill="#f59e0b"/>
          </svg>
        </div>

        {/* Egg */}
        {egg !== null && (
          <div style={{
            position: 'absolute', left: egg + 6, bottom: 20, width: 8, height: 10,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            background: '#fef9c3', border: '1px solid #d97706',
          }} />
        )}
        {clickEgg !== null && (
          <div style={{
            position: 'absolute', left: clickEgg + 6, bottom: 22, width: 8, height: 10,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            background: '#fef9c3', border: '1px solid #d97706',
            animation: 'lazi-float-up 1.5s ease-out forwards',
          }} />
        )}

        {ballX !== null && (
          <div style={{
            position: 'absolute', left: ballX, bottom: 48, width: 10, height: 10,
            borderRadius: '50%', background: '#fff', border: '2px solid #555',
          }} />
        )}

        <div style={{ position: 'absolute', left: portalSuck ? Math.max(50, wolfX - 30) : wolfX, bottom: wolfSitting ? 12 : 20, cursor: 'pointer', transition: 'left 0.8s ease, bottom 0.3s ease' }}
          onClick={petWolf} title={tamed ? (wolfSitting ? `${wolfName} aufstehen!` : `${wolfName} sitzen lassen!`) : 'Klick zum Zähmen!'}>
          {tamed && (
            <div style={{
              position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 9, fontWeight: 700,
              fontFamily: 'monospace', padding: '2px 6px', borderRadius: 3, whiteSpace: 'nowrap',
            }}>{wolfName} <span style={{ color: moodColor }}>&#x2665;</span></div>
          )}
          {tamed && (
            <div style={{
              position: 'absolute', top: -34, left: '50%', transform: 'translateX(-50%)',
              color: '#FFD700', fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
              whiteSpace: 'nowrap', opacity: wolfSitting ? 1 : 0, transition: 'opacity 0.3s',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)', pointerEvents: 'none',
            }}>Sitz!</div>
          )}
          {wolfState === 'happy' && (
            <div style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              background: 'rgba(250,204,21,0.2)', filter: 'blur(4px)',
            }} />
          )}
          <Sprite px={wolfPx} vw={wolfVW} vh={wolfVH} scale={noBackdrop ? 1.1 : 0.9}
            flip={wolfDir === 'l' && !isSitting} />
          {tamed && (
            <div style={{
              position: 'absolute',
              left: wolfDir === 'r' || isSitting ? 1 : undefined,
              right: wolfDir === 'l' && !isSitting ? 1 : undefined,
              top: 3,
              width: 4,
              height: 12,
              background: '#9ca3af',
              borderRadius: 1,
              transformOrigin: 'top center',
              transform: `rotate(${tailWag ? 20 : -10}deg)`,
              transition: 'transform 0.3s ease',
            }} />
          )}
        </div>

        {creeperVisible && (
          <div style={{
            position: 'absolute', left: creeperX, bottom: 20,
            animation: creeperScared ? 'lazi-shake 0.1s infinite' : undefined,
          }}>
            <Sprite px={creeperScenePx(creeperScared)} vw={28} vh={36} scale={1.35} />
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

        {/* ── Ground ── */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28 }}>
          <div style={{ height: 6, background: '#5D9E2E', borderTop: '3px solid #7DC845' }} />
          <div style={{ height: 6, background: '#4a8c22' }} />
          <div style={{ height: 8, background: '#7c4f1e' }} />
          <div style={{ height: 8, background: '#6b3d10' }} />
        </div>

        {/* ── HUD — centered bottom game bar ── */}
        <div style={{
          position: 'fixed', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          zIndex: 8000, display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(14,9,2,0.93)', border: '2px solid #5D9E2E',
          borderRadius: 10, padding: '6px 14px', fontFamily: 'monospace',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)', whiteSpace: 'nowrap',
        }}>
          {/* Wolf info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 120 }}>
            {tamed ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ background: '#5D9E2E', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>Lv.{level}</span>
                  <span style={{ color: '#FFD700', fontSize: 11, fontWeight: 700 }}>{wolfName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#666', fontSize: 9 }}>XP</span>
                  <div style={{ width: 60, height: 4, background: '#2a2010', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${(xpInLv / xpToNext) * 100}%`, height: '100%', background: '#5D9E2E', transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ width: 28, height: 4, background: '#2a2010', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${hunger}%`, height: '100%', background: moodColor, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ color: moodColor, fontSize: 9, fontWeight: 700 }}>{moodLabel}</span>
                </div>
              </>
            ) : (
              <span style={{ color: '#888', fontSize: 10 }}>
                {wolfBones < 3 ? `${wolfBones}/3 Knochen` : 'Klick auf den Wolf!'}
              </span>
            )}
          </div>
          {/* Divider */}
          <div style={{ width: 1, height: 32, background: '#2a4a2a' }} />
          {/* Action buttons */}
          {[
            { emoji: '&#x1F9B4;', label: 'Knochen', action: feedBone, always: true },
            { emoji: '&#x1F34E;', label: 'Apfel',   action: feedApple, always: false },
            { emoji: '&#x26BD;',  label: 'Ball',     action: throwBall, always: false },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              title={!item.always && !tamed ? 'Wolf erst zähmen!' : item.label}
              style={{
                background: 'rgba(30,20,6,0.95)', border: '2px solid #5D9E2E', borderRadius: 6,
                color: '#fff', fontSize: 15, width: 32, height: 32, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: !item.always && !tamed ? 0.3 : 1,
              }}
              dangerouslySetInnerHTML={{ __html: item.emoji }} />
          ))}
          {/* Trick buttons (only when tamed) */}
          {tamed && (
            <>
              <div style={{ width: 1, height: 32, background: '#2a4a2a' }} />
              {([
                { key: 'sit', label: 'Sitz' },
                { key: 'howl', label: 'Heulen' },
                { key: 'spin', label: 'Drehen' },
              ] as const).map(t => (
                <button key={t.key} onClick={() => doTrick(t.key)}
                  disabled={wolfState !== 'idle'}
                  style={{
                    background: 'rgba(30,20,6,0.95)', border: '2px solid #3a7D44', borderRadius: 5,
                    color: wolfState !== 'idle' ? '#444' : '#9ca3af',
                    fontSize: 10, fontWeight: 700, padding: '4px 8px',
                    cursor: wolfState !== 'idle' ? 'not-allowed' : 'pointer',
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
        @keyframes portal-shimmer { 0% { opacity: 0.7; filter: brightness(0.9) saturate(1.2); } 100% { opacity: 1; filter: brightness(1.3) saturate(1.8); } }
        @keyframes lazi-waterfall { 0%{transform:translateY(-100%);opacity:0.9} 100%{transform:translateY(0);opacity:0.4} }
        @keyframes lazi-lavafall { 0%{transform:translateY(-100%);opacity:1} 100%{transform:translateY(0);opacity:0.7} }
      `}</style>
    </>
  )
}
