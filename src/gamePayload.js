export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_GAME_PAYLOAD_BYTES = 14 * 1024 * 1024

/** @typedef {import('./gameState.js').Player} Player */
/** @typedef {import('./gameState.js').GameDetails} GameDetails */
/** @typedef {import('./gameState.js').GameAssets} GameAssets */
/** @typedef {import('./gameState.js').GameEvent} GameEvent */
/**
 * @typedef {object} FinalizeBoxScoreEntry
 * @property {string} playerId
 * @property {string} name
 * @property {string} jersey
 * @property {number} PTS
 * @property {number} REB
 * @property {number} AST
 * @property {number} STL
 * @property {number} BLK
 * @property {number} TOV
 */
/**
 * @typedef {object} FinalizePlayer
 * @property {string} id
 * @property {'Team A'} team
 * @property {string} jersey
 * @property {string} name
 * @property {number} pts
 * @property {number} reb
 * @property {number} ast
 * @property {number} stl
 * @property {number} blk
 * @property {number} to
 * @property {string[]} [photos]
 */
/**
 * @typedef {object} FinalizePayload
 * @property {string} gameId
 * @property {string} idempotencyKey
 * @property {'COMPLETED'} status
 * @property {string} startedAt
 * @property {string} completedAt
 * @property {string} location
 * @property {string} teamName
 * @property {string} [teamLogo]
 * @property {GameEvent[]} events
 * @property {FinalizeBoxScoreEntry[]} boxScore
 * @property {FinalizePlayer[]} players
 */

/** @param {Player[]} players */
export function getFlyerPlayers(players) {
  return [...players]
    .filter((player) => player.pts >= 1)
    .sort((playerA, playerB) =>
      playerB.pts - playerA.pts
      || playerB.reb - playerA.reb
      || playerB.ast - playerA.ast,
    )
    .slice(0, 1)
}

/** @param {FinalizePayload} payload */
export function isFinalizePayloadWithinLimit(payload) {
  return new TextEncoder().encode(JSON.stringify(payload)).byteLength < MAX_GAME_PAYLOAD_BYTES
}

/**
 * @param {object} input
 * @param {GameDetails} input.game
 * @param {Player[]} input.players
 * @param {GameAssets} input.assets
 * @param {number} input.teamAScore
 * @param {GameEvent[]} input.events
 * @param {string} input.startedAt
 * @param {string} input.completedAt
 * @returns {FinalizePayload}
 */
export function createFinalizePayload({ game, players, assets, events, startedAt, completedAt }) {
  const gameId = `game-${startedAt}`
  return {
    gameId,
    idempotencyKey: gameId,
    status: 'COMPLETED',
    startedAt,
    completedAt,
    location: game.location,
    teamName: game.teamA,
    ...(assets.teams.teamA ? { teamLogo: assets.teams.teamA } : {}),
    events,
    boxScore: players.map((player) => ({
      playerId: player.id,
      name: player.name,
      jersey: player.jersey,
      PTS: player.pts,
      REB: player.reb,
      AST: player.ast,
      STL: player.stl,
      BLK: player.blk,
      TOV: player.to,
    })),
    players: players.map(({ id, jersey, name, pts, reb, ast, stl, blk, to }) => ({
      id,
      team: 'Team A',
      jersey,
      name,
      pts,
      reb,
      ast,
      stl,
      blk,
      to,
      ...(assets.players[id]?.some(Boolean)
        ? { photos: assets.players[id].filter(Boolean) }
        : {}),
    })),
  }
}
