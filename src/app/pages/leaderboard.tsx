import { useEffect, useRef, useState } from "react";
import { useLeaderboardStore } from "../../stores/leaderboard";
import { useTheme } from "../../hooks/useTheme";
import { useUserStore } from "../../stores/user";
import { Crown } from "lucide-react";

import { motion } from "framer-motion";

export function Leaderboard() {
  const { entries, loading, fetchLeaderboard } = useLeaderboardStore();
  const colors = useTheme();

  const userAccountId = useUserStore.getState().accountId;

  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [animationDone, setAnimationDone] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLeaderboard("solo", "wins", "keyboardmouse");
  }, []);

  const userIndex = entries.findIndex((e) => e.account === userAccountId);

  const scrollToUser = () => {
    if (!animationDone) return;
    if (userIndex === -1 || !containerRef.current) return;

    const entryElement = containerRef.current.querySelector(
      `[data-index='${userIndex}']`,
    ) as HTMLElement | null;

    if (!entryElement) return;

    const containerTop = containerRef.current.getBoundingClientRect().top;
    const entryTop = entryElement.getBoundingClientRect().top;

    if (
      entryTop < containerTop ||
      entryTop >
        containerTop +
          containerRef.current.clientHeight -
          entryElement.clientHeight
    ) {
      entryElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setHighlightedIndex(userIndex);

    setTimeout(() => setHighlightedIndex(null), 3000);
  };

  if (loading) {
    return <div className="h-40 bg-white/5 rounded-lg animate-pulse" />;
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, damping: 30, stiffness: 330 }}
      onAnimationComplete={() => setAnimationDone(true)}
      className="relative"
    >
      <div className="p-4 max-h-[60vh] overflow-y-auto" ref={containerRef}>
        <h2 className="text-xl font-extrabold text-white mb-1">Leaderboard</h2>
        <p className="mb-4 text-white font-normal">
          View the wins of top players!
        </p>

        <div
          className={`flex items-center justify-between ${colors.current.background.primary} rounded-md px-4 py-2 mb-2 sticky top-0 z-10`}
        >
          <div className="flex items-center gap-4">
            <span className="font-semibold text-white">Username</span>
          </div>

          <span className="font-bold text-white">Wins</span>
        </div>

        {entries.map((entry, index) => {
          const isUser = index === highlightedIndex;
          return (
            <div
              key={entry.account}
              data-index={index}
              className={`flex items-center justify-between ${colors.current.background.primary} rounded-md px-4 py-2 mb-1 cursor-default transition-colors ${
                isUser
                  ? "ring-2 ring-yellow-400 bg-yellow-900/60"
                  : "hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-gray-400 w-6 text-sm">#{index + 1}</span>
                <span className="font-semibold text-white">
                  {entry.displayName}
                </span>
              </div>

              <span className="font-bold flex flex-row items-center justify-center gap-2 text-white">
                <Crown size={20} className="text-yellow-300" /> {entry.value}
              </span>
            </div>
          );
        })}
      </div>

      {userIndex !== -1 && animationDone && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, damping: 30, stiffness: 330 }}
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-between w-max px-5 py-3 rounded-full shadow-lg cursor-pointer select-none z-20
            ${colors.current.background.primary} border ${colors.current.border}`}
          onClick={scrollToUser}
        >
          <span className={`${colors.current.text.primary} font-semibold`}>
            You: #{userIndex + 1}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
