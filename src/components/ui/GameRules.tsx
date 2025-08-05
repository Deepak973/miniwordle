"use client";

type GameRulesProps = {
  onClose: () => void;
};

export function GameRules({ onClose }: GameRulesProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
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

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          📜 Game Rules
        </h2>
        <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300 text-sm leading-6">
          <li>You have 6 attempts to guess the correct 5-letter word.</li>
          <li>Green = correct letter & correct position.</li>
          <li>Yellow = correct letter, wrong position.</li>
          <li>Gray = letter not in the word.</li>
          <li>New word every day. You can play once daily.</li>
        </ul>
      </div>
    </div>
  );
}
