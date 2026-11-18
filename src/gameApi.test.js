import { describe, expect, it } from 'vitest'
import { parseFinalizeResponse } from './gameApi.js'

describe('parseFinalizeResponse', () => {
  it('keeps graphics with valid optional string fields', () => {
    expect(parseFinalizeResponse({
      graphics: [
        { playerId: 'p1', publicUrl: 'https://cdn.example/flyer.png' },
        { downloadUrl: 'https://cdn.example/download' },
      ],
    })).toEqual({
      graphics: [
        { playerId: 'p1', publicUrl: 'https://cdn.example/flyer.png' },
        { downloadUrl: 'https://cdn.example/download' },
      ],
    })
  })

  it('discards malformed graphics and handles unexpected response shapes', () => {
    expect(parseFinalizeResponse({
      graphics: [
        { publicUrl: 42 },
        null,
        { downloadUrl: 'https://cdn.example/download' },
      ],
    })).toEqual({
      graphics: [{ downloadUrl: 'https://cdn.example/download' }],
    })
    expect(parseFinalizeResponse({ graphics: 'not-an-array' })).toEqual({})
    expect(parseFinalizeResponse(null)).toBeNull()
  })
})
