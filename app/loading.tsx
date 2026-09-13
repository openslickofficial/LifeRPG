"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { BlobCharacter } from "@/components/BlobCharacter";

const LOADING_TIPS = [
  "Synchronizing Real-Life Quests...",
  "Tip: Complete quests before midnight to keep your streak alive.",
  "Waking up your companions...",
  "Tip: Hard quests need focus — don't cancel your timer!",
  "Loading the Citadel of Mastery...",
];

export default function RootLoading() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (prefersReducedMotion) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % LOADING_TIPS.length);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [prefersReducedMotion]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Revel..."
      className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.14)_0%,rgba(139,92,246,0.04)_45%,transparent_75%)]" />

      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div
            className={`absolute inset-[-18px] rounded-full bg-primary/20 blur-2xl ${
              prefersReducedMotion ? "opacity-60" : "animate-pulse"
            }`}
          />

          <div className="relative flex items-center justify-center">
            <BlobCharacter
              blobId="pip"
              size="lg"
              state="idle"
              className="drop-shadow-[0_0_26px_rgba(139,92,246,0.35)]"
              priority
            />
          </div>
        </div>

        <div className="mt-6 w-[220px] max-w-[70vw]">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full bg-primary ${
                prefersReducedMotion ? "w-full" : "loading-progress-bar w-1/2"
              }`}
            />
          </div>
        </div>

        <p
          className={`font-heading mt-4 max-w-[26rem] text-center text-[11px] font-black uppercase tracking-[0.24em] text-foreground ${
            prefersReducedMotion ? "opacity-100" : "animate-pulse"
          }`}
        >
          {prefersReducedMotion ? LOADING_TIPS[0] : LOADING_TIPS[activeIndex]}
        </p>
      </div>

      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
}
