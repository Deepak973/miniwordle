"use client";

type GameRulesProps = {
  onClose: () => void;
};

export function GameRules({ onClose }: GameRulesProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-amber-50/95 dark:bg-neutral-950/95 rounded-xl p-6 max-w-md w-full mx-4 relative border border-amber-200/70 dark:border-neutral-800 shadow-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
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

        <h2 className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-4">
          Game Rules
        </h2>
        <ul className="space-y-2 text-amber-900/90 dark:text-amber-100/90 text-sm leading-6">
          <li>• You have 6 attempts to guess the correct 5-letter word.</li>
          <li>• Green: correct letter in the correct position.</li>
          <li>• Yellow: correct letter in the wrong position.</li>
          <li>• Gray: letter is not in the word.</li>
          <li>• A new word is available every day.</li>
        </ul>
      </div>
    </div>
  );
}
