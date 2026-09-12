"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Shield,
  Zap,
  Sword,
  Palette,
  X,
  Crown,
  ChevronRight,
} from "lucide-react";

export interface CharacterLevelUpData {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  levelsGained: number;
}

export interface AttributeLevelUpData {
  leveledUp: boolean;
  attributeName: string;
  oldLevel: number;
  newLevel: number;
  levelsGained: number;
}

interface LevelUpCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  characterLevelUp?: CharacterLevelUpData | null;
  attributeLevelUp?: AttributeLevelUpData | null;
}

// Deterministic particle data generator
const PARTICLE_COUNT = 24;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
  const angle = (i / PARTICLE_COUNT) * 2 * Math.PI;
  const distance = 140 + (i % 5) * 35; // 140px to 280px
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const size = 6 + (i % 4) * 4;
  const colors = [
    "bg-amber-400 text-amber-400",
    "bg-cyan-400 text-cyan-400",
    "bg-violet-400 text-violet-400",
    "bg-rose-400 text-rose-400",
    "bg-emerald-400 text-emerald-400",
  ];
  return {
    id: i,
    x,
    y,
    size,
    colorClass: colors[i % colors.length],
    delay: (i % 6) * 0.04,
    rotation: (i * 37) % 360,
  };
});

function getAttributeIcon(name?: string) {
  switch (name?.toLowerCase()) {
    case "strength":
      return <Sword className="h-4 w-4 text-rose-400" />;
    case "intellect":
      return <Zap className="h-4 w-4 text-cyan-400" />;
    case "creativity":
      return <Palette className="h-4 w-4 text-amber-400" />;
    case "discipline":
    default:
      return <Shield className="h-4 w-4 text-violet-400" />;
  }
}

function getAttributeColor(name?: string) {
  switch (name?.toLowerCase()) {
    case "strength":
      return "border-rose-500/40 bg-rose-500/15 text-rose-300";
    case "intellect":
      return "border-cyan-500/40 bg-cyan-500/15 text-cyan-300";
    case "creativity":
      return "border-amber-500/40 bg-amber-500/15 text-amber-300";
    case "discipline":
    default:
      return "border-violet-500/40 bg-violet-500/15 text-violet-300";
  }
}

export function LevelUpCelebration({
  isOpen,
  onClose,
  characterLevelUp,
  attributeLevelUp,
}: LevelUpCelebrationProps) {
  const prefersReducedMotion = useReducedMotion();

  // Auto-dismiss after 3.8 seconds
  React.useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3800);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const newLevel = characterLevelUp?.newLevel || 2;
  const levelsGained = characterLevelUp?.levelsGained || 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="level-up-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.15 : 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Level Up Celebration"
        >
          {/* Central celebratory modal */}
          <div className="relative flex flex-col items-center">
            {/* Animated particles burst (disabled if prefers-reduced-motion) */}
            {!prefersReducedMotion && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {PARTICLES.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{
                      x: p.x,
                      y: p.y,
                      scale: [0, 1.4, 0.8, 0],
                      opacity: [0, 1, 0.9, 0],
                      rotate: p.rotation + 180,
                    }}
                    transition={{
                      duration: 1.6,
                      delay: p.delay,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{ width: p.size, height: p.size }}
                    className={`absolute rounded-full shadow-lg ${p.colorClass}`}
                  />
                ))}

                {/* Rotating radiant rays behind badge */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 20,
                    ease: "linear",
                  }}
                  className="from-primary/20 pointer-events-none absolute h-96 w-96 rounded-full bg-gradient-to-tr via-amber-500/10 to-transparent blur-2xl"
                />
              </div>
            )}

            {/* Main Celebration Card */}
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { scale: 0.5, y: 30, opacity: 0 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { scale: 1, y: 0, opacity: 1 }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { scale: 0.85, opacity: 0, y: -20 }
              }
              transition={{
                type: "spring",
                damping: 22,
                stiffness: 280,
              }}
              onClick={(e) => e.stopPropagation()}
              className="border-primary/40 bg-card/95 shadow-elevated relative z-10 mx-auto flex max-w-sm flex-col items-center rounded-3xl border p-8 text-center backdrop-blur-2xl sm:max-w-md"
            >
              {/* Top dismissal button */}
              <button
                type="button"
                onClick={onClose}
                className="hover:bg-muted/80 text-muted-foreground absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                aria-label="Dismiss celebration"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Crown Emblem with Glow */}
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0, rotate: -20 }}
                animate={prefersReducedMotion ? {} : { scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  delay: 0.15,
                  stiffness: 300,
                  damping: 18,
                }}
                className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-400/20 via-amber-500/15 to-violet-600/20 shadow-[0_0_40px_rgba(245,158,11,0.35)]"
              >
                <Crown className="h-10 w-10 text-amber-400 drop-shadow-md" />
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 animate-pulse text-yellow-300" />
              </motion.div>

              {/* Display Title */}
              <motion.h2
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-heading bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent drop-shadow-sm sm:text-4xl"
              >
                LEVEL UP!
              </motion.h2>

              <p className="font-body text-muted-foreground mt-1 text-xs sm:text-sm">
                Your character has ascended through relentless action!
              </p>

              {/* Level Number Scale Bounce */}
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0.4 }}
                animate={
                  prefersReducedMotion
                    ? {}
                    : { scale: [0.4, 1.28, 1], rotate: [0, -4, 0] }
                }
                transition={{
                  delay: 0.25,
                  duration: 0.7,
                  ease: [0.175, 0.885, 0.32, 1.275],
                }}
                className="my-5 flex items-baseline justify-center gap-2"
              >
                <span className="font-heading text-muted-foreground text-xl font-bold tracking-widest uppercase">
                  Level
                </span>
                <span className="text-primary font-mono text-6xl font-extrabold tracking-tighter drop-shadow-lg sm:text-7xl">
                  {newLevel}
                </span>
                {levelsGained > 1 && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
                    +{levelsGained} LVLS!
                  </span>
                )}
              </motion.div>

              {/* Attribute Level Up Badge if applicable */}
              {attributeLevelUp && attributeLevelUp.leveledUp && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-xs font-semibold shadow-sm ${getAttributeColor(
                    attributeLevelUp.attributeName
                  )}`}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/20">
                    {getAttributeIcon(attributeLevelUp.attributeName)}
                  </div>
                  <span>
                    <strong>{attributeLevelUp.attributeName}</strong> ascended
                    to Level {attributeLevelUp.newLevel}!
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </motion.div>
              )}

              {/* Auto-dismissing hint */}
              <div className="mt-6 flex flex-col items-center gap-2">
                <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase opacity-70">
                  Click anywhere or press ESC to dismiss
                </span>

                {/* Subtle dismiss progress bar */}
                <div className="bg-muted h-1 w-32 overflow-hidden rounded-full">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 3.8, ease: "linear" }}
                    className="bg-primary/60 h-full rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
