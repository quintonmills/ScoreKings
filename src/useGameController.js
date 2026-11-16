import { useEffect, useMemo, useRef, useState } from 'react'
import { createFinalizePayload, getFlyerPlayers, isFinalizePayloadWithinLimit } from './gamePayload.js'
import { finalizeEndpoint, getFlyerPublicUrl } from './gameApi.js'
import {
  createInitialPlayers,
  GAME_CLOCK_STORAGE_KEY,
  GAME_STORAGE_KEY,
  getScore,
  initialGame,
  loadGameState,
} from './gameState.js'

export function useGameController() {
  const [loadedState] = useState(loadGameState)
  const [game, setGame] = useState(() => loadedState.game || initialGame)
  const [players, setPlayers] = useState(() => loadedState.players || createInitialPlayers())
  const [activePlayerId, setActivePlayerId] = useState(() =>
    loadedState.activePlayerId || loadedState.players?.[0]?.id || 'p1',
  )
  const [assets, setAssets] = useState(() => loadedState.assets || { teams: { teamA: null }, players: {} })
  const [events, setEvents] = useState(() => loadedState.events || [])
  const [startedAt, setStartedAt] = useState(() => loadedState.startedAt || new Date().toISOString())
  const [clockSeconds, setClockSeconds] = useState(() => loadedState.clockSeconds || 0)
  const [customClockEnabled, setCustomClockEnabled] = useState(() => loadedState.customClockEnabled || false)
  const [customClockDurationSeconds, setCustomClockDurationSeconds] = useState(() =>
    loadedState.customClockDurationSeconds || 10 * 60,
  )
  const [isClockRunning, setIsClockRunning] = useState(false)
  const [history, setHistory] = useState(() => loadedState.history || [])
  const [showSetup, setShowSetup] = useState(false)
  const [payload, setPayload] = useState(null)
  const [requestState, setRequestState] = useState('idle')
  const [requestMessage, setRequestMessage] = useState('')
  const [generatedFlyers, setGeneratedFlyers] = useState([])
  const [showAssetValidation, setShowAssetValidation] = useState(false)
  const [storageMessage, setStorageMessage] = useState(loadedState.storageError)
  const [saveRevision, setSaveRevision] = useState(0)
  const skipNextSave = useRef(Boolean(loadedState.storageError))
  const clockSecondsRef = useRef(clockSeconds)
  clockSecondsRef.current = clockSeconds

  const saveClockCheckpoint = (seconds, gameStartedAt) => {
    try {
      window.localStorage.setItem(GAME_CLOCK_STORAGE_KEY, JSON.stringify({
        version: 1,
        startedAt: gameStartedAt,
        clockSeconds: seconds,
      }))
    } catch {
      setStorageMessage('Game clock could not be saved in this browser. Check available storage.')
    }
  }

  useEffect(() => {
    if (!isClockRunning || clockSeconds % 5 === 0) {
      saveClockCheckpoint(clockSeconds, startedAt)
    }
  }, [isClockRunning, clockSeconds, startedAt])

  useEffect(() => {
    const saveCurrentClock = () => saveClockCheckpoint(clockSecondsRef.current, startedAt)
    const saveClockWhenHidden = () => {
      if (document.visibilityState === 'hidden') saveCurrentClock()
    }
    window.addEventListener('pagehide', saveCurrentClock)
    document.addEventListener('visibilitychange', saveClockWhenHidden)
    return () => {
      window.removeEventListener('pagehide', saveCurrentClock)
      document.removeEventListener('visibilitychange', saveClockWhenHidden)
    }
  }, [startedAt])

  useEffect(() => {
    if (!isClockRunning) return undefined
    const intervalId = window.setInterval(() => {
      if (customClockEnabled) {
        setClockSeconds((seconds) => Math.max(0, seconds - 1))
      } else {
        setClockSeconds((seconds) => seconds + 1)
      }
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [isClockRunning, customClockEnabled])

  useEffect(() => {
    if (customClockEnabled && clockSeconds === 0) setIsClockRunning(false)
  }, [customClockEnabled, clockSeconds])

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }

    try {
      window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify({
        version: 2,
        game,
        players,
        assets,
        activePlayerId,
        events,
        startedAt,
        clockSeconds: clockSecondsRef.current,
        customClockEnabled,
        customClockDurationSeconds,
        history,
      }))
      setStorageMessage('')
    } catch {
      setStorageMessage('Game data could not be saved in this browser. Check available storage or remove large images.')
    }
  }, [game, players, activePlayerId, assets, events, startedAt, customClockEnabled, customClockDurationSeconds, history, saveRevision])

  const activePlayer = players.find((player) => player.id === activePlayerId) || players[0]
  const teamAScore = getScore(players, 'Team A')
  const flyerPlayers = useMemo(() => getFlyerPlayers(players), [players])
  const requiredAssets = { teams: {}, players: {} }
  for (const player of flyerPlayers) {
    requiredAssets.players[player.id] = [0, 1, 2].map((photoIndex) =>
      assets.players[player.id]?.[photoIndex]
        ? ''
        : `${player.name || 'Unnamed player'} needs reference photo ${photoIndex + 1} for the flyer.`,
    )
    if (!assets.teams.teamA) requiredAssets.teams.teamA = `${game.teamA} needs a logo for its flyer.`
  }
  const missingAssetMessages = [
    ...Object.values(requiredAssets.players).flat().filter(Boolean),
    ...new Set(Object.values(requiredAssets.teams)),
  ]

  const recordAction = (action) => {
    if (!activePlayer) return
    const timestamp = new Date().toISOString()
    const points = action.stat === 'pts' ? action.amount : 0
    const resultingScore = {
      teamA: teamAScore + points,
      teamB: 0,
    }
    setPlayers((currentPlayers) => currentPlayers.map((player) =>
      player.id === activePlayer.id
        ? { ...player, [action.stat]: player[action.stat] + action.amount }
        : player,
    ))
    setEvents((currentEvents) => [...currentEvents, {
      period: game.period,
      playerId: activePlayer.id,
      action: action.stat === 'pts' ? `PTS_${action.amount}` : action.stat.toUpperCase(),
      timestamp,
      gameClockSeconds: customClockEnabled ? customClockDurationSeconds - clockSeconds : clockSeconds,
      resultingScore,
    }])
    setHistory((currentHistory) => [...currentHistory, {
      playerId: activePlayer.id,
      stat: action.stat,
      amount: action.amount,
    }])
  }

  const undoAction = () => {
    const lastAction = history.at(-1)
    if (!lastAction) return
    setPlayers((currentPlayers) => currentPlayers.map((player) =>
      player.id === lastAction.playerId
        ? { ...player, [lastAction.stat]: player[lastAction.stat] - lastAction.amount }
        : player,
    ))
    setHistory((currentHistory) => currentHistory.slice(0, -1))
    setEvents((currentEvents) => currentEvents.slice(0, -1))
  }

  const updatePlayer = (key, value) => {
    setPlayers((currentPlayers) => currentPlayers.map((player) =>
      player.id === activePlayerId ? { ...player, [key]: value } : player,
    ))
  }

  const removePlayer = (playerId) => {
    if (players.length <= 1 || !players.some((player) => player.id === playerId)) return

    const remainingPlayers = players.filter((player) => player.id !== playerId)
    if (activePlayerId === playerId) setActivePlayerId(remainingPlayers[0].id)
    setPlayers(remainingPlayers)
    setEvents((currentEvents) => currentEvents.filter((event) => event.playerId !== playerId))
    setHistory((currentHistory) => currentHistory.filter((action) => action.playerId !== playerId))
    setAssets((currentAssets) => {
      const remainingPlayerAssets = { ...currentAssets.players }
      delete remainingPlayerAssets[playerId]
      return { ...currentAssets, players: remainingPlayerAssets }
    })
  }

  const updateAsset = (key, image, photoIndex) => {
    setAssets((currentAssets) => {
      if (key === 'teamA') {
        return { ...currentAssets, teams: { ...currentAssets.teams, [key]: image } }
      }
      const playersWithImage = { ...currentAssets.players }
      const playerImages = [...(playersWithImage[key] || [null, null, null])]
      playerImages[photoIndex] = image
      playersWithImage[key] = playerImages
      return { ...currentAssets, players: playersWithImage }
    })
  }

  const updateClockSettings = ({ enabled, durationSeconds }) => {
    setIsClockRunning(false)
    setCustomClockEnabled(enabled)
    setCustomClockDurationSeconds(durationSeconds)
    setClockSeconds(enabled ? durationSeconds : 0)
  }

  const resetBoard = () => {
    try {
      window.localStorage.removeItem(GAME_STORAGE_KEY)
      window.localStorage.removeItem(GAME_CLOCK_STORAGE_KEY)
      skipNextSave.current = true
      setStorageMessage('')
    } catch {
      setStorageMessage('Saved game data could not be cleared. The board will still reset, but saved data may return after refresh.')
    }
    setGame(initialGame)
    setPlayers(createInitialPlayers())
    setActivePlayerId('p1')
    setAssets({ teams: { teamA: null }, players: {} })
    setEvents([])
    setStartedAt(new Date().toISOString())
    setClockSeconds(0)
    setCustomClockEnabled(false)
    setCustomClockDurationSeconds(10 * 60)
    setIsClockRunning(false)
    setHistory([])
    setSaveRevision((revision) => revision + 1)
    setShowSetup(false)
    setPayload(null)
    setRequestState('idle')
    setRequestMessage('')
    setGeneratedFlyers([])
    setShowAssetValidation(false)
  }

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
          responseBody = JSON.parse(responseText)
        } catch {
          setGeneratedFlyers([])
          setRequestState('success')
          setRequestMessage('The game was accepted, but the server returned an unreadable flyer response.')
          return
        }
      }
      const graphics = Array.isArray(responseBody?.graphics)
        ? responseBody.graphics
          .filter((graphic) => getFlyerPublicUrl(graphic))
          .map((graphic) => ({ ...graphic, publicUrl: getFlyerPublicUrl(graphic) }))
        : []
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

  const finalizeGame = () => {
    setShowAssetValidation(true)
    if (missingAssetMessages.length > 0) return

    const nextPayload = createFinalizePayload({
      game,
      players,
      assets,
      teamAScore,
      events,
      startedAt,
      completedAt: new Date().toISOString(),
    })
    if (!isFinalizePayloadWithinLimit(nextPayload)) {
      setRequestState('error')
      setRequestMessage('The selected images make the game request too large. Remove or replace images so the JSON stays below 14 MB.')
      return
    }
    setGeneratedFlyers([])
    setPayload(nextPayload)
    setRequestState('sending')
    setRequestMessage(finalizeEndpoint
      ? `Posting to ${finalizeEndpoint}…`
      : 'Connecting to the configured backend…')
    void sendPayload(nextPayload)
  }

  return {
    game,
    setGame,
    players,
    activePlayer,
    setActivePlayerId,
    assets,
    teamAScore,
    clockSeconds,
    setClockSeconds,
    customClockEnabled,
    customClockDurationSeconds,
    isClockRunning,
    setIsClockRunning,
    history,
    showSetup,
    setShowSetup,
    payload,
    setPayload,
    requestState,
    requestMessage,
    generatedFlyers,
    showAssetValidation,
    storageMessage,
    requiredAssets,
    missingAssetMessages,
    recordAction,
    undoAction,
    updatePlayer,
    removePlayer,
    updateAsset,
    updateClockSettings,
    resetBoard,
    sendPayload,
    finalizeGame,
  }
}
