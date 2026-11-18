import { beforeEach, describe, expect, it } from 'vitest'
import {
  GAME_CLOCK_STORAGE_KEY,
  GAME_STORAGE_KEY,
  loadGameState,
} from './gameState.js'

const savedGame = {
  version: 2,
  game: { teamA: 'Red Team', location: 'Gym', period: 'Q1' },
  players: [{
    id: 'p1',
    team: 'Team A',
    jersey: '3',
    name: 'Marcus',
    pts: 0,
    reb: 0,
    ast: 0,
    stl: 0,
    blk: 0,
    to: 0,
  }],
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

describe('loadGameState saved-data validation', () => {
  it('rejects invalid game, player, event, history, and asset data', () => {
    const invalidStates = [
      { ...savedGame, game: { ...savedGame.game, period: 'Q5' } },
      { ...savedGame, players: [{ ...savedGame.players[0], pts: -1 }] },
      { ...savedGame, players: [{ ...savedGame.players[0], pts: 1.5 }] },
      { ...savedGame, players: [savedGame.players[0], savedGame.players[0]] },
      { ...savedGame, events: [{ playerId: 'p1', action: 'BAD' }] },
      { ...savedGame, history: [{ playerId: 'p1', stat: 'pts', amount: 0 }] },
      { ...savedGame, assets: { teams: { teamA: 'not-an-image' }, players: {} } },
      { ...savedGame, assets: { teams: { teamA: null }, players: { p1: [null, null, null, null] } } },
    ]

    for (const invalidState of invalidStates) {
      window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(invalidState))
      expect(loadGameState().storageError).toBeTruthy()
    }
  })

  it('continues to load valid version 1 saves with clock defaults', () => {
    const versionOneSave = { ...savedGame, version: 1 }
    delete versionOneSave.customClockEnabled
    delete versionOneSave.customClockDurationSeconds
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(versionOneSave))

    expect(loadGameState()).toMatchObject({
      version: 1,
      customClockEnabled: false,
      customClockDurationSeconds: 600,
      storageError: '',
    })
  })
})
