"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion, useInView, type Variants } from "framer-motion";
import { Check, Zap, Star, Shield, ArrowRight, Sparkles } from "lucide-react";
import { BlobCharacter } from "@/components/BlobCharacter";
import { AsteriskLogo } from "@/components/navbar";
import { AmbientParticles } from "@/components/AmbientParticles";
import { CinematicShowcase } from "@/components/CinematicShowcase";

const heroCompanions = [
  { name: "Zippo", attr: "Strength", image: "/blobs/blob-green.png" },
  { name: "Orbit", attr: "Intellect", image: "/blobs/blob-blue.png" },
  { name: "Muse", attr: "Creativity", image: "/blobs/blob-violet.png" },
  { name: "Buddy", attr: "Discipline", image: "/blobs/blob-yellow.png" },
  { name: "Pip", attr: "Mascot", image: "/blobs/blob-pink.png" },
];


const howItWorksSteps = [
  {
    num: "01",
    title: "Create a Quest",
    desc: "Turn routine to-dos, fitness routines, and study sessions into actionable quests with XP and stat tags.",
  },
  {
    num: "02",
    title: "Complete It For Real",
    desc: "Check off quests honestly in your day-to-day life. Stay focused with built-in timers — no pay-to-win shortcuts.",
  },
  {
    num: "03",
    title: "Earn XP & Level Up",
    desc: "Watch your hero stats rise, collect gold loot, evolve companion beasts, and build unstoppable momentum.",
  },
];

const companionShowcase = [
  {
    id: "zippo",
    name: "Zippo",
    attr: "Strength",
    powerText: "Never runs out of energy — turns every workout into a party.",
    accentColor: "#22c55e",
  },
  {
    id: "orbit",
    name: "Orbit",
    attr: "Intellect",
    powerText: "Sees one thing at a time, but sees it completely.",
    accentColor: "#3b82f6",
  },
  {
    id: "muse",
    name: "Muse",
    attr: "Creativity",
    powerText: "Ideas spark out of nowhere when Muse is around.",
    accentColor: "#8b5cf6",
  },
  {
    id: "buddy",
    name: "Buddy",
    attr: "Discipline",
    powerText: "Shows up every single day, rain or shine.",
    accentColor: "#f59e0b",
  },
  {
    id: "pip",
    name: "Pip",
    attr: "Mascot Guide",
    powerText: "A loyal journey companion who celebrates every victory with you.",
    accentColor: "#ec4899",
  },
];

const socialStats = [
  {
    value: 14000,
    label: "Active Adventurers",
    formatter: (n: number) => `${Math.round(n).toLocaleString()}+`,
  },
  {
    value: 2300000,
    label: "Quests Completed",
    formatter: (n: number) => `${(n / 1000000).toFixed(1).replace(".0", "")}M+`,
  },
  {
    value: 4.9,
    label: "Adventurer Rating",
    formatter: (n: number) => `${n.toFixed(1)} / 5`,
  },
  {
    value: 0,
    label: "Pay-to-Win Mechanics",
    formatter: (n: number) => `${Math.round(n)}%`,
  },
];

function AnimatedStatValue({
  target,
  formatter,
}: {
  target: number;
  formatter: (n: number) => string;
}) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = React.useState(
    prefersReducedMotion ? target : 0
  );

  React.useEffect(() => {
    if (!isInView) return;

    if (prefersReducedMotion) return;

    let animationFrame = 0;
    let startTime: number | null = null;
    const duration = 1400;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(target * eased);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isInView, prefersReducedMotion, target]);

  return <span ref={ref}>{formatter(displayValue)}</span>;
}

