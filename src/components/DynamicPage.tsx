import { useEffect } from 'react'
import type { SiteContent, PageItem } from '../types/content'
import { sanitizeHtml } from '../lib/sanitize'
import { InfoPageNav } from './StaticPage'
import { useTheme } from '../hooks/useTheme'

export function DynamicPage({ page, content }: { page: PageItem; content: SiteContent }) {
  const { theme, setTheme } = useTheme()
  useEffect(() => { window.scrollTo(0, 0) }, [page.id])
  useEffect(() => {
    const prev = document.title
    document.title = page.metaTitle ?? `${page.title} — ${content.meta?.title ?? ''}`
    return () => { document.title = prev }
  }, [page.id, page.metaTitle, page.title, content.meta?.title])

  return (
    <div className="static-page" data-theme={theme}>
      <InfoPageNav nav={content.nav} theme={theme} setTheme={setTheme} />
      <main className="static-page-main">
        <div className="static-page-content">
          <h1>{page.title}</h1>
          <div className="dynamic-page-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }} />
        </div>
      </main>
    </div>
  )
}
