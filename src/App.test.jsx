import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

const uploadedImage = (name = 'photo.png', type = 'image/png', contents = 'image-bytes') =>
  new File([contents], name, { type })

function openSetup() {
  render(<App />)
  return userEvent.setup().click(screen.getByRole('button', { name: /Game setup/ }))
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => JSON.stringify({ graphics: [{ publicUrl: '/flyer.png' }] }),
  })))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('flyer image uploads', () => {
  it('previews a selected image and removes it', async () => {
    await openSetup()
    const user = userEvent.setup()
    const input = screen.getByLabelText('Marcus photo upload')
    await user.upload(input, uploadedImage())

    const preview = await screen.findByAltText('Marcus photo preview')
    expect(preview.getAttribute('src')).toMatch(/^data:image\/png;base64,/)
    expect(screen.getAllByText('PNG, JPEG, or WebP · up to 5 MB').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Replace' }))
    await user.upload(input, uploadedImage('replacement.webp', 'image/webp', 'replacement'))
    expect((await screen.findByAltText('Marcus photo preview')).getAttribute('src')).toBe('data:image/webp;base64,cmVwbGFjZW1lbnQ=')

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(screen.queryByAltText('Marcus photo preview')).toBeNull()
  })

  it('shows inline validation for unsupported types and files over 5 MB', async () => {
    await openSetup()
    const input = screen.getByLabelText('Marcus photo upload')
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
    await user.click(screen.getByRole('button', { name: /Marcus/ }))
    await user.click(screen.getByRole('button', { name: /\+2/ }))
    await user.click(screen.getByRole('button', { name: /Finalize game/ }))

    expect(await screen.findByText('Marcus needs a photo for their flyer.')).toBeTruthy()
    expect(screen.getByText('Red Team needs a logo for its flyer.')).toBeTruthy()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('sends the exact JSON payload with selected images and displays returned flyers', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Game setup/ }))

    await user.upload(screen.getByLabelText('Team A logo upload'), uploadedImage('home.png', 'image/png', 'home'))
    await user.upload(screen.getByLabelText('Team B logo upload'), uploadedImage('away.webp', 'image/webp', 'away'))
    await user.upload(screen.getByLabelText('Marcus photo upload'), uploadedImage('marcus.jpg', 'image/jpeg', 'marcus'))
    await user.click(screen.getByRole('button', { name: /Back to game/ }))
    await user.click(screen.getByRole('button', { name: /Marcus/ }))
    await user.click(screen.getByRole('button', { name: /\+2/ }))
    await user.click(screen.getByRole('button', { name: /Finalize game/ }))
    await screen.findByRole('dialog', { name: 'Final box score' })

    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('http://localhost:5000/api/games/finalize')
    expect(options.method).toBe('POST')
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' })

    const expectedPlayers = [
      ['p1', 'Team A', '3', 'Marcus', 2],
      ['p2', 'Team A', '11', 'Jordan', 0],
      ['p3', 'Team A', '24', 'DeAndre', 0],
      ['p4', 'Team A', '8', 'Chris', 0],
      ['p5', 'Team A', '15', 'Eli', 0],
      ['p6', 'Team B', '2', 'Darius', 0],
      ['p7', 'Team B', '7', 'Cameron', 0],
      ['p8', 'Team B', '13', 'Malik', 0],
      ['p9', 'Team B', '21', 'Andre', 0],
      ['p10', 'Team B', '5', 'Noah', 0],
    ].map(([id, team, jersey, name, pts]) => ({
      id,
      team,
      jersey,
      name,
      pts,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      to: 0,
      ...(id === 'p1' ? { photo: 'data:image/jpeg;base64,bWFyY3Vz' } : {}),
    }))

    expect(JSON.parse(options.body)).toEqual({
      gameId: 'game-101',
      location: 'Marietta Rec League',
      teamA: { name: 'Red Team', score: 2, logo: 'data:image/png;base64,aG9tZQ==' },
      teamB: { name: 'Blue Team', score: 0, logo: 'data:image/webp;base64,YXdheQ==' },
      players: expectedPlayers,
    })
    expect(await screen.findByAltText('Generated flyer 1')).toBeTruthy()
  })
})
