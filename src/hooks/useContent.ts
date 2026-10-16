import { useState, useEffect, useCallback, useRef } from 'react'
import type { SiteContent } from '../types/content'
import { ghRead, ghWrite, b64Encode, CONTENT_PATH, UPLOADS_DIR } from '../lib/github'

// The write-proxy caps the whole JSON request body at 5MB (server.js), and the image
// is base64-encoded inside it (~1.37x inflation) — so raw files above ~3MB fail there
// with no useful feedback in the UI. Unresized phone-camera photos routinely exceed
// that. Downscale + re-encode as JPEG client-side first so uploads stay well under it.
const PROXY_BODY_LIMIT = 5_000_000
const DOWNSCALE_THRESHOLD = 1_500_000

async function downscaleImage(file: File, maxDim = 2000, quality = 0.85): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('image decode failed'))
      el.src = objectUrl
    })
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas context unavailable')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('canvas toBlob failed')), 'image/jpeg', quality)
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function useContent() {
  const [content, setContent]   = useState<SiteContent | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const shaRef = useRef<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        // Same-origin, served by the GitHub Pages deploy itself. raw.githubusercontent.com
        // was fetched here previously on every page load; under real traffic that pattern
        // gets rate-limited (429) by GitHub's abuse detection, and the catch below then
        // silently served stale bundled demo content with no visible error.
        const res = await fetch(`${import.meta.env.BASE_URL}content.json`, { cache: 'no-store' })
        if (!res.ok) throw new Error('missing')
        setContent(await res.json())
      } catch {
        const { defaultContent } = await import('../types/defaultContent')
        setContent(defaultContent)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Lazily prime the SHA so we can update (not just create) the file
  const ensureSha = useCallback(async () => {
    if (shaRef.current) return shaRef.current
    try {
      const file = await ghRead(CONTENT_PATH)
      shaRef.current = file.sha
    } catch {
      shaRef.current = null  // file doesn't exist yet — first save creates it
    }
    return shaRef.current
  }, [])

  const save = useCallback(async (updated: SiteContent): Promise<boolean> => {
    setSaving(true)
    try {
      const b64 = b64Encode(JSON.stringify(updated, null, 2))
      const sha = await ensureSha()
      try {
        const file = await ghWrite(CONTENT_PATH, b64, sha, 'content: update via admin panel')
        shaRef.current = file?.sha ?? null
      } catch (e) {
        // Stale sha (someone else — e.g. a direct git push — updated content.json
        // since this tab loaded): refetch the current sha and retry once.
        if (e instanceof Error && e.message.includes('(409)')) {
          shaRef.current = null
          const freshSha = await ensureSha()
          const file = await ghWrite(CONTENT_PATH, b64, freshSha, 'content: update via admin panel')
          shaRef.current = file?.sha ?? null
        } else {
          throw e
        }
      }
      setContent(updated)
      return true
    } catch (e) {
      console.error('Save failed:', e)
      return false
    } finally {
      setSaving(false)
    }
  }, [ensureSha])

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setUploadError(null)
    let blob: Blob = file
    let name = file.name
    if (file.size > DOWNSCALE_THRESHOLD) {
      try {
        blob = await downscaleImage(file)
        name = file.name.replace(/\.\w+$/, '') + '.jpg'
      } catch (e) {
        console.error('Downscale failed, uploading original:', e)
      }
    }
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const b64 = (reader.result as string).split(',')[1]
          if (b64.length > PROXY_BODY_LIMIT * 0.9) {
            setUploadError(`Bild ist nach Verkleinerung noch ${Math.round(blob.size / 1024)} KB groß — bitte ein kleineres Bild verwenden.`)
            resolve(null)
            return
          }
          const safe = name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
          const filename = `${Date.now()}-${safe}`
          const path = `${UPLOADS_DIR}/${filename}`
          await ghWrite(path, b64, null, `upload: ${filename}`)
          // Relative path, resolved same-origin against the deploy — matches every
          // other image reference in content.json. Now that content/uploads changes
          // trigger a real deploy again, this file will actually exist there.
          resolve(`${UPLOADS_DIR.replace(/^public\//, '')}/${filename}`)
        } catch (e) {
          console.error('Upload failed:', e)
          setUploadError(e instanceof Error ? e.message : 'Upload fehlgeschlagen')
          resolve(null)
        }
      }
      reader.readAsDataURL(blob)
    })
  }, [])

  return { content, loading, saving, save, uploadImage, uploadError }
}
