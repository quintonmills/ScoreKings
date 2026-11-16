export const GAME_STORAGE_KEY = 'scorekings-game-state-v1'
export const GAME_CLOCK_STORAGE_KEY = 'scorekings-game-clock-v1'

export const initialGame = {
  teamA: 'Red Team',
  location: 'Marietta Rec League',
  period: 'Q1',
}

const initialPlayer = {
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
}

export function createInitialPlayers() {
  return Array.from({ length: 5 }, (_, index) => index === 0
    ? { ...initialPlayer }
    : {
      id: `p${index + 1}`,
      team: 'Team A',
      jersey: String(index + 3),
      name: `Player ${index + 1}`,
      pts: 0,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      to: 0,
    })
}

export function loadGameState() {
  try {
    const savedState = window.localStorage.getItem(GAME_STORAGE_KEY)
    if (!savedState) return { storageError: '' }

    const parsedState = JSON.parse(savedState)
    if (
      ![1, 2].includes(parsedState.version)
      || !parsedState.game
      || !Array.isArray(parsedState.players)
      || parsedState.players.length === 0
      || !parsedState.assets?.teams
      || !Array.isArray(parsedState.events)
      || !Array.isArray(parsedState.history)
      || typeof parsedState.startedAt !== 'string'
      || !Number.isFinite(parsedState.clockSeconds)
      || (parsedState.version === 2 && (
        typeof parsedState.customClockEnabled !== 'boolean'
        || !Number.isInteger(parsedState.customClockDurationSeconds)
        || parsedState.customClockDurationSeconds < 1
        || parsedState.customClockDurationSeconds > 5999
        || parsedState.clockSeconds < 0
        || (parsedState.customClockEnabled && parsedState.clockSeconds > parsedState.customClockDurationSeconds)
      ))
    ) {
      throw new Error('Saved game state has an unsupported format.')
    }

    let clockSeconds = parsedState.clockSeconds
    const savedClock = window.localStorage.getItem(GAME_CLOCK_STORAGE_KEY)
    if (savedClock) {
      try {
        const checkpoint = JSON.parse(savedClock)
        const isValidClock = Number.isInteger(checkpoint.clockSeconds)
          && checkpoint.clockSeconds >= 0
          && (
            parsedState.version !== 2
            || !parsedState.customClockEnabled
            || checkpoint.clockSeconds <= parsedState.customClockDurationSeconds
          )
        if (
          checkpoint.version === 1
          && checkpoint.startedAt === parsedState.startedAt
          && isValidClock
        ) {
          clockSeconds = checkpoint.clockSeconds
        }
      } catch {
        // Keep the last complete game snapshot if the lightweight clock checkpoint is malformed.
      }
    }

    const players = parsedState.players.slice(0, 5).map((player) => ({ ...player, team: 'Team A' }))
    const playerIds = new Set(players.map((player) => player.id))
    const activePlayerId = players.some((player) => player.id === parsedState.activePlayerId)
      ? parsedState.activePlayerId
      : players[0].id

    return {
      ...parsedState,
      players,
      clockSeconds,
      activePlayerId,
      events: parsedState.events.filter((event) => playerIds.has(event.playerId)),
      history: parsedState.history.filter((action) => playerIds.has(action.playerId)),
      assets: {
        ...parsedState.assets,
        players: Object.fromEntries(
          Object.entries(parsedState.assets.players || {}).filter(([playerId]) => playerIds.has(playerId)),
        ),
      },
      customClockEnabled: parsedState.version === 2 ? parsedState.customClockEnabled : false,
      customClockDurationSeconds: parsedState.version === 2
        ? parsedState.customClockDurationSeconds
        : 10 * 60,
      storageError: '',
    }
  } catch {
    return {
      storageError: 'Saved game data could not be loaded. Reset the board to start a new game.',
    }
  }
}

export const actions = [
  { label: '+2', detail: '2 POINTS', stat: 'pts', amount: 2, style: 'score-action' },
  { label: '+3', detail: '3 POINTS', stat: 'pts', amount: 3, style: 'score-action' },
  { label: '+1', detail: 'FREE THROW', stat: 'pts', amount: 1, style: 'score-action' },
  { label: 'REB', detail: 'REBOUND', stat: 'reb', amount: 1 },
  { label: 'AST', detail: 'ASSIST', stat: 'ast', amount: 1 },
  { label: 'STL', detail: 'STEAL', stat: 'stl', amount: 1 },
  { label: 'BLK', detail: 'BLOCK', stat: 'blk', amount: 1 },
  { label: 'TO', detail: 'TURNOVER', stat: 'to', amount: 1 },
]

export function getScore(players, team) {
  return players
    .filter((player) => player.team === team)
    .reduce((total, player) => total + player.pts, 0)
}

export function formatGameClock(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

export function parseGameClock(value) {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(value.trim())
  if (!match) return null

  const seconds = Number(match[1]) * 60 + Number(match[2])
  return seconds > 0 ? seconds : null
}
