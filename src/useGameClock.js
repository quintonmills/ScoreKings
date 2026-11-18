import { useEffect, useRef, useState } from 'react'
import { GAME_CLOCK_STORAGE_KEY } from './gameState.js'

export function useGameClock({
  initialClockSeconds,
  initialCustomClockEnabled,
  initialCustomClockDurationSeconds,
  startedAt,
  onStorageError,
}) {
  const [clockSeconds, setClockSeconds] = useState(() => initialClockSeconds || 0)
  const [customClockEnabled, setCustomClockEnabled] = useState(() => initialCustomClockEnabled || false)
  const [customClockDurationSeconds, setCustomClockDurationSeconds] = useState(() =>
    initialCustomClockDurationSeconds || 10 * 60,
  )
  const [isClockRunning, setIsClockRunning] = useState(false)
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
      onStorageError('Game clock could not be saved in this browser. Check available storage.')
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

  const updateClockSettings = ({ enabled, durationSeconds }) => {
    setIsClockRunning(false)
    setCustomClockEnabled(enabled)
    setCustomClockDurationSeconds(durationSeconds)
    setClockSeconds(enabled ? durationSeconds : 0)
  }

  const resetClock = () => {
    setClockSeconds(0)
    setCustomClockEnabled(false)
    setCustomClockDurationSeconds(10 * 60)
    setIsClockRunning(false)
  }

  return {
    clockSeconds,
    setClockSeconds,
    customClockEnabled,
    customClockDurationSeconds,
    isClockRunning,
    setIsClockRunning,
    updateClockSettings,
    resetClock,
  }
}
