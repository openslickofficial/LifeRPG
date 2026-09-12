import * as React from "react";
import {
  Trophy,
  Crown,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatarUrl?: string | null;
  level: number;
  score: number;
  classTitle?: string;
  isCurrentUser?: boolean;
  rankChange?: number; // positive = up, negative = down, 0 = unchanged
}

const defaultMockLeaderboard: LeaderboardEntry[] = [
  {
    id: "lead-1",
    rank: 1,
    name: "Seraphina Vance",
    level: 48,
    score: 14820,
    classTitle: "Arcane Chronomancer",
    rankChange: 0,
  },
  {
    id: "lead-2",
    rank: 2,
    name: "Kaelen Dawn",
    level: 42,
    score: 12450,
    classTitle: "Focus Berserker",
    rankChange: 1,
  },
  {
    id: "lead-3",
    rank: 3,
    name: "Elena Frost",
    level: 39,
    score: 11200,
    classTitle: "Deep Paladin",
    rankChange: -1,
  },
  {
    id: "lead-4",
    rank: 4,
    name: "You (Adventurer)",
    level: 24,
    score: 7650,
    classTitle: "Knight of Discipline",
    isCurrentUser: true,
    rankChange: 2,
  },
  {
    id: "lead-5",
    rank: 5,
    name: "Marcus Steel",
    level: 21,
    score: 6400,
    classTitle: "Habit Stalker",
    rankChange: -1,
  },
];

