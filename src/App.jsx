import { useMemo, useState } from 'react'
import './App.css'

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

function RosterEditor({ team, title, players, onChange, onAdd, onRemove }) {
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
      <div className="roster-list">
        {roster.map((player) => (
          <div className="roster-row" key={player.id}>
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
        ))}
      </div>
      <button className="add-player-button" type="button" onClick={() => onAdd(team)}>
        <span>＋</span> Add player
      </button>
    </section>
  )
}

function SetupModal({ game, players, onGameChange, onPlayersChange, onAddPlayer, onRemovePlayer, onClose }) {
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
            title={game.teamA}
            players={players}
            onChange={updatePlayer}
            onAdd={onAddPlayer}
            onRemove={onRemovePlayer}
          />
          <RosterEditor
            team="Team B"
            title={game.teamB}
            players={players}
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

function FinalizeModal({ payload, requestState, requestMessage, onRetry, onClose }) {
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
  const [activePlayerId, setActivePlayerId] = useState(null)
  const [history, setHistory] = useState([])
  const [showSetup, setShowSetup] = useState(false)
  const [payload, setPayload] = useState(null)
  const [requestState, setRequestState] = useState('idle')
  const [requestMessage, setRequestMessage] = useState('')

  const teamAPlayers = useMemo(() => players.filter((player) => player.team === 'Team A'), [players])
  const teamBPlayers = useMemo(() => players.filter((player) => player.team === 'Team B'), [players])
  const activePlayer = players.find((player) => player.id === activePlayerId)
  const teamAScore = getScore(players, 'Team A')
  const teamBScore = getScore(players, 'Team B')

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
    setHistory((currentHistory) => currentHistory.filter((action) => action.playerId !== playerId))
    if (activePlayerId === playerId) setActivePlayerId(null)
  }

  const sendPayload = async (nextPayload) => {
    setRequestState('sending')
    setRequestMessage('Posting to http://localhost:5000/api/games/finalize…')
    try {
      const response = await fetch('http://localhost:5000/api/games/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextPayload),
      })
      if (!response.ok) {
        setRequestState('error')
        setRequestMessage(`The server responded with ${response.status} ${response.statusText || ''}.`.trim())
        return
      }
      setRequestState('success')
      setRequestMessage('The final box score was accepted by the server.')
    } catch (error) {
      setRequestState('error')
      setRequestMessage(error instanceof Error ? error.message : 'The request failed. Check that the backend is running.')
    }
  }

  const finalizeGame = () => {
    const nextPayload = {
      gameId: 'game-101',
      location: game.location,
      teamA: { name: game.teamA, score: teamAScore },
      teamB: { name: game.teamB, score: teamBScore },
      players: players.map(({ id, team, jersey, name, pts, reb, ast, stl, blk, to }) => ({
        id,
        team,
        jersey,
        name,
        pts,
        reb,
        ast,
        stl,
        blk,
        to,
      })),
    }
    setPayload(nextPayload)
    setRequestState('sending')
    setRequestMessage('Posting to http://localhost:5000/api/games/finalize…')
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
