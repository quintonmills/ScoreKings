# ScoreKings Courtside Logger

> 🚀 **Live Demo App:** [https://score-kings-ivory.vercel.app](https://score-kings-ivory.vercel.app)  
> 📄 **Technical Architecture Brief:** [View SaaS Technical Brief & System Architecture](https://quintonmills.github.io/ScoreKings-SaaS-Brief/)

Real-time courtside tracking engine that logs single-player, timestamped basketball event streams—turning live game possessions into structured JSON/CSV telemetry.
## Dashboard

<img width="284" height="512" alt="image" src="https://github.com/user-attachments/assets/2ffb5397-a007-44ac-b579-5a09cb50880b" />



## Features

- Five-player roster with selectable active player and per-player stat tracking.
- Game setup for the team name, location, and quarter or overtime period.
- Player stat tracking for points, rebounds, assists, steals, blocks, and turnovers.
- Undo for the most recently recorded stat action.
- Automatic browser-local game-state persistence and a **Reset Board** control.
- Game finalization modal with the box-score JSON payload, generated flyer, and QR-code download link.
- Team-logo and three target-athlete reference photo uploads for a tailored flyer.
- Backend integration using `POST /api/games/finalize`.
- Responsive, high-contrast layout designed for tablet and touch use.

## Tech stack

- React 19
- Vite 8
- CSS

## Source structure

- `src/App.jsx` composes the dashboard and modal components.
- `src/useGameController.js` coordinates game state, persistence, clock, and finalization.
- `src/components/GameBoard.jsx` renders the live game controls and stats.
- `src/components/GameSetupModal.jsx` contains setup, clock, and image-upload controls.
- `src/components/FinalizeModal.jsx` displays the submitted payload and generated flyers.
- `src/gameState.js` contains game-state defaults, persistence loading, and clock helpers.
- `src/gameApi.js` contains backend URL configuration and flyer URL validation.

## Getting started

### Requirements

- Node.js 20.19+ or 22.12+
- npm

### Run locally

```bash
git clone https://github.com/YOUR_USERNAME/ScoreKings.git
cd ScoreKings
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

## Available scripts

```bash
npm run dev      # Start the local development server
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build locally
npm run lint     # Run Oxlint
```

## Using the logger

1. Open **Game setup** to edit player details, the team name, and game location.
2. Select a player from the roster, then tap a stat button to record an action for that player. Repeat for up to five players.
3. Use **Undo last action** to reverse the most recent stat entry.
4. In **Game setup**, select a player from the roster to edit their name, jersey, and three reference photos. All players are assigned to the configured team. Add the team's logo. PNG, JPEG, and WebP images up to 5 MB each are accepted.
6. Select **Finalize game** to send the box-score payload and required flyer assets to the backend.

The game clock counts up from `00:00` by default. To use a countdown, open **Game setup**, enable **Custom countdown**, enter a duration in `MM:SS`, and select **Apply clock settings**. The countdown stops at zero; applying the setting again after it expires restarts it from the configured duration.

## Backend integration

Finalizing a game sends a JSON `POST` request to:

```text
/api/games/finalize
```

The frontend sends requests directly to `https://servercore-pjwe.onrender.com` in both local development and production. Set `VITE_API_BASE_URL` in the frontend hosting service to override the backend origin (use the backend's public origin without `/api/games/finalize`), then redeploy the frontend. In the Render backend's environment settings, set `CORS_ORIGIN` to the exact frontend origin(s), comma-separated and without paths or trailing slashes. For this deployment, use `https://score-kings-ivory.vercel.app,http://localhost:5173`; add any custom domain or Vercel preview origin you use. Save and redeploy the backend after changing it. The backend defaults to allowing `*` if `CORS_ORIGIN` is unset, so check that it hasn't been set to an outdated or misspelled origin.

The request body follows the backend's `/api/games/finalize` contract: it includes `gameId`, status and timestamps, location, one `teamName`, player stats and optional image data URLs, and events. Each `gameId` is derived from the match's start time and is reused for retries, so separate games do not overwrite the same database record.

Example payload:

```json
{
  "gameId": "game-101",
  "idempotencyKey": "game-101",
  "location": "Marietta Rec League",
  "teamName": "Red Team",
  "teamLogo": "data:image/png;base64,...",
  "players": [
    {
      "id": "p1",
      "team": "Team A",
      "jersey": "3",
      "name": "Marcus",
      "pts": 2,
      "reb": 0,
      "ast": 0,
      "stl": 0,
      "blk": 0,
      "to": 0,
      "photos": [
        "data:image/jpeg;base64,...",
        "data:image/jpeg;base64,...",
        "data:image/jpeg;base64,..."
      ]
    }
  ],
  "boxScore": [
    {
      "playerId": "p1",
      "name": "Marcus",
      "jersey": "3",
      "PTS": 2,
      "REB": 0,
      "AST": 0,
      "STL": 0,
      "BLK": 0,
      "TOV": 0
    }
  ]
}
```

The example above shows one player entry; the frontend submits all five roster players and their stats, both in `players` and in the backend's canonical `boxScore` format. The same per-game identifier is sent as `gameId` and `idempotencyKey` so retries update that game instead of creating duplicates. All players use the configured team name, sent as `teamName`; the team logo is sent as `teamLogo`. Game details, player details and stats, the active player, event history, clock, and uploaded logos/photos are saved to browser `localStorage` as you work. Select **Reset Board** to clear that saved game and return to the defaults. Browser storage limits can prevent very large image collections from being saved; the logger displays a warning if persistence fails. The leading scorer needs three reference photos and the configured team needs a logo; the frontend prevents finalization when an asset is missing or the JSON request would reach the backend's 14 MB limit. The backend uses a bundled flyer image as broad visual art direction, while the model is instructed to create an original composition. The flyer focuses on the athlete name, jersey, team, and points total. Uploaded reference photos are included for each player, allowing the backend to generate graphics for multiple eligible players. Every returned `graphics[]` entry is displayed with its image, a QR code for that graphic's download URL, and a direct link; if a download URL is missing or invalid, the public image URL is used instead.
