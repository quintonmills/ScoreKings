import { useState } from 'react'
import { finalizeEndpoint, getFlyerPublicUrl, parseFinalizeResponse } from './gameApi.js'

/** @typedef {import('./gameApi.js').FlyerGraphic} FlyerGraphic */
/** @typedef {import('./gamePayload.js').FinalizePayload} FinalizePayload */
/** @typedef {FlyerGraphic & { publicUrl: string }} ResolvedFlyerGraphic */

export function useGameSubmission() {
  const [requestState, setRequestState] = useState('idle')
  const [requestMessage, setRequestMessage] = useState('')
  /** @type {[ResolvedFlyerGraphic[], import('react').Dispatch<import('react').SetStateAction<ResolvedFlyerGraphic[]>>]} */
  const [generatedFlyers, setGeneratedFlyers] = useState([])

  /** @param {FinalizePayload} nextPayload */
  const sendPayload = async (nextPayload) => {
    setRequestState('sending')
    if (!finalizeEndpoint) {
      setRequestState('error')
      setRequestMessage('Set VITE_API_BASE_URL to your deployed backend URL in Render, then redeploy the frontend.')
      return
    }
    setRequestMessage(`Posting to ${finalizeEndpoint}…`)
    try {
      const response = await fetch(finalizeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextPayload),
      })
      if (!response.ok) {
        setRequestState('error')
        setRequestMessage(`The server responded with ${response.status} ${response.statusText || ''}.`.trim())
        return
      }
      const responseText = await response.text()
      let responseBody = null
      if (responseText.trim()) {
        try {
          responseBody = parseFinalizeResponse(JSON.parse(responseText))
        } catch {
          setGeneratedFlyers([])
          setRequestState('success')
          setRequestMessage('The game was accepted, but the server returned an unreadable flyer response.')
          return
        }
      }
      const graphics = responseBody?.graphics?.flatMap((graphic) => {
        const publicUrl = getFlyerPublicUrl(graphic)
        return publicUrl ? [{ ...graphic, publicUrl }] : []
      }) || []
      setGeneratedFlyers(graphics)
      setRequestState('success')
      setRequestMessage(graphics.length > 0
        ? 'The game was accepted and your flyers are ready.'
        : 'The final box score was accepted by the server.')
    } catch (error) {
      setRequestState('error')
      setRequestMessage(error instanceof TypeError
        ? `Could not reach ${new URL(finalizeEndpoint).origin}. Check that the Render service is available and its CORS_ORIGIN allows this frontend's exact origin.`
        : error instanceof Error ? error.message : 'The request failed. Check that the backend is running.')
    }
  }

  const resetSubmission = () => {
    setRequestState('idle')
    setRequestMessage('')
    setGeneratedFlyers([])
  }

  return {
    requestState,
    requestMessage,
    generatedFlyers,
    setRequestState,
    setRequestMessage,
    setGeneratedFlyers,
    sendPayload,
    resetSubmission,
  }
}