interface LeaderboardPanelProps {
  entries?: LeaderboardEntry[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function LeaderboardPanel({
  entries = defaultMockLeaderboard,
  title = "Realm Leaderboard",
  subtitle = "Top Adventurers · Season 1",
  className = "",
}: LeaderboardPanelProps) {
  const rank1 = entries.find((e) => e.rank === 1) || entries[0];
  const rank2 = entries.find((e) => e.rank === 2) || entries[1];
  const rank3 = entries.find((e) => e.rank === 3) || entries[2];
  const remainingRanks = entries.filter((e) => e.rank > 3);

  const renderRankChange = (change?: number) => {
    if (!change || change === 0) {
      return (
        <span className="text-muted-foreground flex items-center gap-0.5 font-mono text-[10px] font-bold">
          <Minus className="h-2.5 w-2.5" />
        </span>
      );
    }
    if (change > 0) {
      return (
        <span className="flex items-center gap-0.5 font-mono text-[10px] font-black text-emerald-500">
          <ArrowUp className="h-3 w-3 stroke-[3]" />
          <span>+{change}</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-0.5 font-mono text-[10px] font-black text-rose-500">
        <ArrowDown className="h-3 w-3 stroke-[3]" />
        <span>{change}</span>
      </span>
    );
  };

  return (
    <Card
      className={`border-border bg-card shadow-layered rounded-3xl border-2 p-6 transition-all duration-150 ${className}`}
    >
      {/* Header */}
      <div className="border-border/60 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-amber-500 bg-amber-400 text-slate-950 shadow-[0_3px_0_0_#b45309]">
            <Trophy className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle
              as="h2"
              className="font-heading text-foreground text-xl font-black tracking-tight"
            >
              {title}
            </CardTitle>
            <CardDescription className="font-body text-muted-foreground text-xs font-semibold">
              {subtitle}
            </CardDescription>
          </div>
        </div>

        <Badge variant="gold" className="font-mono text-[11px] font-black">
          LIVE
        </Badge>
      </div>

      {/* 3-Step Olympic Game Podium (Top 3) */}
      <div className="mt-8 pt-4 pb-2">
        <div className="grid grid-cols-3 items-end gap-2 text-center sm:gap-4">
          {/* Rank 2 Podium (Left - Silver) */}
          {rank2 && (
            <div className="flex flex-col items-center">
              <div className="mb-2 flex flex-col items-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-3 border-slate-300 bg-gradient-to-tr from-slate-700 to-slate-800 text-sm font-black text-white shadow-md dark:border-slate-500">
                  {rank2.name.slice(0, 2).toUpperCase()}
                  <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-300 font-mono text-[9px] font-black text-slate-900 dark:bg-slate-400">
                    2
                  </span>
                </div>
                <p className="font-heading text-foreground mt-2 max-w-[90px] truncate text-xs font-black">
                  {rank2.name}
                </p>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="text-muted-foreground font-mono text-[11px] font-black">
                    {rank2.score.toLocaleString()} XP
                  </span>
                  {renderRankChange(rank2.rankChange)}
                </div>
              </div>

              {/* Silver Pedestal */}
              <div className="flex h-24 w-full flex-col items-center justify-center rounded-t-2xl border-2 border-b-0 border-slate-400 bg-slate-300 text-slate-900 shadow-[0_5px_0_0_#94a3b8] dark:bg-slate-700 dark:text-slate-100 dark:shadow-[0_5px_0_0_#334155]">
                <span className="font-heading text-3xl font-black">2</span>
                <span className="font-heading text-[10px] font-extrabold tracking-widest uppercase opacity-80">
                  Silver
                </span>
              </div>
            </div>
          )}

          {/* Rank 1 Podium (Center - Gold Champion - Tallest!) */}
          {rank1 && (
            <div className="flex flex-col items-center">
              <div className="mb-2 flex flex-col items-center">
                <Crown className="h-6 w-6 animate-bounce text-amber-500" />
                <div className="relative flex h-18 w-18 items-center justify-center rounded-3xl border-4 border-amber-400 bg-gradient-to-tr from-violet-700 to-indigo-800 text-base font-black text-white shadow-lg shadow-amber-500/20">
                  {rank1.name.slice(0, 2).toUpperCase()}
                  <span className="absolute -right-1 -bottom-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-400 font-mono text-[11px] font-black text-slate-950 shadow-sm">
                    1
                  </span>
                </div>
                <p className="font-heading text-foreground mt-2 max-w-[110px] truncate text-xs font-black sm:text-sm">
                  {rank1.name}
                </p>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                    {rank1.score.toLocaleString()} XP
                  </span>
                  {renderRankChange(rank1.rankChange)}
                </div>
              </div>

              {/* Gold Pedestal (Tallest) */}
              <div className="flex h-32 w-full flex-col items-center justify-center rounded-t-3xl border-2 border-b-0 border-amber-500 bg-amber-400 text-slate-950 shadow-[0_6px_0_0_#b45309]">
                <span className="font-heading text-4xl font-black">1</span>
                <span className="font-heading text-[11px] font-black tracking-wider text-amber-950 uppercase">
                  Champion
                </span>
              </div>
            </div>
          )}

          {/* Rank 3 Podium (Right - Bronze) */}
          {rank3 && (
            <div className="flex flex-col items-center">
              <div className="mb-2 flex flex-col items-center">
                <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl border-3 border-amber-700 bg-gradient-to-tr from-stone-700 to-stone-900 text-xs font-black text-white shadow-md">
                  {rank3.name.slice(0, 2).toUpperCase()}
                  <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-700 font-mono text-[9px] font-black text-amber-100">
                    3
                  </span>
                </div>
                <p className="font-heading text-foreground mt-2 max-w-[90px] truncate text-xs font-black">
                  {rank3.name}
                </p>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="text-muted-foreground font-mono text-[11px] font-black">
                    {rank3.score.toLocaleString()} XP
                  </span>
                  {renderRankChange(rank3.rankChange)}
                </div>
              </div>

              {/* Bronze Pedestal */}
              <div className="flex h-20 w-full flex-col items-center justify-center rounded-t-2xl border-2 border-b-0 border-amber-800 bg-amber-700 text-amber-100 shadow-[0_4px_0_0_#78350f]">
                <span className="font-heading text-2xl font-black">3</span>
                <span className="font-heading text-[10px] font-extrabold tracking-widest text-amber-200 uppercase">
                  Bronze
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ranks 4+ List */}
      {remainingRanks.length > 0 && (
        <div className="border-border/70 mt-4 space-y-2 border-t pt-4">
          {remainingRanks.map((entry) => {
            const isUser = entry.isCurrentUser;

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between rounded-2xl border-2 p-3 transition-all ${
                  isUser
                    ? "border-violet-500 bg-violet-500/10 shadow-[0_3px_0_0_#7c3aed]"
                    : "border-border/80 bg-secondary/30 hover:border-border hover:bg-secondary/60"
                }`}
              >
                {/* Left: Rank, Avatar, Name */}
                <div className="flex items-center gap-3">
                  <div className="flex w-6 flex-col items-center justify-center">
                    <span className="text-muted-foreground font-mono text-xs font-black">
                      #{entry.rank}
                    </span>
                    {renderRankChange(entry.rankChange)}
                  </div>

                  <div className="font-heading relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-xs font-black text-white shadow-xs">
                    {entry.name.slice(0, 2).toUpperCase()}
                    <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 font-mono text-[8px] font-bold text-white">
                      {entry.level}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading text-foreground text-xs font-bold">
                        {entry.name}
                      </span>
                      {isUser && (
                        <Badge
                          variant="brand"
                          className="h-4 px-1.5 font-mono text-[9px] font-black"
                        >
                          YOU
                        </Badge>
                      )}
                    </div>
                    {entry.classTitle && (
                      <p className="font-body text-muted-foreground text-[11px]">
                        {entry.classTitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Score */}
                <div className="text-right">
                  <span className="text-foreground font-mono text-xs font-black tabular-nums">
                    {entry.score.toLocaleString()}
                  </span>
                  <p className="text-muted-foreground font-mono text-[9px] font-semibold uppercase">
                    XP
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer / Reset Timer */}
      <div className="border-border/60 text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 font-mono text-[11px]">
        <span className="flex items-center gap-1 font-bold">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Resets in 2d 14h</span>
        </span>
        <span className="text-primary font-black tracking-wider uppercase">
          Tier I Bracket
        </span>
      </div>
    </Card>
  );
}
