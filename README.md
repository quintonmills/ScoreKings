# ScoreKings Courtside Logger

A tablet-friendly basketball stat logger for tracking a game from the sideline. ScoreKings lets you manage team rosters, record player stats with touch-friendly controls, and export a final box score as JSON.

## Dashboard

<img width="1041" height="717" alt="image" src="https://github.com/user-attachments/assets/7862561c-fcdf-4a94-8e19-8bba7f0d865a" />


## Features

- Live scoreboard with automatically calculated team totals.
- Game setup for team names, location, and quarter or overtime period.
- Editable rosters with jersey numbers and player names.
- Player stat tracking for points, rebounds, assists, steals, blocks, and turnovers.
- Undo for the most recently recorded stat action.
- Game finalization modal with the box-score JSON payload, generated flyer, and QR-code download link.
- Team-logo and three player-reference photo uploads for a tailored flyer.
- Backend integration using `POST /api/games/finalize`.
- Responsive, high-contrast layout designed for tablet and touch use.

## Tech stack

- React 19
- Vite 8
- CSS

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

1. Open **Game setup** to edit the team names, game location, quarter, and rosters.
2. Tap a player card to make that player active.
3. Tap a stat button to record an action. Points update the scoreboard automatically.
4. Use **Undo last action** to reverse the most recent stat entry.
5. In **Game setup**, add team logos and three player reference photos for the highest-ranked scorer. PNG, JPEG, and WebP images up to 5 MB each are accepted.
6. Select **Finalize game** to send the box-score payload and required flyer assets to the backend.

The game clock currently displays a placeholder (`10:00`); it is not a running timer.

## Backend integration

Finalizing a game sends a JSON `POST` request to:

```text
/api/games/finalize
```

For local development, the frontend uses `http://localhost:5000` by default. Production defaults to `https://servercore-pjwe.onrender.com`; set the `VITE_API_BASE_URL` environment variable in the frontend hosting service to override it (use the backend's public origin without `/api/games/finalize`), then redeploy the frontend. The backend must allow cross-origin requests from the frontend's deployed origin.

Example payload:

```json
{
  "gameId": "game-101",
  "location": "Marietta Rec League",
  "teamA": {
    "name": "Red Team",
    "score": 2,
    "logo": "data:image/png;base64,..."
  },
  "teamB": {
    "name": "Blue Team",
    "score": 0,
    "logo": "data:image/png;base64,..."
  },
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
  ]
}
```

The example above shows the shape of the payload; actual player totals and team scores are generated from the game being logged. Photos and logos are converted to data URLs in memory and are not saved in browser storage. One flyer is generated for the highest-ranked player with at least one point, ranked by points, rebounds, then assists. That player needs three reference photos and their team needs a logo; the frontend prevents finalization when an asset is missing or the JSON request would reach the backend's 14 MB limit. The backend uses a bundled flyer image as broad visual art direction, while the model is instructed to create an original composition. The flyer focuses on the player name, jersey, team, and points total. Returned `graphics[].publicUrl` values are shown as generated flyers. The final-score modal displays one QR code for the first flyer, preferring its `downloadUrl` and falling back to `publicUrl` for older backend responses.
