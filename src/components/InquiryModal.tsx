import { useState, useEffect } from 'react'
import type { ProductItem } from '../types/content'

export interface InquiryModalProps {
  products: ProductItem[]
  preselectedProductId?: string
  onClose: () => void
}

export function InquiryModal({ products, preselectedProductId, onClose }: InquiryModalProps) {
  const [selectedId, setSelectedId] = useState(preselectedProductId ?? products[0]?.id ?? '')
  const [variantSelections, setVariantSelections] = useState<Record<number, string>>({})
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })

  const selectedProduct = products.find(p => p.id === selectedId) ?? null

  // Reset variant selections when product changes
  useEffect(() => {
    const defaults: Record<number, string> = {}
    selectedProduct?.variants?.forEach((v, i) => {
      defaults[i] = v.options[0]?.value ?? ''
    })
    setVariantSelections(defaults)
  }, [selectedId])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const productName = selectedProduct?.name ?? ''

    const variantenStr = selectedProduct?.variants
      ?.map((v, i) => {
        const selectedValue = variantSelections[i] ?? v.options[0]?.value ?? ''
        const opt = v.options.find(o => o.value === selectedValue)
        return `${v.label}: ${selectedValue}${opt?.price ? ` (${opt.price})` : ''}`
      })
      .join(', ') ?? ''

    const body =
      `Produkt: ${productName}\n${variantenStr ? `Sonderausführungen: ${variantenStr}\n` : ''}` +
      `Name: ${form.name}\nTelefon: ${form.phone}\nE-Mail: ${form.email}\n\n${form.message}`
    window.location.href = `mailto:lacitimi2@gmail.com?subject=${encodeURIComponent(`Neue Anfrage: ${productName}`)}&body=${encodeURIComponent(body)}`
    onClose()
  }

  return (
    <div className="pem-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Anfrage senden">
      <div className="inquiry-modal" onClick={e => e.stopPropagation()}>
        <div className="inquiry-modal-header">
          <span className="inquiry-modal-title">Anfrage senden</span>
          <button type="button" className="inquiry-modal-close" aria-label="Schließen" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form className="inquiry-form" onSubmit={submit}>
            {/* Product selector */}
            <div className="inquiry-field">
              <label htmlFor="inq-product">Produkt</label>
              <select
                id="inq-product"
                className="inquiry-select"
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Variant selectors */}
            {(selectedProduct?.variants?.length ?? 0) > 0 && (
              <div className="inquiry-variants">
                <div className="inquiry-variants-label">Sonderausführungen</div>
                {selectedProduct!.variants!.map((v, i) => (
                  <div key={i} className="inquiry-field">
                    <label htmlFor={`inq-variant-${i}`}>{v.label}</label>
                    <select
                      id={`inq-variant-${i}`}
                      className="inquiry-select"
                      value={variantSelections[i] ?? v.options[0]?.value ?? ''}
                      onChange={e => setVariantSelections(prev => ({ ...prev, [i]: e.target.value }))}
                    >
                      {v.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.value}{opt.price ? ` — ${opt.price}` : ''}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Contact fields */}
            <div className="inquiry-field">
              <label htmlFor="inq-name">Name <span className="inquiry-required">*</span></label>
              <input
                id="inq-name"
                type="text"
                required
                placeholder="Ihr Name"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>

            <div className="inquiry-field">
              <label htmlFor="inq-phone">Telefon</label>
              <input
                id="inq-phone"
                type="tel"
                placeholder="+43 …"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
              />
            </div>

            <div className="inquiry-field">
              <label htmlFor="inq-email">E-Mail</label>
              <input
                id="inq-email"
                type="email"
                placeholder="ihre@email.at"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>

            <div className="inquiry-field">
              <label htmlFor="inq-message">Nachricht</label>
              <textarea
                id="inq-message"
                rows={3}
                placeholder="Ihre Nachricht (optional) …"
                value={form.message}
                onChange={e => set('message', e.target.value)}
              />
            </div>

            <button type="submit" className="inquiry-submit">
              Anfrage abschicken
            </button>
        </form>
      </div>
    </div>
  )
}
