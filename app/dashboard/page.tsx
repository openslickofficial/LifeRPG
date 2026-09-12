import { redirect } from "next/navigation";
import {
  LogOut,
  Sparkles,
  Flame,
  Coins,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Authenticate user server-side
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch user's character profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Redirect to onboarding if username not yet set
  if (!profile || !profile.username) {
    redirect("/onboarding");
  }

  // 3. Fetch user's streaks
  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  // 4. Fetch user's attributes
  const { data: attributes } = await supabase
    .from("attributes")
    .select("*")
    .eq("profile_id", user.id);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl space-y-8">
        {/* Dashboard Top Header with Sign Out Action */}
        <div className="border-border/80 bg-card/90 shadow-layered flex flex-col gap-4 rounded-3xl border p-6 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-violet-500/20">
              <div className="bg-background text-foreground font-heading flex h-full w-full items-center justify-center rounded-[14px] text-xl font-extrabold">
                🛡️
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome, {profile.username}
                </h1>
                <Badge variant="xp">ONLINE</Badge>
              </div>
              <p className="font-body text-muted-foreground text-xs">
                Character authenticated via Supabase Server Session
              </p>
            </div>
          </div>

          {/* Sign Out Server Action Form */}
          <form action="/auth/signout" method="POST">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="text-muted-foreground h-10 gap-2 rounded-xl text-xs font-semibold hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </form>
        </div>

        {/* Server Session & Data Verification Banner */}
        <div className="font-body flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <div className="flex-1">
            <p className="font-semibold">Server-Side Data Connection Active</p>
            <p className="mt-0.5 font-mono text-[11px] text-emerald-700/90 dark:text-emerald-300/90">
              User ID: {user.id} · Email:{" "}
              {user.email || "OAuth Provider Account"}
            </p>
          </div>
        </div>

        {/* Core Stats Overview */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <span className="font-heading text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Character Level
              </span>
              <Sparkles className="h-4 w-4 text-violet-500" />
            </div>
            <div className="mt-3">
              <span className="text-foreground font-mono text-3xl font-extrabold">
                Level {profile.level}
              </span>
              <p className="text-muted-foreground mt-1 font-mono text-xs">
                {profile.current_xp} Total XP
              </p>
            </div>
          </Card>

          <Card className="rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <span className="font-heading text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Purse & Gold
              </span>
              <Coins className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-3">
              <span className="font-mono text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {profile.currency}
              </span>
              <p className="font-body text-muted-foreground mt-1 text-xs">
                Spendable in Shop
              </p>
            </div>
          </Card>

          <Card className="rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <span className="font-heading text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Active Streak
              </span>
              <Flame className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-3">
              <span className="text-foreground font-mono text-3xl font-extrabold">
                {streak?.current_streak ?? 0} Days
              </span>
              <p className="text-muted-foreground mt-1 font-mono text-xs">
                Record: {streak?.longest_streak ?? 0} Days
              </p>
            </div>
          </Card>

          <Card className="rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <span className="font-heading text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Primary Attribute
              </span>
              <Zap className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="mt-3">
              <span className="font-heading text-foreground text-2xl font-extrabold">
                Discipline
              </span>
              <p className="mt-1 font-mono text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                Level {attributes?.[0]?.level ?? 1} Mastered
              </p>
            </div>
          </Card>
        </div>

        {/* Character Attributes HUD Panel */}
        <Card className="rounded-3xl p-6 sm:p-8">
          <CardTitle className="text-xl">Heroic Attributes</CardTitle>
          <CardDescription className="mt-1">
            Dynamic attributes read directly from public.attributes via Supabase
            RLS.
          </CardDescription>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {attributes && attributes.length > 0 ? (
              attributes.map((attr) => (
                <div
                  key={attr.id}
                  className="border-border/70 bg-muted/40 rounded-2xl border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-foreground text-sm font-bold">
                      {attr.name}
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      LVL {attr.level}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="text-muted-foreground flex justify-between font-mono text-xs">
                      <span>Progress</span>
                      <span>{attr.current_xp} XP</span>
                    </div>
                    <div className="bg-muted mt-1.5 h-1.5 w-full rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{
                          width: `${Math.min(100, attr.current_xp * 2)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="border-border text-muted-foreground col-span-3 rounded-2xl border border-dashed p-6 text-center text-xs">
                Starter attributes are automatically initialized upon user
                registration via Postgres trigger.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
