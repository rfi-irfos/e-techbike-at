import { useState, useEffect } from 'react'
import type { SiteContent, ProductItem } from '../types/content'
import { InquiryModal } from './InquiryModal'
import { sanitizeHtml } from '../lib/sanitize'

function Accordion({ title, children, open: defaultOpen }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className={`prod-accordion ${open ? 'open' : ''}`}>
      <button type="button" className="prod-accordion-head" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{title}</span>
        <svg className="prod-accordion-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      {open && <div className="prod-accordion-body">{children}</div>}
    </div>
  )
}

export function ProductPage({ product, content, products = [] }: { product: ProductItem; content: SiteContent; products?: ProductItem[] }) {
  const { nav, contact } = content
  const allImages = product.images?.length ? product.images : [product.image].filter(Boolean)
  const [imgIdx, setImgIdx] = useState(0)
  const [inquiryOpen, setInquiryOpen] = useState(false)

  useEffect(() => {
    const prev = document.title
    document.title = `${product.name} — ${content.meta?.title ?? nav.brand}`
    const onKey = (e: KeyboardEvent) => {
      if (!allImages.length) return
      if (e.key === 'ArrowRight') setImgIdx(i => (i + 1) % allImages.length)
      if (e.key === 'ArrowLeft') setImgIdx(i => (i - 1 + allImages.length) % allImages.length)
    }
    window.scrollTo(0, 0)
    document.addEventListener('keydown', onKey)
    return () => { document.title = prev; document.removeEventListener('keydown', onKey) }
  }, [product.id])

  const specsSummary = product.specs?.join(' · ') ?? ''
  const emailBody = [
    'Guten Tag,',
    '',
    `ich interessiere mich für: ${product.name}`,
    product.price !== 'auf Anfrage' ? `Preis: ${product.price}` : '',
    specsSummary ? `Eckdaten: ${specsSummary}` : '',
    '',
    'Bitte um Rückruf oder weitere Informationen.',
    '',
    'Mit freundlichen Grüßen',
  ].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n')

  const waHref = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hallo! Ich interessiere mich für "${product.name}"${product.price !== 'auf Anfrage' ? ` (${product.price})` : ''}${specsSummary ? ` — ${specsSummary}` : ''}. Können Sie mich beraten?`)}`
    : undefined

  return (
    <div className="prodpage">
      {/* Nav */}
      <header className="static-page-nav">
        <a href="#" className="static-page-brand">
          {nav.logo ? <img src={nav.logo} alt={nav.brand} style={{ height: 36 }} /> : nav.brand}
        </a>
        <a href="#products" className="static-page-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Zurück zum Sortiment
        </a>
      </header>

      {/* Main */}
      <main className="prodpage-main">
        <div className="prodpage-inner">

          {/* Left: images */}
          <div className="prodpage-gallery">
            <div className="prodpage-img-wrap">
              {product.badge && <span className="prod-modal-badge">{product.badge}</span>}
              {allImages[imgIdx] && (
                <img src={allImages[imgIdx]} alt={product.name} className="prodpage-img" />
              )}
              {allImages.length > 1 && (
                <>
                  <button type="button" className="prod-modal-arrow prod-modal-arrow-l" onClick={() => setImgIdx(i => (i - 1 + allImages.length) % allImages.length)}>‹</button>
                  <button type="button" className="prod-modal-arrow prod-modal-arrow-r" onClick={() => setImgIdx(i => (i + 1) % allImages.length)}>›</button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="prod-modal-thumbs">
                {allImages.map((src, i) => (
                  <button type="button" key={i} className={`prod-modal-thumb${i === imgIdx ? ' active' : ''}`} onClick={() => setImgIdx(i)}>
                    <img src={src} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: info */}
          <div className="prodpage-info">
            <div className="prod-modal-cat">{product.category}</div>
            <h1 className="prodpage-name">{product.name}</h1>
            <div className="prod-modal-price-row">
              <span className="prod-modal-price">{product.price}</span>
              {product.regularPrice && <span className="prod-modal-price-old">{product.regularPrice}</span>}
            </div>
            {product.regularPrice && <div className="prod-modal-price-note">inkl. MwSt., zzgl. Versand</div>}

            {(product.specs?.length ?? 0) > 0 && (
              <div className="prodpage-specs">
                {product.specs!.map((s, i) => <span key={i} className="site-spec">{s}</span>)}
              </div>
            )}

            <p className="prod-modal-desc">{product.description}</p>

            {(product.specsTable?.length ?? 0) > 0 && (
              <Accordion title="Produktinformationen" open={true}>
                <table className="prod-modal-specs-table">
                  <tbody>
                    {product.specsTable!.map((row, i) => (
                      <tr key={i}>
                        <td className="prod-specs-label">{row.label}</td>
                        <td className="prod-specs-value">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion>
            )}

            {product.variants?.map((v, vi) => (
              (v.options?.length ?? 0) > 0 && (
                <Accordion key={vi} title={v.label || 'Preise & Akkus'}>
                  <div className="prodpage-variant-chips">
                    {v.options.map((opt, oi) => (
                      <span key={oi} className="prodpage-variant-chip">
                        {opt.value}{opt.price && <span className="prodpage-variant-chip-price"> — {opt.price}</span>}
                      </span>
                    ))}
                  </div>
                </Accordion>
              )
            ))}

            {product.details && (
              <Accordion title="Produktdetails">
                <div className="prod-accordion-html" dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.details) }} />
              </Accordion>
            )}

            {product.delivery && (
              <Accordion title="Lieferung & Versand">
                <p className="prod-accordion-text">{product.delivery}</p>
              </Accordion>
            )}

            <div className="prod-modal-ctas prodpage-ctas">
              <button type="button" className="prodpage-inquiry-btn" onClick={() => setInquiryOpen(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Anfrage senden
              </button>
              {waHref && (
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="prod-modal-cta prod-modal-cta-wa">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.118 1.533 5.851L0 24l6.335-1.513A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.843 0-3.57-.49-5.062-1.346L2.5 21.5l.854-3.375A9.944 9.944 0 0 1 2 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  WhatsApp
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="prod-modal-cta prod-modal-cta-call">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.95-.96a2 2 0 0 1 2.1-.45c.908.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Anrufen
                </a>
              )}
              <a href={`mailto:${contact.email}?subject=${encodeURIComponent(`Anfrage: ${product.name}`)}&body=${encodeURIComponent(emailBody)}`} className="prod-modal-cta prod-modal-cta-mail">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                E-Mail
              </a>
            </div>

            <div className="prodpage-permalink">
              <span>Direktlink:</span>
              <code>{window.location.origin}{window.location.pathname}#product/{product.id}</code>
            </div>
          </div>
        </div>
      </main>

      {inquiryOpen && (
        <InquiryModal
          products={products.length > 0 ? products : [product]}
          preselectedProductId={product.id}
          onClose={() => setInquiryOpen(false)}
        />
      )}
    </div>
  )
}
