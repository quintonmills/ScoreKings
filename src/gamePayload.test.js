import { describe, expect, it } from 'vitest'
import { createFinalizePayload, getFlyerPlayers, isFinalizePayloadWithinLimit, MAX_GAME_PAYLOAD_BYTES } from './gamePayload.js'

describe('getFlyerPlayers', () => {
  it('selects one player with points, ranked by points, rebounds, and assists', () => {
    const players = [
      { id: 'a', pts: 10, reb: 2, ast: 1 },
      { id: 'b', pts: 10, reb: 4, ast: 0 },
      { id: 'c', pts: 10, reb: 4, ast: 2 },
      { id: 'd', pts: 0, reb: 20, ast: 20 },
      { id: 'e', pts: 8, reb: 0, ast: 0 },
    ]

    expect(getFlyerPlayers(players).map((player) => player.id)).toEqual(['c'])
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
        players: { p1: ['data:image/jpeg;base64,player-photo-1', 'data:image/jpeg;base64,player-photo-2', 'data:image/jpeg;base64,player-photo-3'] },
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
        photos: [
          'data:image/jpeg;base64,player-photo-1',
          'data:image/jpeg;base64,player-photo-2',
          'data:image/jpeg;base64,player-photo-3',
        ],
      }],
    })
  })

  it('sends reference photos only for the top-ranked flyer player', () => {
    const photoSet = ['photo-1', 'photo-2', 'photo-3']
    const payload = createFinalizePayload({
      game: { location: 'Gym', teamA: 'Home', teamB: 'Away' },
      players: [
        { id: 'top', team: 'Team A', jersey: '1', name: 'Top', pts: 10, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
        { id: 'next', team: 'Team B', jersey: '2', name: 'Next', pts: 8, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
      ],
      assets: {
        teams: { teamA: null, teamB: null },
        players: { top: photoSet, next: photoSet },
      },
      teamAScore: 10,
      teamBScore: 8,
    })

    expect(payload.players[0].photos).toEqual(photoSet)
    expect(payload.players[1].photos).toBeUndefined()
  })

  describe('isFinalizePayloadWithinLimit', () => {
    it('rejects a JSON request that reaches the backend limit', () => {
      const padding = 'x'.repeat(MAX_GAME_PAYLOAD_BYTES - 14)
      expect(isFinalizePayloadWithinLimit({ padding })).toBe(false)
      expect(isFinalizePayloadWithinLimit({ padding: padding.slice(1) })).toBe(true)
    })
  })
})
