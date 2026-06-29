import React, { useState, useEffect, useRef, useMemo } from 'react'
import type { Customer, Transaction, CRMData } from '../types/crm'
import { proxyRead, proxyWrite, b64Encode, b64Decode, ghTraffic } from '../lib/github'
import { McBackdrop, CrmScene } from './MCMobs'

interface GhTrafficData {
  views: { count: number; uniques: number; views: { timestamp: string; count: number; uniques: number }[] }
  referrers: { referrer: string; count: number; uniques: number }[]
  paths: { path: string; title: string; count: number; uniques: number }[]
}

// ── Achievements (shared storage) ───────────────────────────────────────────
const ACH_KEY = 'lazi_achievements'
const FIRST_THREE = ['ach-erste-schritte']

const ACHIEVEMENTS = [
  // ── Wolf-Game ──
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
  { id: 'ach-kuh',             title: 'Milch-Meisterin',           desc: 'Die Kuh entdeckt' },
  { id: 'ach-huhn',            title: 'Hühner-Flüsterin',          desc: 'Das Huhn angeklickt' },
  { id: 'ach-okostojas',      title: 'Okostojás',                 desc: 'A csirke tojást tojt!' },
  { id: 'ach-schaf',           title: 'Schaf-Flüsterin',            desc: 'Das pinke Schaf entdeckt' },
  { id: 'ach-ferkel',          title: 'Ferkel-Königin',             desc: 'Das Ferkelchen gestreichelt' },
  { id: 'ach-nether-suck',     title: 'Ins Nether gezogen!',        desc: 'Ein Mob wurde vom Portal verschluckt' },
  // ── Business ──
  { id: 'ach-biz-first-contact',title: 'Erster Kontakt',           desc: 'Ersten Kunden angelegt' },
  { id: 'ach-biz-5-contacts',   title: 'Netzwerkerin',             desc: '5 Kontakte im CRM' },
  { id: 'ach-biz-10-contacts',  title: 'Die Basis stimmt',         desc: '10 Kontakte im CRM' },
  { id: 'ach-biz-first-sale',   title: 'Erster Abschluss!',        desc: 'Ersten Kunden auf "Verkauft" gesetzt' },
  { id: 'ach-biz-first-partner',title: 'Partnerin',                desc: 'Ersten Partner-Tag vergeben' },
  { id: 'ach-biz-first-income', title: 'Erste Einnahme',           desc: 'Erste Einnahme eingetragen' },
  { id: 'ach-biz-big-deal',     title: 'Big Deal',                 desc: 'Einnahme über 1.000 €' },
  { id: 'ach-biz-first-no',     title: 'Erstes Nein',              desc: 'Nicht jeder wird Kunde — das ist okay' },
  { id: 'ach-biz-comeback',     title: 'Comeback',                 desc: 'Abgesagten Kontakt wieder auf Offen gesetzt' },
  { id: 'ach-biz-hustle',       title: 'Hustle-Mode',              desc: '3 Kunden an einem Tag angelegt' },
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

// Out of the deployed public/ dir on purpose — CRM PII must not be served on Pages.
const CUSTOMERS_PATH = 'data/customers.json'

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

function AchIcon({ id, locked }: { id: string; locked: boolean }) {
  const c = (color: string) => locked ? '#444' : color
  const icons: Record<string, React.ReactElement> = {
    'ach-erste-schritte': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="6" y="0" width="4" height="2" fill={c('#888')}/><rect x="4" y="2" width="8" height="2" fill={c('#aaa')}/>
        <rect x="6" y="4" width="4" height="10" fill={c('#888')}/><rect x="4" y="12" width="8" height="2" fill={c('#6B4226')}/>
      </svg>
    ),
    'ach-wolf': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="4" width="4" height="3" fill={c('#9ca3af')}/><rect x="4" y="6" width="10" height="7" fill={c('#6b7280')}/>
        <rect x="10" y="2" width="6" height="8" fill={c('#9ca3af')}/><rect x="14" y="5" width="2" height="2" fill={c('#d1d5db')}/>
        <rect x="11" y="3" width="2" height="2" fill={c('#1f2937')}/>
        <rect x="10" y="5" width="4" height="1" fill={c('#0ea5e9')}/>
      </svg>
    ),
    'ach-wolf-bone-first': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="7" width="12" height="2" fill={c('#e5e7eb')}/><rect x="0" y="5" width="3" height="3" fill={c('#d1d5db')}/>
        <rect x="0" y="8" width="3" height="3" fill={c('#d1d5db')}/><rect x="13" y="5" width="3" height="3" fill={c('#d1d5db')}/>
        <rect x="13" y="8" width="3" height="3" fill={c('#d1d5db')}/>
      </svg>
    ),
    'ach-wolf-pet-10': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="1" y="4" width="6" height="5" fill={c('#f472b6')}/><rect x="9" y="4" width="6" height="5" fill={c('#f472b6')}/>
        <rect x="0" y="5" width="2" height="3" fill={c('#ec4899')}/><rect x="14" y="5" width="2" height="3" fill={c('#ec4899')}/>
        <rect x="2" y="8" width="12" height="5" fill={c('#f472b6')}/><rect x="4" y="12" width="8" height="3" fill={c('#ec4899')}/>
        <rect x="6" y="14" width="4" height="2" fill={c('#f472b6')}/>
      </svg>
    ),
    'ach-wolf-pet-50': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="1" y="4" width="6" height="5" fill={c('#f9a8d4')}/><rect x="9" y="4" width="6" height="5" fill={c('#f9a8d4')}/>
        <rect x="2" y="8" width="12" height="5" fill={c('#f9a8d4')}/><rect x="4" y="12" width="8" height="3" fill={c('#f9a8d4')}/>
        <rect x="0" y="5" width="2" height="3" fill={c('#f472b6')}/><rect x="14" y="5" width="2" height="3" fill={c('#f472b6')}/>
        <rect x="5" y="6" width="2" height="2" fill={c('#fbbf24')}/><rect x="9" y="6" width="2" height="2" fill={c('#fbbf24')}/>
      </svg>
    ),
    'ach-wolf-bone-5': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="1" y="3" width="8" height="1" fill={c('#e5e7eb')}/><rect x="0" y="2" width="2" height="3" fill={c('#d1d5db')}/>
        <rect x="7" y="2" width="2" height="3" fill={c('#d1d5db')}/>
        <rect x="3" y="7" width="10" height="1" fill={c('#e5e7eb')}/><rect x="2" y="6" width="2" height="3" fill={c('#d1d5db')}/>
        <rect x="11" y="6" width="2" height="3" fill={c('#d1d5db')}/>
        <rect x="1" y="11" width="14" height="2" fill={c('#e5e7eb')}/><rect x="0" y="10" width="3" height="4" fill={c('#d1d5db')}/>
        <rect x="13" y="10" width="3" height="4" fill={c('#d1d5db')}/>
      </svg>
    ),
    'ach-wolf-bone-20': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="6" width="16" height="4" fill={c('#e5e7eb')}/><rect x="0" y="4" width="3" height="8" fill={c('#d1d5db')}/>
        <rect x="13" y="4" width="3" height="8" fill={c('#d1d5db')}/><rect x="7" y="2" width="2" height="12" fill={c('#f59e0b')}/>
      </svg>
    ),
    'ach-creeper': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="0" width="12" height="10" fill={c('#4ade80')}/><rect x="2" y="4" width="3" height="3" fill={c('#166534')}/>
        <rect x="11" y="4" width="3" height="3" fill={c('#166534')}/><rect x="4" y="8" width="2" height="3" fill={c('#166534')}/>
        <rect x="10" y="8" width="2" height="3" fill={c('#166534')}/><rect x="6" y="9" width="4" height="2" fill={c('#166534')}/>
        <rect x="4" y="10" width="8" height="6" fill={c('#4ade80')}/><rect x="2" y="14" width="4" height="2" fill={c('#166534')}/>
        <rect x="10" y="14" width="4" height="2" fill={c('#166534')}/>
      </svg>
    ),
    'ach-night-owl': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="6" y="0" width="8" height="8" fill={c('#fef9c3')}/><rect x="10" y="0" width="6" height="6" fill={c('#05091a')}/>
        <rect x="4" y="4" width="8" height="10" fill={c('#fef9c3')}/><rect x="2" y="6" width="4" height="4" fill={c('#fef9c3')}/>
        <rect x="10" y="6" width="4" height="4" fill={c('#fef9c3')}/>
        <rect x="6" y="6" width="2" height="2" fill={c('#1f2937')}/><rect x="10" y="6" width="2" height="2" fill={c('#1f2937')}/>
        <rect x="7" y="10" width="4" height="2" fill={c('#f59e0b')}/>
      </svg>
    ),
    'ach-early-bird': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="4" width="8" height="8" fill={c('#fbbf24')}/><rect x="2" y="6" width="12" height="4" fill={c('#fbbf24')}/>
        <rect x="6" y="2" width="4" height="12" fill={c('#fbbf24')}/><rect x="0" y="4" width="2" height="2" fill={c('#fde68a')}/>
        <rect x="0" y="10" width="2" height="2" fill={c('#fde68a')}/><rect x="14" y="4" width="2" height="2" fill={c('#fde68a')}/>
        <rect x="14" y="10" width="2" height="2" fill={c('#fde68a')}/><rect x="2" y="2" width="2" height="2" fill={c('#fde68a')}/>
        <rect x="12" y="2" width="2" height="2" fill={c('#fde68a')}/><rect x="2" y="12" width="2" height="2" fill={c('#fde68a')}/>
        <rect x="12" y="12" width="2" height="2" fill={c('#fde68a')}/>
      </svg>
    ),
    'ach-adventurer': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="7" y="0" width="2" height="10" fill={c('#9ca3af')}/><rect x="5" y="1" width="6" height="2" fill={c('#d1d5db')}/>
        <rect x="6" y="2" width="4" height="6" fill={c('#bfdbfe')}/><rect x="7" y="10" width="2" height="6" fill={c('#78350f')}/>
        <rect x="5" y="14" width="6" height="2" fill={c('#92400e')}/>
      </svg>
    ),
    'ach-kuh': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="4" width="12" height="8" fill={c('#f5f5f5')}/><rect x="4" y="5" width="3" height="3" fill={c('#1f2937')}/>
        <rect x="10" y="7" width="2" height="2" fill={c('#1f2937')}/><rect x="12" y="2" width="4" height="6" fill={c('#f5f5f5')}/>
        <rect x="14" y="5" width="3" height="2" fill={c('#fda4af')}/><rect x="5" y="12" width="2" height="4" fill={c('#9ca3af')}/>
        <rect x="9" y="12" width="2" height="4" fill={c('#9ca3af')}/><rect x="2" y="6" width="2" height="1" fill={c('#d4a017')}/>
      </svg>
    ),
    'ach-huhn': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="5" width="9" height="7" fill={c('#fef9c3')}/><rect x="8" y="2" width="6" height="5" fill={c('#fef9c3')}/>
        <rect x="9" y="0" width="2" height="3" fill={c('#ef4444')}/><rect x="13" y="3" width="3" height="2" fill={c('#ef4444')}/>
        <rect x="13" y="3" width="3" height="2" fill={c('#f59e0b')}/><rect x="10" y="3" width="2" height="2" fill={c('#1f2937')}/>
        <rect x="4" y="12" width="2" height="4" fill={c('#f59e0b')}/><rect x="7" y="12" width="2" height="4" fill={c('#f59e0b')}/>
      </svg>
    ),
    'ach-okostojas': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="2" width="8" height="2" fill={c('#fef9c3')}/><rect x="2" y="4" width="12" height="2" fill={c('#fef9c3')}/>
        <rect x="1" y="6" width="14" height="5" fill={c('#fef9c3')}/><rect x="2" y="11" width="12" height="2" fill={c('#fef9c3')}/>
        <rect x="4" y="13" width="8" height="2" fill={c('#fef9c3')}/><rect x="3" y="3" width="2" height="2" fill={c('#fde68a')}/>
        <rect x="11" y="3" width="2" height="2" fill={c('#fde68a')}/><rect x="6" y="8" width="4" height="2" fill={c('#f59e0b')}/>
      </svg>
    ),
    'ach-schaf': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="4" width="10" height="7" fill={c('#e8eaec')}/><rect x="0" y="6" width="3" height="4" fill={c('#e8eaec')}/>
        <rect x="11" y="6" width="3" height="4" fill={c('#e8eaec')}/><rect x="3" y="2" width="5" height="4" fill={c('#e8eaec')}/>
        <rect x="7" y="3" width="4" height="3" fill={c('#e8eaec')}/><rect x="11" y="2" width="5" height="7" fill={c('#6b7280')}/>
        <rect x="13" y="5" width="3" height="2" fill={c('#1f2937')}/><rect x="4" y="11" width="2" height="4" fill={c('#6b7280')}/>
        <rect x="8" y="11" width="2" height="4" fill={c('#6b7280')}/>
      </svg>
    ),
    'ach-ferkel': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="1" y="4" width="11" height="9" fill={c('#fbb6c8')}/><rect x="10" y="2" width="6" height="8" fill={c('#fbb6c8')}/>
        <rect x="14" y="4" width="4" height="4" fill={c('#f472b6')}/><rect x="15" y="5" width="1" height="1" fill={c('#9f1239')}/>
        <rect x="15" y="7" width="1" height="1" fill={c('#9f1239')}/><rect x="11" y="3" width="2" height="2" fill={c('#1f2937')}/>
        <rect x="3" y="13" width="2" height="3" fill={c('#fbb6c8')}/><rect x="7" y="13" width="2" height="3" fill={c('#fbb6c8')}/>
        <rect x="0" y="5" width="2" height="2" fill={c('#f472b6')}/>
      </svg>
    ),
    'ach-nether-suck': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="0" width="3" height="16" fill={c('#1a0a2e')}/><rect x="13" y="0" width="3" height="16" fill={c('#1a0a2e')}/>
        <rect x="0" y="0" width="16" height="3" fill={c('#1a0a2e')}/><rect x="0" y="13" width="16" height="3" fill={c('#1a0a2e')}/>
        <rect x="3" y="3" width="10" height="10" fill={c('#7b2fbe')} opacity="0.8"/>
        <rect x="5" y="5" width="6" height="6" fill={c('#9b59b6')}/>
        <rect x="7" y="7" width="2" height="2" fill={c('#c084fc')}/>
      </svg>
    ),
  }
  const bizIcons: Record<string, React.ReactElement> = {
    'ach-biz-first-contact': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="2" width="16" height="12" fill={c('#4b5563')}/><rect x="0" y="2" width="16" height="2" fill={c('#9ca3af')}/>
        <polygon points="0,4 8,9 16,4" fill={c('#9ca3af')}/>
      </svg>
    ),
    'ach-biz-5-contacts': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="0" width="4" height="4" fill={c('#6b7280')}/><rect x="1" y="4" width="6" height="5" fill={c('#6b7280')}/>
        <rect x="8" y="2" width="4" height="4" fill={c('#9ca3af')}/><rect x="7" y="6" width="6" height="5" fill={c('#9ca3af')}/>
        <rect x="0" y="11" width="16" height="2" fill={c('#4b5563')}/>
      </svg>
    ),
    'ach-biz-10-contacts': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="2" width="4" height="4" fill={c('#6b7280')}/><rect x="6" y="0" width="4" height="4" fill={c('#9ca3af')}/>
        <rect x="12" y="2" width="4" height="4" fill={c('#6b7280')}/><rect x="0" y="6" width="5" height="4" fill={c('#6b7280')}/>
        <rect x="5" y="4" width="6" height="4" fill={c('#9ca3af')}/><rect x="11" y="6" width="5" height="4" fill={c('#6b7280')}/>
        <rect x="2" y="11" width="12" height="2" fill={c('#4b5563')}/>
      </svg>
    ),
    'ach-biz-first-sale': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="1" y="7" width="4" height="6" fill={c('#4ade80')}/><rect x="5" y="5" width="4" height="8" fill={c('#22c55e')}/>
        <rect x="9" y="2" width="4" height="11" fill={c('#4ade80')}/><rect x="13" y="0" width="2" height="13" fill={c('#16a34a')}/>
        <rect x="0" y="13" width="16" height="2" fill={c('#15803d')}/>
      </svg>
    ),
    'ach-biz-first-partner': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="4" width="6" height="5" fill={c('#6b7280')}/><rect x="0" y="6" width="4" height="2" fill={c('#9ca3af')}/>
        <rect x="10" y="4" width="6" height="5" fill={c('#6b7280')}/><rect x="12" y="6" width="4" height="2" fill={c('#9ca3af')}/>
        <rect x="6" y="7" width="4" height="2" fill={c('#4ade80')}/>
      </svg>
    ),
    'ach-biz-first-income': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="2" width="12" height="12" fill={c('#ca8a04')}/><rect x="3" y="3" width="10" height="10" fill={c('#fbbf24')}/>
        <rect x="5" y="5" width="6" height="6" fill={c('#d97706')}/><rect x="7" y="3" width="2" height="10" fill={c('#fef08a')}/>
      </svg>
    ),
    'ach-biz-big-deal': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="0" width="8" height="2" fill={c('#22d3ee')}/><rect x="2" y="2" width="12" height="6" fill={c('#67e8f9')}/>
        <rect x="4" y="8" width="8" height="4" fill={c('#22d3ee')}/><rect x="6" y="12" width="4" height="2" fill={c('#0e7490')}/>
        <rect x="5" y="2" width="2" height="2" fill="#fff" opacity="0.6"/>
      </svg>
    ),
    'ach-biz-first-no': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="6" width="16" height="4" fill={c('#ef4444')}/><rect x="6" y="0" width="4" height="16" fill={c('#ef4444')}/>
        <rect x="2" y="2" width="3" height="3" fill={c('#dc2626')}/><rect x="11" y="2" width="3" height="3" fill={c('#dc2626')}/>
        <rect x="2" y="11" width="3" height="3" fill={c('#dc2626')}/><rect x="11" y="11" width="3" height="3" fill={c('#dc2626')}/>
      </svg>
    ),
    'ach-biz-comeback': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="6" y="0" width="4" height="4" fill={c('#4ade80')}/><rect x="10" y="2" width="4" height="4" fill={c('#4ade80')}/>
        <rect x="12" y="4" width="4" height="8" fill={c('#22c55e')}/><rect x="10" y="10" width="4" height="4" fill={c('#4ade80')}/>
        <rect x="6" y="12" width="4" height="4" fill={c('#4ade80')}/><rect x="0" y="6" width="8" height="4" fill={c('#22c55e')}/>
        <rect x="2" y="4" width="4" height="2" fill={c('#4ade80')}/><rect x="0" y="10" width="4" height="2" fill={c('#4ade80')}/>
      </svg>
    ),
    'ach-biz-hustle': (
      <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
        <rect x="7" y="0" width="4" height="6" fill={c('#fbbf24')}/><rect x="5" y="4" width="8" height="4" fill={c('#fbbf24')}/>
        <rect x="8" y="8" width="4" height="8" fill={c('#f59e0b')}/><rect x="6" y="2" width="2" height="2" fill={c('#fef08a')}/>
      </svg>
    ),
  }
  return icons[id] || bizIcons[id] || (
    <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
      <rect x="5" y="0" width="6" height="2" fill={c('#fbbf24')}/><rect x="3" y="2" width="10" height="8" fill={c('#fbbf24')}/>
      <rect x="4" y="10" width="8" height="4" fill={c('#d97706')}/><rect x="6" y="14" width="4" height="2" fill={c('#92400e')}/>
    </svg>
  )
}

