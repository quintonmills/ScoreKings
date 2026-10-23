import { useMemo, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createFinalizePayload, getFlyerPlayers, isFinalizePayloadWithinLimit, MAX_IMAGE_SIZE_BYTES } from './gamePayload.js'
import './App.css'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '')
  || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://servercore-pjwe.onrender.com')
const finalizeEndpoint = apiBaseUrl ? `${apiBaseUrl}/api/games/finalize` : ''

const initialPlayers = [
  { id: 'p1', team: 'Team A', jersey: '3', name: 'Marcus', pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
  { id: 'p2', team: 'Team A', jersey: '11', name: 'Jordan', pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
  { id: 'p3', team: 'Team A', jersey: '24', name: 'DeAndre', pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
  { id: 'p4', team: 'Team A', jersey: '8', name: 'Chris', pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
  { id: 'p5', team: 'Team A', jersey: '15', name: 'Eli', pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
  { id: 'p6', team: 'Team B', jersey: '2', name: 'Darius', pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
  { id: 'p7', team: 'Team B', jersey: '7', name: 'Cameron', pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
  { id: 'p8', team: 'Team B', jersey: '13', name: 'Malik', pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
  { id: 'p9', team: 'Team B', jersey: '21', name: 'Andre', pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
  { id: 'p10', team: 'Team B', jersey: '5', name: 'Noah', pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
]

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

function PlayerCard({ player, active, onSelect }) {
  return (
    <button
      className={`player-card ${active ? 'is-active' : ''}`}
      type="button"
      onClick={onSelect}
      aria-pressed={active}
    >
      <span className="player-number">#{player.jersey || '—'}</span>
      <span className="player-info">
        <span className="player-name">{player.name || 'Unnamed player'}</span>
        <span className="player-stats">
          <span><b>{player.pts}</b> PTS</span>
          <span><b>{player.reb}</b> REB</span>
          <span><b>{player.ast}</b> AST</span>
        </span>
      </span>
      {active && <span className="active-indicator">ACTIVE</span>}
    </button>
  )
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

function RosterEditor({ team, teamKey, title, players, logo, onLogoChange, requiredLogoMessage, playerImages, requiredPlayerMessages, onPlayerImageChange, onChange, onAdd, onRemove }) {
  const roster = players.filter((player) => player.team === team)
  return (
    <section className="roster-editor">
      <div className="editor-heading">
        <span className={`team-dot ${team === 'Team A' ? 'team-a-dot' : 'team-b-dot'}`} />
        <h3>{title}</h3>
        <span className="roster-count">{roster.length} PLAYERS</span>
      </div>
      <label className="field-label">
        Team name
        <input
          value={title}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Team name"
        />
      </label>
      <ImageUpload
        id={`${teamKey}-logo`}
        label={`${teamKey === 'teamA' ? 'Team A' : 'Team B'} logo`}
        image={logo}
        onImageChange={onLogoChange}
        requiredMessage={requiredLogoMessage}
      />
      <div className="roster-list">
        {roster.map((player) => (
          <div className="roster-player" key={player.id}>
            <div className="roster-row">
              <input
                aria-label={`${title} jersey number`}
                value={player.jersey}
                onChange={(event) => onChange(null, player.id, 'jersey', event.target.value)}
                placeholder="#"
              />
              <input
                aria-label={`${title} player name`}
                value={player.name}
                onChange={(event) => onChange(null, player.id, 'name', event.target.value)}
                placeholder="Player name"
              />
              <button className="remove-player" type="button" onClick={() => onRemove(player.id)} aria-label={`Remove ${player.name || 'player'}`}>×</button>
            </div>
            <p className="image-upload-guidance">Add three reference photos; only the top scorer's photos are sent for flyer generation.</p>
            {[0, 1, 2].map((index) => (
              <ImageUpload
                key={`${player.id}-photo-${index + 1}`}
                id={`player-${player.id}-photo-${index + 1}`}
                label={`${player.name || 'Unnamed player'} reference photo ${index + 1}`}
                image={playerImages[player.id]?.[index]}
                onImageChange={(image) => onPlayerImageChange(player.id, image, index)}
                requiredMessage={requiredPlayerMessages[player.id]?.[index]}
              />
            ))}
          </div>
        ))}
      </div>
      <button className="add-player-button" type="button" onClick={() => onAdd(team)}>
        <span>＋</span> Add player
      </button>
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

function SetupModal({ game, players, assets, requiredAssets, onAssetChange, onGameChange, onPlayersChange, onAddPlayer, onRemovePlayer, onClose }) {
  const updateTeam = (team, value) => onGameChange({ ...game, [team === 'Team A' ? 'teamA' : 'teamB']: value })
  const updatePlayer = (teamName, playerId, key, value) => {
    if (playerId) {
      onPlayersChange(players.map((player) => player.id === playerId ? { ...player, [key]: value } : player))
      return
    }
    const team = teamName === game.teamA ? 'Team A' : 'Team B'
    updateTeam(team, teamName)
  }

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
        <div className="game-fields">
          <label className="field-label">
            Location
            <input value={game.location} onChange={(event) => onGameChange({ ...game, location: event.target.value })} />
          </label>
          <label className="field-label">
            Quarter / period
            <select value={game.period} onChange={(event) => onGameChange({ ...game, period: event.target.value })}>
              {['Q1', 'Q2', 'Q3', 'Q4', 'OT1', 'OT2'].map((period) => <option key={period}>{period}</option>)}
            </select>
          </label>
        </div>
        <div className="roster-editors">
          <RosterEditor
            team="Team A"
            teamKey="teamA"
            title={game.teamA}
            players={players}
            logo={assets.teams.teamA}
            onLogoChange={(image) => onAssetChange('teamA', image)}
            requiredLogoMessage={requiredAssets.teams.teamA}
            playerImages={assets.players}
            requiredPlayerMessages={requiredAssets.players}
            onPlayerImageChange={(playerId, image, index) => onAssetChange(playerId, image, index)}
            onChange={updatePlayer}
            onAdd={onAddPlayer}
            onRemove={onRemovePlayer}
          />
          <RosterEditor
            team="Team B"
            teamKey="teamB"
            title={game.teamB}
            players={players}
            logo={assets.teams.teamB}
            onLogoChange={(image) => onAssetChange('teamB', image)}
            requiredLogoMessage={requiredAssets.teams.teamB}
            playerImages={assets.players}
            requiredPlayerMessages={requiredAssets.players}
            onPlayerImageChange={(playerId, image, index) => onAssetChange(playerId, image, index)}
            onChange={updatePlayer}
            onAdd={onAddPlayer}
            onRemove={onRemovePlayer}
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
  const [game, setGame] = useState({
    teamA: 'Red Team',
    teamB: 'Blue Team',
    location: 'Marietta Rec League',
    period: 'Q1',
  })
  const [players, setPlayers] = useState(initialPlayers)
  const [assets, setAssets] = useState({ teams: { teamA: null, teamB: null }, players: {} })
  const [activePlayerId, setActivePlayerId] = useState(null)
  const [history, setHistory] = useState([])
  const [showSetup, setShowSetup] = useState(false)
  const [payload, setPayload] = useState(null)
  const [requestState, setRequestState] = useState('idle')
  const [requestMessage, setRequestMessage] = useState('')
  const [generatedFlyers, setGeneratedFlyers] = useState([])
  const [showAssetValidation, setShowAssetValidation] = useState(false)

  const teamAPlayers = useMemo(() => players.filter((player) => player.team === 'Team A'), [players])
  const teamBPlayers = useMemo(() => players.filter((player) => player.team === 'Team B'), [players])
  const activePlayer = players.find((player) => player.id === activePlayerId)
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
    setPlayers((currentPlayers) => currentPlayers.map((player) =>
      player.id === activePlayerId
        ? { ...player, [action.stat]: player[action.stat] + action.amount }
        : player,
    ))
    setHistory((currentHistory) => [...currentHistory, {
      playerId: activePlayerId,
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
  }

  const addPlayer = (team) => {
    const player = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      team,
      jersey: '',
      name: '',
      pts: 0,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      to: 0,
    }
    setPlayers((currentPlayers) => [...currentPlayers, player])
    setActivePlayerId(player.id)
  }

  const removePlayer = (playerId) => {
    setPlayers((currentPlayers) => currentPlayers.filter((player) => player.id !== playerId))
    setAssets((currentAssets) => {
      const nextPlayerImages = { ...currentAssets.players }
      delete nextPlayerImages[playerId]
      return { ...currentAssets, players: nextPlayerImages }
    })
    setHistory((currentHistory) => currentHistory.filter((action) => action.playerId !== playerId))
    if (activePlayerId === playerId) setActivePlayerId(null)
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

      <section className="scoreboard" id="game" aria-label="Live scoreboard">
        <div className="score-team score-team-a">
          <span className="team-label">HOME</span>
          <span className="score-team-name">{game.teamA}</span>
          <span className="score-number">{teamAScore}</span>
        </div>
        <div className="score-center">
          <span className="period-pill">{game.period}</span>
          <span className="score-separator">:</span>
          <div className="game-clock"><span className="clock-dot" /> 10:00</div>
          <span className="clock-caption">GAME CLOCK</span>
        </div>
        <div className="score-team score-team-b">
          <span className="team-label">AWAY</span>
          <span className="score-team-name">{game.teamB}</span>
          <span className="score-number">{teamBScore}</span>
        </div>
        <div className="scoreboard-location"><span>⌖</span> {game.location}</div>
      </section>

      <div className="main-content">
        <section className="roster-section" aria-label="Player roster">
          <div className="section-heading">
            <div>
              <span className="eyebrow">LIVE BOX SCORE</span>
              <h1>Tap a player to log stats</h1>
            </div>
            <span className="player-count">{players.length} PLAYERS ON ROSTER</span>
          </div>
          <div className="roster-columns">
            <section className="team-roster">
              <div className="roster-title">
                <span className="team-dot team-a-dot" />
                <h2>{game.teamA}</h2>
                <span>{teamAScore} PTS</span>
              </div>
              <div className="player-grid">
                {teamAPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} active={activePlayerId === player.id} onSelect={() => setActivePlayerId(player.id)} />
                ))}
                {teamAPlayers.length === 0 && <p className="empty-roster">Add players in Game setup to get started.</p>}
              </div>
            </section>
            <section className="team-roster">
              <div className="roster-title">
                <span className="team-dot team-b-dot" />
                <h2>{game.teamB}</h2>
                <span>{teamBScore} PTS</span>
              </div>
              <div className="player-grid">
                {teamBPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} active={activePlayerId === player.id} onSelect={() => setActivePlayerId(player.id)} />
                ))}
                {teamBPlayers.length === 0 && <p className="empty-roster">Add players in Game setup to get started.</p>}
              </div>
            </section>
          </div>
        </section>

        <section className="action-dock" aria-label="Stat actions">
          <div className="active-player-panel">
            <span className="active-avatar">{activePlayer ? `#${activePlayer.jersey || '—'}` : '—'}</span>
            <div className="active-player-copy">
              <span className="eyebrow">ACTIVE PLAYER</span>
              <strong>{activePlayer ? activePlayer.name || 'Unnamed player' : 'Select a player'}</strong>
              <span>{activePlayer ? activePlayer.team === 'Team A' ? game.teamA : game.teamB : 'Tap a roster card above'}</span>
            </div>
            {activePlayer && <div className="active-points"><strong>{activePlayer.pts}</strong><span>PTS</span></div>}
          </div>
          <div className="action-buttons">
            {actions.map((action) => (
              <button
                className={`action-button ${action.style || ''}`}
                type="button"
                key={`${action.stat}-${action.amount}`}
                disabled={!activePlayer}
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
            <div className="dock-hint">Select a player, then tap a stat to record it.</div>
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
          players={players}
          assets={assets}
          requiredAssets={showAssetValidation ? requiredAssets : { teams: {}, players: {} }}
          onAssetChange={updateAsset}
          onGameChange={setGame}
          onPlayersChange={setPlayers}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
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
