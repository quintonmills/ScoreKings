import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

const uploadedImage = (name = 'photo.png', type = 'image/png', contents = 'image-bytes') =>
  new File([contents], name, { type })
const storedValues = new Map()
const localStorageMock = {
  getItem: (key) => storedValues.get(key) ?? null,
  setItem: (key, value) => storedValues.set(key, String(value)),
  removeItem: (key) => storedValues.delete(key),
  clear: () => storedValues.clear(),
}

function openSetup() {
  render(<App />)
  return userEvent.setup().click(screen.getByRole('button', { name: /Game setup/ }))
}

beforeEach(() => {
  storedValues.clear()
  Object.defineProperty(window, 'localStorage', { configurable: true, value: localStorageMock })
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => JSON.stringify({
      graphics: [{
        publicUrl: 'https://cdn.scorekings.example/flyer.png',
        downloadUrl: 'https://api.scorekings.example/games/game-101/flyer/download',
      }],
    }),
  })))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('flyer image uploads', () => {
  it('previews a selected image and removes it', async () => {
    await openSetup()
    const user = userEvent.setup()
    const input = screen.getByLabelText('Marcus reference photo 1 upload')
    await user.upload(input, uploadedImage())

    const preview = await screen.findByAltText('Marcus reference photo 1 preview')
    expect(preview.getAttribute('src')).toMatch(/^data:image\/png;base64,/)
    expect(screen.getAllByText('PNG, JPEG, or WebP · up to 5 MB').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Replace' }))
    await user.upload(input, uploadedImage('replacement.webp', 'image/webp', 'replacement'))
    expect((await screen.findByAltText('Marcus reference photo 1 preview')).getAttribute('src')).toBe('data:image/webp;base64,cmVwbGFjZW1lbnQ=')

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(screen.queryByAltText('Marcus reference photo 1 preview')).toBeNull()
  })

  it('shows inline validation for unsupported types and files over 5 MB', async () => {
    await openSetup()
    const input = screen.getByLabelText('Marcus reference photo 1 upload')
    fireEvent.change(input, { target: { files: [uploadedImage('portrait.gif', 'image/gif')] } })
    expect(await screen.findByText('Choose a PNG, JPEG, or WebP image.')).toBeTruthy()

    fireEvent.change(input, {
      target: { files: [uploadedImage('large.png', 'image/png', new Uint8Array(5 * 1024 * 1024 + 1))] },
    })
    expect(await screen.findByText('Choose an image that is 5 MB or smaller.')).toBeTruthy()
  })

  it('blocks finalization with inline messages for missing flyer assets', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /\+2/ }))
    await user.click(screen.getByRole('button', { name: /Finalize game/ }))

    expect(await screen.findByText('Marcus needs reference photo 1 for the flyer.')).toBeTruthy()
    expect(screen.getByText('Red Team needs a logo for its flyer.')).toBeTruthy()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('removes the last play-by-play event when undoing a stat action', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /REBREBOUND/ }))
    await user.click(screen.getByRole('button', { name: /Undo last action/ }))
    await user.click(screen.getByRole('button', { name: /Finalize game/ }))
    await screen.findByRole('dialog', { name: 'Final box score' })

    const payload = JSON.parse(fetch.mock.calls[0][1].body)
    expect(payload.events).toEqual([])
    expect(payload.players[0].reb).toBe(0)
  })

  it('starts and pauses the count-up game clock', async () => {
    vi.useFakeTimers()
    render(<App />)

    expect(screen.getByText('00:00')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Start game clock' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(screen.getByText('00:03')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Pause game clock' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    expect(screen.getByText('00:03')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Start game clock' }).textContent).toBe('Resume')
  })

  it('lets the user change periods and records the selected period on events', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Current game period' }), 'Q3')
    await user.click(screen.getByRole('button', { name: /REBREBOUND/ }))
    await user.click(screen.getByRole('button', { name: /Finalize game/ }))
    await screen.findByRole('dialog', { name: 'Final box score' })

    const payload = JSON.parse(fetch.mock.calls[0][1].body)
    expect(payload.events[0].period).toBe('Q3')
  })

  it('sends the exact JSON payload with selected images and displays returned flyers', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Game setup/ }))

    await user.upload(screen.getByLabelText('Red Team logo upload'), uploadedImage('home.png', 'image/png', 'home'))
    await user.upload(screen.getByLabelText('Blue Team logo upload'), uploadedImage('away.webp', 'image/webp', 'away'))
    for (let index = 1; index <= 3; index += 1) {
      await user.upload(
        screen.getByLabelText(`Marcus reference photo ${index} upload`),
        uploadedImage(`marcus-${index}.jpg`, 'image/jpeg', `marcus-${index}`),
      )
    }
    await user.click(screen.getByRole('button', { name: /Back to game/ }))
    await user.click(screen.getByRole('button', { name: /\+2/ }))
    await user.click(screen.getByRole('button', { name: /Finalize game/ }))
    await screen.findByRole('dialog', { name: 'Final box score' })

    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('http://localhost:5000/api/games/finalize')
    expect(options.method).toBe('POST')
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' })

    const expectedPlayers = [{
      id: 'p1',
      team: 'Team A',
      jersey: '3',
      name: 'Marcus',
      pts: 2,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      to: 0,
      photos: [
        'data:image/jpeg;base64,bWFyY3VzLTE=',
        'data:image/jpeg;base64,bWFyY3VzLTI=',
        'data:image/jpeg;base64,bWFyY3VzLTM=',
      ],
    }]

    expect(JSON.parse(options.body)).toEqual({
      gameId: 'game-101',
      status: 'COMPLETED',
      startedAt: expect.stringMatching(/^\d{4}-\d\d-\d\dT/),
      completedAt: expect.stringMatching(/^\d{4}-\d\d-\d\dT/),
      location: 'Marietta Rec League',
      events: [{
        period: 'Q1',
        playerId: 'p1',
        action: 'PTS_2',
        timestamp: expect.stringMatching(/^\d{4}-\d\d-\d\dT/),
        gameClockSeconds: 0,
        resultingScore: { teamA: 2, teamB: 0 },
      }],
      teamA: { name: 'Red Team', score: 2, logo: 'data:image/png;base64,aG9tZQ==' },
      teamB: { name: 'Blue Team', score: 0, logo: 'data:image/webp;base64,YXdheQ==' },
      players: expectedPlayers,
    })
    expect(await screen.findByAltText('Generated flyer 1')).toBeTruthy()
    expect(screen.getAllByRole('img', { name: 'QR code to download the flyer' })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Or open the download link' }).getAttribute('href'))
      .toBe('https://api.scorekings.example/games/game-101/flyer/download')
  })
})

