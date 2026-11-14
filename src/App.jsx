import GameBoard from './components/GameBoard.jsx'
import FinalizeModal from './components/FinalizeModal.jsx'
import GameSetupModal from './components/GameSetupModal.jsx'
import { useGameController } from './useGameController.js'
import './App.css'

function App() {
  const gameController = useGameController()

  return (
    <>
      <GameBoard
        {...gameController}
        onOpenSetup={() => gameController.setShowSetup(true)}
      />
      {gameController.showSetup && (
        <GameSetupModal
          game={gameController.game}
          players={gameController.players}
          player={gameController.activePlayer}
          activePlayerNumber={gameController.players.findIndex(
            (player) => player.id === gameController.activePlayer.id,
          ) + 1}
          assets={gameController.assets}
          requiredAssets={gameController.showAssetValidation
            ? gameController.requiredAssets
            : { teams: {}, players: {} }}
          customClockEnabled={gameController.customClockEnabled}
          customClockDurationSeconds={gameController.customClockDurationSeconds}
          onClockSettingsChange={gameController.updateClockSettings}
          onAssetChange={gameController.updateAsset}
          onGameChange={gameController.setGame}
          onPlayerChange={gameController.updatePlayer}
          onPlayerSelect={gameController.setActivePlayerId}
          onPlayerRemove={gameController.removePlayer}
          onClose={() => gameController.setShowSetup(false)}
        />
      )}
      {gameController.payload && (
        <FinalizeModal
          payload={gameController.payload}
          graphics={gameController.generatedFlyers}
          requestState={gameController.requestState}
          requestMessage={gameController.requestMessage}
          onRetry={() => void gameController.sendPayload(gameController.payload)}
          onClose={() => gameController.setPayload(null)}
        />
      )}
    </>
  )
}

export default App
