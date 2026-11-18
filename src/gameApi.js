const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '')
  || 'https://servercore-pjwe.onrender.com'

export const finalizeEndpoint = `${apiBaseUrl}/api/games/finalize`

/**
 * @typedef {object} FlyerGraphic
 * @property {string} [playerId]
 * @property {string} [playerName]
 * @property {string} [publicUrl]
 * @property {string} [downloadUrl]
 */
/**
 * @typedef {object} FinalizeResponse
 * @property {FlyerGraphic[]} [graphics]
 */

/** @param {FlyerGraphic | null | undefined} graphic */
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

/** @param {FlyerGraphic | null | undefined} graphic */
export function getFlyerPublicUrl(graphic) {
  if (typeof graphic?.publicUrl !== 'string' || !graphic.publicUrl) return null

  try {
    const url = new URL(graphic.publicUrl, apiBaseUrl)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

/**
 * @param {unknown} value
 * @returns {value is FlyerGraphic}
 */
function isFlyerGraphic(value) {
  return isRecord(value)
    && (value.playerId === undefined || typeof value.playerId === 'string')
    && (value.playerName === undefined || typeof value.playerName === 'string')
    && (value.publicUrl === undefined || typeof value.publicUrl === 'string')
    && (value.downloadUrl === undefined || typeof value.downloadUrl === 'string')
}

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * @param {unknown} value
 * @returns {FinalizeResponse | null}
 */
export function parseFinalizeResponse(value) {
  if (!isRecord(value)) return null
  if (!Array.isArray(value.graphics)) return {}
  return { graphics: value.graphics.filter(isFlyerGraphic) }
}
