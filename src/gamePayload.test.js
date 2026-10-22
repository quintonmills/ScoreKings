import { describe, expect, it } from 'vitest'
import { createFinalizePayload, getFlyerPlayers, isFinalizePayloadWithinLimit, MAX_GAME_PAYLOAD_BYTES } from './gamePayload.js'

describe('getFlyerPlayers', () => {
  it('selects up to three players with points, ranked by points, rebounds, and assists', () => {
    const players = [
      { id: 'a', pts: 10, reb: 2, ast: 1 },
      { id: 'b', pts: 10, reb: 4, ast: 0 },
      { id: 'c', pts: 10, reb: 4, ast: 2 },
      { id: 'd', pts: 0, reb: 20, ast: 20 },
      { id: 'e', pts: 8, reb: 0, ast: 0 },
    ]

    expect(getFlyerPlayers(players).map((player) => player.id)).toEqual(['c', 'b', 'a'])
  })
})

describe('createFinalizePayload', () => {
  it('preserves game and player fields and adds images under the backend field names', () => {
    const payload = createFinalizePayload({
      game: { location: 'Gym', teamA: 'Home', teamB: 'Away' },
      players: [{
        id: 'p1',
        team: 'Team A',
        jersey: '3',
        name: 'Marcus',
        pts: 2,
        reb: 1,
        ast: 0,
        stl: 0,
        blk: 0,
        to: 0,
      }],
      assets: {
        teams: { teamA: 'data:image/png;base64,logo-a', teamB: 'data:image/webp;base64,logo-b' },
        players: { p1: 'data:image/jpeg;base64,player-photo' },
      },
      teamAScore: 2,
      teamBScore: 0,
    })

    expect(payload).toEqual({
      gameId: 'game-101',
      location: 'Gym',
      teamA: { name: 'Home', score: 2, logo: 'data:image/png;base64,logo-a' },
      teamB: { name: 'Away', score: 0, logo: 'data:image/webp;base64,logo-b' },
      players: [{
        id: 'p1',
        team: 'Team A',
        jersey: '3',
        name: 'Marcus',
        pts: 2,
        reb: 1,
        ast: 0,
        stl: 0,
        blk: 0,
        to: 0,
        photo: 'data:image/jpeg;base64,player-photo',
      }],
    })
  })

  describe('isFinalizePayloadWithinLimit', () => {
    it('rejects a JSON request that reaches the backend limit', () => {
      const padding = 'x'.repeat(MAX_GAME_PAYLOAD_BYTES - 14)
      expect(isFinalizePayloadWithinLimit({ padding })).toBe(false)
      expect(isFinalizePayloadWithinLimit({ padding: padding.slice(1) })).toBe(true)
    })
  })
})
