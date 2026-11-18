import { useMemo, useState } from 'react'
import { createFinalizePayload, getFlyerPlayers, isFinalizePayloadWithinLimit } from './gamePayload.js'
import {
  createInitialPlayers,
  getScore,
  initialGame,
  loadGameState,
} from './gameState.js'
import { useGameClock } from './useGameClock.js'
import { useGamePersistence } from './useGamePersistence.js'
import { useGameSubmission } from './useGameSubmission.js'

/** @typedef {import('./gameState.js').GameActionDefinition} GameActionDefinition */

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
  const [history, setHistory] = useState(() => loadedState.history || [])
  const [showSetup, setShowSetup] = useState(false)
  const [payload, setPayload] = useState(null)
  const [showAssetValidation, setShowAssetValidation] = useState(false)
  const [storageMessage, setStorageMessage] = useState(loadedState.storageError)
  const clock = useGameClock({
    initialClockSeconds: loadedState.clockSeconds,
    initialCustomClockEnabled: loadedState.customClockEnabled,
    initialCustomClockDurationSeconds: loadedState.customClockDurationSeconds,
    startedAt,
    onStorageError: setStorageMessage,
  })
  const persistence = useGamePersistence({
    game,
    players,
    assets,
    activePlayerId,
    events,
    startedAt,
    clockSeconds: clock.clockSeconds,
    customClockEnabled: clock.customClockEnabled,
    customClockDurationSeconds: clock.customClockDurationSeconds,
    history,
  }, {
    hadLoadError: Boolean(loadedState.storageError),
    setStorageMessage,
  })
  const submission = useGameSubmission()
  const { clockSeconds, setClockSeconds, customClockEnabled, customClockDurationSeconds, isClockRunning, setIsClockRunning } = clock
  const {
    requestState,
    requestMessage,
    generatedFlyers,
    setRequestState,
    setRequestMessage,
    setGeneratedFlyers,
  } = submission

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

  /** @param {GameActionDefinition} action */
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

  /** @param {'name' | 'jersey'} key @param {string} value */
  const updatePlayer = (key, value) => {
    setPlayers((currentPlayers) => currentPlayers.map((player) =>
      player.id === activePlayerId ? { ...player, [key]: value } : player,
    ))
  }

  /** @param {string} playerId */
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

  /**
   * @param {string} key
   * @param {string | null} image
   * @param {number} [photoIndex]
   */
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

  const resetBoard = () => {
    persistence.clearSavedGame()
    setGame(initialGame)
    setPlayers(createInitialPlayers())
    setActivePlayerId('p1')
    setAssets({ teams: { teamA: null }, players: {} })
    setEvents([])
    setStartedAt(new Date().toISOString())
    clock.resetClock()
    setHistory([])
    setShowSetup(false)
    setPayload(null)
    submission.resetSubmission()
    setShowAssetValidation(false)
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
    void submission.sendPayload(nextPayload)
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
    updateClockSettings: clock.updateClockSettings,
    resetBoard,
    sendPayload: submission.sendPayload,
    finalizeGame,
  }
}
