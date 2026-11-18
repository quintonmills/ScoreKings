import { useEffect, useRef } from 'react'
import { GAME_CLOCK_STORAGE_KEY, GAME_STORAGE_KEY } from './gameState.js'

/** @typedef {Omit<import('./gameState.js').GameState, 'version'>} PersistedGameData */

/**
 * @param {PersistedGameData} gameState
 * @param {{ hadLoadError: boolean, setStorageMessage: (message: string) => void }} options
 */
export function useGamePersistence(gameState, { hadLoadError, setStorageMessage }) {
  const skipNextSave = useRef(hadLoadError)
  const {
    game,
    players,
    assets,
    activePlayerId,
    events,
    startedAt,
    clockSeconds,
    customClockEnabled,
    customClockDurationSeconds,
    history,
  } = gameState

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
        clockSeconds,
        customClockEnabled,
        customClockDurationSeconds,
        history,
      }))
      setStorageMessage('')
    } catch {
      setStorageMessage('Game data could not be saved in this browser. Check available storage or remove large images.')
    }
  }, [
    game,
    players,
    assets,
    activePlayerId,
    events,
    startedAt,
    customClockEnabled,
    customClockDurationSeconds,
    history,
  ])

  const clearSavedGame = () => {
    try {
      window.localStorage.removeItem(GAME_STORAGE_KEY)
      window.localStorage.removeItem(GAME_CLOCK_STORAGE_KEY)
      skipNextSave.current = true
      setStorageMessage('')
    } catch {
      setStorageMessage('Saved game data could not be cleared. The board will still reset, but saved data may return after refresh.')
    }
  }

  return {
    clearSavedGame,
  }
}
