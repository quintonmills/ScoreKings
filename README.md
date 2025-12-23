# 🏀 OTE Pick'em - Fantasy Basketball Application

## 📋 Overview

OTE Pick'em is a fantasy sports application where users can enter daily contests by predicting player performances. Users select 2 players and choose whether they'll score **Over** or **Under** their projected point totals. If both picks are correct, they win 3x their entry fee!

### Key Features

- **Daily Contests** with various entry fees and prize pools
- **Player Prop Betting** on points scored
- **Real-time Results** and contest grading
- **Admin Panel** for complete contest management
- **Game Results Entry** with manual and CSV upload options
- **User Balance Management** with automatic payouts

## 🏗️ Architecture

### Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Authentication**: Simple Bearer token for admin access

### Project Structure

```
ote-pickem/
├── server.ts              # Main Express server
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── admin-panel.html      # Combined admin interface
├── public/               # Static files (future)
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd ote-pickem
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` and set:

```
DATABASE_URL="postgresql://user:password@localhost:5432/ote_pickem"
ADMIN_PASSWORD="admin123"  # Change in production!
PORT=4000
```

3. **Set up the database:**

```bash
npx prisma migrate dev --name init
npx prisma db seed  # If you have seed data
```

4. **Start the development server:**

```bash
npm run dev
```

5. **Access the application:**

- API Server: `http://localhost:4000`
- Admin Panel: Open `admin-panel.html` in browser

## 🛠️ Database Schema

### Core Models

```prisma
model User {
  id        Int    @id @default(autoincrement())
  email     String @unique
  password  String
  name      String
  balance   Float  @default(0.0)
  entries   ContestEntry[]
}

model Player {
  id    Int    @id @default(autoincrement())
  name  String
  team  String
  ppg   Float  @default(0.0)  # Points per game
  rpg   Float  @default(0.0)  # Rebounds per game
  apg   Float  @default(0.0)  # Assists per game
  image String?

  picks      EntryPick[]
  gameResults GameResult[]
}

model Contest {
  id          Int      @id @default(autoincrement())
  title       String
  entryFee    Float
  prize       Float
  participants Int     @default(0)
  players     String[]  # JSON array of player names
  startTime   DateTime?
  endTime     String
  status      String   @default("UPCOMING")
  entries     ContestEntry[]
}

model ContestEntry {
  id             Int      @id @default(autoincrement())
  contestId      Int
  userId         Int
  entryFee       Float
  potentialPayout Float
  status         String   @default("ACTIVE")
  picks          EntryPick[]
  contest        Contest  @relation(fields: [contestId], references: [id])
  user           User     @relation(fields: [userId], references: [id])
}

model EntryPick {
  id          Int     @id @default(autoincrement())
  entryId     Int
  playerId    Int
  playerName  String
  team        String
  stat        String  @default("points")
  line        Float
  prediction  String  # "OVER" or "UNDER"
  actualValue Float?
  result      String  @default("PENDING") # "WON", "LOST", "PENDING"
}

model GameResult {
  id        Int      @id @default(autoincrement())
  playerId  Int
  gameDate  DateTime
  points    Float
  rebounds  Float?
  assists   Float?
  opponent  String?
  player    Player   @relation(fields: [playerId], references: [id])
}
```

## 📊 API Endpoints

### Public Endpoints

