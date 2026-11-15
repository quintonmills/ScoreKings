export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_GAME_PAYLOAD_BYTES = 14 * 1024 * 1024

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

export function isFinalizePayloadWithinLimit(payload) {
  return new TextEncoder().encode(JSON.stringify(payload)).byteLength < MAX_GAME_PAYLOAD_BYTES
}

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
