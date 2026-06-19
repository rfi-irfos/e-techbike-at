import { useEffect, useRef, useState } from 'react'

// ── Nether minigame ────────────────────────────────────────────────────────
// Enter from the overworld by holding the Nether portal for 5s. Move with
// A/D (or arrows), jump with W / Space, aim with the mouse and click to swing
// the diamond sword. Slay zombies for gold; trade gold for bones and hearts.
// On exit, returns the net gold and the bones traded so the overworld persists.

interface Zombie { id: number; x: number; y: number; vy: number; onGround: boolean; dead: boolean }
interface Drop { id: number; x: number; y: number; amount: number }

const GROUND = 90          // ground height from bottom of the play area (px)
const GRAV = 1700          // px/s^2
const MOVE = 240           // px/s
const JUMP = 620           // px/s
const PLAYER_W = 26
const ZOMBIE_W = 24
const SWORD_REACH = 64
const SWING_MS = 260
const HURT_CD = 900

export function NetherGame({
  wolfName, startGold, onExit, onAchUnlock,
}: {
  wolfName: string
  startGold: number
  onExit: (finalGold: number, bonesGained: number) => void
  onAchUnlock: (id: string, title: string) => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [, force] = useState(0)
  const [over, setOver] = useState(false)
  const [showTrade, setShowTrade] = useState(false)

  // ── Mutable game state (refs so the rAF loop never goes stale) ──
  const px = useRef(120), py = useRef(0), pvx = useRef(0), pvy = useRef(0)
  const onGround = useRef(true)
  const facing = useRef<1 | -1>(1)
  const swingUntil = useRef(0)
  const invulnUntil = useRef(0)
  const hearts = useRef(3)
  const gold = useRef(startGold)
  const sessionGold = useRef(0)   // collected this session (for the achievement)
  const bones = useRef(0)
  const kills = useRef(0)
  const zombies = useRef<Zombie[]>([])
  const drops = useRef<Drop[]>([])
  const keys = useRef<Set<string>>(new Set())
  const mouseX = useRef(0)
  const idc = useRef(1)
  const spawnAcc = useRef(0)
  const wolfX = useRef(70)
  const overRef = useRef(false)
  const tradedOnce = useRef(false)

  const widthRef = useRef(900)

  useEffect(() => {
    const el = wrapRef.current
    if (el) widthRef.current = el.clientWidth

    // Lock the page while the minigame is open so movement keys never scroll
    // the overworld behind the overlay (that was the "mobs slide" glitch).
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const MOVE_KEYS = new Set([' ', 'w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'])
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (MOVE_KEYS.has(k)) e.preventDefault()
      keys.current.add(k)
      if (k === ' ' || k === 'w' || k === 'arrowup') jump()
      if (k === 't') setShowTrade(s => !s)
      if (k === 'escape') exit()
      if (k === 'j') swing()
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    let raf = 0
    let last = 0
    const loop = (t: number) => {
      if (!last) last = t
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      if (!overRef.current && !document.hidden) step(dt)
      force(n => (n + 1) & 0xffff)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); document.body.style.overflow = prevOverflow }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function jump() {
    if (overRef.current) return
    if (onGround.current) { pvy.current = JUMP; onGround.current = false }
  }
  function swing() {
    if (overRef.current) return
    swingUntil.current = performance.now() + SWING_MS
    // resolve hits immediately against live zombies in the sword arc
    const reachFrom = px.current
    zombies.current.forEach(z => {
      if (z.dead) return
      const inFront = facing.current === 1 ? (z.x > reachFrom - 6 && z.x < reachFrom + SWORD_REACH) : (z.x < reachFrom + 6 && z.x > reachFrom - SWORD_REACH)
      const closeY = Math.abs(z.y - py.current) < 40
      if (inFront && closeY) {
        z.dead = true
        kills.current++
        drops.current.push({ id: idc.current++, x: z.x, y: z.y, amount: 1 + Math.floor(Math.random() * 3) })
        if (kills.current === 1) onAchUnlock('ach-zombie-slayer', 'Zombie-Schnetzler')
        if (kills.current === 15) onAchUnlock('ach-zombie-horde', 'Horden-Bezwinger')
      }
    })
  }

  function step(dt: number) {
    const W = widthRef.current

    // ── player horizontal ──
    let vx = 0
    if (keys.current.has('a') || keys.current.has('arrowleft')) vx -= MOVE
    if (keys.current.has('d') || keys.current.has('arrowright')) vx += MOVE
    pvx.current = vx
    px.current = Math.max(16, Math.min(W - 16, px.current + vx * dt))

    // facing follows the mouse
    facing.current = mouseX.current >= px.current ? 1 : -1

    // ── player vertical (gravity) ──
    pvy.current -= GRAV * dt
    py.current += pvy.current * dt
    if (py.current <= 0) { py.current = 0; pvy.current = 0; onGround.current = true }

    // ── wolf companion follows ──
    const target = px.current - facing.current * 46
    wolfX.current += (target - wolfX.current) * Math.min(1, dt * 4)

    // ── spawn zombies ──
    spawnAcc.current += dt
    const spawnEvery = Math.max(1.1, 2.6 - kills.current * 0.04)
    if (spawnAcc.current > spawnEvery && zombies.current.filter(z => !z.dead).length < 7) {
      spawnAcc.current = 0
      const fromLeft = Math.random() < 0.5
      zombies.current.push({ id: idc.current++, x: fromLeft ? -20 : W + 20, y: 0, vy: 0, onGround: true, dead: false })
    }

    // ── zombies move toward player ──
    const now = performance.now()
    zombies.current.forEach(z => {
      if (z.dead) return
      const dir = z.x < px.current ? 1 : -1
      z.x += dir * 70 * dt
      // occasional hop
      if (z.onGround && Math.random() < 0.01) { z.vy = 380; z.onGround = false }
      z.vy -= GRAV * dt
      z.y += z.vy * dt
      if (z.y <= 0) { z.y = 0; z.vy = 0; z.onGround = true }
      // contact damage
      if (Math.abs(z.x - px.current) < (PLAYER_W + ZOMBIE_W) / 2 && Math.abs(z.y - py.current) < 36) {
        if (now > invulnUntil.current) {
          invulnUntil.current = now + HURT_CD
          hearts.current -= 1
          pvx.current = 0
          px.current += dir < 0 ? 38 : -38   // knockback away from zombie
          if (hearts.current <= 0) gameOver()
        }
      }
    })
    // cull dead zombies that have been dead a while (keep drops)
    zombies.current = zombies.current.filter(z => !z.dead)

    // ── collect gold drops ──
    drops.current = drops.current.filter(d => {
      if (Math.abs(d.x - px.current) < 30 && Math.abs(d.y - py.current) < 50) {
        gold.current += d.amount
        sessionGold.current += d.amount
        if (sessionGold.current >= 50) onAchUnlock('ach-nether-gold', 'Goldrausch')
        return false
      }
      return true
    })
  }

  function gameOver() {
    overRef.current = true
    setOver(true)
  }
  function exit() {
    overRef.current = true
    onExit(gold.current, bones.current)
  }
  function trade(costGold: number, kind: 'bone' | 'heart') {
    if (gold.current < costGold) return
    gold.current -= costGold
    if (kind === 'bone') bones.current += 1
    if (kind === 'heart') hearts.current = Math.min(3, hearts.current + 1)
    if (!tradedOnce.current) { tradedOnce.current = true; onAchUnlock('ach-nether-trade', 'Nether-Händler') }
    force(n => (n + 1) & 0xffff)
  }

  // ── render ──
  const swinging = performance.now() < swingUntil.current
  const blink = performance.now() < invulnUntil.current && Math.floor(performance.now() / 100) % 2 === 0

  return (
    <div ref={wrapRef}
      onPointerMove={e => { mouseX.current = e.clientX - (wrapRef.current?.getBoundingClientRect().left ?? 0) }}
      onPointerDown={() => { if (!over) swing() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden', cursor: 'crosshair',
        background: 'radial-gradient(120% 100% at 50% 0%, #5a1410 0%, #3a0c0a 45%, #1c0605 100%)',
        userSelect: 'none', fontFamily: '"Press Start 2P", monospace',
      }}
    >
      {/* nether haze */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 40% at 50% 18%, rgba(255,120,40,.18), transparent 70%)', pointerEvents: 'none' }} />

      {/* ground (netherrack) */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: GROUND, background: 'repeating-linear-gradient(90deg, #5b1b18 0 18px, #631f1b 18px 36px)', borderTop: '4px solid #7a2a24', boxShadow: 'inset 0 8px 0 #4a1512' }} />
      {/* lava glow strip at very bottom */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: 'linear-gradient(#ff7b29, #d6450f)', filter: 'blur(1px)', opacity: .8 }} />

      {/* gold drops */}
      {drops.current.map(d => (
        <div key={d.id} style={{ position: 'absolute', left: d.x - 7, bottom: GROUND + d.y, width: 14, height: 14, background: 'linear-gradient(#ffe27a,#f4b400)', border: '2px solid #b07d00', borderRadius: 2, boxShadow: '0 0 8px #f4b40088', animation: 'nether-bob 1s ease-in-out infinite alternate' }} />
      ))}

      {/* zombies */}
      {zombies.current.map(z => (
        <div key={z.id} style={{ position: 'absolute', left: z.x - ZOMBIE_W / 2, bottom: GROUND + z.y, width: ZOMBIE_W, height: 38, imageRendering: 'pixelated' }}>
          <div style={{ width: ZOMBIE_W, height: 16, background: '#3a7d2c', border: '2px solid #245018', boxSizing: 'border-box' }}>
            <div style={{ position: 'absolute', left: 4, top: 5, width: 4, height: 4, background: '#1a3a10' }} />
            <div style={{ position: 'absolute', right: 4, top: 5, width: 4, height: 4, background: '#1a3a10' }} />
          </div>
          <div style={{ width: ZOMBIE_W, height: 20, background: '#2f6f6a', border: '2px solid #1d4744', borderTop: 'none', boxSizing: 'border-box' }} />
        </div>
      ))}

      {/* wolf companion */}
      <div style={{ position: 'absolute', left: wolfX.current - 14, bottom: GROUND, width: 28, height: 20 }}>
        <div style={{ width: 26, height: 13, background: '#b9b9c4', border: '2px solid #7d7d8a', borderRadius: 3 }} />
        <div style={{ position: 'absolute', left: facing.current === 1 ? 18 : -2, top: 0, width: 8, height: 9, background: '#b9b9c4', border: '2px solid #7d7d8a', borderRadius: 2 }} />
      </div>
      {wolfName && <div style={{ position: 'absolute', left: wolfX.current - 24, bottom: GROUND + 22, width: 48, textAlign: 'center', fontSize: 7, color: '#d7c7ff' }}>{wolfName}</div>}

      {/* player — Herobrine (diamond sword) */}
      <div style={{ position: 'absolute', left: px.current - PLAYER_W / 2, bottom: GROUND + py.current, width: PLAYER_W, height: 46, imageRendering: 'pixelated', opacity: blink ? 0.4 : 1, transform: facing.current === -1 ? 'scaleX(-1)' : 'none' }}>
        {/* head */}
        <div style={{ width: 18, height: 16, margin: '0 auto', background: '#c98e6d', border: '2px solid #7a4a32', boxSizing: 'border-box', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 3, top: 6, width: 3, height: 4, background: '#fff' }} />
          <div style={{ position: 'absolute', right: 3, top: 6, width: 3, height: 4, background: '#fff' }} />
        </div>
        {/* hair */}
        <div style={{ position: 'absolute', top: -2, left: 2, right: 2, height: 6, background: '#4a2f1d', borderRadius: '3px 3px 0 0' }} />
        {/* body */}
        <div style={{ width: 20, height: 18, margin: '0 auto', background: '#2a7fd6', border: '2px solid #195aa0', boxSizing: 'border-box' }} />
        {/* legs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <div style={{ width: 7, height: 10, background: '#33405a' }} />
          <div style={{ width: 7, height: 10, background: '#33405a' }} />
        </div>
        {/* diamond sword */}
        <div style={{ position: 'absolute', right: -16, top: 14, width: 22, height: 6, transformOrigin: 'left center', transform: swinging ? 'rotate(-70deg)' : 'rotate(10deg)', transition: 'transform .08s' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 5, height: 6, background: '#6b4a2a' }} />
          <div style={{ position: 'absolute', left: 5, top: 1, width: 17, height: 4, background: 'linear-gradient(#9bf0ec,#46c7c0)', border: '1px solid #2a9d96', boxShadow: swinging ? '0 0 8px #6bf0ec' : 'none' }} />
        </div>
      </div>

      {/* swing arc flash */}
      {swinging && (
        <div style={{ position: 'absolute', left: facing.current === 1 ? px.current : px.current - SWORD_REACH, bottom: GROUND + py.current + 6, width: SWORD_REACH, height: 34, border: '2px solid rgba(155,240,236,.55)', borderRadius: facing.current === 1 ? '0 40px 40px 0' : '40px 0 0 40px', pointerEvents: 'none' }} />
      )}

      {/* ── HUD ── */}
      <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: '#fff' }}>
        <span style={{ display: 'flex', gap: 3 }}>{[0, 1, 2].map(i => <span key={i} style={{ color: i < hearts.current ? '#ff4d4d' : '#5a2a2a', fontSize: 14 }}>♥</span>)}</span>
        <span style={{ color: '#ffd84d' }}>⬤ {gold.current} Gold</span>
        <span style={{ color: '#e8e8e8' }}>🦴 {bones.current}</span>
        <span style={{ color: '#9bf0ec' }}>☠ {kills.current}</span>
      </div>
      <div style={{ position: 'absolute', top: 12, right: 16, display: 'flex', gap: 8 }}>
        <button onClick={() => setShowTrade(s => !s)} style={hudBtn}>Handeln (T)</button>
        <button onClick={exit} style={{ ...hudBtn, background: '#7a2a24' }}>Zurück (Esc)</button>
      </div>
      <div style={{ position: 'absolute', bottom: GROUND + 8, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: 'rgba(255,255,255,.45)', whiteSpace: 'nowrap' }}>
        A / D bewegen · W / Leertaste springen · Maus zielen · Klick = Schwert
      </div>

      {/* ── Trade panel ── */}
      {showTrade && !over && (
        <div style={panelStyle}>
          <div style={{ fontSize: 12, color: '#ffd84d', marginBottom: 14 }}>Nether-Handel</div>
          <div style={{ fontSize: 9, color: '#bbb', marginBottom: 16 }}>Du hast {gold.current} Gold</div>
          <button style={tradeBtn} disabled={gold.current < 5} onClick={() => trade(5, 'bone')}>5 Gold → 1 Knochen 🦴</button>
          <button style={tradeBtn} disabled={gold.current < 10} onClick={() => trade(10, 'heart')}>10 Gold → 1 Herz ♥</button>
          <button style={{ ...tradeBtn, background: 'none', border: '1px solid #555', marginTop: 10 }} onClick={() => setShowTrade(false)}>Schließen</button>
        </div>
      )}

      {/* ── Game over ── */}
      {over && (
        <div style={panelStyle}>
          <div style={{ fontSize: 14, color: '#ff6b6b', marginBottom: 14 }}>Du wurdest überwältigt!</div>
          <div style={{ fontSize: 10, color: '#fff', lineHeight: 1.8, marginBottom: 18 }}>
            Zombies geschnetzelt: {kills.current}<br />Gold gesammelt: {sessionGold.current}<br />Knochen erhandelt: {bones.current}
          </div>
          <button style={{ ...tradeBtn, background: '#2a7fd6' }} onClick={() => onExit(gold.current, bones.current)}>Zurück ins Spawn</button>
        </div>
      )}

      <style>{`@keyframes nether-bob{from{transform:translateY(0)}to{transform:translateY(-5px)}}`}</style>
    </div>
  )
}

const hudBtn: React.CSSProperties = { background: '#3a0c0a', border: '2px solid #7a2a24', color: '#fff', fontSize: 9, padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 }
const panelStyle: React.CSSProperties = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(20,6,5,.96)', border: '3px solid #7a2a24', borderRadius: 10, padding: '26px 30px', textAlign: 'center', minWidth: 260, boxShadow: '0 12px 50px rgba(0,0,0,.6)' }
const tradeBtn: React.CSSProperties = { display: 'block', width: '100%', background: '#5b1b18', border: '2px solid #7a2a24', color: '#fff', fontSize: 9, padding: '10px', marginBottom: 8, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 5 }