| Method | Endpoint                   | Description                     |
| ------ | -------------------------- | ------------------------------- |
| GET    | `/api/players`             | Get all players with stats      |
| GET    | `/api/contests`            | Get all contests                |
| GET    | `/api/contest/:id`         | Get specific contest            |
| GET    | `/api/contests/:id/props`  | Get available props for contest |
| POST   | `/api/contests/:id/submit` | Submit entry to contest         |
| GET    | `/api/users/:id/entries`   | Get user's contest entries      |
| GET    | `/api/entries/:id`         | Get specific entry details      |
| DELETE | `/api/entries/:id`         | Cancel an entry                 |
| POST   | `/login`                   | User login                      |
| GET    | `/api/me`                  | Get current user info           |

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <ADMIN_PASSWORD>` header.

| Method | Endpoint                          | Description                   |
| ------ | --------------------------------- | ----------------------------- |
| GET    | `/api/admin/stats`                | Get dashboard statistics      |
| GET    | `/api/admin/contests`             | Get all contests with entries |
| POST   | `/api/admin/contests`             | Create new contest            |
| PUT    | `/api/admin/contests/:id`         | Update contest                |
| DELETE | `/api/admin/contests/:id`         | Delete contest                |
| GET    | `/api/admin/contests/:id/entries` | Get contest entries           |
| POST   | `/api/admin/contests/:id/grade`   | Grade contest manually        |
| GET    | `/api/admin/entries`              | Get all entries               |
| POST   | `/api/admin/game-results/manual`  | Enter game results manually   |
| GET    | `/api/admin/game-results`         | Get game results              |
| DELETE | `/api/admin/game-results/:id`     | Delete game result            |

## 👨‍💼 Admin Panel Guide

### Accessing the Admin Panel

1. Open `admin-panel.html` in your browser
2. Enter the admin password (default: `admin123`)
3. You'll see four main tabs:

### 1. Contests Tab

- View all contests with their status
- Create new contests with custom parameters
- Set entry fees, prize pools, and available players
- Manage contest start/end times

### 2. All Entries Tab

- View all user entries across all contests
- See entry status, picks, and potential payouts
- Monitor user activity and contest participation

### 3. Grade Contest Tab

- Manually grade contests when games are complete
- Enter actual player points to determine winners
- Automatic payout distribution to winners
- Contest status updates to "COMPLETED"

### 4. Game Results Tab (New!)

- **Manual Entry**: Enter player stats for specific game dates
- **CSV Upload**: Bulk upload game results via CSV file
- **Auto-grading**: Automatically grade all affected contests
- **Player Stats Update**: Updates player season averages automatically

### CSV Format for Game Results

```csv
PlayerName,Team,Points,Rebounds,Assists,GameDate
Eli Ellis,YNG Dreamerz,35.0,6.0,5.0,2024-12-15
Ian Jackson,Jelly Fam,21.0,4.0,7.0,2024-12-15
Karter Knox,RWE,28.0,8.0,3.0,2024-12-15
```

## 🔒 Authentication & Security

### User Authentication

- Simple email/password authentication (JWT planned)
- Balance validation before entry submission

### Admin Authentication

- Bearer token authentication using `ADMIN_PASSWORD`
- All admin endpoints protected
- Default password should be changed in production

## 💰 Financial Model

### Entry Fees & Payouts

- Users pay entry fee when submitting picks
- Entry fee deducted from user balance
- Winners receive 3x entry fee payout
- Both picks must be correct to win

### Profit Calculation

```
Total Revenue = Sum of all entry fees
Total Payouts = Sum of all winner payouts
Profit = Total Revenue - Total Payouts
```

## 🎮 Game Rules

### How to Play

1. Select a contest from available options
2. Pick 2 different players
3. Choose Over or Under their point line
4. Pay entry fee
5. Wait for game completion and results

### Winning Conditions

- **Win**: Both picks are correct (Over hits Over, Under hits Under)
- **Loss**: One or both picks are incorrect
- **Payout**: 3x entry fee for winners

### Example

- Entry fee: $5
- Pick 1: Eli Ellis OVER 24.5 points (scores 28 points) ✅
- Pick 2: Ian Jackson UNDER 22.5 points (scores 18 points) ✅
- Result: WIN! Payout: $15

## 🚨 Error Handling

The application includes comprehensive error handling:

- Invalid picks validation
- Insufficient balance checks
- Contest status validation
- Database transaction safety
- Graceful shutdown handling

## 📈 Monitoring & Analytics

The admin panel provides real-time stats:

- Total contests and entries
- Revenue and payout tracking
- User participation rates
- Contest performance metrics

## 🔄 Workflow Examples

### Daily Operations

1. **Morning**: Create new contests for day's games
2. **Afternoon**: Monitor entry submissions
3. **Post-game**: Enter game results via admin panel
4. **Evening**: Review graded contests and payouts

### Contest Lifecycle

```
UPCOMING → LIVE → COMPLETED
```

## 🛡️ Production Considerations

### Security Improvements Needed

1. Implement proper JWT authentication
2. Add HTTPS support
3. Rate limiting on API endpoints
4. Input validation and sanitization
5. Database connection pooling

### Scalability Considerations

1. Add Redis for caching
2. Implement message queues for grading
3. Database indexing optimization
4. Load balancing for high traffic

### Monitoring & Logging

1. Add structured logging (Winston/Pino)
2. Implement health check endpoints
3. Add performance monitoring
4. Set up error tracking (Sentry)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary. All rights reserved.

## 📞 Support

For issues or questions:

1. Check the troubleshooting guide below
2. Review server logs for errors
3. Ensure database connections are working
4. Verify environment variables are set correctly

---

**Note**: This is a development version. For production deployment, additional security measures and optimizations are required.
