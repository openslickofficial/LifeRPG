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
  Plus,
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatTile } from "@/components/StatTile";
import { CircularProgress } from "@/components/CircularProgress";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getLevelProgress, getRankTitle } from "@/lib/rpg/leveling";
import { StreakCalendar } from "@/components/StreakCalendar";
import { BlobCharacter } from "@/components/BlobCharacter";
import { GroupBlobImage } from "@/components/GroupBlobImage";

interface DashboardPageProps {
  searchParams?: Promise<{ demo?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
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
  let streakShields = 2;
  let lastActivityDate: string | null = null;
  let activityDates: string[] = [];
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
      streakShields = profile.streak_shields ?? 0;
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
      lastActivityDate = streak.last_activity_date;
    }

    // Fetch completed tasks in last 7 days for the streak calendar
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: recentTasks } = await supabase
      .from("tasks")
      .select("completed_at")
      .eq("profile_id", user.id)
      .eq("status", "completed")
      .gte("completed_at", sevenDaysAgo.toISOString());

    if (recentTasks) {
      activityDates = recentTasks
        .map((t) => (t.completed_at ? t.completed_at.slice(0, 10) : ""))
        .filter(Boolean);
    }
  } else {
    // Demo fallback activity dates for preview mode
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(d1.getDate() - 1);
    const d2 = new Date(today);
    d2.setDate(d2.getDate() - 2);
    activityDates = [
      today.toISOString().slice(0, 10),
      d1.toISOString().slice(0, 10),
      d2.toISOString().slice(0, 10),
    ];
    lastActivityDate = today.toISOString().slice(0, 10);
  }

  // Check gentle streak decay: if last activity was 2 days ago (missed yesterday)
  let isStreakFading = false;
  let isStreakReset = false;
  let isLongInactive = false;

  let daysDiff = 0;
  if (lastActivityDate) {
    const last = new Date(lastActivityDate);
    const today = new Date();
    last.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    daysDiff = Math.round(
      (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff === 2) {
      isStreakFading = true;
    } else if (daysDiff > 2 && streakCount === 0 && (longestStreak > 0 || daysDiff < 60)) {
      // Streak was lost/reset after having a prior streak
      isStreakReset = true;
    }

    if (daysDiff >= 7) {
      isLongInactive = true;
    }
  } else if (isAuthenticatedUser && longestStreak > 0 && streakCount === 0) {
    isStreakReset = true;
  }

  // Allow preview demo overrides via URL searchParams (e.g. ?demo=streak-reset or ?demo=inactive)
  if (resolvedParams.demo === "streak-reset") {
    streakCount = 0;
    longestStreak = 14;
    isStreakReset = true;
    isStreakFading = false;
  } else if (resolvedParams.demo === "inactive") {
    isLongInactive = true;
    isStreakReset = true;
    streakCount = 0;
  }

  // Calculate non-linear XP progress towards next level using pure leveling curve
  const progress = getLevelProgress(level, currentXp);
  const xpNeededRemaining = Math.max(
    0,
    progress.xpNeededForNextLevel - progress.xpIntoLevel
  );
  const xpProgressPercentage = progress.percentage;

  // Flame icon visual intensity based on streak duration
  const flameIconClass =
    streakCount >= 30
      ? "h-5 w-5 text-rose-500 scale-125 drop-shadow-[0_0_12px_rgba(244,63,94,0.85)] animate-pulse"
      : streakCount >= 7
        ? "h-5 w-5 text-amber-500 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse"
        : streakCount > 0
          ? "h-5 w-5 text-amber-500"
          : "h-5 w-5 text-muted-foreground/60";

  const todayStr = new Date().toISOString().slice(0, 10);
  const completedToday = activityDates.includes(todayStr);
  const isCelebrating = completedToday || progress.percentage >= 100;

  return (
    <div className="space-y-8">
      {/* 1. Top Header Area (Greeting, Notification Bell, Action with Pip) */}
      <DashboardHeader
        username={username}
        isCelebrating={isCelebrating}
      />

      {/* Gentle Streak Decay Nudge Banner with Mascot Pip */}
      {isStreakFading && (
        <div className="flex items-center justify-between gap-4 rounded-3xl border-2 border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 text-xs text-amber-950 dark:text-amber-100 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="shrink-0">
              <BlobCharacter blobId="mascot" size="sm" state="sad" />
            </div>
            <div>
              <p className="font-heading text-xs font-black sm:text-sm text-foreground">
                Your streak is fading, but Pip knows you can do it!
              </p>
              <p className="font-body text-muted-foreground mt-0.5 text-xs leading-relaxed">
                You missed yesterday — complete a quest today to rekindle your discipline flame. Pip is right here cheering you on!
              </p>
            </div>
          </div>
          <Link href="/dashboard/quests">
            <Button
              size="sm"
              className="shadow-brand rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Save Streak
            </Button>
          </Link>
        </div>
      )}

      {/* Supportive Streak Reset Banner with Group Hurt Blobs */}
      {isStreakReset && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border-2 border-rose-500/30 bg-rose-500/10 p-4 sm:p-5 text-xs text-rose-950 dark:text-rose-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-24 sm:h-20 sm:w-28 shrink-0">
              <GroupBlobImage
                src="/blobs/blobs-hurt.png"
                alt="Companions encouraging you after streak reset"
                fill
                sizes="112px"
                className="filter drop-shadow-sm"
                fallbackTitle="Fresh Streak"
              />
            </div>
            <div>
              <p className="font-heading text-xs font-black sm:text-sm text-foreground">
                Ouch — but every hero starts somewhere. Ready for a fresh streak?
              </p>
              <p className="font-body text-muted-foreground mt-0.5 text-xs leading-relaxed">
                Your streak has reset, but every legend has setbacks. Your companions are cheering you on — complete any quest today to ignite a fresh new streak!
              </p>
            </div>
          </div>
          <Link href="/dashboard/quests">
            <Button
              size="sm"
              className="shadow-brand rounded-xl text-xs font-black uppercase tracking-wider shrink-0"
            >
              Ignite Fresh Streak
            </Button>
          </Link>
        </div>
      )}

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
        <h2 className="sr-only">Core Character Stats Overview</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stat 1: Character Level */}
          <StatTile
            icon={<Shield className="h-5 w-5" aria-hidden="true" />}
            label="Character Level"
            value={`Lvl ${level}`}
            subvalue={getRankTitle(level)}
            accentColor="violet"
            trend="Rank #42 · Season 1 Bracket"
          />

          {/* Stat 2: Current XP with Circular Progress Ring */}
          <StatTile
            icon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
            label="Experience Points"
            value={`${currentXp.toLocaleString()}`}
            subvalue={`${xpNeededRemaining} XP to Lvl ${level + 1}`}
            accentColor="emerald"
            trend={`${progress.xpIntoLevel} / ${progress.xpNeededForNextLevel} XP in Tier`}
          >
            <CircularProgress
              percentage={xpProgressPercentage}
              size={64}
              strokeWidth={6}
              color="text-white"
              trackColor="text-emerald-700/70"
              valueClassName="text-white font-black"
              sublabelClassName="text-emerald-100"
              value={`${xpProgressPercentage}%`}
              sublabel="XP"
            />
          </StatTile>

          {/* Stat 3: Daily Activity Streak with Dynamic Flame Intensity & Shields */}
          <StatTile
            icon={<Flame className={flameIconClass} aria-hidden="true" />}
            label="Daily Streak"
            value={streakCount > 0 ? `${streakCount} Days` : "0 Days"}
            subvalue={
              streakShields > 0
                ? `🛡️ ${streakShields} Shield${streakShields > 1 ? "s" : ""} Active · Best: ${longestStreak}d`
                : streakCount > 0
                  ? `Best Record: ${longestStreak} Days`
                  : "Fresh start — begin a new streak today"
            }
            accentColor="amber"
            trend={
              streakCount >= 7
                ? "🔥 1.5x Streak Multiplier Active"
                : streakCount > 0
                  ? "⚡ Streak active · Complete today to maintain"
                  : "🌱 Complete any quest to ignite streak"
            }
          />

          {/* Stat 4: Gold Currency */}
          <StatTile
            icon={<Coins className="h-5 w-5" aria-hidden="true" />}
            label="Gold Purse"
            value={`${currency.toLocaleString()}`}
            subvalue="Spendable in Shop Vault"
            accentColor="cyan"
            trend="+40 Gold earned today"
          />
        </div>
      </section>

      {/* 2b. Streak 7-Day Activity Calendar Card */}
      <Card className="border-border/80 bg-card/80 rounded-3xl border p-5 backdrop-blur-sm sm:p-6">
        <h2 className="sr-only">7-Day Streak Activity Calendar</h2>
        <StreakCalendar activityDates={activityDates} />
      </Card>

      {/* 3. Main Dashboard Body: Asymmetric Grid (Quests & Habits vs Leaderboard) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (8 cols): Today's Active Quest Board & Attributes Preview */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          {/* Active Quests Card */}
          <Card className="rounded-3xl p-6 sm:p-8">
            <div className="border-border/60 flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Sword className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle as="h2" className="text-xl">
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
                  className="h-10 min-h-[44px] gap-1.5 rounded-xl text-xs sm:h-8.5 sm:min-h-0"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Quests Content / Long Inactivity Empty State */}
            {isLongInactive ? (
              <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-500/20 bg-rose-500/5 p-8 text-center sm:p-10">
                <div className="relative h-28 w-44 sm:h-36 sm:w-56 mb-4">
                  <GroupBlobImage
                    src="/blobs/blobs-hurt.png"
                    alt="Companions missing your adventures"
                    fill
                    sizes="(max-width: 640px) 176px, 224px"
                    className="filter drop-shadow-md"
                    fallbackTitle="Companions Miss You"
                  />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                  Your companions have missed you. Let&apos;s get back to it.
                </h3>
                <p className="font-body mt-1.5 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  It&apos;s been over a week since your last completed quest. No pressure, no judgment — just pick one small task today to bring the party back to life.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/dashboard/quests?action=new">
                    <Button size="sm" className="rounded-xl text-xs font-bold gap-2">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create a Quick Quest</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/quests">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                      <span>Browse Quest Board</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Sample Active Quests */
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
            )}
          </Card>

          {/* Quick Attributes Card */}
          <Card className="rounded-3xl p-6">
            <div className="border-border/60 flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-cyan-500" aria-hidden="true" />
                <h2 className="font-heading text-foreground text-sm font-bold">
                  Attribute Mastery Summary
                </h2>
              </div>
              <Link
                href="/dashboard/attributes"
                className="font-body text-primary text-xs font-semibold hover:underline"
              >
                Skill Trees →
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="border-border/60 bg-muted/40 rounded-2xl border p-3.5 text-center transition-colors hover:border-rose-500/40">
                <span className="font-heading text-xs font-bold text-rose-500">
                  ⚔️ Strength
                </span>
                <p className="text-foreground mt-1 font-mono text-base font-extrabold">
                  Lvl 12
                </p>
                <p className="text-muted-foreground font-mono text-[10px]">
                  Physical Grit
                </p>
              </div>
              <div className="border-border/60 bg-muted/40 rounded-2xl border p-3.5 text-center transition-colors hover:border-cyan-500/40">
                <span className="font-heading text-xs font-bold text-cyan-500">
                  🔮 Intellect
                </span>
                <p className="text-foreground mt-1 font-mono text-base font-extrabold">
                  Lvl 16
                </p>
                <p className="text-muted-foreground font-mono text-[10px]">
                  Focus Systems
                </p>
              </div>
              <div className="border-border/60 bg-muted/40 rounded-2xl border p-3.5 text-center transition-colors hover:border-violet-500/40">
                <span className="font-heading text-xs font-bold text-violet-500">
                  🛡️ Discipline
                </span>
                <p className="text-foreground mt-1 font-mono text-base font-extrabold">
                  Lvl 18
                </p>
                <p className="text-muted-foreground font-mono text-[10px]">
                  Habit Resolve
                </p>
              </div>
              <div className="border-border/60 bg-muted/40 rounded-2xl border p-3.5 text-center transition-colors hover:border-amber-500/40">
                <span className="font-heading text-xs font-bold text-amber-500">
                  🎨 Creativity
                </span>
                <p className="text-foreground mt-1 font-mono text-base font-extrabold">
                  Lvl 10
                </p>
                <p className="text-muted-foreground font-mono text-[10px]">
                  Innovation & Art
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
