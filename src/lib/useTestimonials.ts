import { useState, useEffect, useRef } from 'react'
import type { Testimonial } from '../types/testimonials'
import { ghRead, ghWrite, b64Encode, b64Decode } from './github'

const PATH = 'public/testimonials.json'

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const savedTimer = useRef<number | undefined>(undefined)
  const shaRef = useRef<string | null>(null)
  const listRef = useRef<Testimonial[]>([])
  // Schreibvorgänge laufen nacheinander, sonst überholt ein zweiter Klick den ersten (GitHub 409)
  const queueRef = useRef<Promise<void>>(Promise.resolve())
  const errorTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    ghRead(PATH)
      .then(f => { shaRef.current = f.sha; listRef.current = JSON.parse(b64Decode(f.content)); setTestimonials(listRef.current) })
      .catch(() => setTestimonials([]))
    return () => window.clearTimeout(errorTimer.current)
  }, [])

  function showError() {
    setSaveError(true)
    window.clearTimeout(errorTimer.current)
    errorTimer.current = window.setTimeout(() => setSaveError(false), 6000)
  }

  function commit(next: Testimonial[]) {
    listRef.current = next
    setTestimonials(next)
    queueRef.current = queueRef.current.then(async () => {
      setSaving(true)
      // Immer den neuesten Stand schreiben; bei einem Konflikt holt der Proxy den aktuellen sha selbst
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const f = await ghWrite(PATH, b64Encode(JSON.stringify(listRef.current, null, 2)), attempt === 0 ? shaRef.current : null, 'update testimonials')
          shaRef.current = f.sha
          setSaveError(false)
          setJustSaved(true)
          window.clearTimeout(savedTimer.current)
          savedTimer.current = window.setTimeout(() => setJustSaved(false), 6000)
          break
        } catch (e) {
          if (attempt === 2) { console.error('Testimonial save failed:', e); showError() }
          else await new Promise(r => setTimeout(r, 700 * (attempt + 1)))
        }
      }
      setSaving(false)
    })
  }

  function add(t: Omit<Testimonial, 'id'>) {
    commit([...listRef.current, { ...t, id: crypto.randomUUID() }])
  }
  function update(t: Testimonial) {
    const old = listRef.current.find(r => r.id === t.id)
    if (old && JSON.stringify(old) === JSON.stringify(t)) return
    commit(listRef.current.map(r => r.id === t.id ? t : r))
  }
  function remove(id: string) {
    commit(listRef.current.filter(r => r.id !== id))
  }
  return { testimonials, saving, saveError, justSaved, add, update, remove }
}
