import * as React from "react";
import Link from "next/link";
import {
  Shield,
  Sparkles,
  Flame,
  Coins,
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  Sword,
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatTile } from "@/components/StatTile";
import { CircularProgress } from "@/components/CircularProgress";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Fetch authenticated user from Supabase server session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Default / preview fallback values
  let username = "Alex Vanguard";
  let level = 14;
  let currentXp = 4250;
  let currency = 1450;
  let streakCount = 7;
  let longestStreak = 14;
  let isAuthenticatedUser = false;

  if (user) {
    isAuthenticatedUser = true;

    // Fetch character profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      username = profile.username || "Adventurer";
      level = profile.level;
      currentXp = profile.current_xp;
      currency = profile.currency;
    }

    // Fetch streak records
    const { data: streak } = await supabase
      .from("streaks")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (streak) {
      streakCount = streak.current_streak;
      longestStreak = streak.longest_streak;
    }
  }

  // Calculate XP progress towards next level
  const targetXpForNextLevel = 1000;
  const xpInCurrentTier = currentXp % targetXpForNextLevel;
  const xpProgressPercentage = Math.min(
    100,
    Math.max(
      8, // minimum visual ring progress
      Math.round((xpInCurrentTier / targetXpForNextLevel) * 100)
    )
  );

  return (
    <div className="space-y-8">
      {/* 1. Top Header Area (Greeting, Search Bar, Notification Bell, Action) */}
      <DashboardHeader username={username} />

      {/* Auth verification banner if logged in */}
      {isAuthenticatedUser && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="font-medium">
              Live Supabase Character Session Verified for{" "}
              <strong>{username}</strong>
            </span>
          </div>
          <Badge variant="xp" className="text-[10px]">
            CONNECTED
          </Badge>
        </div>
      )}

      {/* 2. Grid of 4 Reusable Stat Tiles (Reflows: 4 col -> 2 col -> 1 col) */}
      <section aria-label="Core Character Stats">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stat 1: Character Level */}
          <StatTile
            icon={<Shield className="h-5 w-5" />}
            label="Character Level"
            value={`Lvl ${level}`}
            subvalue="Paladin of Discipline"
            accentColor="violet"
            trend="Rank #42 · Season 1 Bracket"
          />

          {/* Stat 2: Current XP with Circular Progress Ring */}
          <StatTile
            icon={<Sparkles className="h-5 w-5" />}
            label="Experience Points"
            value={`${currentXp.toLocaleString()}`}
            subvalue={`${targetXpForNextLevel - xpInCurrentTier} XP to Lvl ${level + 1}`}
            accentColor="emerald"
            trend="+350 XP earned today"
          >
            <CircularProgress
              percentage={xpProgressPercentage}
              size={64}
              strokeWidth={6}
              value={`${xpProgressPercentage}%`}
              sublabel="XP"
            />
          </StatTile>

          {/* Stat 3: Daily Activity Streak */}
          <StatTile
            icon={<Flame className="h-5 w-5" />}
            label="Daily Streak"
            value={`${streakCount} Days`}
            subvalue={`Best Record: ${longestStreak} Days`}
            accentColor="rose"
            trend="🔥 1.5x Streak Multiplier Active"
          />

          {/* Stat 4: Gold Currency */}
          <StatTile
            icon={<Coins className="h-5 w-5" />}
            label="Gold Purse"
            value={`${currency.toLocaleString()}`}
            subvalue="Spendable in Shop Vault"
            accentColor="amber"
            trend="+40 Gold earned today"
          />
        </div>
      </section>

      {/* 3. Main Dashboard Body: Asymmetric Grid (Quests & Habits vs Leaderboard) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (8 cols): Today's Active Quest Board & Attributes Preview */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          {/* Active Quests Card */}
          <Card className="rounded-3xl p-6 sm:p-8">
            <div className="border-border/60 flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Sword className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Today&apos;s Quest Board
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Complete dailies before midnight to maintain your{" "}
                    {streakCount}-day streak
                  </CardDescription>
                </div>
              </div>

              <Link href="/dashboard/quests">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8.5 gap-1.5 rounded-xl text-xs"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Sample Active Quests */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 transition-all hover:bg-emerald-500/10">
                <div className="flex items-center gap-3.5">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  <div>
                    <p className="font-body text-foreground text-muted-foreground text-xs font-semibold line-through sm:text-sm">
                      Morning 90-Min Focus Deep Work Sprint
                    </p>
                    <div className="text-muted-foreground mt-0.5 flex items-center gap-2 font-mono text-[11px]">
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                        Focus
                      </span>
                      <span>•</span>
                      <span>Completed at 09:30 AM</span>
                    </div>
                  </div>
                </div>
                <Badge variant="xp">+250 XP</Badge>
              </div>

              <div className="border-border/80 bg-card hover:border-primary/40 hover:bg-secondary/30 flex items-center justify-between rounded-2xl border p-4 transition-all">
                <div className="flex items-center gap-3.5">
                  <Circle className="text-muted-foreground/50 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-body text-foreground text-xs font-semibold sm:text-sm">
                      Strength Routine (50 Pushups & Core Session)
                    </p>
                    <div className="text-muted-foreground mt-0.5 flex items-center gap-2 font-mono text-[11px]">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        Vitality
                      </span>
                      <span>•</span>
                      <span>Reward: +180 XP · +25 Gold</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-[11px]">
                  Pending
                </Badge>
              </div>

              <div className="border-border/80 bg-card hover:border-primary/40 hover:bg-secondary/30 flex items-center justify-between rounded-2xl border p-4 transition-all">
                <div className="flex items-center gap-3.5">
                  <Circle className="text-muted-foreground/50 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-body text-foreground text-xs font-semibold sm:text-sm">
                      Read 25 Pages of Non-Fiction Book
                    </p>
                    <div className="text-muted-foreground mt-0.5 flex items-center gap-2 font-mono text-[11px]">
                      <span className="font-semibold text-violet-600 dark:text-violet-400">
                        Intellect
                      </span>
                      <span>•</span>
                      <span>Reward: +120 XP · +15 Gold</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-[11px]">
                  Pending
                </Badge>
              </div>
            </div>
          </Card>

          {/* Quick Attributes Card */}
          <Card className="rounded-3xl p-6">
            <div className="border-border/60 flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-cyan-500" />
                <span className="font-heading text-foreground text-sm font-bold">
                  Attribute Mastery Summary
                </span>
              </div>
              <Link
                href="/dashboard/attributes"
                className="font-body text-primary text-xs font-semibold hover:underline"
              >
                Skill Trees →
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="border-border/60 bg-muted/40 rounded-2xl border p-3.5 text-center">
                <span className="font-heading text-foreground text-xs font-bold">
                  ⚔️ Strength
                </span>
                <p className="text-foreground mt-1 font-mono text-base font-extrabold">
                  Lvl 12
                </p>
                <p className="text-muted-foreground font-mono text-[10px]">
                  Vitality Core
                </p>
              </div>
              <div className="border-border/60 bg-muted/40 rounded-2xl border p-3.5 text-center">
                <span className="font-heading text-foreground text-xs font-bold">
                  🔮 Intellect
                </span>
                <p className="text-foreground mt-1 font-mono text-base font-extrabold">
                  Lvl 16
                </p>
                <p className="text-muted-foreground font-mono text-[10px]">
                  Knowledge Core
                </p>
              </div>
              <div className="border-border/60 bg-muted/40 rounded-2xl border p-3.5 text-center">
                <span className="font-heading text-foreground text-xs font-bold">
                  🛡️ Discipline
                </span>
                <p className="text-foreground mt-1 font-mono text-base font-extrabold">
                  Lvl 18
                </p>
                <p className="text-muted-foreground font-mono text-[10px]">
                  Habit Resolve
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Leaderboard Panel (Mock data per requirement) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <LeaderboardPanel />
        </div>
      </div>
    </div>
  );
}
