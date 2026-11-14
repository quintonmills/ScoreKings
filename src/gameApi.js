const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '')
  || 'https://servercore-pjwe.onrender.com'

export const finalizeEndpoint = import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL
  ? '/api/games/finalize'
  : `${apiBaseUrl}/api/games/finalize`

export function getFlyerDownloadUrl(graphic) {
  for (const candidate of [graphic?.downloadUrl, graphic?.publicUrl]) {
    if (typeof candidate !== 'string' || !candidate) continue

    try {
      const url = new URL(candidate, apiBaseUrl)
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.href
    } catch {
      continue
    }
  }
  return null
}

export function getFlyerPublicUrl(graphic) {
  if (typeof graphic?.publicUrl !== 'string' || !graphic.publicUrl) return null

  try {
    const url = new URL(graphic.publicUrl, apiBaseUrl)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}
