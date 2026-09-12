"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Zap,
  Trophy,
  Flame,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Sword,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background Ambient RPG Glows (Dynamic in Light vs Dark) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-400/15 via-indigo-500/10 to-transparent blur-3xl dark:from-sky-500/20 dark:via-purple-600/15"
      />

      <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <div className="border-border/80 bg-background/90 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 shadow-xs backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Phase 1 · Frontend Foundation
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            <span className="text-foreground block">
              Level Up Your Real Life with
            </span>
            <span className="mt-2 block bg-gradient-to-r from-slate-900 via-indigo-800 to-sky-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-indigo-300 dark:to-purple-400">
              Life RPG
            </span>
          </h1>

          <p className="text-muted-foreground mt-6 text-lg leading-relaxed sm:text-xl">
            Transform everyday habits, work sprints, and self-improvement into
            an immersive role-playing journey. Earn XP, upgrade your character
            stats, and defeat procrastination.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="group h-13 rounded-2xl px-8 text-base font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] dark:shadow-[0_0_25px_rgba(56,189,248,0.25)]"
            >
              <span>Get Started</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-border/80 bg-background/80 hover:bg-accent h-13 rounded-2xl px-8 text-base font-semibold backdrop-blur-sm"
            >
              <Sword className="mr-2 h-4 w-4" />
              <span>Explore Preview</span>
            </Button>
          </div>
        </motion.div>

        {/* Showcase Section: shadcn UI Cards and Gamified Preview */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-20 sm:mt-24"
        >
          <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Gamified System Architecture
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Previewing shadcn/ui Card, Badge, and Button primitives with
                16-24px rounded geometry.
              </p>
            </div>
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 text-xs font-semibold"
            >
              Live Theme Reactivity
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1: Player Character Status */}
            <Card className="border-border/80 bg-card relative overflow-hidden rounded-3xl border p-0 shadow-sm transition-all duration-300 hover:shadow-md dark:shadow-[0_0_20px_rgba(0,0,0,0.4)]">
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-sky-400">
                    <Shield className="h-6 w-6" />
                  </div>
                  <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300">
                    Level 14 Paladin
                  </Badge>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-card-foreground text-xl font-bold">
                    Hero Attributes
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1 text-sm">
                    Core stats calibrated for maximum productivity focus.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-2">
                <div className="space-y-4">
                  {/* Health / Stamina Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">
                        Vitality / Energy
                      </span>
                      <span className="text-foreground">84 / 100 HP</span>
                    </div>
                    <div className="bg-muted mt-1.5 h-2.5 w-full overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full bg-rose-500 dark:bg-rose-400 dark:shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                        style={{ width: "84%" }}
                      />
                    </div>
                  </div>

                  {/* Mana / Focus Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">
                        Deep Work Mana
                      </span>
                      <span className="text-foreground">62 / 100 MP</span>
                    </div>
                    <div className="bg-muted mt-1.5 h-2.5 w-full overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full bg-sky-500 dark:bg-sky-400 dark:shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                        style={{ width: "62%" }}
                      />
                    </div>
                  </div>

                  {/* Experience Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">
                        Level Progression
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        78% XP
                      </span>
                    </div>
                    <div className="bg-muted mt-1.5 h-2.5 w-full overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 dark:shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                        style={{ width: "78%" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-border/60 border-t p-6 pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full justify-between rounded-xl font-medium"
                >
                  <span>View Character Sheet</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Card 2: Daily Quests */}
            <Card className="border-border/80 bg-card relative overflow-hidden rounded-3xl border p-0 shadow-sm transition-all duration-300 hover:shadow-md dark:shadow-[0_0_20px_rgba(0,0,0,0.4)]">
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                    <Zap className="h-6 w-6" />
                  </div>
                  <Badge
                    variant="outline"
                    className="border-border/80 rounded-full font-semibold"
                  >
                    3 Quests Available
                  </Badge>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-card-foreground text-xl font-bold">
                    Daily Quests
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1 text-sm">
                    Repeatable routines that build persistent real-life
                    momentum.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-2">
                <div className="space-y-3">
                  <div className="border-border/60 bg-muted/40 flex items-start gap-3 rounded-2xl border p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <div className="flex-1">
                      <p className="text-foreground text-xs font-semibold">
                        Morning Focus Sprint (45m)
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        +120 XP · +15 Gold
                      </p>
                    </div>
                  </div>

                  <div className="border-border/60 bg-muted/40 flex items-start gap-3 rounded-2xl border p-3">
                    <Flame className="mt-0.5 h-4 w-4 text-amber-500" />
                    <div className="flex-1">
                      <p className="text-foreground text-xs font-semibold">
                        Strength & Posture Routine
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        +80 XP · +10 Gold
                      </p>
                    </div>
                  </div>

                  <div className="border-border/60 bg-muted/40 flex items-start gap-3 rounded-2xl border p-3">
                    <Zap className="mt-0.5 h-4 w-4 text-sky-500" />
                    <div className="flex-1">
                      <p className="text-foreground text-xs font-semibold">
                        Read 20 Pages Non-Fiction
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        +95 XP · +12 Gold
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-border/60 border-t p-6 pt-0">
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4 w-full rounded-xl font-semibold"
                >
                  <span>Open Quest Log</span>
                </Button>
              </CardFooter>
            </Card>

            {/* Card 3: Loot & Inventory */}
            <Card className="border-border/80 bg-card relative overflow-hidden rounded-3xl border p-0 shadow-sm transition-all duration-300 hover:shadow-md dark:shadow-[0_0_20px_rgba(0,0,0,0.4)]">
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <Badge className="rounded-full bg-amber-500/15 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300">
                    7 Day Streak
                  </Badge>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-card-foreground text-xl font-bold">
                    Rewards & Guild Stash
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1 text-sm">
                    Redeem earned gold for real-life leisure and rewards.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="border-border/60 bg-muted/40 rounded-2xl border p-3 text-center">
                    <span className="text-foreground text-xl font-extrabold">
                      420
                    </span>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Gold Coins
                    </p>
                  </div>
                  <div className="border-border/60 bg-muted/40 rounded-2xl border p-3 text-center">
                    <span className="text-foreground text-xl font-extrabold">
                      Tier II
                    </span>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Rank Badge
                    </p>
                  </div>
                  <div className="border-border/60 bg-muted/40 rounded-2xl border p-3 text-center">
                    <span className="text-foreground text-xl font-extrabold">
                      94%
                    </span>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Consistency
                    </p>
                  </div>
                  <div className="border-border/60 bg-muted/40 rounded-2xl border p-3 text-center">
                    <span className="text-foreground text-xl font-extrabold">
                      18
                    </span>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Completed
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-border/60 border-t p-6 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full rounded-xl font-medium"
                >
                  <span>Visit Guild Shop</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </motion.section>

        {/* Phase 1 Verification / Status Footer */}
        <footer className="border-border/60 text-muted-foreground mt-24 border-t pt-8 pb-12 text-center text-xs">
          <p>
            Life RPG · Phase 1 Scaffold Complete · Built with Next.js, Tailwind
            CSS, shadcn/ui, and next-themes
          </p>
          <p className="mt-1">
            Supabase database and authentication integration ready for Phase 2
          </p>
        </footer>
      </div>
    </div>
  );
}
