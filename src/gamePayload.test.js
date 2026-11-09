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
  it('preserves backend team identifiers and adds images under the backend field names', () => {
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
      events: [{
        period: 'Q1',
        playerId: 'p1',
        action: 'PTS_2',
        timestamp: '2026-01-02T03:04:05.000Z',
        resultingScore: { teamA: 2, teamB: 0 },
      }],
      startedAt: '2026-01-02T03:00:00.000Z',
      completedAt: '2026-01-02T04:00:00.000Z',
    })

    expect(payload).toEqual({
      gameId: 'game-101',
      status: 'COMPLETED',
      startedAt: '2026-01-02T03:00:00.000Z',
      completedAt: '2026-01-02T04:00:00.000Z',
      location: 'Gym',
      events: [{
        period: 'Q1',
        playerId: 'p1',
        action: 'PTS_2',
        timestamp: '2026-01-02T03:04:05.000Z',
        resultingScore: { teamA: 2, teamB: 0 },
      }],
      teamA: { name: 'Home', score: 2, logo: 'data:image/png;base64,logo-a' },
      teamB: { name: 'Opponent', score: 0 },
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

  it('submits every tracked player and attaches photos to the top scorer', () => {
    const photoSet = ['photo-1', 'photo-2', 'photo-3']
    const payload = createFinalizePayload({
      game: { location: 'Gym', teamA: 'Home', teamB: 'Away' },
      players: [
        { id: 'top', team: 'Team B', jersey: '1', name: 'Top', pts: 10, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
        { id: 'next', team: 'Team A', jersey: '2', name: 'Next', pts: 8, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
      ],
      assets: {
        teams: { teamA: null, teamB: null },
        players: { top: photoSet, next: photoSet },
      },
      teamAScore: 10,
      teamBScore: 8,
      events: [],
      startedAt: '2026-01-02T03:00:00.000Z',
      completedAt: '2026-01-02T04:00:00.000Z',
    })

    expect(payload.players).toHaveLength(2)
    expect(payload.players[0].id).toBe('top')
    expect(payload.players[0].team).toBe('Team A')
    expect(payload.players[0].photos).toEqual(photoSet)
    expect(payload.players[1].id).toBe('next')
    expect(payload.players[1].team).toBe('Team A')
    expect(payload.players[1]).not.toHaveProperty('photos')
  })

  describe('isFinalizePayloadWithinLimit', () => {
    it('rejects a JSON request that reaches the backend limit', () => {
      const padding = 'x'.repeat(MAX_GAME_PAYLOAD_BYTES - 14)
      expect(isFinalizePayloadWithinLimit({ padding })).toBe(false)
      expect(isFinalizePayloadWithinLimit({ padding: padding.slice(1) })).toBe(true)
    })
  })
})
