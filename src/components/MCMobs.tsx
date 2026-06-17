// Shared Minecraft mob + landscape components

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
        {tamed && <rect x="14" y="7" width="5" height="2" fill="#cc2222"/>}
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
