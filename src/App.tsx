import { useState, useEffect } from 'react'
import './App.css'
import { useContent } from './hooks/useContent'
import { useAuth } from './hooks/useAuth'
import { PublicSite } from './components/PublicSite'
import { AdminPanel } from './components/AdminPanel'
import { LoginPage } from './components/LoginPage'
import { StaticPage } from './components/StaticPage'

function getRoute(hash: string) {
  if (hash === '#admin' || hash.startsWith('#admin/')) return { isAdmin: true, staticPageId: null }
  if (hash === '#uber-uns')   return { isAdmin: false, staticPageId: 'uber-uns' }
  if (hash === '#wie-kaufen') return { isAdmin: false, staticPageId: 'wie-kaufen' }
  if (hash === '#foerderung') return { isAdmin: false, staticPageId: 'foerderung' }
  if (hash === '#akku-pflege') return { isAdmin: false, staticPageId: 'akku-pflege' }
  return { isAdmin: false, staticPageId: null }
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

  return <PublicSite content={content} />
}
