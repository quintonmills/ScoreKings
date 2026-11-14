import { actions, formatGameClock } from '../gameState.js'

export default function GameBoard({
  game,
  setGame,
  onOpenSetup,
  players,
  activePlayer,
  setActivePlayerId,
  clockSeconds,
  setClockSeconds,
  customClockEnabled,
  customClockDurationSeconds,
  isClockRunning,
  setIsClockRunning,
  history,
  storageMessage,
  showAssetValidation,
  missingAssetMessages,
  requestState,
  requestMessage,
  recordAction,
  undoAction,
  resetBoard,
  finalizeGame,
}) {
  return (
    <main className="app-shell">
      {storageMessage && <p className="storage-warning" role="alert">{storageMessage}</p>}

      <section className="scoreboard" id="game" aria-label="Live scoreboard">
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
          <div className="clock-readout">
            <div className="game-clock" aria-live="off">
              <span className={`clock-dot ${isClockRunning ? 'is-running' : ''}`} />
              {formatGameClock(clockSeconds)}
            </div>
            <span className="clock-caption">GAME CLOCK</span>
          </div>
          <button
            className="clock-control"
            type="button"
            onClick={() => {
              if (!isClockRunning && customClockEnabled && clockSeconds === 0) {
                setClockSeconds(customClockDurationSeconds)
              }
              setIsClockRunning((running) => !running)
            }}
            aria-label={isClockRunning ? 'Pause game clock' : 'Start game clock'}
          >
            {isClockRunning ? 'Pause' : clockSeconds > 0 ? 'Resume' : 'Start'}
          </button>
          <button
            type="button"
            className="setup-button"
            onClick={onOpenSetup}
            aria-label="Game settings"
            title="Game settings"
          >
            <span className="setup-icon" aria-hidden="true">⚙</span>
          </button>
        </div>
        <div className="scoreboard-location"><span>⌖</span> {game.location}</div>
      </section>

      <div className="main-content">
        <section className="roster-section" aria-label="Player roster">
          <div className="roster-columns">
            <section className="team-roster" aria-label={`${game.teamA} roster`}>
              <div className="roster-title">
                <span className="team-dot team-a-dot" />
                <h2>{game.teamA}</h2>
                <span>{players.length} PLAYERS</span>
              </div>
              <div className="player-grid">
                {players.map((player, index) => {
                  const playerName = player.name || `Player ${index + 1}`
                  const isActive = player.id === activePlayer.id
                  return (
                    <button
                      className={`player-card ${isActive ? 'is-active' : ''}`}
                      type="button"
                      key={player.id}
                      aria-label={`Select ${playerName} to track stats`}
                      aria-pressed={isActive}
                      onClick={() => setActivePlayerId(player.id)}
                    >
                      <span className="player-number">#{player.jersey || '—'}</span>
                      <span className="player-info">
                        <span className="player-name">{playerName}</span>
                        <span className="player-stats">
                          <span><b>{player.pts}</b> PTS</span>
                          <span><b>{player.reb}</b> REB</span>
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>
        </section>
        <section className="action-dock" aria-label="Stat actions">
          <div className="active-player-panel">
            <span className="active-avatar">{activePlayer ? `#${activePlayer.jersey || '—'}` : '—'}</span>
            <div className="active-player-copy">
              <strong>{activePlayer.name || 'Unnamed athlete'}</strong>
              <span>{game.teamA}</span>
            </div>
            <div className="active-stats" aria-label={`${activePlayer.name || 'Athlete'} stats`}>
              {[
                ['PTS', activePlayer.pts],
                ['REB', activePlayer.reb],
                ['AST', activePlayer.ast],
                ['STL', activePlayer.stl],
                ['BLK', activePlayer.blk],
                ['TO', activePlayer.to],
              ].map(([label, value]) => (
                <span className="active-stat" key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </span>
              ))}
            </div>
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
    </main>
  )
}
