"use client";

import classNames from "classnames";

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  letterStatuses: Record<string, "correct" | "present" | "absent">;
}

const KEYBOARD_LAYOUT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

export function Keyboard({
  onKeyPress,
  onEnter,
  onBackspace,
  letterStatuses,
}: KeyboardProps) {
  const getKeyStatus = (letter: string) => {
    return letterStatuses[letter] || "unused";
  };

  const handleKeyClick = (key: string) => {
    if (key === "ENTER") {
      onEnter();
    } else if (key === "BACKSPACE") {
      onBackspace();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full px-2 pb-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 mb-1">
          {row.map((key) => {
            const status = getKeyStatus(key);
            const isSpecialKey = key === "ENTER" || key === "BACKSPACE";

            const baseKeyStyle =
              "flex items-center justify-center font-semibold text-sm uppercase rounded transition-colors h-12 border-2";

            const widthClass = isSpecialKey ? "w-[48px]" : "w-10 sm:w-12";

            const bgColorClass = {
              correct: "!bg-green-500 !text-white",
              present: "!bg-yellow-500 !text-white",
              absent: "!bg-gray-500 !text-white",
              unused: "bg-gray-300 dark:bg-gray-600 text-black dark:text-white",
            }[status];

            return (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                className={classNames(baseKeyStyle, widthClass, bgColorClass)}
              >
                {key === "BACKSPACE" ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-6.5-7l-3.5 3.5-3.5-3.5 1.41-1.41L12 10.17l2.09-2.08L15.5 9z" />
                  </svg>
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
