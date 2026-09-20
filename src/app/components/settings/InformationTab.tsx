"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";
import { useUserStore } from "../../../stores/user";
import { useState } from "react";
import { useProfileStore } from "../../../stores/profile";

export function InformationTab() {
  const colors = useTheme();
  const user = useUserStore.getState();
  const [showModal, setShowModal] = useState(false);

  const favoriteCharacter =
    useProfileStore((s) => s.getFavoriteCharacter()) ||
    "cid_001_athena_commando_f_default";

  const iconUrl = `https://fortnite-api.com/images/cosmetics/br/${favoriteCharacter.toLowerCase()}/icon.png`;

  return (
    <>
      <div className="settings-info-stack">
        <div
          className={`rounded-xl p-6 ${colors.current.background.secondary} border ${colors.current.border}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-full h-full max-w-15 rounded-xl bg-transparent flex items-center justify-center text-2xl font-bold text-white">
                <img src={iconUrl} alt="" className="rounded-xl" />
              </div>
              <div>
                <h2
                  className={`text-xl font-bold ${colors.current.text.primary}`}
                >
                  {user.displayName}
                </h2>
                <p className={`text-sm ${colors.current.text.secondary}`}>
                  {user.accountId}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg ${colors.current.button.base} ${colors.current.button.hover} ${colors.current.text.primary} transition-colors`}
            >
              <LogOut size={18} />
              <span className="font-medium">Log Out</span>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`rounded-2xl p-8 w-[400px] ${colors.current.background.secondary} border ${colors.current.border} text-center shadow-xl`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className={`text-2xl font-bold mb-4 ${colors.current.text.primary}`}
              >
                Confirm Logout
              </h2>
              <p className={`text-sm mb-6 ${colors.current.text.secondary}`}>
                Are you sure you want to log out?
              </p>
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg ${colors.current.button.base} ${colors.current.text.primary} transition-colors`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowModal(false);
                    user.logout();
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Log Out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
