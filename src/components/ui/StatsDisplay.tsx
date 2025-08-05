"use client";

interface StatsDisplayProps {
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  averageAttempts: number;
  onClose: () => void;
}

export function StatsDisplay({
  currentStreak,
  maxStreak,
  gamesPlayed,
  gamesWon,
  winRate,
  averageAttempts,
  onClose,
}: StatsDisplayProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 relative">
          {/* Close Button - matching GameRules style */}
          <button
            onClick={() => onClose()}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>

          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
            Game Stats
          </h2>

          {/* Stats Grid with Box Design */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Current Streak Box */}
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg p-4 text-center shadow-lg">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-3xl font-bold text-white mb-1">
                {currentStreak}
              </div>
              <div className="text-sm text-yellow-100 font-medium">
                Current Streak
              </div>
            </div>

            {/* Max Streak Box */}
            <div className="bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg p-4 text-center shadow-lg">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-3xl font-bold text-white mb-1">
                {maxStreak}
              </div>
              <div className="text-sm text-cyan-100 font-medium">
                Max Streak
              </div>
            </div>

            {/* Games Played Box */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-4 text-center shadow-lg">
              <div className="text-2xl mb-1">🎮</div>
              <div className="text-3xl font-bold text-white mb-1">
                {gamesPlayed}
              </div>
              <div className="text-sm text-blue-100 font-medium">
                Games Played
              </div>
            </div>

            {/* Games Won Box */}
            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-4 text-center shadow-lg">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-3xl font-bold text-white mb-1">
                {gamesWon}
              </div>
              <div className="text-sm text-green-100 font-medium">
                Games Won
              </div>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Win Rate Box */}
            <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg p-4 text-center shadow-lg">
              <div className="text-2xl mb-1">📈</div>
              <div className="text-2xl font-bold text-white mb-1">
                {winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-100 font-medium">
                Win Rate
              </div>
            </div>

            {/* Average Attempts Box */}
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg p-4 text-center shadow-lg">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-2xl font-bold text-white mb-1">
                {averageAttempts.toFixed(1)}
              </div>
              <div className="text-sm text-orange-100 font-medium">
                Avg Attempts
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
