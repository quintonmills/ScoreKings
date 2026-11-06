import { useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createFinalizePayload, getFlyerPlayers, isFinalizePayloadWithinLimit, MAX_IMAGE_SIZE_BYTES } from './gamePayload.js'
import './App.css'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '')
  || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://servercore-pjwe.onrender.com')
const finalizeEndpoint = apiBaseUrl ? `${apiBaseUrl}/api/games/finalize` : ''
const GAME_STORAGE_KEY = 'scorekings-game-state-v1'

const initialGame = {
  teamA: 'Red Team',
  teamB: 'Blue Team',
  location: 'Marietta Rec League',
  period: 'Q1',
}

const initialPlayer = {
  id: 'p1',
  team: 'Team A',
  jersey: '3',
  name: 'Marcus',
  pts: 0,
  reb: 0,
  ast: 0,
  stl: 0,
  blk: 0,
  to: 0,
}

function loadGameState() {
  try {
    const savedState = window.localStorage.getItem(GAME_STORAGE_KEY)
    if (!savedState) return { storageError: '' }

    const parsedState = JSON.parse(savedState)
    if (
      parsedState.version !== 1
      || !parsedState.game
      || !Array.isArray(parsedState.players)
      || !parsedState.assets?.teams
      || !Array.isArray(parsedState.events)
      || !Array.isArray(parsedState.history)
      || typeof parsedState.startedAt !== 'string'
      || !Number.isFinite(parsedState.clockSeconds)
    ) {
      throw new Error('Saved game state has an unsupported format.')
    }

    const savedPlayer = parsedState.players.find((player) => player.id === parsedState.activePlayerId)
      || parsedState.players.find((player) => player.pts || player.reb || player.ast || player.stl || player.blk || player.to)
      || parsedState.players[0]
      || initialPlayer
    const playerId = savedPlayer.id

    return {
      ...parsedState,
      players: [savedPlayer],
      activePlayerId: playerId,
      events: parsedState.events.filter((event) => event.playerId === playerId),
      history: parsedState.history.filter((action) => action.playerId === playerId),
      assets: {
        ...parsedState.assets,
        players: parsedState.assets.players?.[playerId]
          ? { [playerId]: parsedState.assets.players[playerId] }
          : {},
      },
      storageError: '',
    }
  } catch {
    return {
      storageError: 'Saved game data could not be loaded. Reset the board to start a new game.',
    }
  }
}

const actions = [
  { label: '+2', detail: '2 POINTS', stat: 'pts', amount: 2, style: 'score-action' },
  { label: '+3', detail: '3 POINTS', stat: 'pts', amount: 3, style: 'score-action' },
  { label: '+1', detail: 'FREE THROW', stat: 'pts', amount: 1, style: 'score-action' },
  { label: 'REB', detail: 'REBOUND', stat: 'reb', amount: 1 },
  { label: 'AST', detail: 'ASSIST', stat: 'ast', amount: 1 },
  { label: 'STL', detail: 'STEAL', stat: 'stl', amount: 1 },
  { label: 'BLK', detail: 'BLOCK', stat: 'blk', amount: 1 },
  { label: 'TO', detail: 'TURNOVER', stat: 'to', amount: 1 },
]

function getScore(players, team) {
  return players
    .filter((player) => player.team === team)
    .reduce((total, player) => total + player.pts, 0)
}

