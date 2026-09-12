"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Coins, Zap } from "lucide-react";

interface RewardPickupProps {
  xp: number;
  currency: number;
  isVisible: boolean;
  isCritical?: boolean;
  comboCount?: number;
  onAnimationComplete?: () => void;
  className?: string;
}

export function RewardPickup({
  xp,
  currency,
  isVisible,
  isCritical = false,
  comboCount = 1,
  onAnimationComplete,
  className = "",
}: RewardPickupProps) {
  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: isCritical
              ? [0.6, 1.25, 1.15, 0.9]
              : [0.6, 1.15, 1.05, 0.9],
            y: [10, -26, -38, -52],
          }}
          transition={{
            duration: 0.95,
            times: [0, 0.25, 0.7, 1],
            ease: "easeOut",
          }}
          className={`font-heading pointer-events-none absolute z-40 flex items-center gap-2 rounded-2xl border-2 px-3.5 py-1.5 font-black text-slate-950 select-none ${
            isCritical
              ? "border-amber-300 bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 shadow-[0_4px_0_0_#e11d48]"
              : "border-amber-500 bg-amber-400 shadow-[0_4px_0_0_#b45309]"
          } ${className}`}
        >
          {isCritical && (
            <span className="flex items-center gap-0.5 rounded-lg bg-rose-600 px-1.5 py-0.5 font-mono text-[10px] font-black tracking-wider text-white uppercase">
              <Zap className="h-2.5 w-2.5 fill-current" />
              CRIT 2X
            </span>
          )}

          {/* XP Pill */}
          <span className="flex items-center gap-1 font-mono text-xs font-black text-emerald-950">
            <Sparkles className="h-3.5 w-3.5 text-emerald-800" />
            <span>+{xp} XP</span>
          </span>

          <span className="font-black text-amber-900">•</span>

          {/* Gold Pill */}
          <span className="flex items-center gap-1 font-mono text-xs font-black text-amber-950">
            <Coins className="h-3.5 w-3.5 text-amber-900" />
            <span>+{currency} Gold</span>
          </span>

          {comboCount > 1 && (
            <span className="rounded-lg bg-amber-600/20 px-1.5 py-0.5 font-mono text-[10px] font-black text-amber-950">
              x{comboCount} Combo
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