describe('game state', () => {
  it('updates team titles and logo labels as team names are typed', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Game setup/ }))

    const teamNameInputs = screen.getAllByRole('textbox', { name: 'Team name' })
    await user.clear(teamNameInputs[0])
    await user.type(teamNameInputs[0], 'Falcons')
    await user.clear(teamNameInputs[1])
    await user.type(teamNameInputs[1], 'Wolves')

    expect(screen.getAllByText('Falcons').length).toBeGreaterThan(1)
    expect(screen.getByText('Wolves')).toBeTruthy()
    expect(screen.getByText(/#3 · Falcons/)).toBeTruthy()
    expect(screen.getByLabelText('Falcons logo upload')).toBeTruthy()
    expect(screen.getByLabelText('Wolves logo upload')).toBeTruthy()
  })

  it('keeps the live board focused on one athlete and exposes no roster switching', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Marcus' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Jordan|DeAndre|Darius/ })).toBeNull()
    expect(screen.getByRole('button', { name: /\+2/ }).hasAttribute('disabled')).toBe(false)
  })

  it('restores game details, active player, stats, and events after remount', async () => {
    const user = userEvent.setup()
    const firstRender = render(<App />)
    await user.click(screen.getByRole('button', { name: /\+2/ }))
    await user.click(screen.getByRole('button', { name: /Game setup/ }))
    const teamAName = screen.getAllByRole('textbox', { name: 'Team name' })[0]
    await user.clear(teamAName)
    await user.type(teamAName, 'Falcons')
    await user.click(screen.getByRole('button', { name: /Back to game/ }))

    expect(window.localStorage.getItem('scorekings-game-state-v1')).toBeTruthy()
    firstRender.unmount()

    const { container } = render(<App />)
    expect(container.querySelector('.score-team-a .athlete-team-name').textContent).toContain('Falcons')
    expect(container.querySelector('.athlete-score-total .score-number').textContent).toBe('2')
    expect(container.querySelector('.active-player-copy strong').textContent).toBe('Marcus')
    expect(screen.getByRole('heading', { name: 'Marcus' })).toBeTruthy()
    expect(container.querySelector('.athlete-stat-grid').textContent).toContain('2')
  })

  it('clears saved data and resets the board only when Reset Board is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(screen.getByRole('button', { name: /\+2/ }))
    expect(window.localStorage.getItem('scorekings-game-state-v1')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Reset Board' }))

    expect(window.localStorage.getItem('scorekings-game-state-v1')).toBeNull()
    expect(container.querySelector('.score-team-a .athlete-team-name').textContent).toContain('Red Team')
    expect(container.querySelector('.athlete-score-total .score-number').textContent).toBe('0')
    expect(screen.getByRole('heading', { name: 'Marcus' })).toBeTruthy()
  })
})
