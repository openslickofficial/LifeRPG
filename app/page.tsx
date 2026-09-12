"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  Trophy,
  Sword,
  Flame,
  Shield,
  Star,
  Coins,
  Play,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [activeCardHover, setActiveCardHover] = React.useState<number | null>(
    null
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#0A0A0F] text-white">
      {/* 1. Vintage Arcade Background Grid & Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:4rem_4rem] opacity-30"
      />

      {/* Atmospheric Glowing Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[54rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-600/30 via-indigo-600/20 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-32 -z-10 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -left-32 -z-10 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl"
      />

      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        {/* ========================================================================= */}
        {/* 2. ARCADE TITLE SCREEN HERO                                              */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center text-center">
          {/* Season Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-heading mb-6 inline-flex items-center gap-2 rounded-2xl border-2 border-amber-500 bg-amber-400 px-4 py-1.5 text-xs font-black tracking-wider text-slate-950 uppercase shadow-[0_4px_0_0_#b45309]"
          >
            <Gamepad2 className="h-4 w-4" />
            <span>SEASON 1 · THE REALM OF MASTERY</span>
            <span className="flex h-2 w-2 animate-ping rounded-full bg-emerald-700" />
          </motion.div>

          {/* Huge Chunky Title in Fredoka */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl"
          >
            LIFE{" "}
            <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(245,158,11,0.3)]">
              RPG
            </span>
          </motion.h1>

          {/* Punchy Game Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-heading mt-4 max-w-2xl text-lg font-black tracking-wider text-amber-300 uppercase sm:text-xl"
          >
            Turn Real-Life Habits Into Level 100 Hero Stats
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="font-body mt-2 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base"
          >
            No more boring to-do lists. Complete real-world quests, level up
            attributes across Intellect, Strength, and Discipline, and conquer
            the procrastination boss.
          </motion.p>

          {/* Chunky 3D Pressable CTA Cluster */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/login">
              <Button
                variant="success"
                size="lg"
                className="h-14 px-8 text-base shadow-[0_6px_0_0_#065f46] active:translate-y-[4px] active:shadow-[0_2px_0_0_#065f46]"
              >
                <Play className="mr-2 h-5 w-5 fill-current" />
                <span>START YOUR QUEST</span>
              </Button>
            </Link>

            <Link href="/dashboard?preview=true">
              <Button
                variant="default"
                size="lg"
                className="h-14 px-8 text-base shadow-[0_6px_0_0_#4c1d95] active:translate-y-[4px] active:shadow-[0_2px_0_0_#4c1d95]"
              >
                <Shield className="mr-2 h-5 w-5" />
                <span>EXPLORE PREVIEW</span>
              </Button>
            </Link>
          </motion.div>

          {/* Social Proof Star Rating */}
          <div className="mt-8 flex items-center gap-2 font-mono text-xs font-bold text-amber-400">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="font-black text-white">4.9 / 5.0</span>
            <span className="font-normal text-slate-400">
              · Over 14,000 Adventurers
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. FANNED CARD-HAND COMPOSITION (Trading Card Game Hand)                   */}
        {/* ========================================================================= */}
        <section className="mt-16 sm:mt-24">
          <div className="mb-4 text-center">
            <span className="font-heading text-xs font-black tracking-widest text-slate-400 uppercase">
              ⚡ LIVE CHARACTER HUD · HAND OF DESTINY
            </span>
          </div>

          <div className="relative mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 py-8 sm:py-12 md:flex-nowrap md:gap-0">
            {/* Card 1: Strength (Left, rotated -7deg) */}
            <motion.div
              onHoverStart={() => setActiveCardHover(1)}
              onHoverEnd={() => setActiveCardHover(null)}
              animate={{
                rotate: activeCardHover === 1 ? 0 : -7,
                y: activeCardHover === 1 ? -24 : 10,
                scale: activeCardHover === 1 ? 1.08 : 1,
                zIndex: activeCardHover === 1 ? 40 : 10,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="w-72 shrink-0 cursor-pointer rounded-3xl border-3 border-rose-700 bg-rose-600 p-6 text-white shadow-[0_14px_30px_rgba(244,63,94,0.35)] select-none md:-mr-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/30 bg-white/20">
                  <Sword className="h-5 w-5 text-white" />
                </div>
                <span className="rounded-xl border border-rose-800 bg-rose-700 px-2.5 py-1 font-mono text-[10px] font-black uppercase">
                  STRENGTH
                </span>
              </div>

              <div className="mt-6">
                <span className="font-mono text-xs font-black tracking-wider text-rose-200 uppercase">
                  QUEST #01
                </span>
                <h3 className="font-heading text-xl leading-tight font-black text-white">
                  Heavy Iron Deadlifts
                </h3>
                <p className="font-body mt-2 text-xs leading-relaxed text-rose-100/90">
                  5 sets of heavy compound pulls to forge physical grit.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-rose-500/60 pt-4">
                <span className="font-mono text-xs font-black text-rose-100">
                  +180 STR XP
                </span>
                <span className="font-heading rounded-full bg-white px-3 py-1 text-xs font-black text-rose-600 shadow-xs">
                  READY
                </span>
              </div>
            </motion.div>

            {/* Card 2: Intellect (Center-Left, rotated -2deg) */}
            <motion.div
              onHoverStart={() => setActiveCardHover(2)}
              onHoverEnd={() => setActiveCardHover(null)}
              animate={{
                rotate: activeCardHover === 2 ? 0 : -2,
                y: activeCardHover === 2 ? -24 : -6,
                scale: activeCardHover === 2 ? 1.08 : 1,
                zIndex: activeCardHover === 2 ? 40 : 20,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="w-72 shrink-0 cursor-pointer rounded-3xl border-3 border-blue-700 bg-blue-600 p-6 text-white shadow-[0_16px_35px_rgba(37,99,235,0.4)] select-none md:-mr-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/30 bg-white/20">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="rounded-xl border border-blue-800 bg-blue-700 px-2.5 py-1 font-mono text-[10px] font-black uppercase">
                  INTELLECT
                </span>
              </div>

              <div className="mt-6">
                <span className="font-mono text-xs font-black tracking-wider text-blue-200 uppercase">
                  QUEST #02
                </span>
                <h3 className="font-heading text-xl leading-tight font-black text-white">
                  90-Min Deep Focus
                </h3>
                <p className="font-body mt-2 text-xs leading-relaxed text-blue-100/90">
                  Zero distractions, code architecture design session.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-blue-500/60 pt-4">
                <span className="font-mono text-xs font-black text-blue-100">
                  +250 INT XP
                </span>
                <span className="font-heading rounded-full bg-white px-3 py-1 text-xs font-black text-blue-600 shadow-xs">
                  IN FLOW
                </span>
              </div>
            </motion.div>

            {/* Card 3: Discipline / Streak (Center-Right, rotated +3deg) */}
            <motion.div
              onHoverStart={() => setActiveCardHover(3)}
              onHoverEnd={() => setActiveCardHover(null)}
              animate={{
                rotate: activeCardHover === 3 ? 0 : 3,
                y: activeCardHover === 3 ? -24 : -2,
                scale: activeCardHover === 3 ? 1.08 : 1,
                zIndex: activeCardHover === 3 ? 40 : 25,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="w-72 shrink-0 cursor-pointer rounded-3xl border-3 border-amber-500 bg-amber-400 p-6 text-slate-950 shadow-[0_16px_35px_rgba(245,158,11,0.45)] select-none md:-mr-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black/15">
                  <Flame className="h-5 w-5 animate-pulse text-slate-950" />
                </div>
                <span className="rounded-xl border border-amber-600 bg-amber-500 px-2.5 py-1 font-mono text-[10px] font-black text-slate-950 uppercase">
                  STREAK · 7 DAYS
                </span>
              </div>

              <div className="mt-6">
                <span className="font-mono text-xs font-black tracking-wider text-amber-900 uppercase">
                  DISCIPLINE
                </span>
                <h3 className="font-heading text-xl leading-tight font-black text-slate-950">
                  Consistency Flame
                </h3>
                <p className="font-body mt-2 text-xs leading-relaxed font-medium text-amber-950">
                  3.5x XP Multiplier active. Complete today to preserve your
                  fire.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-amber-500/60 pt-4">
                <span className="font-mono text-xs font-black text-slate-950">
                  +50 GOLD BONUS
                </span>
                <span className="font-heading rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-amber-400 shadow-xs">
                  BLAZING
                </span>
              </div>
            </motion.div>

            {/* Card 4: Creativity & Loot (Right, rotated +8deg) */}
            <motion.div
              onHoverStart={() => setActiveCardHover(4)}
              onHoverEnd={() => setActiveCardHover(null)}
              animate={{
                rotate: activeCardHover === 4 ? 0 : 8,
                y: activeCardHover === 4 ? -24 : 12,
                scale: activeCardHover === 4 ? 1.08 : 1,
                zIndex: activeCardHover === 4 ? 40 : 15,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="w-72 shrink-0 cursor-pointer rounded-3xl border-3 border-emerald-600 bg-emerald-500 p-6 text-white shadow-[0_14px_30px_rgba(16,185,129,0.35)] select-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/30 bg-white/20">
                  <Coins className="h-5 w-5 text-white" />
                </div>
                <span className="rounded-xl border border-emerald-700 bg-emerald-600 px-2.5 py-1 font-mono text-[10px] font-black uppercase">
                  COSMIC LOOT
                </span>
              </div>

              <div className="mt-6">
                <span className="font-mono text-xs font-black tracking-wider text-emerald-200 uppercase">
                  SHOP VAULT
                </span>
                <h3 className="font-heading text-xl leading-tight font-black text-white">
                  Cyberpunk HUD
                </h3>
                <p className="font-body mt-2 text-xs leading-relaxed text-emerald-100/90">
                  High-energy neon theme unlocked with earned gold coins.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-emerald-600/60 pt-4">
                <span className="font-mono text-xs font-black text-emerald-100">
                  250 COINS
                </span>
                <span className="font-heading rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700 shadow-xs">
                  UNLOCKED
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. THREE CHUNKY GAME PILLARS                                             */}
        {/* ========================================================================= */}
        <section className="mt-20 sm:mt-28">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-3xl font-black text-white sm:text-4xl">
              CORE RPG MECHANICS
            </h2>
            <p className="font-body mt-2 text-sm text-slate-300 sm:text-base">
              Engineered to make daily discipline genuinely addictive.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Pillar 1: Quests */}
            <div className="rounded-3xl border-3 border-violet-700 bg-violet-600 p-6 text-white shadow-[0_6px_0_0_#4c1d95]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/20">
                <Sword className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-heading mt-6 text-2xl font-black text-white">
                Tiered Quests
              </h3>
              <p className="font-body mt-2 text-xs leading-relaxed text-violet-100 sm:text-sm">
                Break ambitious goals into Easy (+10 XP), Medium (+25 XP), and
                Hard (+50 XP) battles with instant satisfaction.
              </p>
            </div>

            {/* Pillar 2: Attributes */}
            <div className="rounded-3xl border-3 border-blue-700 bg-blue-600 p-6 text-white shadow-[0_6px_0_0_#1e40af]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/20">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-heading mt-6 text-2xl font-black text-white">
                Attribute Trees
              </h3>
              <p className="font-body mt-2 text-xs leading-relaxed text-blue-100 sm:text-sm">
                Workouts build Strength. Reading expands Intellect. Routines
                forge Discipline. Every task permanently enhances your sheet.
              </p>
            </div>

            {/* Pillar 3: Loot Economy */}
            <div className="rounded-3xl border-3 border-amber-500 bg-amber-400 p-6 text-slate-950 shadow-[0_6px_0_0_#b45309]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-black/15">
                <Trophy className="h-6 w-6 text-slate-950" />
              </div>
              <h3 className="font-heading mt-6 text-2xl font-black text-slate-950">
                Guilt-Free Loot
              </h3>
              <p className="font-body mt-2 text-xs leading-relaxed font-medium text-amber-950 sm:text-sm">
                Earn gold coins solely by finishing tasks. Spend them in the
                shop for cosmetic themes and custom real-life rewards.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 border-t border-slate-800 pt-8 pb-12 text-center text-xs text-slate-400">
          <p className="font-heading text-base font-black text-white">
            LIFE RPG · 2026 HACKATHON EDITION
          </p>
          <p className="mt-1 font-mono text-[11px] text-slate-500">
            Powered by Next.js 16, Supabase, Tailwind CSS, and Framer Motion
          </p>
        </footer>
      </div>
    </div>
  );
}
