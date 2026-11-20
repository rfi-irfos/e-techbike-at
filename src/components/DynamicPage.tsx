import { useEffect } from 'react'
import type { SiteContent, PageItem } from '../types/content'
import { sanitizeHtml } from '../lib/sanitize'
import { InfoPageNav } from './StaticPage'
import { useTheme } from '../hooks/useTheme'
import { getNavLinks } from '../lib/navLinks'
import { GdprBanner } from './GdprBanner'
import { IconLocation, IconPhone, IconMail } from './PublicSite'

export function DynamicPage({ page, content }: { page: PageItem; content: SiteContent }) {
  const { theme, setTheme } = useTheme()
  useEffect(() => { window.scrollTo(0, 0) }, [page.id])
  useEffect(() => {
    const prev = document.title
    document.title = page.metaTitle ?? `${page.title} — ${content.meta?.title ?? ''}`
    return () => { document.title = prev }
  }, [page.id, page.metaTitle, page.title, content.meta?.title])

  const vars = { '--primary': content.meta.primaryColor, '--accent': content.meta.accentColor, fontFamily: content.meta.font } as React.CSSProperties
  return (
    <div className="site static-page" data-theme={theme} style={vars}>
      <InfoPageNav nav={{ ...content.nav, links: getNavLinks(content) }} theme={theme} setTheme={setTheme} />
      <main className="static-page-main">
        <div className="static-page-content">
          <h1>{page.title}</h1>
          <div className="dynamic-page-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }} />
          {page.slug === 'uber-uns' && <LocationCard contact={content.contact} />}
        </div>
      </main>
      {page.slug !== 'datenschutz' && page.slug !== 'impressum' && <GdprBanner />}
    </div>
  )
}

// Standort gehört zu „Über uns“: Karte mit Graz und dem Partner in Wien
function LocationCard({ contact }: { contact: SiteContent['contact'] }) {
  if (!contact) return null
  const partner = contact.partnerShop
  return (
    <section className="page-location" id="location">
      <h2>So findest du uns</h2>
      {contact.mapSrc && (
        <div className="page-location-map">
          <iframe src={contact.mapSrc} loading="lazy" title="Standort Graz" allowFullScreen />
        </div>
      )}
      <div className="page-location-cards">
        <div className="page-location-card">
          <div className="page-location-label">Graz</div>
          {contact.address && <div className="page-location-row"><IconLocation /><span>{contact.address}</span></div>}
          {contact.phone && <div className="page-location-row"><IconPhone /><a href={`tel:${contact.phone}`}>{contact.phone}</a></div>}
          {contact.email && <div className="page-location-row"><IconMail /><a href={`mailto:${contact.email}`}>{contact.email}</a></div>}
        </div>
        {partner && (
          <div className="page-location-card">
            <div className="page-location-label">{contact.partnerLabel ?? 'Unser Partner'}: {partner.name}</div>
            {partner.address && <div className="page-location-row"><IconLocation /><span>{partner.address}</span></div>}
            {partner.phone?.trim() && <div className="page-location-row"><IconPhone /><a href={`tel:${partner.phone.replace(/\s/g, "")}`}>{partner.phone.trim()}</a></div>}
          </div>
        )}
      </div>
    </section>
  )
}
