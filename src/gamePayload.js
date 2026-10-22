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
    .slice(0, 3)
}

export function isFinalizePayloadWithinLimit(payload) {
  return new TextEncoder().encode(JSON.stringify(payload)).byteLength < MAX_GAME_PAYLOAD_BYTES
}

export function createFinalizePayload({ game, players, assets, teamAScore, teamBScore }) {
  return {
    gameId: 'game-101',
    location: game.location,
    teamA: {
      name: game.teamA,
      score: teamAScore,
      ...(assets.teams.teamA ? { logo: assets.teams.teamA } : {}),
    },
    teamB: {
      name: game.teamB,
      score: teamBScore,
      ...(assets.teams.teamB ? { logo: assets.teams.teamB } : {}),
    },
    players: players.map(({ id, team, jersey, name, pts, reb, ast, stl, blk, to }) => ({
      id,
      team,
      jersey,
      name,
      pts,
      reb,
      ast,
      stl,
      blk,
      to,
      ...(assets.players[id] ? { photo: assets.players[id] } : {}),
    })),
  }
}
