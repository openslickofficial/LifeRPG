"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Sparkles } from "lucide-react";

interface CinematicShowcaseProps {
  videoSrc?: string;
  className?: string;
}

export function CinematicShowcase({
  videoSrc = "/hero.mp4",
  className = "",
}: CinematicShowcaseProps) {
  const prefersReducedMotion = useReducedMotion();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [hasStarted, setHasStarted] = React.useState(false);

  const handlePlayToggle = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // On first play, ensure sound is unmuted per requirement
      if (!hasStarted) {
        videoRef.current.muted = false;
        setIsMuted(false);
        setHasStarted(true);
      }
      videoRef.current.play().catch(() => {
        // In case browser autoplay policy blocks unmuted audio on first click, fall back to muted play
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play();
        }
      });
      setIsPlaying(true);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <section
      id="cinematic"
      className={`relative z-10 max-w-6xl mx-auto px-6 sm:px-8 py-20 sm:py-28 scroll-mt-20 ${className}`}
    >
      {/* Section Header */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="text-center mb-10 sm:mb-14"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/[0.08] dark:border-white/[0.08] bg-slate-900/[0.04] dark:bg-white/[0.03] px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 backdrop-blur-xs mb-3">
          <Sparkles className="h-3 w-3" />
          Cinematic Showcase
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          Enter the World of Revel
        </h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-body leading-relaxed">
          Your companions are waiting for their next adventure. Watch the realm awaken as discipline turns into legend.
        </p>
      </motion.div>

      {/* Video Container Frame with Soft Glow */}
      <motion.div
        ref={containerRef}
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative mx-auto w-full max-w-5xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Soft Accent-Colored Glow behind frame */}
        <div className="pointer-events-none absolute -inset-2 sm:-inset-4 rounded-3xl sm:rounded-[36px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.20)_0%,rgba(16,185,129,0.05)_50%,transparent_75%)] blur-2xl -z-10" />

        {/* Video Player Card */}
        <div
          onClick={handlePlayToggle}
          className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-900/[0.12] dark:border-white/[0.12] bg-slate-100 dark:bg-[#12121A] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md"
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            loop
            preload="metadata"
            onEnded={() => setIsPlaying(false)}
            className="h-full w-full object-cover object-center"
          />

          {/* Vignette Overlay for cinematic look */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Large Centered Play Button Overlay (fades out when playing) */}
          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]"
              >
                {/* Pulsing Glow Ring around Play Button */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                  <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.5)] ring-4 ring-emerald-400/30 transition-transform duration-200 group-hover:scale-110 active:scale-95">
                    <Play className="ml-1 h-7 w-7 sm:h-8 sm:w-8 fill-current" />
                  </div>
                </div>

                <span className="font-display mt-4 text-xs sm:text-sm font-bold tracking-wider uppercase text-white drop-shadow-md">
                  Play with Sound
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hover Controls (Mute / Pause) when playing */}
          <AnimatePresence>
            {isPlaying && (isHovered || !hasStarted) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayToggle();
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-colors"
                    aria-label={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <span className="text-xs font-mono text-slate-300">
                    Revel Realm Cinematic
                  </span>
                </div>

                {/* Sound Toggle */}
                <button
                  type="button"
                  onClick={handleMuteToggle}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-colors"
                  aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-emerald-400" />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
