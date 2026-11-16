import { beforeEach, describe, expect, it } from 'vitest'
import {
  GAME_CLOCK_STORAGE_KEY,
  GAME_STORAGE_KEY,
  loadGameState,
} from './gameState.js'

const savedGame = {
  version: 2,
  game: { teamA: 'Red Team', location: 'Gym', period: 'Q1' },
  players: [{ id: 'p1', pts: 0 }],
  assets: { teams: { teamA: null }, players: {} },
  activePlayerId: 'p1',
  events: [],
  startedAt: '2026-11-15T12:00:00.000Z',
  clockSeconds: 12,
  customClockEnabled: false,
  customClockDurationSeconds: 600,
  history: [],
}
const storedValues = new Map()
const localStorageMock = {
  getItem: (key) => storedValues.get(key) ?? null,
  setItem: (key, value) => storedValues.set(key, String(value)),
  removeItem: (key) => storedValues.delete(key),
  clear: () => storedValues.clear(),
}

beforeEach(() => {
  storedValues.clear()
  Object.defineProperty(window, 'localStorage', { configurable: true, value: localStorageMock })
})

describe('loadGameState clock checkpoints', () => {
  it('uses the latest checkpoint for the same game', () => {
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(savedGame))
    window.localStorage.setItem(GAME_CLOCK_STORAGE_KEY, JSON.stringify({
      version: 1,
      startedAt: savedGame.startedAt,
      clockSeconds: 17,
    }))

    expect(loadGameState().clockSeconds).toBe(17)
  })

  it('falls back to the full snapshot for stale or malformed checkpoints', () => {
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(savedGame))
    window.localStorage.setItem(GAME_CLOCK_STORAGE_KEY, JSON.stringify({
      version: 1,
      startedAt: 'another-game',
      clockSeconds: 17,
    }))
    expect(loadGameState().clockSeconds).toBe(12)

    window.localStorage.setItem(GAME_CLOCK_STORAGE_KEY, '{invalid')
    expect(loadGameState().clockSeconds).toBe(12)
  })
})
