import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Game from "../../../lib/models/Game";
import UserStats from "../../../lib/models/UserStats";

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Helper function to get yesterday's date
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

// GET: Get current game state for user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const today = getTodayDate();

    // Find today's game for the user
    let game = await Game.findOne({ userId, date: today });

    if (!game) {
      // Create a new game for today
      game = new Game({
        userId,
        date: today,
        guesses: [],
        statuses: [],
        completed: false,
        won: false,
        attempts: 0,
        timeTaken: 0,
      });
      await game.save();
    }

    // Get user stats
    let userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      userStats = new UserStats({
        userId,
        currentStreak: 0,
        maxStreak: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        winRate: 0,
        averageAttempts: 0,
        lastPlayedDate: null,
      });
      await userStats.save();
    }

    return NextResponse.json({
      game: {
        id: game._id,
        guesses: game.guesses,
        statuses: game.statuses,
        completed: game.completed,
        won: game.won,
        attempts: game.attempts,
        timeTaken: game.timeTaken,
      },
      stats: {
        currentStreak: userStats.currentStreak,
        maxStreak: userStats.maxStreak,
        gamesPlayed: userStats.gamesPlayed,
        gamesWon: userStats.gamesWon,
        winRate: userStats.winRate,
        averageAttempts: userStats.averageAttempts,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Save a guess or complete the game
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, guess, statuses, completed, won, timeTaken } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const today = getTodayDate();

    // Find today's game
    const game = await Game.findOne({ userId, date: today });

    if (!game) {
      return NextResponse.json(
        { error: "No game found for today" },
        { status: 404 }
      );
    }

    // Update game with new guess
    if (guess && statuses) {
      game.guesses.push(guess);
      game.statuses.push(statuses);
      game.attempts = game.guesses.length;
    }

    // Mark game as completed
    if (completed !== undefined) {
      game.completed = completed;
      game.won = won || false;
      game.timeTaken = timeTaken || 0;
    }

    await game.save();

    // Update user stats if game is completed
    if (game.completed) {
      await updateUserStats(userId, game.won, game.attempts, today);
    }

    return NextResponse.json({
      success: true,
      game: {
        id: game._id,
        guesses: game.guesses,
        statuses: game.statuses,
        completed: game.completed,
        won: game.won,
        attempts: game.attempts,
        timeTaken: game.timeTaken,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to update user statistics
async function updateUserStats(
  userId: string,
  won: boolean,
  attempts: number,
  date: string
) {
  let userStats = await UserStats.findOne({ userId });

  if (!userStats) {
    userStats = new UserStats({ userId });
  }

  // Update basic stats
  userStats.gamesPlayed += 1;
  if (won) {
    userStats.gamesWon += 1;
  }
  userStats.winRate = (userStats.gamesWon / userStats.gamesPlayed) * 100;

  // Update average attempts
  const totalAttempts =
    userStats.averageAttempts * (userStats.gamesPlayed - 1) + attempts;
  userStats.averageAttempts = totalAttempts / userStats.gamesPlayed;

  // Update streak
  const yesterday = getYesterdayDate();
  if (userStats.lastPlayedDate === yesterday) {
    // Consecutive day
    if (won) {
      userStats.currentStreak += 1;
    } else {
      userStats.currentStreak = 0;
    }
  } else if (userStats.lastPlayedDate !== date) {
    // Not consecutive day
    if (won) {
      userStats.currentStreak = 1;
    } else {
      userStats.currentStreak = 0;
    }
  }

  // Update max streak
  if (userStats.currentStreak > userStats.maxStreak) {
    userStats.maxStreak = userStats.currentStreak;
  }

  userStats.lastPlayedDate = date;
  await userStats.save();
}
