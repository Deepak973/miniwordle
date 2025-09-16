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
  ["BACKSPACE", "Z", "X", "C", "V", "B", "N", "M", "ENTER"],
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
    <div className="fixed bottom-0 left-0 right-0 w-full px-2 pb-4 bg-amber-50/80 dark:bg-neutral-950/70 backdrop-blur border-t border-amber-200/60 dark:border-neutral-800">
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1.5 mb-1.5">
          {row.map((key) => {
            const status = getKeyStatus(key);
            const isSpecialKey = key === "ENTER" || key === "BACKSPACE";

            const baseKeyStyle =
              "flex items-center justify-center font-serif font-semibold text-sm uppercase rounded-md transition-all h-12 border shadow-sm";

            const widthClass = isSpecialKey
              ? "px-3 min-w-[56px]"
              : "w-10 sm:w-12";

            const bgColorClass = {
              correct:
                "!bg-emerald-500 !text-white !border-emerald-600 shadow-[0_1px_0_rgba(16,185,129,0.4),inset_0_-2px_0_rgba(0,0,0,0.08)]",
              present:
                "!bg-amber-400 !text-white !border-amber-500 shadow-[0_1px_0_rgba(245,158,11,0.4),inset_0_-2px_0_rgba(0,0,0,0.08)]",
              absent:
                "!bg-amber-100 !text-amber-900 dark:!bg-neutral-800 dark:!text-amber-100 !border-amber-300 dark:!border-neutral-700",
              unused:
                "bg-amber-50/80 dark:bg-neutral-900 text-amber-900 dark:text-amber-100 border-amber-300/80 dark:border-neutral-800",
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
