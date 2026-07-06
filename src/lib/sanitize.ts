import DOMPurify from 'dompurify'

// Content flows in from admin contentEditable fields (rich text: headlines,
// hero tag, page bodies, product details, news articles) and gets persisted
// verbatim into content.json, then rendered site-wide via dangerouslySetInnerHTML.
// A pasted payload (compromised clipboard, careless paste from an untrusted
// page) would otherwise run for every visitor, not just the admin. Sanitize
// at render time so it's safe regardless of how the markup got into the data.
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, { ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'] })
}
