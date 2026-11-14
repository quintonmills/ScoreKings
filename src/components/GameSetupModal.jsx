import { useRef, useState } from 'react'
import { MAX_IMAGE_SIZE_BYTES } from '../gamePayload.js'
import { formatGameClock, parseGameClock } from '../gameState.js'

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

function AthleteEditor({ player, playerNumber, playerImages, requiredPlayerMessages, onPlayerChange, onPlayerImageChange }) {
  return (
    <section className="athlete-editor" aria-labelledby="player-details-title">
      <div className="editor-heading">
        <h3 id="player-details-title">Player {playerNumber} details</h3>
      </div>
      <div className="game-fields athlete-fields">
        <label className="field-label">
          Player name
          <input value={player.name} onChange={(event) => onPlayerChange('name', event.target.value)} />
        </label>
        <label className="field-label">
          Jersey number
          <input value={player.jersey} onChange={(event) => onPlayerChange('jersey', event.target.value)} />
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

export default function GameSetupModal({
  game,
  players,
  player,
  activePlayerNumber,
  assets,
  requiredAssets,
  customClockEnabled,
  customClockDurationSeconds,
  onClockSettingsChange,
  onAssetChange,
  onGameChange,
  onPlayerChange,
  onPlayerSelect,
  onPlayerRemove,
  onClose,
}) {
  const [enableCustomClock, setEnableCustomClock] = useState(customClockEnabled)
  const [clockDurationInput, setClockDurationInput] = useState(formatGameClock(customClockDurationSeconds))
  const [clockDurationError, setClockDurationError] = useState('')

  const applyClockSettings = (event) => {
    event.preventDefault()
    if (!enableCustomClock) {
      onClockSettingsChange({ enabled: false, durationSeconds: customClockDurationSeconds })
      setClockDurationError('')
      return
    }

    const durationSeconds = parseGameClock(clockDurationInput)
    if (durationSeconds === null) {
      setClockDurationError('Enter a duration from 00:01 to 99:59 in MM:SS format.')
      return
    }

    onClockSettingsChange({ enabled: true, durationSeconds })
    setClockDurationInput(formatGameClock(durationSeconds))
    setClockDurationError('')
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
        <div className="game-fields setup-game-fields">
          <label className="field-label">
            Location
            <input value={game.location} onChange={(event) => onGameChange({ ...game, location: event.target.value })} />
          </label>
        </div>
        <form className="custom-clock-settings" onSubmit={applyClockSettings}>
          <div className="custom-clock-heading">
            <div>
              <h3>Game clock</h3>
              <p>Off counts up from 00:00.</p>
            </div>
            <label className="custom-clock-toggle">
              <span>Custom countdown</span>
              <input
                type="checkbox"
                role="switch"
                aria-label="Enable custom countdown"
                checked={enableCustomClock}
                onChange={(event) => setEnableCustomClock(event.target.checked)}
              />
            </label>
          </div>
          {enableCustomClock && (
            <label className="field-label custom-clock-duration">
              Countdown duration (MM:SS)
              <input
                aria-label="Custom countdown duration (MM:SS)"
                inputMode="numeric"
                pattern="[0-9]{1,2}:[0-5][0-9]"
                placeholder="10:00"
                value={clockDurationInput}
                onChange={(event) => setClockDurationInput(event.target.value)}
                aria-invalid={Boolean(clockDurationError)}
                aria-describedby={clockDurationError ? 'custom-clock-error' : undefined}
              />
              {clockDurationError && (
                <span id="custom-clock-error" className="custom-clock-error" role="alert">
                  {clockDurationError}
                </span>
              )}
            </label>
          )}
          <button type="submit" className="clock-settings-button">Apply clock settings</button>
        </form>
        <section className="setup-player-picker" aria-label="Choose a player to edit">
          <h3>Players</h3>
          <div className="setup-player-options">
            {players.map((rosterPlayer, index) => {
              const playerName = rosterPlayer.name || `Player ${index + 1}`
              const isSelected = rosterPlayer.id === player.id
              return (
                <div className="setup-player-option" key={rosterPlayer.id}>
                  <button
                    type="button"
                    className={`setup-player-choice ${isSelected ? 'is-selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => onPlayerSelect(rosterPlayer.id)}
                  >
                    <span>#{rosterPlayer.jersey || '—'} {playerName}</span>
                    <small>{game.teamA}</small>
                  </button>
                  <button
                    type="button"
                    className="remove-player"
                    aria-label={`Remove ${playerName}`}
                    title={players.length === 1 ? 'At least one player must remain' : `Remove ${playerName}`}
                    disabled={players.length === 1}
                    onClick={() => onPlayerRemove(rosterPlayer.id)}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </section>
        <AthleteEditor
          player={player}
          playerNumber={activePlayerNumber}
          playerImages={assets.players}
          requiredPlayerMessages={requiredAssets.players[player.id] || []}
          onPlayerChange={onPlayerChange}
          onPlayerImageChange={(image, index) => onAssetChange(player.id, image, index)}
        />
        <div className="team-editors">
          <TeamEditor
            team="Team A"
            teamKey="teamA"
            title={game.teamA}
            logo={assets.teams.teamA}
            onLogoChange={(image) => onAssetChange('teamA', image)}
            requiredLogoMessage={requiredAssets.teams.teamA}
            onTeamNameChange={(value) => onGameChange((currentGame) => ({ ...currentGame, teamA: value }))}
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
