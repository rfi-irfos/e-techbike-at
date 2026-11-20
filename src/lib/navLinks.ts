import type { SiteContent } from '../types/content'

// Menüpunkte der Seite: die frei gepflegten Links plus Seiten mit Haken "Im Menü zeigen".
// Eine Quelle für Startseite, Unterseiten und Handy-Menü, damit überall dasselbe steht.
export function getNavLinks(content: Pick<SiteContent, 'nav' | 'pages'>): { label: string; href: string }[] {
  const base = content.nav?.links ?? []
  const seen = new Set(base.map(l => l.href))
  const fromPages = (content.pages ?? [])
    .filter(p => p.showInNav)
    .map(p => ({ label: p.title, href: `#p/${p.slug}` }))
    .filter(l => !seen.has(l.href))
  return [...base, ...fromPages]
}
