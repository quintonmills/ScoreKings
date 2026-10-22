# ScoreKings 🏀

> Real-time courtside stat engine & automated social graphic generator for youth, amateur, and regional basketball leagues.

ScoreKings is a B2B2C sports tech platform designed to capture live game data courtside and instantaneously render high-impact, shareable stat graphics for athletes. The platform turns raw box scores into viral marketing for players and structured, verified analytics for leagues and scouts.

---

## 🎯 Core Features

- **Courtside Stat Logger:** Ultra-responsive touch UI optimized for iPad/mobile stat entry (Points, Rebounds, Assists, Steals, Blocks, Turnovers).
- **Automated Graphic Engine:** Instant server-side canvas rendering that maps live box score JSON into high-resolution 4:5 Instagram/TikTok stat cards.
- **Export & Delivery Pipeline:** Automated JPEG output ready for direct messaging, SMS, or social media distribution post-buzzer.
- **League Data Ingestion:** Structured data storage for game box scores, leaderboards, and player analytics.

---

## 🛠 Tech Stack

- **Frontend / Field App:** React / React Native (iPad / Tablet optimized)
- **Backend Service:** Node.js, Express
- **Graphic Rendering Engine:** Canvas (`@napi-rs/canvas`)
- **Database:** MongoDB
- **Styling & Assets:** Custom Figma graphic templates

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js (v18+)
- npm or yarn

### 1. Installation

```bash
# Clone the repository
git clone [https://github.com/YOUR_USERNAME/ScoreKings.git](https://github.com/YOUR_USERNAME/ScoreKings.git)

# Navigate to project directory
cd ScoreKings

# Install dependencies
npm install
