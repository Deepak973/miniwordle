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
        <div className="bg-amber-50/95 dark:bg-neutral-950/95 rounded-xl p-6 max-w-lg w-full mx-4 relative border border-amber-200/70 dark:border-neutral-800 shadow-lg">
          {/* Close Button - matching GameRules style */}
          <button
            onClick={() => onClose()}
            className="absolute top-4 right-4 text-amber-900 hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>

          <h2 className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-6 text-center">
            Game Stats
          </h2>

          {/* Stats Grid with Box Design */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Current Streak Box */}
            <div className="rounded-lg p-4 text-center shadow-sm border border-amber-300/70 dark:border-neutral-800 bg-amber-100/70 dark:bg-neutral-900">
              <div className="text-[11px] tracking-wide uppercase font-medium text-amber-800/80 dark:text-amber-200/80 mb-1">
                Current Streak
              </div>
              <div className="text-3xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-1">
                {currentStreak}
              </div>
            </div>

            {/* Max Streak Box */}
            <div className="rounded-lg p-4 text-center shadow-sm border border-amber-300/70 dark:border-neutral-800 bg-amber-100/70 dark:bg-neutral-900">
              <div className="text-[11px] tracking-wide uppercase font-medium text-amber-800/80 dark:text-amber-200/80 mb-1">
                Max Streak
              </div>
              <div className="text-3xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-1">
                {maxStreak}
              </div>
            </div>

            {/* Games Played Box */}
            <div className="rounded-lg p-4 text-center shadow-sm border border-amber-300/70 dark:border-neutral-800 bg-amber-100/70 dark:bg-neutral-900">
              <div className="text-[11px] tracking-wide uppercase font-medium text-amber-800/80 dark:text-amber-200/80 mb-1">
                Games Played
              </div>
              <div className="text-3xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-1">
                {gamesPlayed}
              </div>
            </div>

            {/* Games Won Box */}
            <div className="rounded-lg p-4 text-center shadow-sm border border-amber-300/70 dark:border-neutral-800 bg-amber-100/70 dark:bg-neutral-900">
              <div className="text-[11px] tracking-wide uppercase font-medium text-amber-800/80 dark:text-amber-200/80 mb-1">
                Games Won
              </div>
              <div className="text-3xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-1">
                {gamesWon}
              </div>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Win Rate Box */}
            <div className="rounded-lg p-4 text-center shadow-sm border border-amber-300/70 dark:border-neutral-800 bg-amber-100/70 dark:bg-neutral-900">
              <div className="text-[11px] tracking-wide uppercase font-medium text-amber-800/80 dark:text-amber-200/80 mb-1">
                Win Rate
              </div>
              <div className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-1">
                {winRate.toFixed(1)}%
              </div>
            </div>

            {/* Average Attempts Box */}
            <div className="rounded-lg p-4 text-center shadow-sm border border-amber-300/70 dark:border-neutral-800 bg-amber-100/70 dark:bg-neutral-900">
              <div className="text-[11px] tracking-wide uppercase font-medium text-amber-800/80 dark:text-amber-200/80 mb-1">
                Avg Attempts
              </div>
              <div className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-1">
                {averageAttempts.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
