"use client";

import * as React from "react";
import { WifiOff, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = React.useState<boolean>(() => {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.onLine === "boolean"
    ) {
      return navigator.onLine;
    }
    return true;
  });
  const [showRestoredToast, setShowRestoredToast] = React.useState(false);

  React.useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setShowRestoredToast(true);
      const timer = setTimeout(() => setShowRestoredToast(false), 3500);
      return () => clearTimeout(timer);
    }

    function handleOffline() {
      setIsOnline(false);
      setShowRestoredToast(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {/* Offline Alert Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            role="status"
            aria-live="polite"
            className="bg-card/95 shadow-elevated fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-2xl border border-amber-500/40 px-4 py-2.5 text-xs font-semibold text-amber-700 backdrop-blur-xl sm:text-sm dark:text-amber-300"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <span>
              You are currently offline. Actions will be cached locally until
              connection restores.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Restored Toast */}
      <AnimatePresence>
        {showRestoredToast && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            role="status"
            aria-live="polite"
            className="bg-card/95 shadow-elevated fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-2xl border border-emerald-500/40 px-4 py-2.5 text-xs font-semibold text-emerald-700 backdrop-blur-xl sm:text-sm dark:text-emerald-300"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <span>
              Connection restored! Re-synchronized with Revel servers.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
