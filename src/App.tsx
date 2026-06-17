import { useState, useEffect } from 'react'
import './App.css'
import { useContent } from './hooks/useContent'
import { useAuth } from './hooks/useAuth'
import { PublicSite } from './components/PublicSite'
import { AdminPanel } from './components/AdminPanel'
import { LoginPage } from './components/LoginPage'
import { StaticPage } from './components/StaticPage'
import { DynamicPage } from './components/DynamicPage'
import { ProductPage } from './components/ProductPage'
import { LaziPanel } from './components/LaziPanel'
import { CrmPanel } from './components/CrmPanel'

function getRoute(hash: string) {
  if (hash === '#admin' || hash.startsWith('#admin/')) return { isAdmin: true, isLazi: false, isCrm: false, staticPageId: null, pageSlug: null, productId: null }
  if (hash === '#lazi') return { isAdmin: false, isLazi: true, isCrm: false, staticPageId: null, pageSlug: null, productId: null }
  if (hash === '#crm') return { isAdmin: false, isLazi: false, isCrm: true, staticPageId: null, pageSlug: null, productId: null }
  if (hash === '#uber-uns')   return { isAdmin: false, isLazi: false, isCrm: false, staticPageId: 'uber-uns', pageSlug: null, productId: null }
  if (hash === '#wie-kaufen') return { isAdmin: false, isLazi: false, isCrm: false, staticPageId: 'wie-kaufen', pageSlug: null, productId: null }
  if (hash === '#foerderung') return { isAdmin: false, isLazi: false, isCrm: false, staticPageId: 'foerderung', pageSlug: null, productId: null }
  if (hash === '#akku-pflege') return { isAdmin: false, isLazi: false, isCrm: false, staticPageId: 'akku-pflege', pageSlug: null, productId: null }
  if (hash.startsWith('#product/')) return { isAdmin: false, isLazi: false, isCrm: false, staticPageId: null, pageSlug: null, productId: hash.slice(9) }
  if (hash.startsWith('#p/')) return { isAdmin: false, isLazi: false, isCrm: false, staticPageId: null, pageSlug: hash.slice(3), productId: null }
  return { isAdmin: false, isLazi: false, isCrm: false, staticPageId: null, pageSlug: null, productId: null }
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

  if (route.isLazi) return <LaziPanel />

  if (route.isCrm) {
    if (!user) return <LoginPage onLogin={login} />
    const mcMode = localStorage.getItem('mc-theme') !== 'false'
    return <CrmPanel mcMode={mcMode} />
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

  if (route.productId) {
    const product = content.products?.items.find(p => p.id === route.productId)
    if (product) return <ProductPage product={product} content={content} products={content.products?.items ?? []} />
  }

  if (route.pageSlug) {
    const page = content.pages?.find(p => p.slug === route.pageSlug)
    if (page) return <DynamicPage page={page} content={content} />
  }

  if (route.staticPageId) {
    // Check if a dynamic page overrides the static one (same slug)
    const override = content.pages?.find(p => p.slug === route.staticPageId)
    if (override) return <DynamicPage page={override} content={content} />
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