function formatGameClock(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

function ImageUpload({ id, label, image, onImageChange, requiredMessage }) {
  const inputRef = useRef(null)
  const [validationMessage, setValidationMessage] = useState('')

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setValidationMessage('Choose a PNG, JPEG, or WebP image.')
      event.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setValidationMessage('Choose an image that is 5 MB or smaller.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setValidationMessage('The selected image could not be read. Try another file.')
        return
      }
      onImageChange(reader.result)
      setValidationMessage('')
    }
    reader.onerror = () => {
      setValidationMessage('The selected image could not be read. Try another file.')
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    onImageChange(null)
    setValidationMessage('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="image-upload">
      <label className="image-upload-label" htmlFor={id}>{label}</label>
      <p id={`${id}-guidance`} className="image-upload-guidance">PNG, JPEG, or WebP · up to 5 MB</p>
      {image && (
        <div className="image-preview">
          <img src={image} alt={`${label} preview`} />
          <div className="image-preview-actions">
            <button
              type="button"
              onClick={() => {
                if (inputRef.current) inputRef.current.value = ''
                inputRef.current?.click()
              }}
            >
              Replace
            </button>
            <button type="button" onClick={removeImage}>Remove</button>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        id={id}
        className="image-file-input"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-label={`${label} upload`}
        aria-describedby={`${id}-guidance`}
        aria-invalid={Boolean(validationMessage || requiredMessage)}
        onChange={handleFileChange}
      />
      {(validationMessage || requiredMessage) && (
        <p className="image-upload-error" role="alert">{validationMessage || requiredMessage}</p>
      )}
    </div>
  )
}

function TeamEditor({ team, teamKey, title, logo, onLogoChange, requiredLogoMessage, onTeamNameChange }) {
  return (
    <section className="team-editor">
      <div className="editor-heading">
        <span className={`team-dot ${team === 'Team A' ? 'team-a-dot' : 'team-b-dot'}`} />
        <h3>{title}</h3>
      </div>
      <label className="field-label">
        Team name
        <input
          value={title}
          onChange={(event) => onTeamNameChange(event.target.value)}
          placeholder="Team name"
        />
      </label>
      <ImageUpload
        id={`${teamKey}-logo`}
        label={`${title} logo`}
        image={logo}
        onImageChange={onLogoChange}
        requiredMessage={requiredLogoMessage}
      />
    </section>
  )
}

function AthleteEditor({ player, playerImages, requiredPlayerMessages, onPlayerChange, onPlayerImageChange }) {
  return (
    <section className="athlete-editor" aria-labelledby="athlete-details-title">
      <div className="editor-heading">
        <h3 id="athlete-details-title">Athlete details</h3>
      </div>
      <div className="game-fields athlete-fields">
        <label className="field-label">
          Athlete name
          <input value={player.name} onChange={(event) => onPlayerChange('name', event.target.value)} />
        </label>
        <label className="field-label">
          Jersey number
          <input value={player.jersey} onChange={(event) => onPlayerChange('jersey', event.target.value)} />
        </label>
        <label className="field-label">
          Team
          <select value={player.team} onChange={(event) => onPlayerChange('team', event.target.value)}>
            <option value="Team A">Team A</option>
            <option value="Team B">Team B</option>
          </select>
        </label>
      </div>
      {[0, 1, 2].map((index) => (
        <ImageUpload
          key={`${player.id}-photo-${index + 1}`}
          id={`player-${player.id}-photo-${index + 1}`}
          label={`${player.name || 'Unnamed athlete'} reference photo ${index + 1}`}
          image={playerImages[player.id]?.[index]}
          onImageChange={(image) => onPlayerImageChange(image, index)}
          requiredMessage={requiredPlayerMessages[index]}
        />
      ))}
    </section>
  )
}

function getFlyerDownloadUrl(graphic) {
  const candidate = graphic.downloadUrl || graphic.publicUrl
  if (typeof candidate !== 'string' || !candidate) return null

  try {
    const url = new URL(candidate, apiBaseUrl)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

function SetupModal({ game, player, assets, requiredAssets, onAssetChange, onGameChange, onPlayerChange, onClose }) {
  const teamKey = player.team === 'Team A' ? 'teamA' : 'teamB'

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal setup-modal" role="dialog" aria-modal="true" aria-labelledby="setup-title">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">BEFORE TIP-OFF</span>
            <h2 id="setup-title">Game setup</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close setup">×</button>
        </div>
        <div className="game-fields setup-game-fields">
          <label className="field-label">
            Location
            <input value={game.location} onChange={(event) => onGameChange({ ...game, location: event.target.value })} />
          </label>
        </div>
        <AthleteEditor
          player={player}
          playerImages={assets.players}
          requiredPlayerMessages={requiredAssets.players[player.id] || []}
          onPlayerChange={onPlayerChange}
          onPlayerImageChange={(image, index) => onAssetChange(player.id, image, index)}
        />
        <div className="team-editors">
          <TeamEditor
            key={teamKey}
            team={player.team}
            teamKey={teamKey}
            title={game[teamKey]}
            logo={assets.teams[teamKey]}
            onLogoChange={(image) => onAssetChange(teamKey, image)}
            requiredLogoMessage={requiredAssets.teams[teamKey]}
            onTeamNameChange={(value) => onGameChange((currentGame) => ({ ...currentGame, [teamKey]: value }))}
          />
        </div>
        <div className="modal-footer">
          <span>Changes are saved to this game immediately.</span>
          <button type="button" className="primary-button" onClick={onClose}>Back to game <span>→</span></button>
        </div>
      </section>
    </div>
  )
}

function FinalizeModal({ payload, graphics, requestState, requestMessage, onRetry, onClose }) {
  const firstFlyer = graphics[0]
  const downloadUrl = firstFlyer ? getFlyerDownloadUrl(firstFlyer) : null

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal finalize-modal" role="dialog" aria-modal="true" aria-labelledby="finalize-title">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">GAME COMPLETE</span>
            <h2 id="finalize-title">Final box score</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close final score">×</button>
        </div>
        <div className={`request-status status-${requestState}`} role="status">
          <span className="status-indicator" />
          <div>
            <strong>{requestState === 'sending' ? 'Sending game data' : requestState === 'success' ? 'Game sent successfully' : 'Could not reach backend'}</strong>
            <p>{requestMessage}</p>
          </div>
          {requestState === 'error' && <button type="button" className="retry-button" onClick={onRetry}>Retry</button>}
        </div>
        <div className="payload-heading">
          <span>API PAYLOAD</span>
          <code>POST /api/games/finalize</code>
        </div>
        <pre className="payload-code">{JSON.stringify(payload, null, 2)}</pre>
        {graphics.length > 0 && (
          <section className="generated-flyers" aria-label="Generated flyers">
            <h3>Generated flyers</h3>
            {downloadUrl ? (
              <div className="flyer-download">
                <div className="flyer-qr">
                  <QRCodeSVG
                    value={downloadUrl}
                    size={176}
                    level="M"
                    marginSize={4}
                    role="img"
                    aria-label="QR code to download the flyer"
                  />
                </div>
                <div className="flyer-download-copy">
                  <strong>Scan to download the flyer</strong>
                  <span>Open your phone’s camera and point it at the code.</span>
                  <a href={downloadUrl} target="_blank" rel="noreferrer">Or open the download link</a>
                </div>
              </div>
            ) : (
              <p className="flyer-qr-unavailable" role="status">
                A QR code is unavailable because the server did not return a valid flyer URL.
              </p>
            )}
            <div className="generated-flyer-list">
              {graphics.map((graphic, index) => (
                <a key={`${graphic.publicUrl}-${index}`} href={graphic.publicUrl} target="_blank" rel="noreferrer">
                  <img src={graphic.publicUrl} alt={`Generated flyer ${index + 1}`} />
                  <span>Open flyer {index + 1}</span>
                </a>
              ))}
            </div>
          </section>
        )}
        <div className="modal-footer">
          <span>Ready for your ScoreKings backend.</span>
          <button type="button" className="primary-button" onClick={onClose}>Done <span>✓</span></button>
        </div>
      </section>
    </div>
  )
}

function App() {
  const [loadedState] = useState(loadGameState)
  const [game, setGame] = useState(() => loadedState.game || initialGame)
  const [players, setPlayers] = useState(() => loadedState.players || [{ ...initialPlayer }])
  const [assets, setAssets] = useState(() => loadedState.assets || { teams: { teamA: null, teamB: null }, players: {} })
  const [events, setEvents] = useState(() => loadedState.events || [])
  const [startedAt, setStartedAt] = useState(() => loadedState.startedAt || new Date().toISOString())
  const [clockSeconds, setClockSeconds] = useState(() => loadedState.clockSeconds || 0)
  const [isClockRunning, setIsClockRunning] = useState(false)
  const [history, setHistory] = useState(() => loadedState.history || [])
  const [showSetup, setShowSetup] = useState(false)
  const [payload, setPayload] = useState(null)
  const [requestState, setRequestState] = useState('idle')
  const [requestMessage, setRequestMessage] = useState('')
  const [generatedFlyers, setGeneratedFlyers] = useState([])
  const [showAssetValidation, setShowAssetValidation] = useState(false)
  const [storageMessage, setStorageMessage] = useState(loadedState.storageError)
  const [saveRevision, setSaveRevision] = useState(0)
  const skipNextSave = useRef(Boolean(loadedState.storageError))

  useEffect(() => {
    if (!isClockRunning) return undefined
    const intervalId = window.setInterval(() => {
      setClockSeconds((seconds) => seconds + 1)
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [isClockRunning])

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }

    try {
      window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify({
        version: 1,
        game,
        players,
        assets,
        activePlayerId: players[0]?.id || null,
        events,
        startedAt,
        clockSeconds,
        history,
      }))
      setStorageMessage('')
    } catch {
      setStorageMessage('Game data could not be saved in this browser. Check available storage or remove large images.')
    }
  }, [game, players, assets, events, startedAt, clockSeconds, history, saveRevision])

  const activePlayer = players[0]
  const teamAScore = getScore(players, 'Team A')
  const teamBScore = getScore(players, 'Team B')
  const flyerPlayers = useMemo(() => getFlyerPlayers(players), [players])
  const requiredAssets = { teams: {}, players: {} }
  for (const player of flyerPlayers) {
    requiredAssets.players[player.id] = [0, 1, 2].map((photoIndex) =>
      assets.players[player.id]?.[photoIndex]
        ? ''
        : `${player.name || 'Unnamed player'} needs reference photo ${photoIndex + 1} for the flyer.`,
    )
    const teamKey = player.team === 'Team A' ? 'teamA' : 'teamB'
    if (!assets.teams[teamKey]) requiredAssets.teams[teamKey] = `${player.team === 'Team A' ? game.teamA : game.teamB} needs a logo for its flyer.`
  }
  const missingAssetMessages = [
    ...Object.values(requiredAssets.players).flat().filter(Boolean),
    ...new Set(Object.values(requiredAssets.teams)),
  ]

  const recordAction = (action) => {
    if (!activePlayer) return
    const timestamp = new Date().toISOString()
    const points = action.stat === 'pts' ? action.amount : 0
    const resultingScore = {
      teamA: teamAScore + (activePlayer.team === 'Team A' ? points : 0),
      teamB: teamBScore + (activePlayer.team === 'Team B' ? points : 0),
    }
    setPlayers((currentPlayers) => currentPlayers.map((player) =>
      player.id === activePlayer.id
        ? { ...player, [action.stat]: player[action.stat] + action.amount }
        : player,
    ))
    setEvents((currentEvents) => [...currentEvents, {
      period: game.period,
      playerId: activePlayer.id,
      action: action.stat === 'pts' ? `PTS_${action.amount}` : action.stat.toUpperCase(),
      timestamp,
      gameClockSeconds: clockSeconds,
      resultingScore,
    }])
    setHistory((currentHistory) => [...currentHistory, {
      playerId: activePlayer.id,
      stat: action.stat,
      amount: action.amount,
    }])
  }

  const undoAction = () => {
    const lastAction = history.at(-1)
    if (!lastAction) return
    setPlayers((currentPlayers) => currentPlayers.map((player) =>
      player.id === lastAction.playerId
        ? { ...player, [lastAction.stat]: player[lastAction.stat] - lastAction.amount }
        : player,
    ))
    setHistory((currentHistory) => currentHistory.slice(0, -1))
    setEvents((currentEvents) => currentEvents.slice(0, -1))
  }

  const updatePlayer = (key, value) => {
    setPlayers((currentPlayers) => currentPlayers.map((player) => ({ ...player, [key]: value })))
  }

  const updateAsset = (key, image, photoIndex) => {
    setAssets((currentAssets) => {
      if (key === 'teamA' || key === 'teamB') {
        return { ...currentAssets, teams: { ...currentAssets.teams, [key]: image } }
      }
      const playersWithImage = { ...currentAssets.players }
      const playerImages = [...(playersWithImage[key] || [null, null, null])]
      playerImages[photoIndex] = image
      playersWithImage[key] = playerImages
      return { ...currentAssets, players: playersWithImage }
    })
  }

  const resetBoard = () => {
    try {
      window.localStorage.removeItem(GAME_STORAGE_KEY)
      skipNextSave.current = true
      setStorageMessage('')
    } catch {
      setStorageMessage('Saved game data could not be cleared. The board will still reset, but saved data may return after refresh.')
    }
    setGame(initialGame)
    setPlayers([{ ...initialPlayer }])
    setAssets({ teams: { teamA: null, teamB: null }, players: {} })
    setEvents([])
    setStartedAt(new Date().toISOString())
    setClockSeconds(0)
    setIsClockRunning(false)
    setHistory([])
    setSaveRevision((revision) => revision + 1)
    setShowSetup(false)
    setPayload(null)
    setRequestState('idle')
    setRequestMessage('')
    setGeneratedFlyers([])
    setShowAssetValidation(false)
  }

  const sendPayload = async (nextPayload) => {
    setRequestState('sending')
    if (!finalizeEndpoint) {
      setRequestState('error')
      setRequestMessage('Set VITE_API_BASE_URL to your deployed backend URL in Render, then redeploy the frontend.')
      return
    }
    setRequestMessage(`Posting to ${finalizeEndpoint}…`)
    try {
      const response = await fetch(finalizeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextPayload),
      })
      if (!response.ok) {
        setRequestState('error')
        setRequestMessage(`The server responded with ${response.status} ${response.statusText || ''}.`.trim())
        return
      }
      const responseText = await response.text()
      let responseBody = null
      if (responseText.trim()) {
        try {
          responseBody = JSON.parse(responseText)
        } catch {
          setGeneratedFlyers([])
          setRequestState('success')
          setRequestMessage('The game was accepted, but the server returned an unreadable flyer response.')
          return
        }
      }
      const graphics = Array.isArray(responseBody?.graphics)
        ? responseBody.graphics.filter((graphic) => typeof graphic?.publicUrl === 'string' && graphic.publicUrl.length > 0)
        : []
      setGeneratedFlyers(graphics)
      setRequestState('success')
      setRequestMessage(graphics.length > 0
        ? 'The game was accepted and your flyers are ready.'
        : 'The final box score was accepted by the server.')
    } catch (error) {
      setRequestState('error')
      setRequestMessage(error instanceof Error ? error.message : 'The request failed. Check that the backend is running.')
    }
  }

  const finalizeGame = () => {
    setShowAssetValidation(true)
    if (missingAssetMessages.length > 0) return

    const nextPayload = createFinalizePayload({
      game,
      players,
      assets,
      teamAScore,
      teamBScore,
      events,
      startedAt,
      completedAt: new Date().toISOString(),
    })
    if (!isFinalizePayloadWithinLimit(nextPayload)) {
      setRequestState('error')
      setRequestMessage('The selected images make the game request too large. Remove or replace images so the JSON stays below 14 MB.')
      return
    }
    setGeneratedFlyers([])
    setPayload(nextPayload)
    setRequestState('sending')
    setRequestMessage(finalizeEndpoint
      ? `Posting to ${finalizeEndpoint}…`
      : 'Connecting to the configured backend…')
    void sendPayload(nextPayload)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#game" aria-label="ScoreKings home">
          <span className="brand-mark">SK</span>
          <span>SCORE<span className="brand-light">KINGS</span></span>
          <span className="brand-divider" />
          <span className="brand-caption">COURTSIDE</span>
        </a>
        <div className="topbar-right">
          <span className="live-pill"><span /> LIVE GAME</span>
          <button type="button" className="setup-button" onClick={() => setShowSetup(true)}>
            <span className="setup-icon">☷</span> Game setup
          </button>
        </div>
      </header>
      {storageMessage && <p className="storage-warning" role="alert">{storageMessage}</p>}

      <section className="scoreboard" id="game" aria-label="Live scoreboard">
        <div className="score-team score-team-a">
          <span className="team-label">TRACKING ONE ATHLETE</span>
          <span className="score-team-name">{activePlayer.name || 'Unnamed athlete'}</span>
          <span className="athlete-team-name">
            #{activePlayer.jersey || '—'} · {activePlayer.team === 'Team A' ? game.teamA : game.teamB}
          </span>
        </div>
        <div className="score-center">
          <label className="period-selector-label">
            <span className="visually-hidden">Current game period</span>
            <select
              className="period-selector"
              value={game.period}
              onChange={(event) => setGame((currentGame) => ({ ...currentGame, period: event.target.value }))}
              aria-label="Current game period"
            >
              {['Q1', 'Q2', 'Q3', 'Q4', 'OT1', 'OT2'].map((period) => <option key={period}>{period}</option>)}
            </select>
          </label>
          <span className="score-separator">:</span>
          <div className="game-clock">
            <span className={`clock-dot ${isClockRunning ? 'is-running' : ''}`} />
            {formatGameClock(clockSeconds)}
          </div>
          <span className="clock-caption">GAME CLOCK</span>
          <button
            className="clock-control"
            type="button"
            onClick={() => setIsClockRunning((running) => !running)}
            aria-label={isClockRunning ? 'Pause game clock' : 'Start game clock'}
          >
            {isClockRunning ? 'Pause' : clockSeconds > 0 ? 'Resume' : 'Start'}
          </button>
        </div>
        <div className="score-team score-team-b athlete-score-total">
          <span className="team-label">ATHLETE POINTS</span>
          <span className="score-number">{activePlayer.pts}</span>
        </div>
        <div className="scoreboard-location"><span>⌖</span> {game.location}</div>
      </section>

      <div className="main-content">
        <section className="roster-section" aria-label="Single athlete stats">
          <div className="section-heading">
            <div>
              <span className="eyebrow">LIVE ATHLETE BOX SCORE</span>
              <h1>{activePlayer.name || 'Unnamed athlete'}</h1>
            </div>
          </div>
          <div className="athlete-stat-grid" aria-label={`${activePlayer.name || 'Athlete'} stats`}>
            {[
              ['PTS', activePlayer.pts],
              ['REB', activePlayer.reb],
              ['AST', activePlayer.ast],
              ['STL', activePlayer.stl],
              ['BLK', activePlayer.blk],
              ['TO', activePlayer.to],
            ].map(([label, value]) => (
              <div className="athlete-stat" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="action-dock" aria-label="Stat actions">
          <div className="active-player-panel">
            <span className="active-avatar">{activePlayer ? `#${activePlayer.jersey || '—'}` : '—'}</span>
            <div className="active-player-copy">
              <strong>{activePlayer.name || 'Unnamed athlete'}</strong>
              <span>{activePlayer.team === 'Team A' ? game.teamA : game.teamB}</span>
            </div>
            {activePlayer && <div className="active-points"><strong>{activePlayer.pts}</strong><span>PTS</span></div>}
          </div>
          <div className="action-buttons">
            {actions.map((action) => (
              <button
                className={`action-button ${action.style || ''}`}
                type="button"
                key={`${action.stat}-${action.amount}`}
                onClick={() => recordAction(action)}
              >
                <strong>{action.label}</strong>
                <span>{action.detail}</span>
              </button>
            ))}
          </div>
          <div className="dock-footer">
            <button className="undo-button" type="button" onClick={undoAction} disabled={history.length === 0}>
              <span>↶</span> Undo last action
            </button>
            <button type="button" className="reset-button" onClick={resetBoard}>Reset Board</button>
            <button className="finalize-button" type="button" onClick={finalizeGame}>
              Finalize game <span>→</span>
            </button>
          </div>
          {showAssetValidation && missingAssetMessages.length > 0 && (
            <div className="finalize-validation" role="alert">
              <strong>Flyer assets are required before finalizing:</strong>
              <ul>
                {missingAssetMessages.map((message) => <li key={message}>{message}</li>)}
              </ul>
              <span>Open Game setup to add the missing images.</span>
            </div>
          )}
          {requestState === 'error' && requestMessage.includes('below 14 MB') && (
            <p className="finalize-validation" role="alert">{requestMessage}</p>
          )}
        </section>
      </div>

      <footer className="app-footer">
        <span>ScoreKings <span className="footer-muted">· Courtside Stat Logger</span></span>
        <span>Changes are recorded live</span>
      </footer>

      {showSetup && (
        <SetupModal
          game={game}
          player={activePlayer}
          assets={assets}
          requiredAssets={showAssetValidation ? requiredAssets : { teams: {}, players: {} }}
          onAssetChange={updateAsset}
          onGameChange={setGame}
          onPlayerChange={updatePlayer}
          onClose={() => setShowSetup(false)}
        />
      )}
      {payload && (
        <FinalizeModal
          payload={payload}
          graphics={generatedFlyers}
          requestState={requestState}
          requestMessage={requestMessage}
          onRetry={() => void sendPayload(payload)}
          onClose={() => setPayload(null)}
        />
      )}
    </main>
  )
}

export default App
