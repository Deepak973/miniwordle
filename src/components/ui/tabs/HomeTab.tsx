"use client";

import { useState, useEffect } from "react";
import classNames from "classnames";
// Remove the DICTIONARY import
// import { DICTIONARY } from "../../../lib/mockDictonary";
import { Keyboard } from "../Keyboard";
import { useGame } from "../../../hooks/useGame";
import { useDailyWord } from "../../../hooks/useDailyWord";
import { StatsDisplay } from "../StatsDisplay";
import { useMiniApp } from "@neynar/react";
import { ShareButton } from "../Share";
import { APP_URL } from "~/lib/constants";
import { GameRules } from "../GameRules";
import { isValidWord } from "../../../lib/utils";

const NUM_ROWS = 6;
const WORD_LENGTH = 5;

// Dictionary for word validation

function getLetterStatus(guess: string, answer: string) {
  // Returns an array of: "correct" | "present" | "absent"
  const result: ("correct" | "present" | "absent")[] =
    Array(WORD_LENGTH).fill("absent");
  const answerArr = answer.split("");
  const guessArr = guess.split("");
  const used = Array(WORD_LENGTH).fill(false);

  // First pass: correct positions
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === answerArr[i]) {
      result[i] = "correct";
      used[i] = true;
      answerArr[i] = ""; // Mark as used
    }
  }
  // Second pass: present but not in correct position
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    const idx = answerArr.findIndex((ch, j) => ch === guessArr[i] && !used[j]);
    if (idx !== -1) {
      result[i] = "present";
      used[idx] = true;
      answerArr[idx] = ""; // Mark as used
    }
  }
  return result;
}

