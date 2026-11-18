export const GAME_STORAGE_KEY = 'scorekings-game-state-v1'
export const GAME_CLOCK_STORAGE_KEY = 'scorekings-game-clock-v1'

/** @typedef {'Q1' | 'Q2' | 'Q3' | 'Q4' | 'OT1' | 'OT2'} GamePeriod */
/** @typedef {'pts' | 'reb' | 'ast' | 'stl' | 'blk' | 'to'} PlayerStat */
/** @typedef {'PTS_1' | 'PTS_2' | 'PTS_3' | 'REB' | 'AST' | 'STL' | 'BLK' | 'TO'} GameEventAction */
/**
 * @typedef {object} Player
 * @property {string} id
 * @property {string} team
 * @property {string} jersey
 * @property {string} name
 * @property {number} pts
 * @property {number} reb
 * @property {number} ast
 * @property {number} stl
 * @property {number} blk
 * @property {number} to
 */
/**
 * @typedef {object} GameDetails
 * @property {string} teamA
 * @property {string} location
 * @property {GamePeriod} period
 */
/**
 * @typedef {object} GameEvent
 * @property {GamePeriod} period
 * @property {string} playerId
 * @property {GameEventAction} action
 * @property {string} timestamp
 * @property {number} gameClockSeconds
 * @property {{ teamA: number, teamB: number }} resultingScore
 */
/**
 * @typedef {object} GameAction
 * @property {string} playerId
 * @property {PlayerStat} stat
 * @property {number} amount
 */
/**
 * @typedef {object} GameAssets
 * @property {{ teamA: string | null, teamB?: string | null }} teams
 * @property {Record<string, Array<string | null>>} players
 */
/**
 * @typedef {object} GameActionDefinition
 * @property {string} label
 * @property {string} detail
 * @property {PlayerStat} stat
 * @property {number} amount
 * @property {string} [style]
 */
/**
 * @typedef {object} GameState
 * @property {2} version
 * @property {GameDetails} game
 * @property {Player[]} players
 * @property {GameAssets} assets
 * @property {string} activePlayerId
 * @property {GameEvent[]} events
 * @property {string} startedAt
 * @property {number} clockSeconds
 * @property {boolean} customClockEnabled
 * @property {number} customClockDurationSeconds
 * @property {GameAction[]} history
 */
/**
 * @typedef {Omit<GameState, 'version' | 'customClockEnabled' | 'customClockDurationSeconds'> & {
 *   version: 1 | 2,
 *   customClockEnabled?: boolean,
 *   customClockDurationSeconds?: number
 * }} PersistedGameState
 */
/**
 * @typedef {Partial<Omit<GameState, 'version'>> & {
 *   version?: 1 | 2,
 *   storageError: string
 * }} LoadedGameState
 */

const GAME_PERIODS = new Set(['Q1', 'Q2', 'Q3', 'Q4', 'OT1', 'OT2'])
const PLAYER_STATS = new Set(['pts', 'reb', 'ast', 'stl', 'blk', 'to'])
const EVENT_ACTIONS = new Set(['PTS_1', 'PTS_2', 'PTS_3', 'REB', 'AST', 'STL', 'BLK', 'TO'])
const IMAGE_DATA_URL = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]*={0,2}$/

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/** @param {unknown} value @returns {value is number} */
function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0
}

/** @param {unknown} value @returns {value is string} */
function isValidTimestamp(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

/** @param {unknown} value @returns {value is string | null} */
function isValidImage(value) {
  return value === null || (typeof value === 'string' && IMAGE_DATA_URL.test(value))
}

/** @param {unknown} player @returns {player is Player} */
function isValidPlayer(player) {
  return isRecord(player)
    && typeof player.id === 'string'
    && player.id.length > 0
    && typeof player.team === 'string'
    && typeof player.jersey === 'string'
    && typeof player.name === 'string'
    && ['pts', 'reb', 'ast', 'stl', 'blk', 'to'].every((stat) => isNonNegativeInteger(player[stat]))
}

/** @param {unknown} event @returns {event is GameEvent} */
function isValidGameEvent(event) {
  return isRecord(event)
    && GAME_PERIODS.has(event.period)
    && typeof event.playerId === 'string'
    && event.playerId.length > 0
    && EVENT_ACTIONS.has(event.action)
    && isValidTimestamp(event.timestamp)
    && isNonNegativeInteger(event.gameClockSeconds)
    && isRecord(event.resultingScore)
    && isNonNegativeInteger(event.resultingScore.teamA)
    && isNonNegativeInteger(event.resultingScore.teamB)
}

/** @param {unknown} action @returns {action is GameAction} */
function isValidGameAction(action) {
  return isRecord(action)
    && typeof action.playerId === 'string'
    && action.playerId.length > 0
    && PLAYER_STATS.has(action.stat)
    && Number.isInteger(action.amount)
    && action.amount > 0
}

/** @param {unknown} assets @returns {assets is GameAssets} */
function isValidAssets(assets) {
  if (!isRecord(assets) || !isRecord(assets.teams) || !isValidImage(assets.teams.teamA)) return false
  if (assets.teams.teamB !== undefined && !isValidImage(assets.teams.teamB)) return false
  if (!isRecord(assets.players)) return false

  return Object.values(assets.players).every((images) =>
    Array.isArray(images)
    && images.length <= 3
    && images.every(isValidImage),
  )
}

/**
 * @param {unknown} state
 * @returns {state is PersistedGameState}
 */
function isValidSavedGame(state) {
  if (
    !isRecord(state)
    || ![1, 2].includes(state.version)
    || !isRecord(state.game)
    || typeof state.game.teamA !== 'string'
    || typeof state.game.location !== 'string'
    || !GAME_PERIODS.has(state.game.period)
    || !Array.isArray(state.players)
    || state.players.length === 0
    || state.players.length > 5
    || !state.players.every(isValidPlayer)
    || new Set(state.players.map((player) => player.id)).size !== state.players.length
    || !isValidAssets(state.assets)
    || (state.activePlayerId !== undefined && typeof state.activePlayerId !== 'string')
    || !Array.isArray(state.events)
    || !state.events.every(isValidGameEvent)
    || !Array.isArray(state.history)
    || !state.history.every(isValidGameAction)
    || !isValidTimestamp(state.startedAt)
    || !isNonNegativeInteger(state.clockSeconds)
  ) {
    return false
  }

  return state.version !== 2 || (
    typeof state.customClockEnabled === 'boolean'
    && Number.isInteger(state.customClockDurationSeconds)
    && state.customClockDurationSeconds >= 1
    && state.customClockDurationSeconds <= 5999
    && (!state.customClockEnabled || state.clockSeconds <= state.customClockDurationSeconds)
  )
}

/** @type {GameDetails} */
export const initialGame = {
  teamA: 'Red Team',
  location: 'Marietta Rec League',
  period: 'Q1',
}

/** @type {Player} */
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

/** @returns {Player[]} */
export function createInitialPlayers() {
  return [{ ...initialPlayer }]
}

/** @returns {LoadedGameState} */
export function loadGameState() {
  try {
    const savedState = window.localStorage.getItem(GAME_STORAGE_KEY)
    if (!savedState) return { storageError: '' }

    const parsedState = JSON.parse(savedState)
    if (!isValidSavedGame(parsedState)) {
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

    const players = parsedState.players.map((player) => ({ ...player, team: 'Team A' }))
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

/** @type {GameActionDefinition[]} */
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

/**
 * @param {Player[]} players
 * @param {string} team
 */
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
