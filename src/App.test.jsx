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
  return userEvent.setup().click(screen.getByRole('button', { name: 'Game settings' }))
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
    const { container } = render(<App />)

    const scoreboard = container.querySelector('.scoreboard')
    expect(scoreboard.textContent).not.toContain('TRACKING ONE ATHLETE')
    expect(scoreboard.textContent).not.toContain('ATHLETE POINTS')
    expect(scoreboard.textContent).not.toContain('Marcus')
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

  it('applies an optional countdown and can return to count-up mode', async () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Game settings' }))

    fireEvent.click(screen.getByRole('switch', { name: 'Enable custom countdown' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Custom countdown duration (MM:SS)' }), {
      target: { value: '00:02' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply clock settings' }))
    expect(screen.getByText('00:02')).toBeTruthy()
    expect(screen.getByRole('switch', { name: 'Enable custom countdown' }).checked).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: /Back to game/ }))

    fireEvent.click(screen.getByRole('button', { name: 'Start game clock' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(screen.getByText('00:01')).toBeTruthy()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(screen.getByText('00:00')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Start game clock' }).textContent).toBe('Start')

    fireEvent.click(screen.getByRole('button', { name: 'Game settings' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Enable custom countdown' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply clock settings' }))
    fireEvent.click(screen.getByRole('button', { name: /Back to game/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Start game clock' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(screen.getByText('00:01')).toBeTruthy()
  })

  it('rejects invalid custom countdown durations without changing the clock', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Game settings' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Enable custom countdown' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Custom countdown duration (MM:SS)' }), {
      target: { value: '00:00' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply clock settings' }))

    expect(screen.getByRole('alert').textContent).toContain('Enter a duration')
    expect(screen.getByText('00:00')).toBeTruthy()
    expect(JSON.parse(window.localStorage.getItem('scorekings-game-state-v1')).customClockEnabled).toBe(false)
  })

  it('persists custom countdown settings across a page reload', () => {
    const firstRender = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Game settings' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Enable custom countdown' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Custom countdown duration (MM:SS)' }), {
      target: { value: '01:15' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply clock settings' }))
    expect(JSON.parse(window.localStorage.getItem('scorekings-game-state-v1'))).toMatchObject({
      version: 2,
      customClockEnabled: true,
      customClockDurationSeconds: 75,
      clockSeconds: 75,
    })

    firstRender.unmount()
    render(<App />)
    expect(screen.getByText('01:15')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Game settings' }))
    expect(screen.getByRole('switch', { name: 'Enable custom countdown' }).checked).toBe(true)
    expect(screen.getByRole('textbox', { name: 'Custom countdown duration (MM:SS)' }).value).toBe('01:15')
  })

  it('lets the user change periods and records the selected period on events', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Current game period' }), 'Q3')
    await user.click(screen.getByRole('button', { name: 'Game settings' }))
    expect(screen.queryByLabelText('Quarter / period')).toBeNull()
    await user.click(screen.getByRole('button', { name: /Back to game/ }))
    await user.click(screen.getByRole('button', { name: /REBREBOUND/ }))
    await user.click(screen.getByRole('button', { name: /Finalize game/ }))
    await screen.findByRole('dialog', { name: 'Final box score' })

    const payload = JSON.parse(fetch.mock.calls[0][1].body)
    expect(payload.events[0].period).toBe('Q3')
  })

  it('sends the exact JSON payload with selected images and displays returned flyers', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Game settings' }))

    await user.upload(screen.getByLabelText('Red Team logo upload'), uploadedImage('home.png', 'image/png', 'home'))
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
      teamB: { name: 'Blue Team', score: 0 },
      players: expectedPlayers,
    })
    expect(await screen.findByAltText('Generated flyer 1')).toBeTruthy()
    expect(screen.getAllByRole('img', { name: 'QR code to download the flyer' })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Or open the download link' }).getAttribute('href'))
      .toBe('https://api.scorekings.example/games/game-101/flyer/download')
  })
})

describe('game state', () => {
  it('uses the top clock strip without branding header or footer banners', () => {
    const { container } = render(<App />)
    const scoreboard = container.querySelector('.scoreboard')
    const mainContent = container.querySelector('.main-content')

    expect(container.querySelector('header')).toBeNull()
    expect(container.querySelector('footer')).toBeNull()
    expect(scoreboard.compareDocumentPosition(mainContent) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Game settings' })).toBeTruthy()
  })

  it('updates team titles and logo labels as team names are typed', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Game settings' }))

    const teamNameInput = screen.getByRole('textbox', { name: 'Team name' })
    expect(screen.getAllByRole('textbox', { name: 'Team name' })).toHaveLength(1)
    await user.clear(teamNameInput)
    await user.type(teamNameInput, 'Falcons')

    expect(screen.getAllByText('Falcons').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Falcons').length).toBeGreaterThan(1)
    expect(screen.getByLabelText('Falcons logo upload')).toBeTruthy()
    expect(screen.getAllByRole('textbox', { name: 'Team name' })).toHaveLength(1)
    expect(screen.queryByRole('combobox', { name: 'Team' })).toBeNull()
  })

  it('keeps the live board focused on one athlete and exposes no roster switching', async () => {
    const { container } = render(<App />)
    expect(container.querySelector('.active-player-copy strong').textContent).toBe('Marcus')
    expect(container.querySelector('.roster-section')).toBeNull()
    expect(container.querySelectorAll('.active-stat')).toHaveLength(6)
    expect(screen.queryByRole('button', { name: /Jordan|DeAndre|Darius/ })).toBeNull()
    expect(screen.getByRole('button', { name: /\+2/ }).hasAttribute('disabled')).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: /\+2/ }))
    fireEvent.click(screen.getByRole('button', { name: /REBREBOUND/ }))
    expect([...container.querySelectorAll('.active-stat strong')].map((stat) => stat.textContent))
      .toEqual(['2', '1', '0', '0', '0', '0'])
  })

  it('restores game details, active player, stats, and events after remount', async () => {
    const user = userEvent.setup()
    const firstRender = render(<App />)
    await user.click(screen.getByRole('button', { name: /\+2/ }))
    await user.click(screen.getByRole('button', { name: 'Game settings' }))
    const teamAName = screen.getByRole('textbox', { name: 'Team name' })
    await user.clear(teamAName)
    await user.type(teamAName, 'Falcons')
    await user.click(screen.getByRole('button', { name: /Back to game/ }))

    expect(window.localStorage.getItem('scorekings-game-state-v1')).toBeTruthy()
    firstRender.unmount()

    const { container } = render(<App />)
    expect(container.querySelector('.active-player-copy > span:last-child').textContent).toBe('Falcons')
    expect(container.querySelector('.active-player-copy strong').textContent).toBe('Marcus')
    expect(container.querySelector('.active-stats').textContent).toContain('2PTS')
    expect(container.querySelector('.roster-section')).toBeNull()
  })

  it('clears saved data and resets the board only when Reset Board is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(screen.getByRole('button', { name: /\+2/ }))
    expect(window.localStorage.getItem('scorekings-game-state-v1')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Reset Board' }))

    expect(window.localStorage.getItem('scorekings-game-state-v1')).toBeNull()
    expect(container.querySelector('.active-player-copy > span:last-child').textContent).toBe('Red Team')
    expect(container.querySelector('.active-player-copy strong').textContent).toBe('Marcus')
  })
})