export function HomeTab() {
  // Generate a unique user ID (in a real app, this would come from authentication)
  const { context } = useMiniApp();
  const userId = context?.user?.fid?.toString() || "";

  // User avatar image from context
  const userAvatarUrl = context?.user?.pfpUrl || undefined;

  // Use the game hook for MongoDB integration
  const {
    game,
    stats,
    loading,
    error: gameError,
    saveGuess,
    completeGame,
  } = useGame(userId);

  // Fetch daily word
  const {
    dailyWord,
    loading: dailyWordLoading,
    error: dailyWordError,
  } = useDailyWord();

  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStartTime, setGameStartTime] = useState<Date>(new Date());

  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [flippingRow, setFlippingRow] = useState<number | null>(null);
  const [submittingGuess, setSubmittingGuess] = useState<string>("");

  // Add state for tracking which cells should shake
  const [shakingCells, setShakingCells] = useState<Set<string>>(new Set());

  const [showCompletedPopup, setShowCompletedPopup] = useState<boolean>(false);
  const [showRules, setShowRules] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const fid = context?.user?.fid?.toString() || "anonymous";
    const key = `hasSeenRules:${fid}`;
    const seen =
      typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (!seen) {
      setShowRules(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(key, "1");
      }
    }
  }, [context?.user?.fid]);

  useEffect(() => {
    setGameStartTime(new Date());
  }, []);

  // Calculate letter statuses for keyboard
  const getLetterStatuses = () => {
    const letterStatuses: Record<string, "correct" | "present" | "absent"> = {};

    // Process all guesses to determine final status for each letter
    game.guesses.forEach((guess: string, guessIndex: number) => {
      const guessStatuses = game.statuses[guessIndex];
      guess.split("").forEach((letter: string, letterIndex: number) => {
        const status = guessStatuses[letterIndex];
        const currentStatus = letterStatuses[letter];

        // Priority: correct > present > absent
        if (!currentStatus) {
          letterStatuses[letter] = status;
        } else if (status === "correct") {
          letterStatuses[letter] = "correct";
        } else if (status === "present" && currentStatus === "absent") {
          letterStatuses[letter] = "present";
        }
        // If current status is "correct" or "present", don't downgrade to "absent"
      });
    });

    return letterStatuses;
  };

  const handleKeyPress = (key: string) => {
    if (
      game.guesses.length >= NUM_ROWS ||
      gameCompleted ||
      gameOver ||
      isSubmitting ||
      game.completed
    )
      return;
    if (currentGuess.length < WORD_LENGTH) {
      const newGuess = currentGuess + key;
      setCurrentGuess(newGuess);

      // Add shake effect for the new letter
      const cellKey = `${game.guesses.length}-${newGuess.length - 1}`;
      setShakingCells((prev) => new Set([...prev, cellKey]));

      // Remove shake effect after animation completes
      setTimeout(() => {
        setShakingCells((prev) => {
          const newSet = new Set(prev);
          newSet.delete(cellKey);
          return newSet;
        });
      }, 500);

      setError(null);
      setShowError(false);
    }
  };

  const handleEnter = async () => {
    if (
      game.guesses.length >= NUM_ROWS ||
      gameCompleted ||
      gameOver ||
      isSubmitting
    )
      return;

    // Check if word is complete
    if (currentGuess.length < WORD_LENGTH) {
      setError("Not enough letters");
      setShowError(true);
      setIsShaking(true);

      // Hide error message after 2 seconds
      setTimeout(() => {
        setShowError(false);
        setError(null);
      }, 2000);

      // Stop shake animation after 500ms
      setTimeout(() => {
        setIsShaking(false);
      }, 250);

      return;
    }

    if (currentGuess.length === WORD_LENGTH) {
      // Check if word exists using the API
      const wordExists = await isValidWord(currentGuess);

      if (!wordExists) {
        setError("Not in dictionary");
        setShowError(true);
        setIsShaking(true);

        // Hide error message after 2 seconds
        setTimeout(() => {
          setShowError(false);
          setError(null);
        }, 2000);

        // Stop shake animation after 500ms
        setTimeout(() => {
          setIsShaking(false);
        }, 250);

        return;
      }

      // Prevent duplicate submissions
      setIsSubmitting(true);
      setError(null);
      setShowError(false);

      const newGuess = currentGuess.toUpperCase();
      const newStatuses = getLetterStatus(newGuess, dailyWord || "");

      // Store the submitting guess and clear current guess immediately
      setSubmittingGuess(newGuess);
      setCurrentGuess("");

      // Start flip animation
      setFlippingRow(game.guesses.length);

      // Save guess to MongoDB
      await saveGuess(newGuess, newStatuses);

      // Wait for flip animation to complete (2.5 seconds for 5 letters)
      setTimeout(() => {
        setFlippingRow(null);
        setIsSubmitting(false);
        // Clear submitting guess after animation completes
        setSubmittingGuess("");

        // Check if the word is correct
        if (newGuess === dailyWord) {
          const endTime = new Date();
          const timeDiff = Math.floor(
            (endTime.getTime() - gameStartTime.getTime()) / 1000
          );

          setGameCompleted(true);
          completeGame(true, timeDiff);
        } else if (game.guesses.length + 1 >= NUM_ROWS) {
          // Game over - all attempts used
          const endTime = new Date();
          const timeDiff = Math.floor(
            (endTime.getTime() - gameStartTime.getTime()) / 1000
          );

          setGameOver(true);
          completeGame(false, timeDiff);
        }
      }, 2500);
    }
  };

  const handleBackspace = () => {
    if (gameCompleted || gameOver || isSubmitting) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
    setError(null);
    setShowError(false);
  };

  // Keyboard handler for physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        game.guesses.length >= NUM_ROWS ||
        gameCompleted ||
        gameOver ||
        isSubmitting
      )
        return;
      if (e.key === "Enter") {
        handleEnter();
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (
        /^[a-zA-Z]$/.test(e.key) &&
        currentGuess.length < WORD_LENGTH
      ) {
        handleKeyPress(e.key.toUpperCase());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentGuess,
    game.guesses,
    game.statuses,
    gameCompleted,
    gameOver,
    isSubmitting,
    handleBackspace,
    handleEnter,
    handleKeyPress,
  ]);

  const letterStatuses = getLetterStatuses();

  // Show completed game popup if game is completed
  useEffect(() => {
    if (game.completed) {
      setShowCompletedPopup(true);
    }
  }, [game.completed]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Show loading state
  if (loading || dailyWordLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dictionary-bg dark:dictionary-bg-dark p-6">
        <div className="dictionary-card rounded-xl shadow-lg border border-amber-300/70 dark:border-neutral-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <svg
              className="w-7 h-7 text-amber-700 dark:text-amber-300 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span className="text-lg font-serif font-bold text-amber-900 dark:text-amber-100">
              Loading game...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (gameError || dailyWordError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-black">
        <div className="text-red-500 mb-4">
          Error: {gameError || dailyWordError}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show error if no daily word is available
  if (!dailyWord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-black">
        <div className="text-red-500 mb-4">No daily word available</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-amber-50/80 dark:bg-neutral-900/80 backdrop-blur border-b border-amber-200/60 dark:border-neutral-800 z-30 px-4 py-2">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          {/* Game Rules Button - Left */}
          <button
            onClick={() => setShowRules(true)}
            className="hidden sm:inline-flex items-center justify-center border border-amber-300 dark:border-neutral-700 text-amber-900 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 h-10 w-10 rounded-md transition-colors shadow-sm"
            aria-label="Open rules"
            title="Rules"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="currentColor"
            >
              <path d="M4 4h10a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a4 4 0 0 1-4-4V6a2 2 0 0 1 2-2zm2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8V8a2 2 0 0 0-2-2H6zm10 0h2a2 2 0 0 1 2 2v10h-2V8a4 4 0 0 0-2-2z" />
            </svg>
          </button>

          {/* Title - Center */}
          <div className="flex flex-col items-center select-none">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-serif font-bold tracking-wide w-logo">
                W
              </span>
              <span className="text-xs sm:text-sm font-serif italic text-amber-800/80 dark:text-amber-300/80">
                dictionary edition
              </span>
            </div>
            <div className="text-[10px] sm:text-xs font-serif text-amber-700/80 dark:text-amber-300/60">
              [wurd-uhl] • n. a daily lexical puzzle of five letters
            </div>
          </div>

          {/* Stats Button - Right */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStats(true)}
              className="inline-flex items-center justify-center border border-amber-300 dark:border-neutral-700 text-amber-900 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 h-10 w-10 rounded-md transition-colors shadow-sm"
              aria-label="Open stats"
              title="Stats"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
              >
                <path d="M5 3a1 1 0 0 1 1 1v14h12a1 1 0 1 1 0 2H6a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1zm4 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v5H9v-5zm6-6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v11h-3V7zm-6 2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v9h-3V9z" />
              </svg>
            </button>
            {userAvatarUrl && (
              <img
                src={userAvatarUrl}
                alt="User profile"
                title={
                  context?.user?.username
                    ? `@${context.user.username}`
                    : "Profile"
                }
                className="h-10 w-10 rounded-full border border-amber-300 dark:border-neutral-700 shadow-sm object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (
                    context?.user?.pfpUrl &&
                    target.src !== context.user?.pfpUrl
                  ) {
                    target.src = context.user.pfpUrl as string;
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Main Content */}
      <div className="min-h-screen dictionary-bg dark:dictionary-bg-dark pt-[56px] pb-36">
        <div className="flex flex-col items-center justify-start p-2">
          {/* Completed Game Popup */}
          {showCompletedPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="dictionary-card rounded-xl p-6 max-w-sm w-full mx-4 text-center relative border border-amber-300/70 dark:border-neutral-800 shadow-lg">
                {/* Close button */}
                <button
                  onClick={() => setShowCompletedPopup(false)}
                  className="absolute top-4 right-4 text-amber-900 hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>

                <h2 className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-3">
                  Today&apos;s Word
                </h2>

                <p className="text-base mb-5 text-amber-800/90 dark:text-amber-200/90">
                  You have played today&apos;s game. Come back tomorrow to guess
                  a new word! The word was{" "}
                  <span className="font-bold text-amber-900 dark:text-amber-100 bg-amber-200/80 dark:bg-neutral-800 px-2 rounded border border-amber-300/70 dark:border-neutral-700">
                    {dailyWord}
                  </span>
                </p>

                {/* Game Result */}
                <div className="bg-amber-100/70 dark:bg-neutral-900 rounded-lg p-4 mb-6 border border-amber-300/70 dark:border-neutral-800 text-left">
                  <div className="text-sm font-serif text-amber-900 dark:text-amber-100 mb-2">
                    {game.won ? (
                      <span>Result: Won</span>
                    ) : (
                      <span>Result: Lost</span>
                    )}
                  </div>
                  <div className="text-sm text-amber-800/90 dark:text-amber-200/80">
                    Attempts: {game.attempts}/6
                    {game.timeTaken > 0 && (
                      <span className="ml-4">
                        Time: {formatTime(game.timeTaken)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCompletedPopup(false)}
                    className="flex-1 border border-amber-300 dark:border-neutral-700 bg-amber-100 hover:bg-amber-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-amber-900 dark:text-amber-200 font-semibold py-2 px-6 rounded-md transition-colors shadow-sm"
                  >
                    Close
                  </button>
                  {game.won && (
                    <ShareButton
                      buttonText="Share"
                      cast={{
                        text: `I guessed today's word in ${
                          game.attempts
                        } attempts! and it took me ${formatTime(
                          game.timeTaken
                        )} to complete !`,
                        bestFriends: true,
                        embeds: [
                          `${APP_URL}/share/${context?.user?.fid || ""}`,
                        ],
                      }}
                      className="flex-1 border border-amber-300 dark:border-neutral-700 bg-amber-100 hover:bg-amber-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-amber-900 dark:text-amber-200 font-semibold rounded-md transition-colors shadow-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error message at the top of the board */}
          <div className="h-12 w-full max-w-md mb-4 flex items-center justify-center">
            {showError && error && (
              <div className="animate-slide-down bg-amber-200/90 dark:bg-neutral-800 text-amber-950 dark:text-amber-100 border border-amber-300 dark:border-neutral-700 px-4 py-2 rounded-md shadow-sm font-serif">
                {error}
              </div>
            )}
          </div>

          <div className="w-full max-w-md dictionary-card rounded-xl shadow-lg border border-amber-300/70 dark:border-neutral-800 overflow-hidden">
            <div className="bg-amber-100/60 dark:bg-neutral-900 px-4 py-3 border-b border-amber-300/70 dark:border-neutral-800 flex items-center justify-between">
              <div className="text-sm font-serif italic text-amber-900/80 dark:text-amber-200/80">
                Page {new Date().getDate()} • Volume {new Date().getFullYear()}
              </div>
              <div className="h-3 w-12 bg-amber-300/70 dark:bg-neutral-700 rounded-sm" />
            </div>

            <div className="p-4 grid grid-rows-6 gap-2 bg-paper dark:bg-paper-dark">
              {[...Array(NUM_ROWS)].map((_, rowIndex) => {
                const word =
                  rowIndex < game.guesses.length
                    ? game.guesses[rowIndex]
                    : rowIndex === game.guesses.length && !isSubmitting
                    ? currentGuess
                    : rowIndex === flippingRow
                    ? submittingGuess
                    : "";
                const rowStatus =
                  rowIndex < game.statuses.length
                    ? game.statuses[rowIndex]
                    : [];
                const isCurrentRow = rowIndex === game.guesses.length;
                const isFlipping = flippingRow === rowIndex;

                return (
                  <div
                    key={rowIndex}
                    className={classNames("grid grid-cols-5 gap-2", {
                      "animate-shake": isShaking && isCurrentRow,
                    })}
                  >
                    {[...Array(WORD_LENGTH)].map((_, colIndex) => {
                      const cellStatus = rowStatus[colIndex] || "";
                      const isFlippingCell =
                        isFlipping && colIndex < word.length;
                      const cellKey = `${rowIndex}-${colIndex}`;
                      const isShakingCell = shakingCells.has(cellKey);

                      return (
                        <div
                          key={colIndex}
                          className={classNames(
                            "w-full aspect-square border text-center font-bold text-2xl uppercase flex items-center justify-center transition-all duration-500 rounded-lg font-serif shadow-sm tile",
                            {
                              "bg-emerald-500 text-white border-emerald-600 shadow-emerald":
                                cellStatus === "correct",
                              "bg-amber-400 text-white border-amber-500 shadow-amber":
                                cellStatus === "present",
                              "bg-amber-100 dark:bg-neutral-800 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-neutral-700":
                                cellStatus === "absent" && word[colIndex],
                              "bg-amber-50/70 dark:bg-neutral-900 text-amber-900 dark:text-amber-100 border-amber-300/80 dark:border-neutral-800":
                                !cellStatus,
                              "animate-flip": isFlippingCell,
                              "animate-cell-shake": isShakingCell,
                            }
                          )}
                          style={{
                            animationDelay: isFlippingCell
                              ? `${colIndex * 300}ms`
                              : "0ms",
                            animationFillMode: isFlippingCell
                              ? "forwards"
                              : "none",
                          }}
                        >
                          {word[colIndex] || ""}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {game.won && (
            <>
              <div className="text-center font-serif text-amber-800 dark:text-amber-200 mt-4 mb-3">
                You guessed today&apos;s word. Come again tomorrow to continue
                your streak!
              </div>
              <div className="flex justify-center w-full max-w-md">
                <ShareButton
                  buttonText="Share"
                  cast={{
                    text: `I guessed today's word in ${
                      game.attempts
                    } attempts! and it took me ${formatTime(
                      game.timeTaken
                    )} to complete `,
                    bestFriends: true,
                    embeds: [`${APP_URL}/share/${context?.user?.fid || ""}`],
                  }}
                  className="flex-1 border border-amber-300 dark:border-neutral-700 bg-amber-100 hover:bg-amber-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-amber-900 dark:text-amber-200 font-semibold py-2 px-4 rounded-md transition-colors shadow-sm"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fixed Keyboard at bottom */}
      <Keyboard
        onKeyPress={handleKeyPress}
        onEnter={handleEnter}
        onBackspace={handleBackspace}
        letterStatuses={letterStatuses}
      />

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        @keyframes cell-shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-3px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(3px);
          }
        }

        @keyframes slide-down {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          20% {
            transform: translateY(0);
            opacity: 1;
          }
          80% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-20px);
            opacity: 0;
          }
        }

        @keyframes slide-up {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          20% {
            transform: translateY(0);
            opacity: 1;
          }
          80% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-20px);
            opacity: 0;
          }
        }

        @keyframes flip {
          0% {
            transform: rotateX(0deg);
          }
          49.99% {
            transform: rotateX(90deg);
          }
          50% {
            transform: rotateX(90deg);
            background-color: inherit; /* Or set to the correct mid-flip color */
          }
          100% {
            transform: rotateX(0deg);
          }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-cell-shake {
          animation: cell-shake 0.5s ease-in-out;
        }

        .animate-slide-down {
          animation: slide-down 2s ease-in-out;
        }

        .animate-slide-up {
          animation: slide-up 2s ease-in-out;
        }

        .animate-flip {
          animation: flip 0.6s linear;
          animation-fill-mode: forwards;
          transform-style: preserve-3d;
        }

        /* Animated W logo colors */
        @keyframes w-colors {
          0% {
            color: #ff66c4;
          }
          25% {
            color: #8e66ff;
          }
          50% {
            color: #66edff;
          }
          75% {
            color: #ff6678;
          }
          100% {
            color: #ff66c4;
          }
        }
        .w-logo {
          animation: w-colors 6s ease-in-out infinite;
        }

        /* Dictionary theme additions */
        .dictionary-bg {
          background: linear-gradient(180deg, #fef3c7 0%, #fdf6e3 100%);
        }
        .dictionary-bg-dark {
          background: linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
        }
        .dictionary-card {
          background: #fffaf0;
        }
        :global(.dark) .dictionary-card {
          background: #0b0b0b;
        }
        .bg-paper {
          background-image: repeating-linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0px,
            rgba(0, 0, 0, 0) 23px,
            rgba(203, 162, 91, 0.25) 24px
          );
          position: relative;
        }
        .bg-paper::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(59, 7, 0, 0.08),
            rgba(0, 0, 0, 0)
          );
          pointer-events: none;
        }
        .bg-paper-dark {
          background-image: repeating-linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0) 0px,
            rgba(255, 255, 255, 0) 23px,
            rgba(255, 255, 255, 0.08) 24px
          );
          position: relative;
        }
        .bg-paper-dark::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0.06),
            rgba(0, 0, 0, 0)
          );
          pointer-events: none;
        }
        .tile {
          box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.06);
        }
        .shadow-emerald {
          box-shadow: 0 1px 0 0 rgba(16, 185, 129, 0.4),
            inset 0 -2px 0 rgba(0, 0, 0, 0.08);
        }
        .shadow-amber {
          box-shadow: 0 1px 0 0 rgba(245, 158, 11, 0.4),
            inset 0 -2px 0 rgba(0, 0, 0, 0.08);
        }
      `}</style>

      {/* Game Rules Modal */}
      {showRules && <GameRules onClose={() => setShowRules(false)} />}
      {showStats && (
        <StatsDisplay
          onClose={() => setShowStats(false)}
          currentStreak={stats.currentStreak}
          maxStreak={stats.maxStreak}
          gamesPlayed={stats.gamesPlayed}
          gamesWon={stats.gamesWon}
          winRate={stats.winRate}
          averageAttempts={stats.averageAttempts}
        />
      )}
    </>
  );
}
