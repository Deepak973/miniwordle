import { useState, useEffect, useCallback } from "react";

interface GameState {
  id?: string;
  guesses: string[];
  statuses: ("correct" | "present" | "absent")[][];
  completed: boolean;
  won: boolean;
  attempts: number;
  timeTaken: number;
}

interface UserStats {
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  averageAttempts: number;
}

interface UseGameReturn {
  game: GameState;
  stats: UserStats;
  loading: boolean;
  error: string | null;
  saveGuess: (
    guess: string,
    statuses: ("correct" | "present" | "absent")[]
  ) => Promise<void>;
  completeGame: (won: boolean, timeTaken: number) => Promise<void>;
  refreshGame: () => Promise<void>;
}

export function useGame(userId: string): UseGameReturn {
  const [game, setGame] = useState<GameState>({
    guesses: [],
    statuses: [],
    completed: false,
    won: false,
    attempts: 0,
    timeTaken: 0,
  });

  const [stats, setStats] = useState<UserStats>({
    currentStreak: 0,
    maxStreak: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    winRate: 0,
    averageAttempts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/game?userId=${encodeURIComponent(userId)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch game");
      }

      const data = await response.json();

      setGame(data.game);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching game:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const saveGuess = useCallback(
    async (guess: string, statuses: ("correct" | "present" | "absent")[]) => {
      if (!userId) return;

      try {
        const response = await fetch("/api/game", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            guess,
            statuses,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save guess");
        }

        const data = await response.json();
        setGame(data.game);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save guess");
        console.error("Error saving guess:", err);
      }
    },
    [userId]
  );

  const completeGame = useCallback(
    async (won: boolean, timeTaken: number) => {
      if (!userId) return;

      try {
        const response = await fetch("/api/game", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            completed: true,
            won,
            timeTaken,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to complete game");
        }

        // Refresh game data to get updated stats
        await fetchGame();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to complete game"
        );
        console.error("Error completing game:", err);
      }
    },
    [userId, fetchGame]
  );

  const refreshGame = useCallback(async () => {
    await fetchGame();
  }, [fetchGame]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  return {
    game,
    stats,
    loading,
    error,
    saveGuess,
    completeGame,
    refreshGame,
  };
}
