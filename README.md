# Mini Wordle

A daily word-guessing challenge for Farcaster users - test your vocabulary in 6 tries!

## Features

- Daily word guessing game with 6 attempts
- Persistent game state with MongoDB
- User statistics and streaks
- Animated feedback for invalid words
- Responsive design with dark mode support

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up MongoDB:

   - Install MongoDB locally, or
   - Use MongoDB Atlas (cloud service)
   - Create a database named `wordle`

4. Create environment file:

   ```bash
   cp .env.local.example .env.local
   ```

5. Configure MongoDB connection in `.env.local`:

   ```
   MONGODB_URI=mongodb://localhost:27017/wordle
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

## Game Features

### Core Gameplay

- Guess the 5-letter word in 6 attempts
- Green: Letter is correct and in right position
- Yellow: Letter is in word but wrong position
- Gray: Letter is not in word

### User Progress

- Game state persists across browser sessions
- Daily progress tracking
- Win/loss statistics
- Current and maximum streaks
- Average attempts per game

### Animations

- Shake animation for invalid words
- Floating error messages
- Smooth transitions

## API Endpoints

- `GET /api/game?userId=<id>` - Get current game state and user stats
- `POST /api/game` - Save guess or complete game

## Database Schema

### Game Collection

- `userId`: User identifier
- `date`: Game date (YYYY-MM-DD)
- `guesses`: Array of user guesses
- `statuses`: Array of letter statuses for each guess
- `completed`: Whether game is finished
- `won`: Whether user won
- `attempts`: Number of attempts used
- `timeTaken`: Time taken to complete (seconds)

### UserStats Collection

- `userId`: User identifier
- `currentStreak`: Current winning streak
- `maxStreak`: Maximum streak achieved
- `gamesPlayed`: Total games played
- `gamesWon`: Total games won
- `winRate`: Win percentage
- `averageAttempts`: Average attempts per game
- `lastPlayedDate`: Last game date

## Development

### Project Structure

```
src/
├── app/
│   └── api/
│       └── game/
│           └── route.ts          # Game API endpoints
├── components/
│   └── ui/
│       ├── tabs/
│       │   └── HomeTab.tsx       # Main game component
│       ├── Keyboard.tsx          # Virtual keyboard
│       └── StatsDisplay.tsx      # User statistics
├── hooks/
│   └── useGame.ts               # Game state management
└── lib/
    ├── mongodb.ts               # Database connection
    └── models/
        ├── Game.ts              # Game model
        └── UserStats.ts         # User stats model
```

### Key Components

- **HomeTab**: Main game interface with word grid and game logic
- **Keyboard**: Virtual keyboard with letter status feedback
- **StatsDisplay**: User statistics and streak display
- **useGame**: Custom hook for game state and API management

## Deployment

1. Set up MongoDB Atlas or other cloud MongoDB service
2. Update `MONGODB_URI` in environment variables
3. Deploy to Vercel or other hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