function PadlockIcon() {
  return (
    <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="0" width="8" height="2" fill="#374151"/><rect x="2" y="2" width="4" height="6" fill="#374151"/>
      <rect x="10" y="2" width="4" height="6" fill="#374151"/><rect x="0" y="7" width="16" height="9" fill="#4b5563"/>
      <rect x="6" y="9" width="4" height="2" fill="#1f2937"/><rect x="7" y="11" width="2" height="3" fill="#1f2937"/>
    </svg>
  )
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
  
  const [crmTab, setCrmTab]               = useState<'kunden' | 'finanzen' | 'achievements' | 'analytics'>('kunden')
  const [ghTrafficData, setGhTrafficData] = useState<GhTrafficData | null>(null)
  const [ghTrafficLoading, setGhTrafficLoading] = useState(false)
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

  useEffect(() => {
    if (crmTab !== 'analytics') return
    setGhTrafficLoading(true)
    Promise.all([
      ghTraffic('views'),
      ghTraffic('referrers'),
      ghTraffic('popular/paths'),
    ]).then(([views, referrers, paths]) => {
      setGhTrafficData({ views: views as GhTrafficData['views'], referrers: referrers as GhTrafficData['referrers'], paths: paths as GhTrafficData['paths'] })
      setGhTrafficLoading(false)
    }).catch(() => setGhTrafficLoading(false))
  }, [crmTab])

  async function loadData() {
    setLoading(true)
    try {
      const file = await proxyRead(CUSTOMERS_PATH)
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
      await proxyWrite(CUSTOMERS_PATH, b64)
      shaRef.current = null
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
    if (ok) {
      setModalType(null); flash('ok')
      if (!editId) {
        // new customer
        handleAchUnlock('ach-biz-first-contact')
        if (updatedCustomers.length >= 5)  handleAchUnlock('ach-biz-5-contacts')
        if (updatedCustomers.length >= 10) handleAchUnlock('ach-biz-10-contacts')
        const todayPrefix = new Date().toISOString().slice(0, 10)
        const todayCount = updatedCustomers.filter(c => c.createdAt.startsWith(todayPrefix)).length
        if (todayCount >= 3) handleAchUnlock('ach-biz-hustle')
      } else {
        // editing existing — check status changes
        const updated = updatedCustomers.find(c => c.id === editId)
        const prev = data.customers.find(c => c.id === editId)
        if (updated?.status === 'verkauft') handleAchUnlock('ach-biz-first-sale')
        if (updated?.status === 'abgesagt') handleAchUnlock('ach-biz-first-no')
        if (updated?.status === 'offen' && prev?.status === 'abgesagt') handleAchUnlock('ach-biz-comeback')
        if (customerForm.notes?.toLowerCase().includes('partner') ||
            customerForm.interest?.toLowerCase().includes('partner')) {
          handleAchUnlock('ach-biz-first-partner')
        }
      }
    } else flash('err')
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
    const updatedTransactions = [...data.transactions, newT]
    const ok = await persistData({ ...data, transactions: updatedTransactions })
    if (ok) {
      setModalType(null); flash('ok')
      if (transactionForm.type === 'einnahme') {
        handleAchUnlock('ach-biz-first-income')
        if (transactionForm.amount >= 1000) handleAchUnlock('ach-biz-big-deal')
      }
    } else flash('err')
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
    <div className={`crm-panel${mcMode ? ' crm-mc' : ''} crm-shell`}>

      {/* MC background: pure landscape + mob layer stacked */}
      {mcMode && (
        <div className="minigame-bg">
          <McBackdrop />
          {/* full-height overlay so the HUD sits at the very top while mobs,
              trees, house and ground stay anchored to the bottom */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <CrmScene noBackdrop onAchUnlock={handleAchUnlock} />
          </div>
        </div>
      )}

      {/* Content Viewport */}
      <div className="crm-viewport">
        {/* ... Rest of existing component ... */}
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
        <button className={`crm-tab${crmTab === 'analytics' ? ' active' : ''}`} onClick={() => setCrmTab('analytics')}>Analytics</button>
        {mcMode && (
          <button className={`crm-tab${crmTab === 'achievements' ? ' active' : ''}`} onClick={() => setCrmTab('achievements')}>
            Achievements
            <span className="crm-tab-count">{unlocked.size}/50</span>
          </button>
        )}
      </div>
      {/* ── Finanzen (Professional KMU dashboard) ── */}
      {crmTab === 'finanzen' && (
        <div className="crm-finanzen-wrapper">
          <div className="crm-fin-dash">
            <div className="crm-fin-card">
              <label>Einnahmen</label>
              <div className="crm-fin-val crm-fin-val--ein">€ {totals.ein.toLocaleString('de-AT')}</div>
            </div>
            <div className="crm-fin-card">
              <label>Ausgaben</label>
              <div className="crm-fin-val crm-fin-val--aus">€ {totals.aus.toLocaleString('de-AT')}</div>
            </div>
            <div className="crm-fin-card">
              <label>Saldo</label>
              <div className={`crm-fin-val ${totals.saldo >= 0 ? 'crm-fin-val--ein' : 'crm-fin-val--aus'}`}>
                € {totals.saldo.toLocaleString('de-AT')}
              </div>
            </div>
          </div>

          <div className="crm-list">
            <div className="crm-list-header">
              <h3 className="crm-section-title">Buchungen</h3>
              <button className="crm-add-btn" onClick={openAddTransaction}>
                + Neue Buchung
              </button>
            </div>
            {data.transactions.length === 0 && <div className="crm-empty">Noch keine Buchungen erfasst.</div>}
            {data.transactions.slice().reverse().map(t => (
              <div key={t.id} className="crm-row crm-row--fin">
                <div className="crm-row-main">
                  <span className="crm-row-date">{t.date.slice(0, 10)}</span>
                  <span className="crm-row-desc">{t.description || t.category}</span>
                  <span className={`crm-fin-badge crm-fin-badge--${t.type}`}>
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
                <div className="lazi-ach-tile-icon">
                  {isUnlocked ? <AchIcon id={a.id} locked={false} /> : <PadlockIcon />}
                </div>
                <div className="lazi-ach-tile-title">{a.title}</div>
              </div>
            )
          })}
          {/* Fill remaining slots to reach 50 */}
          {Array.from({ length: 50 - ACHIEVEMENTS.length }).map((_, i) => (
            <div key={`empty-${i}`} className="lazi-ach-tile locked">
              <div className="lazi-ach-tile-icon"><PadlockIcon /></div>
              <div className="lazi-ach-tile-title">???</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {crmTab === 'analytics' && (
        <div style={{ padding: 20 }}>
          {ghTrafficLoading && (
            <div style={{ textAlign: 'center', color: '#aaa', padding: '40px 0', fontSize: 13 }}>Lade Daten…</div>
          )}
          {!ghTrafficLoading && !ghTrafficData && (
            <div style={{ textAlign: 'center', color: '#aaa', padding: '40px 0', fontSize: 13 }}>
              Keine Daten. Token braucht push-Rechte.
            </div>
          )}
          {ghTrafficData && (() => {
            const maxDay = Math.max(...(ghTrafficData.views.views ?? []).map(d => d.count), 1)
            const maxRef = Math.max(...(ghTrafficData.referrers ?? []).map(r => r.count), 1)
            return (
              <div style={{ color: mcMode ? '#e8e8c8' : 'inherit' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ background: mcMode ? 'rgba(0,0,0,.45)' : '#f8f8f8', border: mcMode ? '2px solid #7a7' : '1px solid #e8e8e8', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: mcMode ? '#a4e875' : '#0099CC' }}>{ghTrafficData.views.count}</div>
                    <div style={{ fontSize: 11, color: mcMode ? '#adb' : '#888', marginTop: 2 }}>Aufrufe (14 T.)</div>
                  </div>
                  <div style={{ background: mcMode ? 'rgba(0,0,0,.45)' : '#f8f8f8', border: mcMode ? '2px solid #7a7' : '1px solid #e8e8e8', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: mcMode ? '#ffd966' : '#38A169' }}>{ghTrafficData.views.uniques}</div>
                    <div style={{ fontSize: 11, color: mcMode ? '#adb' : '#888', marginTop: 2 }}>Unique Besucher</div>
                  </div>
                </div>

                {(ghTrafficData.views.views ?? []).length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', color: mcMode ? '#a4e875' : '#555' }}>Täglich (14 Tage)</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 64 }}>
                      {ghTrafficData.views.views.map(d => (
                        <div key={d.timestamp} title={`${d.timestamp.slice(0,10)}: ${d.count}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
                          <div style={{ width: '100%', height: `${Math.max((d.count / maxDay) * 52, 2)}px`, background: mcMode ? '#a4e875' : '#0099CC', borderRadius: '3px 3px 0 0' }} />
                          <span style={{ fontSize: 7, color: mcMode ? '#adb' : '#aaa' }}>{d.timestamp.slice(5, 10)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(ghTrafficData.referrers ?? []).length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', color: mcMode ? '#a4e875' : '#555' }}>Traffic-Quellen</div>
                    {ghTrafficData.referrers.map(r => (
                      <div key={r.referrer} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <span style={{ width: 90, fontSize: 11, fontWeight: 500, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: mcMode ? '#e8e8c8' : '#555' }}>{r.referrer || 'direkt'}</span>
                        <div style={{ flex: 1, background: mcMode ? 'rgba(255,255,255,.12)' : '#f0f0f0', borderRadius: 4, height: 8 }}>
                          <div style={{ width: `${(r.count / maxRef) * 100}%`, height: '100%', background: mcMode ? '#a4e875' : '#0099CC', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: mcMode ? '#a4e875' : '#0099CC', minWidth: 24, textAlign: 'right' }}>{r.count}</span>
                      </div>
                    ))}
                  </div>
                )}

                {(ghTrafficData.paths ?? []).length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', color: mcMode ? '#a4e875' : '#555' }}>Beliebteste Seiten</div>
                    {ghTrafficData.paths.map((p, i) => (
                      <div key={p.path} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <span style={{ width: 18, fontSize: 10, color: mcMode ? '#adb' : '#aaa', fontWeight: 700 }}>#{i + 1}</span>
                        <span style={{ flex: 1, fontSize: 11, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: mcMode ? '#e8e8c8' : '#444' }}>{p.path}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, color: mcMode ? '#ffd966' : '#555' }}>{p.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}
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
      </div>


    </div>
  )
}