export default function Home() {
  const [hoveredBlob, setHoveredBlob] = React.useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isHeroVideoReady, setIsHeroVideoReady] = React.useState(prefersReducedMotion);
  const [shouldPlayHeroVideo, setShouldPlayHeroVideo] = React.useState(false);

  const heroRef = React.useRef<HTMLElement>(null);
  const heroVideoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const start = window.requestAnimationFrame(() => {
      setShouldPlayHeroVideo(true);
    });

    return () => window.cancelAnimationFrame(start);
  }, [prefersReducedMotion]);

  React.useEffect(() => {
    if (!shouldPlayHeroVideo || !heroVideoRef.current) return;

    const video = heroVideoRef.current;
    const playPromise = video.play();

    if (playPromise) {
      playPromise.catch(() => {
        setShouldPlayHeroVideo(false);
      });
    }
  }, [shouldPlayHeroVideo]);

  // Parallax Scroll Tracking for Hero
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const videoY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ["0%", "0%"] : ["0%", "22%"]
  );
  const foregroundY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ["0%", "0%"] : ["0%", "12%"]
  );
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.85],
    [1, prefersReducedMotion ? 1 : 0.05]
  );

  // Smooth-scroll to section on mount or hashchange if navigating from another route with a hash (e.g. /pricing -> /#features)
  React.useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const targetId = window.location.hash.replace("#", "");
        const el = document.getElementById(targetId);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Section entrance animation variants (respecting reduced motion)
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.09,
        delayChildren: 0.1,
      },
    },
  };

  const fadeUpItem: Variants = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  return (
    <div id="top" className="relative min-h-screen overflow-hidden bg-[#F5F1EB] dark:bg-[#0A0A0F] text-slate-900 dark:text-white transition-colors duration-300">
      {/* ========================================================================= */}
      {/* ZONE 1: CINEMATIC GAME TITLE HERO SECTION                                 */}
      {/* ========================================================================= */}
      <section
        ref={heroRef}
        className="relative min-h-[calc(100vh-57px)] w-full flex flex-col justify-between items-center overflow-hidden pt-10 sm:pt-14 pb-0 bg-[#F5F1EB] dark:bg-[#0A0A0F] transition-colors duration-300"
      >
        {/* Background Parallax Layer: Video + Dark Scrim Gradients */}
        <motion.div
          style={{ y: videoY }}
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          {/* Static Ambient Base Backdrop (always visible so zero flash of unstyled page) */}
          <div className="absolute inset-0 bg-[#F5F1EB] dark:bg-[#0A0A0F] transition-colors duration-300" />
          <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] max-w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,rgba(16,185,129,0.02)_50%,transparent_75%)] dark:bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16)_0%,rgba(16,185,129,0.03)_50%,transparent_75%)] blur-3xl" />

          {/* Autoplaying Hero Cinematic Background Video */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/hero-poster.svg"
              alt=""
              fill
              priority
              className={`object-cover object-center transition-opacity duration-1000 ${isHeroVideoReady ? "opacity-0" : "opacity-100"}`}
              aria-hidden="true"
            />
          </div>

          {!prefersReducedMotion && (
            <video
              ref={heroVideoRef}
              autoPlay={shouldPlayHeroVideo}
              muted
              loop
              playsInline
              preload="auto"
              poster="/hero-poster.svg"
              onCanPlay={() => setIsHeroVideoReady(true)}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${isHeroVideoReady ? "opacity-20 dark:opacity-40" : "opacity-0"}`}
            >
              <source src="https://res.cloudinary.com/sf0vublu/video/upload/v1789267800/hero2.mp4" type="video/mp4" />
            </video>
          )}

          {/* Strong Dark Scrim Gradients directly over video */}
          {/* 1. Center radial scrim focused directly behind headline text */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,241,235,0.88)_0%,rgba(245,241,235,0.72)_48%,rgba(245,241,235,0.42)_90%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(10,10,15,0.88)_0%,rgba(10,10,15,0.72)_48%,rgba(10,10,15,0.42)_90%)]" />

          {/* 2. Top and bottom vertical gradient bleed */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F5F1EB]/95 via-transparent to-[#F5F1EB] dark:from-[#0A0A0F]/95 dark:via-transparent dark:to-[#0A0A0F]" />

          {/* 3. Ambient Floating Particle Orbs */}
          <AmbientParticles />
        </motion.div>

        {/* Floating Detail Badges flanking the hero content */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.2 },
            x: { duration: 0.6, delay: 0.2 },
            y: { repeat: Infinity, duration: 5.5, ease: "easeInOut" },
          }}
          className="hidden lg:flex absolute left-4 xl:left-10 2xl:left-20 top-28 xl:top-36 items-center gap-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-[#12121A]/90 px-3.5 py-2 text-left shadow-xl dark:shadow-2xl backdrop-blur-md -rotate-3 hover:rotate-0 transition-transform duration-300 select-none z-20 pointer-events-none"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quest Complete
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">
              Morning Workout{" "}
              <span className="text-emerald-400 font-mono font-bold">+50 XP</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.3 },
            x: { duration: 0.6, delay: 0.3 },
            y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
          }}
          className="hidden lg:flex absolute right-4 xl:right-10 2xl:right-20 top-36 xl:top-44 items-center gap-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-[#12121A]/90 px-3.5 py-2 text-left shadow-xl dark:shadow-2xl backdrop-blur-md rotate-3 hover:rotate-0 transition-transform duration-300 select-none z-20 pointer-events-none"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Zap className="h-3.5 w-3.5 fill-current" />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Level Up!
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">
              Buddy reached <span className="font-mono font-bold text-slate-700 dark:text-slate-200">Level 5</span>
            </div>
          </div>
        </motion.div>

        {/* Foreground Content Stack (Parallax responsive) */}
        <motion.div
          style={{ y: foregroundY, opacity: heroOpacity }}
          className="relative z-10 container mx-auto max-w-5xl px-4 flex flex-col items-center text-center my-auto"
        >
          {/* Trust Badge */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/[0.08] dark:border-white/[0.08] bg-slate-900/[0.04] dark:bg-white/[0.04] px-3.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 backdrop-blur-xs shadow-xs"
          >
            <Star className="h-3 w-3 fill-emerald-400/80 text-emerald-400/80" />
            <span>Rated 4.9 by 14,000+ Adventurers</span>
          </motion.div>

          {/* 2-Line Headline in font-display */}
          <motion.h1
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 sm:mt-5 font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-center max-w-4xl"
          >
            <span className="block text-slate-900 dark:text-white drop-shadow-sm">
              Turn Daily Tasks Into
            </span>
            <span className="block text-emerald-600 dark:text-emerald-400 mt-1 drop-shadow-[0_0_24px_rgba(16,185,129,0.35)]">
              Epic Quests.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3.5 sm:mt-4 max-w-xl text-center text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-body"
          >
            Revel turns your to-do list into an RPG — earn XP, level up companions, and make progress feel like a game.
          </motion.p>

          {/* CTA & Quiet Link */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex flex-col items-center gap-3"
          >
            <Link href="/login">
              <button
                type="button"
                className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm sm:text-base tracking-tight shadow-[0_0_28px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400/50 hover:ring-emerald-400 active:scale-95 transition-all duration-150 group cursor-pointer"
              >
                <span>Start Your Quest</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>

            <a
              href="#cinematic"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Watch cinematic trailer ↓
            </a>
          </motion.div>

          {/* Trust Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-slate-500 dark:text-slate-400"
          >
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /> Real-Time XP Progression
            </span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /> Zero Pay-to-Win
            </span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /> Science-Backed Habits
            </span>
          </motion.div>
        </motion.div>

        {/* Anchored Companion Row at Bottom Edge */}
        <div className="relative z-10 w-full mt-auto flex flex-col items-center pt-6">
          {/* Single Quiet Label Row */}
          <div className="mb-2 sm:mb-3 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 px-4">
            {heroCompanions.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/[0.08] dark:border-white/[0.08] bg-slate-900/[0.03] dark:bg-white/[0.03] px-2.5 sm:px-3 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 backdrop-blur-xs"
              >
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{c.name}</span>
                <span className="text-slate-600">·</span>
                <span>{c.attr}</span>
              </span>
            ))}
          </div>

          {/* Characters Anchored & Fading into Bottom Edge */}
          <div className="relative flex items-end justify-center gap-2 sm:gap-6 md:gap-8 px-4 translate-y-6 sm:translate-y-8">
            {heroCompanions.map((c, i) => (
              <motion.div
                key={c.name}
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 + i * 0.08 }}
                whileHover={{ y: -8, scale: 1.04 }}
                className="relative cursor-pointer transition-transform"
              >
                <Image
                  src={c.image}
                  alt={`${c.name} - ${c.attr} Companion`}
                  width={176}
                  height={176}
                  priority
                  className="h-24 w-24 sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-44 lg:w-44 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
                />
              </motion.div>
            ))}
          </div>

          {/* Gradient fade cropping the characters' lower half into the section's bottom edge */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 sm:h-20 bg-gradient-to-t from-[#F5F1EB] via-[#F5F1EB]/80 dark:from-[#0D0D14] dark:via-[#0D0D14]/80 to-transparent z-10" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ZONE 2: BENTO GRID / CORE MECHANICS (REFERENCE MATCH)                     */}
      {/* ========================================================================= */}
      <section
        id="features"
        className="relative z-10 bg-[#F5F1EB] dark:bg-[#0E0E16] py-20 sm:py-28 scroll-mt-20 overflow-hidden text-slate-900 dark:text-white transition-colors duration-300"
      >
        <span id="quests" className="-mt-20 block h-0 w-0 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          {/* Section Header */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-950/10 dark:border-white/[0.08] bg-slate-950/[0.05] dark:bg-white/[0.04] px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-emerald-400 backdrop-blur-xs mb-3">
              Core RPG Mechanics
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Everything a real game needs.
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-body leading-relaxed">
              Engineered to turn daily discipline into an addictive feedback loop of measurable progress.
            </p>
          </motion.div>

          {/* ASYMMETRIC BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            {/* ------------------------------------------------------------- */}
            {/* CARD 1: TALL LEFT CARD (What's in the Box)                    */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45 }}
              whileHover={{ y: -4 }}
              className="lg:col-span-4 lg:row-span-2 rounded-[32px] sm:rounded-[40px] bg-[#D7C7B7] dark:bg-[#2A2218] p-7 sm:p-9 text-[#231B15] dark:text-[#E8D5C4] relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[540px] lg:min-h-[640px] transition-colors duration-300"
            >
              <div>
                <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#221B16] dark:text-[#F0E0D0] leading-tight">
                  What&apos;s in the Box
                </h3>

                <div className="mt-6 space-y-3.5 text-sm sm:text-base font-semibold text-[#382E26] dark:text-[#C8B8A8]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#221B16] dark:border-[#C8B8A8] text-[#221B16] dark:text-[#C8B8A8] text-xs font-black shrink-0">
                      ✓
                    </span>
                    <span>16+ Crafted Habit Quests</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#221B16] dark:border-[#C8B8A8] text-[#221B16] dark:text-[#C8B8A8] text-xs font-black shrink-0">
                      ✓
                    </span>
                    <span>5 Living Companions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#221B16] dark:border-[#C8B8A8] text-[#221B16] dark:text-[#C8B8A8] text-xs font-black shrink-0">
                      ✓
                    </span>
                    <span>Creative XP Energy</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#221B16] dark:border-[#C8B8A8] text-[#221B16] dark:text-[#C8B8A8] text-xs font-black shrink-0">
                      ✓
                    </span>
                    <span>Lots of good vibes</span>
                  </div>
                </div>
              </div>

              {/* Bottom Transparent Ziploc Bag with Stickers */}
              <div className="relative mt-8 -mb-4 -mx-3 sm:-mx-5 pt-3">
                {/* Ziploc White Plastic Sealer Line */}
                <div className="relative z-20 mx-auto w-11/12 h-3.5 rounded-t-md bg-white/70 dark:bg-white/20 border border-white/80 dark:border-white/30 backdrop-blur-sm shadow-sm flex items-center justify-between px-3">
                  <div className="h-0.5 w-full bg-slate-300/60 rounded-full" />
                </div>

                {/* Clear Plastic Pouch Body */}
                <div className="relative z-10 rounded-2xl bg-white/[0.22] dark:bg-white/[0.08] border border-white/60 dark:border-white/20 backdrop-blur-md p-4 pt-5 shadow-xl overflow-hidden min-h-[220px]">
                  {/* Sheen reflection diagonal */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/40 opacity-80" />

                  {/* Scatter of Colorful Stickers inside Bag */}
                  <div className="relative z-10 w-full h-full">
                    {/* Big Eyes Sticker */}
                    <div className="absolute -top-1 left-2 bg-white rounded-full px-2.5 py-1 shadow-md border border-slate-200 flex items-center gap-1 -rotate-6">
                      <span className="h-4 w-4 rounded-full bg-black flex items-center justify-center text-[8px] text-white">●</span>
                      <span className="h-4 w-4 rounded-full bg-black flex items-center justify-center text-[8px] text-white">●</span>
                    </div>

                    {/* Yellow Tape Sticker */}
                    <div className="absolute top-1 right-2 bg-[#FDE047] text-slate-900 text-[10px] font-mono font-bold px-2.5 py-1 rounded shadow-md rotate-3 border border-yellow-400/80">
                      Please Detach with care ✂
                    </div>

                    {/* Blue Oval Badge */}
                    <div className="absolute top-10 left-5 bg-[#2563EB] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md -rotate-3">
                      anti-burnout proof
                    </div>

                    {/* Red Heart / Love Badge */}
                    <div className="absolute top-10 right-3 bg-white text-slate-900 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md rotate-6 border border-slate-100 flex items-center gap-1">
                      I ❤️ MY QUESTS
                    </div>

                    {/* Flame Sticker */}
                    <div className="absolute top-20 right-14 bg-gradient-to-br from-amber-400 to-red-500 text-white text-xs p-1.5 rounded-full shadow-md -rotate-12">
                      🔥
                    </div>

                    {/* Name Tag Sticker */}
                    <div className="absolute top-22 left-2 bg-white rounded-lg p-2 border-2 border-[#EF4444] shadow-lg w-36 -rotate-2">
                      <div className="bg-[#EF4444] text-white text-[8px] font-black px-1 text-center uppercase tracking-wider rounded-xs">
                        HELLO, I&apos;M
                      </div>
                      <div className="text-[#1E293B] font-display font-extrabold text-xs text-center pt-1">
                        Disciplined
                      </div>
                    </div>

                    {/* White Round Studio Stamp */}
                    <div className="absolute bottom-1 right-3 bg-white rounded-full h-14 w-14 border-2 border-dashed border-slate-400 flex items-center justify-center text-[9px] font-bold text-slate-700 text-center shadow-md rotate-12 leading-tight">
                      Revel<br />Studio
                    </div>

                    {/* Green Peace Sign */}
                    <div className="absolute bottom-2 left-16 text-2xl rotate-12">
                      ✌️
                    </div>

                    {/* Purple Out of Comfort Zone Tag */}
                    <div className="absolute bottom-0 left-2 bg-white text-purple-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow border border-purple-200">
                      Out of Comfort Zone
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 2: TOP MIDDLE CARD (Stick with meaning)                  */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="lg:col-span-4 rounded-[32px] sm:rounded-[40px] bg-[#EE3B63] dark:bg-[#8B1A35] p-7 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-sm min-h-[290px] transition-colors duration-300"
            >
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Stick with meaning
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-white/90 leading-relaxed font-body">
                  We made habits that stick with you (literally). After all, great discipline deserves to go wherever you do.
                </p>
              </div>

              {/* Laptop Graphic Sticking Out from Bottom */}
              <div className="relative mt-6 -mb-10 mx-auto w-48 sm:w-56 h-28 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 rounded-t-2xl shadow-2xl border-t-2 border-x-2 border-white/60 flex items-center justify-center pt-2">
                <div className="w-8 h-8 rounded-full bg-slate-800/90 flex items-center justify-center text-white shadow-inner">
                  <AsteriskLogo className="h-4.5 w-4.5 text-white fill-white" />
                </div>
              </div>
            </motion.div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 3: TOP RIGHT CARD (Water resistance. Bad vibes proof.)   */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55 }}
              whileHover={{ y: -4 }}
              className="lg:col-span-4 rounded-[32px] sm:rounded-[40px] bg-[#E0F7BE] dark:bg-[#1A2E0A] p-7 sm:p-8 text-[#305313] dark:text-[#B8E88A] relative overflow-hidden flex flex-col justify-between shadow-sm min-h-[290px] transition-colors duration-300"
            >
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2B4C10] dark:text-[#C8F090] leading-tight">
                  Water resistance.<br />Bad vibes proof.
                </h3>
              </div>

              {/* 3 Pixel Art Icons Matching Reference (Droplet, Umbrella, Sparkles) */}
              <div className="flex items-end gap-6 pt-8 pb-1">
                {/* Pixel Droplet */}
                <svg
                  viewBox="0 0 16 16"
                  className="w-10 h-10 text-[#426E1E] fill-current"
                  shapeRendering="crispEdges"
                >
                  <rect x="7" y="1" width="2" height="2" />
                  <rect x="6" y="3" width="4" height="2" />
                  <rect x="5" y="5" width="6" height="2" />
                  <rect x="4" y="7" width="8" height="4" />
                  <rect x="5" y="11" width="6" height="2" />
                  <rect x="6" y="13" width="4" height="1" />
                  <rect x="6" y="7" width="2" height="2" fill="#E0F7BE" />
                </svg>

                {/* Pixel Umbrella */}
                <svg
                  viewBox="0 0 16 16"
                  className="w-10 h-10 text-[#426E1E] fill-current"
                  shapeRendering="crispEdges"
                >
                  <rect x="5" y="2" width="6" height="2" />
                  <rect x="3" y="4" width="10" height="2" />
                  <rect x="1" y="6" width="14" height="2" />
                  <rect x="7" y="8" width="2" height="5" />
                  <rect x="5" y="13" width="3" height="1" />
                </svg>

                {/* Pixel Sparkles */}
                <svg
                  viewBox="0 0 16 16"
                  className="w-10 h-10 text-[#426E1E] fill-current"
                  shapeRendering="crispEdges"
                >
                  <rect x="4" y="1" width="2" height="2" />
                  <rect x="3" y="3" width="4" height="2" />
                  <rect x="1" y="4" width="8" height="2" />
                  <rect x="3" y="6" width="4" height="2" />
                  <rect x="4" y="8" width="2" height="2" />
                  <rect x="12" y="7" width="2" height="2" />
                  <rect x="11" y="9" width="4" height="2" />
                  <rect x="9" y="10" width="8" height="2" />
                  <rect x="11" y="12" width="4" height="2" />
                  <rect x="12" y="14" width="2" height="2" />
                </svg>
              </div>
            </motion.div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 4: WIDE BOTTOM CARD (Designed for humans + Polaroids)    */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -4 }}
              className="lg:col-span-8 rounded-[32px] sm:rounded-[40px] bg-[#EEF4FF] dark:bg-[#111827] p-7 sm:p-10 text-[#0F1E3D] dark:text-slate-200 relative overflow-hidden shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 min-h-[300px] transition-colors duration-300"
            >
              {/* Left Copy */}
              <div className="max-w-md text-left">
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#16295C] dark:text-white leading-tight">
                  Designed<br />for humans
                </h3>
                <p className="mt-3.5 text-xs sm:text-sm text-[#334D80] dark:text-slate-400 leading-relaxed font-body">
                  We&apos;re an RPG habit app with a tight-knit team of designers, gamers, and thinkers crafting digital experiences people actually enjoy.
                </p>
              </div>

              {/* Right Illustration: Cartoon Globe Mascot & Tilted Polaroids */}
              <div className="relative flex items-center justify-center shrink-0 w-full md:w-auto h-52 sm:h-60">
                {/* Blue Globe Mascot with Cartoon Eyes */}
                <div className="absolute -top-3 left-4 md:-left-8 z-30 flex items-center justify-center">
                  <div className="relative h-14 w-14 rounded-full bg-[#2563EB] border-2 border-[#1E40AF] shadow-lg flex items-center justify-center overflow-hidden">
                    {/* Globe Grid lines */}
                    <div className="absolute inset-0 border-y border-white/30 rounded-full" />
                    <div className="absolute inset-0 border-x border-white/30 rounded-full" />
                    {/* Eyes */}
                    <div className="relative z-10 flex items-center gap-1 bg-white rounded-full px-1.5 py-0.5 shadow-sm">
                      <div className="h-2.5 w-2.5 rounded-full bg-black flex items-center justify-center">
                        <div className="h-1 w-1 rounded-full bg-white -translate-y-0.5 -translate-x-0.5" />
                      </div>
                      <div className="h-2.5 w-2.5 rounded-full bg-black flex items-center justify-center">
                        <div className="h-1 w-1 rounded-full bg-white -translate-y-0.5 -translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Polaroid 1 (Flowers / Companions) */}
                <div className="relative z-10 w-36 sm:w-44 bg-white dark:bg-slate-800 p-2.5 pb-5 rounded-md shadow-xl -rotate-6 border border-slate-200 dark:border-slate-700 transition-transform duration-300 hover:rotate-0 hover:scale-105">
                  <div className="relative w-full h-28 sm:h-32 rounded bg-slate-900 overflow-hidden">
                    <Image
                      src="/blobs/blobs-fighting.jpg"
                      alt="Revel Adventure"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center pt-2 font-mono text-[9px] font-bold text-slate-700 dark:text-slate-300 tracking-wider">
                    Revel Studio &amp; Co.
                  </div>
                </div>

                {/* Polaroid 2 (Workspace / Cat Photo Strip) */}
                <div className="relative z-20 -ml-8 w-32 sm:w-36 bg-white dark:bg-slate-800 p-2 pb-4 rounded-md shadow-2xl rotate-6 border border-slate-200 dark:border-slate-700 transition-transform duration-300 hover:rotate-2 hover:scale-105">
                  <div className="relative w-full h-18 sm:h-20 rounded bg-slate-100 dark:bg-slate-700 overflow-hidden mb-1.5">
                    <Image
                      src="/blobs/blob-green.png"
                      alt="Companion Snapshot"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="relative w-full h-18 sm:h-20 rounded bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <Image
                      src="/blobs/blob-pink.png"
                      alt="Companion Mascot"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  {/* Pink Peace Sign Sticker on Bottom Corner */}
                  <div className="absolute -bottom-2 -right-2 text-2xl filter drop-shadow-md rotate-12">
                    ✌️
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ZONE 3: HOW IT WORKS SECTION (#0F0F18)                                    */}
      {/* ========================================================================= */}
      <section className="relative z-10 bg-[#F5F1EB] dark:bg-[#0F0F18] py-16 sm:py-24 border-t border-slate-900/[0.06] dark:border-white/[0.04] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/[0.08] dark:border-white/[0.08] bg-slate-900/[0.04] dark:bg-white/[0.03] px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 backdrop-blur-xs mb-3">
              Simple 3-Step Flow
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Level up in three simple steps.
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto font-body leading-relaxed">
              No complicated setup. Plug your real routine into Revel and start earning XP today.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10"
          >
            {/* Subtle connecting line across steps on desktop */}
            <div className="hidden md:block absolute top-7 left-[15%] right-[15%] h-[1px] border-t border-dashed border-emerald-600/20 dark:border-emerald-500/20 pointer-events-none z-0" />

            {howItWorksSteps.map((step) => (
              <motion.div
                key={step.num}
                variants={fadeUpItem}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-600/30 dark:border-emerald-500/30 bg-[#F5F1EB] dark:bg-[#0E0E15] font-display text-xl font-bold text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.08)] dark:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-colors duration-300">
                  {step.num}
                </div>
                <h3 className="font-display mt-5 text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {step.title}
                </h3>
                <p className="font-body mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ZONE 4: DEDICATED CINEMATIC SHOWCASE SECTION (#0B0B11)                     */}
      {/* ========================================================================= */}
      <div className="relative z-10 bg-[#F5F1EB] dark:bg-[#0B0B11] border-t border-slate-900/[0.06] dark:border-white/[0.04] transition-colors duration-300">
        <CinematicShowcase videoSrc="/hero.mp4" />
      </div>

      {/* ========================================================================= */}
      {/* ZONE 5: COMPANIONS SHOWCASE SECTION (#0E0E16)                             */}
      {/* ========================================================================= */}
      <section
        id="companions"
        className="relative z-10 bg-[#F5F1EB] dark:bg-[#0E0E16] py-20 sm:py-28 scroll-mt-20 border-t border-slate-900/[0.06] dark:border-white/[0.04] transition-colors duration-300"
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-center mb-12 sm:mb-14"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/[0.08] dark:border-white/[0.08] bg-slate-900/[0.04] dark:bg-white/[0.03] px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 backdrop-blur-xs mb-3">
              Sanctuary Roster
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Meet Your Companions
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-body leading-relaxed">
              Living digital beasts that journey alongside you and evolve as you conquer real-world goals.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5"
          >
            {companionShowcase.map((b) => {
              const isHovered = hoveredBlob === b.id;
              return (
                <motion.div
                  key={b.id}
                  variants={fadeUpItem}
                  onMouseEnter={() => setHoveredBlob(b.id)}
                  onMouseLeave={() => setHoveredBlob(null)}
                  whileHover={{ y: -6, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  className="group relative flex flex-col items-center rounded-2xl border border-slate-900/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-[#12121A]/85 p-5 text-center transition-colors duration-200 hover:border-emerald-500/40 hover:shadow-[0_0_24px_rgba(16,185,129,0.1)] overflow-hidden select-none cursor-pointer"
                >
                  {/* Individual subtle radial glow behind character using THAT blob's accent color */}
                  <div
                    className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 h-28 w-28 rounded-full blur-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-40"
                    style={{ backgroundColor: b.accentColor }}
                  />

                  {/* Blob Character Animation */}
                  <div className="relative z-10 my-2 flex items-center justify-center">
                    <BlobCharacter
                      blobId={b.id}
                      size="lg"
                      state={isHovered ? "celebrating" : "idle"}
                    />
                  </div>

                  {/* Blob Name */}
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-2">
                    {b.name}
                  </h3>

                  {/* Attribute Pill */}
                  <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-slate-900/[0.08] dark:border-white/[0.08] bg-slate-900/[0.03] dark:bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 backdrop-blur-xs">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: b.accentColor }}
                    />
                    <span>{b.attr}</span>
                  </span>

                  {/* Flavor / Power Text */}
                  <p className="font-body mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400 min-h-[2.5rem]">
                    &ldquo;{b.powerText}&rdquo;
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ZONE 6: SOCIAL PROOF / STATS SECTION (#0C0C13)                            */}
      {/* ========================================================================= */}
      <section className="relative z-10 border-y border-slate-900/[0.06] dark:border-white/[0.06] bg-[#EDE8E0] dark:bg-[#0C0C13] py-12 sm:py-16 transition-colors duration-300">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10"
        >
          {socialStats.map((stat) => (
            <div key={stat.label} className="relative flex flex-col items-center text-center">
              <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                <AnimatedStatValue target={stat.value} formatter={stat.formatter} />
              </span>
              <span className="mt-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* ZONE 6.5: MANIFESTO / PHILOSOPHY STATEMENT                                */}
      {/* ========================================================================= */}
      <section className="relative z-10 bg-[#F5F1EB] dark:bg-[#0E0E16] py-20 sm:py-28 md:py-36 overflow-hidden">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-4xl mx-auto px-6 sm:px-8 text-center"
        >
          {/* Section Label */}
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-950/10 dark:border-white/[0.08] bg-slate-950/[0.05] dark:bg-white/[0.04] px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-emerald-400 backdrop-blur-xs mb-8">
            The Revel Manifesto
          </span>

          {/* Manifesto Text — Large flowing text with inline blob images */}
          <p className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.25] sm:leading-[1.22] tracking-tight text-slate-950 dark:text-white">
            Real growth starts with{" "}
            <span className="inline-block align-middle mx-1">
              <Image src="/blobs/blob-green.png" alt="Zippo" width={52} height={52} className="inline h-9 w-9 sm:h-11 sm:w-11 md:h-13 md:w-13 drop-shadow-md" />
            </span>{" "}
            showing up every day,{" "}
            <span className="inline-block align-middle mx-1">
              <Image src="/blobs/blob-blue.png" alt="Orbit" width={52} height={52} className="inline h-9 w-9 sm:h-11 sm:w-11 md:h-13 md:w-13 drop-shadow-md" />
            </span>{" "}
            we built Revel to make{" "}
            discipline feel like{" "}
            <span className="inline-block align-middle mx-1">
              <Image src="/blobs/blob-pink.png" alt="Pip" width={52} height={52} className="inline h-9 w-9 sm:h-11 sm:w-11 md:h-13 md:w-13 drop-shadow-md" />
            </span>{" "}
            play, grounded in honesty,{" "}
            <span className="inline-block align-middle mx-1">
              <Image src="/blobs/blob-violet.png" alt="Muse" width={52} height={52} className="inline h-9 w-9 sm:h-11 sm:w-11 md:h-13 md:w-13 drop-shadow-md" />
            </span>{" "}
            and driven by the belief{" "}
            that small wins{" "}
            <span className="inline-block align-middle mx-1">
              <Image src="/blobs/blob-yellow.png" alt="Buddy" width={52} height={52} className="inline h-9 w-9 sm:h-11 sm:w-11 md:h-13 md:w-13 drop-shadow-md" />
            </span>{" "}
            compound into extraordinary lives.
          </p>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* ZONE 7: FINAL CTA LAUNCH SCREEN (#0A0A0F)                                 */}
      {/* ========================================================================= */}
      <section
        id="pricing"
        className="relative z-10 bg-[#F5F1EB] dark:bg-[#0A0A0F] py-24 sm:py-32 text-center overflow-hidden scroll-mt-20 border-t border-slate-900/[0.06] dark:border-white/[0.04] transition-colors duration-300"
      >
        {/* Soft Radial Accent Glow & Ambient Floating Particles */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[680px] max-w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,rgba(16,185,129,0.01)_60%,transparent_75%)] dark:bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,rgba(16,185,129,0.02)_60%,transparent_75%)] blur-3xl" />
        <AmbientParticles />

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/[0.08] dark:border-white/[0.08] bg-slate-900/[0.04] dark:bg-white/[0.03] px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 backdrop-blur-xs mb-4">
            <Sparkles className="h-3 w-3" />
            Begin Your Adventure
          </div>
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight max-w-2xl leading-tight">
            Ready to turn your to-do list into an adventure?
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-lg mx-auto font-body leading-relaxed">
            Join thousands of adventurers leveling up their real lives today. Free forever for individuals — zero pay-to-win mechanics.
          </p>

          <div className="mt-8 flex justify-center">
            <Link href="/login">
              <button
                type="button"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm sm:text-base tracking-tight shadow-[0_0_28px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400/50 hover:ring-emerald-400 active:scale-95 transition-all duration-150 group cursor-pointer"
              >
                <span>Start Your Quest — Free</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>

          {/* Companion Party Waving */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            animate={prefersReducedMotion ? {} : { y: [0, -6, 0] }}
            {...(!prefersReducedMotion && { transition: { y: { repeat: Infinity, duration: 5, ease: "easeInOut" }, opacity: { duration: 0.6 } } })}
            className="mt-10 sm:mt-14 flex justify-center"
          >
            <Image
              src="/blobs/blobs-waving-hand.png"
              alt="Your companion party waving hello"
              width={560}
              height={340}
              className="h-56 sm:h-72 md:h-80 lg:h-[22rem] w-auto object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_16px_32px_rgba(0,0,0,0.6)]"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* ZONE 8: BOLD CREATIVE FOOTER                                               */}
      {/* ========================================================================= */}
      <footer className="relative z-10 overflow-visible bg-emerald-500 dark:bg-emerald-500 text-slate-950">
        {/* ── Top Info Strip ── */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 sm:px-8 pt-12 sm:pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {/* Column 1: Product */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-950/20 bg-slate-950/10 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-950/70 mb-3">
                product
              </span>
              <ul className="mt-3 space-y-1.5 text-sm font-semibold">
                <li>
                  <Link href="/#features" className="hover:text-white transition-colors duration-200">
                    Features & Core Mechanics
                  </Link>
                </li>
                <li>
                  <Link href="/#companions" className="hover:text-white transition-colors duration-200">
                    Companion Beasts
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors duration-200">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors duration-200">
                    Sign In / Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Quest Engine */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-950/20 bg-slate-950/10 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-950/70 mb-3">
                quest engine
              </span>
              <div className="mt-3">
                <p className="text-lg sm:text-xl font-display font-bold leading-snug">
                  Built with Next.js 16,
                  <br />
                  Supabase & Framer Motion
                </p>
                <Link
                  href="https://github.com/openslickofficial/LifeRPG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm font-semibold underline underline-offset-4 decoration-slate-950/40 hover:decoration-slate-950 transition-colors duration-200"
                >
                  View on GitHub
                </Link>
              </div>
            </div>

            {/* Column 3: Connect */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-950/20 bg-slate-950/10 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-950/70 mb-3">
                connect
              </span>
              <div className="mt-3">
                <p className="text-lg sm:text-xl font-display font-bold leading-snug">
                  Start your quest today.
                </p>
                <p className="mt-1 text-xs text-slate-950/60 font-body">
                  *zero pay-to-win; built for honest self-improvement.
                </p>
                {/* Social Icons Row */}
                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href="https://github.com/openslickofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-950/20 bg-slate-950/10 text-slate-950 hover:bg-slate-950 hover:text-emerald-400 transition-all duration-200"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </Link>
                  <Link
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-950/20 bg-slate-950/10 text-slate-950 hover:bg-slate-950 hover:text-emerald-400 transition-all duration-200"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </Link>
                  <Link
                    href="mailto:subhajitmandal42033@gmail.com"
                    aria-label="Email"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-950/20 bg-slate-950/10 text-slate-950 hover:bg-slate-950 hover:text-emerald-400 transition-all duration-200"
                  >
                    <svg className="h-4 w-4 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Giant "revel" Wordmark Background + Floating Blob Stickers ── */}
        <div className="relative z-10 w-full overflow-visible pb-6 sm:pb-8">
          {/* The giant wordmark */}
          <div className="relative flex items-end justify-center select-none pointer-events-none" aria-hidden="true">
            <span className="font-display text-[clamp(6rem,22vw,16rem)] font-extrabold leading-[0.82] tracking-tighter text-emerald-600/30 whitespace-nowrap">
              revel
            </span>

            {/* Scattered Floating Blob Stickers */}
            {/* Blob 1 — Green (Zippo) — top-left area */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute left-[8%] top-[10%] sm:top-[5%] z-20 pointer-events-auto"
            >
              <Image
                src="/blobs/blob-green.png"
                alt="Zippo sticker"
                width={120}
                height={120}
                className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] -rotate-12 hover:rotate-0 hover:scale-110 transition-transform duration-300"
              />
            </motion.div>

            {/* Blob 2 — Pink (Pip) — center-top, slightly left */}
            <motion.div
              animate={{ y: [0, 5, 0], rotate: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
              className="absolute left-[30%] sm:left-[28%] top-[-5%] sm:top-[-10%] z-20 pointer-events-auto"
            >
              <Image
                src="/blobs/blob-pink.png"
                alt="Pip sticker"
                width={120}
                height={120}
                className="h-16 w-16 sm:h-22 sm:w-22 md:h-28 md:w-28 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] rotate-6 hover:rotate-0 hover:scale-110 transition-transform duration-300"
              />
            </motion.div>

            {/* Blob 3 — Blue (Orbit) — center area */}
            <motion.div
              animate={{ y: [0, -4, 0], rotate: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1 }}
              className="absolute left-[50%] -translate-x-1/2 top-[0%] sm:top-[-8%] z-20 pointer-events-auto"
            >
              <Image
                src="/blobs/blob-blue.png"
                alt="Orbit sticker"
                width={140}
                height={140}
                className="h-22 w-22 sm:h-28 sm:w-28 md:h-36 md:w-36 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] rotate-[-8deg] hover:rotate-0 hover:scale-110 transition-transform duration-300"
              />
            </motion.div>

            {/* Blob 4 — Violet (Muse) — right area */}
            <motion.div
              animate={{ y: [0, 6, 0], rotate: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 0.8 }}
              className="absolute right-[25%] sm:right-[22%] top-[5%] sm:top-[-5%] z-20 pointer-events-auto"
            >
              <Image
                src="/blobs/blob-violet.png"
                alt="Muse sticker"
                width={120}
                height={120}
                className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] rotate-12 hover:rotate-0 hover:scale-110 transition-transform duration-300"
              />
            </motion.div>

            {/* Blob 5 — Yellow (Buddy) — far right */}
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1.2 }}
              className="absolute right-[6%] sm:right-[8%] top-[15%] sm:top-[8%] z-20 pointer-events-auto"
            >
              <Image
                src="/blobs/blob-yellow.png"
                alt="Buddy sticker"
                width={120}
                height={120}
                className="h-16 w-16 sm:h-22 sm:w-22 md:h-28 md:w-28 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] -rotate-6 hover:rotate-0 hover:scale-110 transition-transform duration-300"
              />
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <div className="relative z-30 max-w-6xl mx-auto px-6 sm:px-8 mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-950/50">
            <p>© 2026 Revel. All rights reserved.</p>
            <p>Crafted for real-world progress.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
