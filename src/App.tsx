import { useState, useEffect } from 'react'
import './App.css'
import { useContent } from './hooks/useContent'
import { useAuth } from './hooks/useAuth'
import { PublicSite } from './components/PublicSite'
import { AdminPanel } from './components/AdminPanel'
import { LoginPage } from './components/LoginPage'
import { StaticPage } from './components/StaticPage'
import { DynamicPage } from './components/DynamicPage'

function getRoute(hash: string) {
  if (hash === '#admin' || hash.startsWith('#admin/')) return { isAdmin: true, staticPageId: null, pageSlug: null }
  if (hash === '#uber-uns')   return { isAdmin: false, staticPageId: 'uber-uns', pageSlug: null }
  if (hash === '#wie-kaufen') return { isAdmin: false, staticPageId: 'wie-kaufen', pageSlug: null }
  if (hash === '#foerderung') return { isAdmin: false, staticPageId: 'foerderung', pageSlug: null }
  if (hash === '#akku-pflege') return { isAdmin: false, staticPageId: 'akku-pflege', pageSlug: null }
  if (hash.startsWith('#p/')) return { isAdmin: false, staticPageId: null, pageSlug: hash.slice(3) }
  return { isAdmin: false, staticPageId: null, pageSlug: null }
}

export default function App() {
  const { content, loading, saving, save, uploadImage } = useContent()
  const { user, login, logout } = useAuth()
  const [route, setRoute] = useState(() => getRoute(window.location.hash))

  useEffect(() => {
    const onHash = () => setRoute(getRoute(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!content) {
    return <div className="error-screen">Inhalt konnte nicht geladen werden.</div>
  }

  if (route.isAdmin) {
    if (!user) return <LoginPage onLogin={login} />
    return (
      <AdminPanel
        content={content}
        user={user}
        saving={saving}
        onSave={save}
        onUpload={uploadImage}
        onLogout={logout}
      />
    )
  }

  if (route.staticPageId) {
    return (
      <StaticPage
        pageId={route.staticPageId}
        brand={content.nav?.brand}
        phone={content.contact?.phone}
        email={content.contact?.email}
        address={content.contact?.address}
      />
    )
  }

  if (route.pageSlug) {
    const page = content.pages?.find(p => p.slug === route.pageSlug)
    if (page) return <DynamicPage page={page} content={content} />
  }

  return <PublicSite content={content} />
}
