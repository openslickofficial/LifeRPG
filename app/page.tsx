"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Trophy,
  Sparkles,
  Sword,
  CheckCircle2,
  Circle,
  Star,
  ChevronRight,
  Compass,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuestItem {
  id: string;
  title: string;
  category: string;
  xp: number;
  gold: number;
  completed: boolean;
}

export default function Home() {
  // Interactive Quest state for delightful micro-interaction in the Live HUD
  const [quests, setQuests] = React.useState<QuestItem[]>([
    {
      id: "q1",
      title: "Morning 90-Min Deep Work Sprint",
      category: "Focus",
      xp: 250,
      gold: 40,
      completed: true,
    },
    {
      id: "q2",
      title: "Hit Gym (Push Routine + 10k Steps)",
      category: "Vitality",
      xp: 180,
      gold: 30,
      completed: false,
    },
    {
      id: "q3",
      title: "Read 25 Pages of Non-Fiction",
      category: "Intellect",
      xp: 120,
      gold: 20,
      completed: false,
    },
  ]);

  const [bonusXpAlert, setBonusXpAlert] = React.useState<string | null>(null);

  const toggleQuest = (id: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const nextState = !q.completed;
          if (nextState) {
            setBonusXpAlert(`+${q.xp} XP Earned!`);
            setTimeout(() => setBonusXpAlert(null), 2500);
          }
          return { ...q, completed: nextState };
        }
        return q;
      })
    );
  };

  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 -z-10 h-[38rem] w-[58rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-500/12 via-cyan-400/8 to-transparent blur-3xl dark:from-violet-500/20 dark:via-cyan-500/12"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-48 -z-10 h-96 w-96 rounded-full bg-gradient-to-l from-cyan-400/10 to-transparent blur-3xl dark:from-cyan-500/15"
      />

      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-20">
        {/* Asymmetric Hero Section (2 Columns) */}
        <section className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Asymmetric Narrative & Action */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-start text-left lg:col-span-7"
          >
            {/* Live Season Chip */}
            <div className="bg-secondary/80 mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 px-3.5 py-1.5 shadow-xs backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
              </span>
              <span className="text-foreground/90 font-mono text-xs font-semibold">
                SEASON 1 · THE REALM OF FOCUS
              </span>
            </div>

            {/* Display Heading in Space Grotesk */}
            <h1 className="font-heading text-foreground text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-[4rem] lg:leading-[1.08]">
              Turn Everyday Habits Into{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400">
                Character Stats.
              </span>
            </h1>

            {/* Subtitle in Inter with Generous Line Height */}
            <p className="font-body text-muted-foreground mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
              Life RPG transforms your daily to-do lists, workouts, and deep
              work sprints into an immersive role-playing journey. Level up your
              real-life avatar, earn gold, and defeat the procrastination
              dragon.
            </p>

            {/* CTA Cluster */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="group shadow-brand h-12 rounded-xl px-7 text-base font-semibold hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Get Started</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl px-6 text-base font-semibold"
              >
                <Compass className="mr-2 h-4 w-4 text-cyan-500" />
                <span>Explore Preview</span>
              </Button>
            </div>

            {/* Social Proof & Guild Rating Row */}
            <div className="border-border/70 mt-10 flex flex-wrap items-center gap-4 border-t pt-6">
              <div className="flex -space-x-2.5 overflow-hidden">
                <div className="ring-background inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-[10px] font-bold text-white ring-2">
                  AX
                </div>
                <div className="ring-background inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-[10px] font-bold text-white ring-2">
                  KL
                </div>
                <div className="ring-background inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-[10px] font-bold text-white ring-2">
                  MR
                </div>
                <div className="ring-background inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200 ring-2">
                  +14k
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                  <span className="text-foreground ml-1 font-mono text-xs font-bold">
                    4.9 / 5
                  </span>
                </div>
                <span className="text-muted-foreground font-body text-xs">
                  14,200+ adventurers leveling up daily
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Live Interactive Character HUD Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="relative lg:col-span-5"
          >
            {/* Ambient Card Backlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-tr from-violet-600/20 to-cyan-500/20 opacity-75 blur-xl"
            />

            <Card className="border-border/80 bg-card/95 shadow-elevated relative overflow-hidden rounded-3xl border p-0 backdrop-blur-xl">
              {/* HUD Header Banner */}
              <div className="border-border/60 bg-muted/40 border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 p-0.5 shadow-md">
                      <div className="bg-background text-foreground font-heading flex h-full w-full items-center justify-center rounded-[14px] text-lg font-extrabold">
                        🛡️
                      </div>
                      <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 font-mono text-[9px] font-bold text-white shadow-xs">
                        24
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-foreground font-bold">
                          Alex Vanguard
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-muted-foreground font-mono text-xs">
                        Paladin of Focus · Rank #42
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-700 dark:text-amber-300">
                    <Coins className="h-3.5 w-3.5" />
                    <span className="font-mono text-xs font-bold">1,450</span>
                  </div>
                </div>
              </div>

              {/* Character Attributes & Progress HUD */}
              <div className="space-y-4 p-6">
                {/* Level Progression Bar (XP) */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Level 24 Progression</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      3,840 / 5,000 XP (76.8%)
                    </span>
                  </div>
                  <div className="bg-muted/80 mt-2 h-2.5 w-full overflow-hidden rounded-full p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 dark:shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                      style={{ width: "76.8%" }}
                    />
                  </div>
                </div>

                {/* Mana / Deep Work Stamina */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-cyan-500" />
                      <span>Focus Mana (Deep Work)</span>
                    </span>
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      480 / 500 MP
                    </span>
                  </div>
                  <div className="bg-muted/80 mt-2 h-2.5 w-full overflow-hidden rounded-full p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 dark:shadow-[0_0_12px_rgba(14,229,252,0.5)]"
                      style={{ width: "96%" }}
                    />
                  </div>
                </div>

                {/* Interactive Daily Quests Preview */}
                <div className="border-border/60 mt-6 border-t pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-heading text-foreground text-sm font-bold">
                      Today&apos;s Active Quests
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {completedCount} of {quests.length} Completed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {quests.map((quest) => (
                      <button
                        key={quest.id}
                        type="button"
                        onClick={() => toggleQuest(quest.id)}
                        className={`group flex w-full cursor-pointer items-center justify-between rounded-2xl border p-3 text-left transition-all duration-200 ${
                          quest.completed
                            ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-400/5"
                            : "border-border/70 bg-card hover:border-primary/40 hover:bg-secondary/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-5 w-5 items-center justify-center transition-transform group-hover:scale-110">
                            {quest.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Circle className="text-muted-foreground/60 h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-body text-xs font-semibold ${
                                quest.completed
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground"
                              }`}
                            >
                              {quest.title}
                            </p>
                            <span className="text-muted-foreground font-mono text-[10px]">
                              {quest.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                          <span className="text-emerald-600 dark:text-emerald-400">
                            +{quest.xp} XP
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Moment of Delight Toast Notice */}
                  {bonusXpAlert && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 py-1.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-300"
                    >
                      <Sparkles className="h-3.5 w-3.5 animate-spin" />
                      <span>{bonusXpAlert}</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* HUD Footer */}
              <div className="border-border/60 bg-muted/20 border-t px-6 py-3 text-center">
                <span className="text-muted-foreground font-mono text-[11px]">
                  Tap quest items to preview live RPG progression logic
                </span>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* Asymmetric Showcase: The Core Game Mechanics */}
        <section className="mt-24 sm:mt-32">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Badge variant="brand" className="mb-2 font-mono text-xs">
                CORE GAME MECHANICS
              </Badge>
              <h2 className="font-heading text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Built For High Performers Who Love RPGs.
              </h2>
              <p className="font-body text-muted-foreground mt-2 text-base">
                Three interwoven systems engineered to make daily consistency
                genuinely addictive.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="hidden rounded-xl font-mono text-xs sm:inline-flex"
            >
              <span>View Rulebook</span>
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Asymmetric 3-Card Grid */}
          <div className="grid gap-6 md:grid-cols-12">
            {/* Card 1: Featured Quest Engine (Span 7) */}
            <Card className="border-border/80 bg-card shadow-layered hover:shadow-elevated flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all duration-200 sm:p-8 md:col-span-7">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <Sword className="h-6 w-6" />
                  </div>
                  <Badge variant="xp">STREAK MULTIPLIER 3.5X</Badge>
                </div>

                <div className="mt-6">
                  <CardTitle className="text-2xl">
                    The Dynamic Quest Engine
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Break overwhelming ambitious life goals into tiered
                    micro-battles. Dailies give steady XP, while Epic Quests
                    trigger boss encounters that reward rare gear.
                  </CardDescription>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="border-border/60 bg-muted/40 rounded-2xl border p-3.5 text-center">
                    <span className="font-heading text-foreground text-lg font-bold">
                      Daily
                    </span>
                    <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                      +50 XP
                    </p>
                  </div>
                  <div className="border-border/60 bg-muted/40 rounded-2xl border p-3.5 text-center">
                    <span className="font-heading text-foreground text-lg font-bold">
                      Heroic
                    </span>
                    <p className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
                      +250 XP
                    </p>
                  </div>
                  <div className="border-border/60 bg-muted/40 rounded-2xl border p-3.5 text-center">
                    <span className="font-heading text-foreground text-lg font-bold">
                      Boss
                    </span>
                    <p className="font-mono text-[11px] text-violet-600 dark:text-violet-400">
                      +1,000 XP
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-border/60 mt-8 flex items-center justify-between border-t pt-4">
                <span className="text-muted-foreground font-mono text-xs">
                  Calibrated for focus sprints
                </span>
                <span className="text-primary font-mono text-xs font-bold">
                  Level 1 - 100 System
                </span>
              </div>
            </Card>

            {/* Card 2: Skill Trees & Attributes (Span 5) */}
            <Card className="border-border/80 bg-card shadow-layered hover:shadow-elevated flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all duration-200 sm:p-8 md:col-span-5">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <Zap className="h-6 w-6" />
                  </div>
                  <Badge variant="mana">STAT MASTERY</Badge>
                </div>

                <div className="mt-6">
                  <CardTitle className="text-2xl">Attribute Synergy</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Every task points to a real-life attribute. Workouts
                    increase Strength, reading expands Intellect, meditation
                    bolsters Willpower.
                  </CardDescription>
                </div>

                <div className="mt-6 space-y-2.5">
                  <div className="bg-muted/40 flex items-center justify-between rounded-xl px-3.5 py-2">
                    <span className="font-body text-xs font-semibold">
                      ⚔️ Strength & Stamina
                    </span>
                    <span className="text-foreground font-mono text-xs font-bold">
                      +24 STR
                    </span>
                  </div>
                  <div className="bg-muted/40 flex items-center justify-between rounded-xl px-3.5 py-2">
                    <span className="font-body text-xs font-semibold">
                      🔮 Intellect & Logic
                    </span>
                    <span className="text-foreground font-mono text-xs font-bold">
                      +38 INT
                    </span>
                  </div>
                  <div className="bg-muted/40 flex items-center justify-between rounded-xl px-3.5 py-2">
                    <span className="font-body text-xs font-semibold">
                      🛡️ Discipline & Resolve
                    </span>
                    <span className="text-foreground font-mono text-xs font-bold">
                      +52 RES
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-border/60 mt-8 border-t pt-4">
                <span className="text-muted-foreground font-mono text-xs">
                  Dynamic attribute scaling
                </span>
              </div>
            </Card>

            {/* Card 3: Real-World Loot Vault (Span 12) */}
            <Card className="border-border/80 bg-card shadow-layered hover:shadow-elevated overflow-hidden rounded-3xl border p-6 transition-all duration-200 sm:p-8 md:col-span-12">
              <div className="grid gap-6 md:grid-cols-12 md:items-center">
                <div className="md:col-span-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <Badge variant="gold">REAL-WORLD REWARDS</Badge>
                  </div>

                  <h3 className="font-heading text-foreground mt-4 text-2xl font-bold tracking-tight">
                    Guilt-Free Real-Life Rewards
                  </h3>
                  <p className="font-body text-muted-foreground mt-2 max-w-2xl text-base">
                    Gold isn&apos;t meaningless score. Spend earned gold on
                    custom real-life indulgences — video games, sushi nights, or
                    books — without feeling a single shred of procrastination
                    guilt.
                  </p>
                </div>

                <div className="flex flex-col justify-end gap-3 sm:flex-row md:col-span-4 md:flex-col">
                  <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                    <div>
                      <p className="font-heading text-foreground text-xs font-bold">
                        Weekend Gaming Session
                      </p>
                      <p className="text-muted-foreground font-mono text-[11px]">
                        Real-Life Leisure
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      350 Gold
                    </span>
                  </div>

                  <div className="border-border/60 bg-muted/30 flex items-center justify-between rounded-2xl border p-4">
                    <div>
                      <p className="font-heading text-foreground text-xs font-bold">
                        Coffee & Pastry Sprint
                      </p>
                      <p className="text-muted-foreground font-mono text-[11px]">
                        Energy Boost
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      120 Gold
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Phase 1 Status & Tech Stack Footer */}
        <footer className="border-border/60 mt-24 border-t pt-8 pb-12 text-center">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-6">
            <span className="font-heading text-foreground text-sm font-bold">
              Life RPG
            </span>
            <span className="text-muted-foreground/40 hidden sm:inline">•</span>
            <span className="font-body text-muted-foreground text-xs">
              Phase 1 Visual Foundation Active
            </span>
            <span className="text-muted-foreground/40 hidden sm:inline">•</span>
            <span className="text-muted-foreground font-mono text-xs">
              Next.js 16 · Tailwind v4 · shadcn/ui · next-themes
            </span>
          </div>
          <p className="font-body text-muted-foreground/80 mt-2 text-xs">
            Database models and Supabase authentication scheduled for Phase 2.
          </p>
        </footer>
      </div>
    </div>
  );
}
