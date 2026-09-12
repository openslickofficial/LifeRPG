import * as React from "react";
import { Trophy, Crown, Medal, Sparkles } from "lucide-react";
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
}

const defaultMockLeaderboard: LeaderboardEntry[] = [
  {
    id: "lead-1",
    rank: 1,
    name: "Seraphina Vance",
    level: 48,
    score: 14820,
    classTitle: "Arcane Chronomancer",
  },
  {
    id: "lead-2",
    rank: 2,
    name: "Kaelen Dawn",
    level: 42,
    score: 12450,
    classTitle: "Focus Berserker",
  },
  {
    id: "lead-3",
    rank: 3,
    name: "Elena Frost",
    level: 39,
    score: 11200,
    classTitle: "Deep Paladin",
  },
  {
    id: "lead-4",
    rank: 4,
    name: "You (Adventurer)",
    level: 24,
    score: 7650,
    classTitle: "Knight of Discipline",
    isCurrentUser: true,
  },
  {
    id: "lead-5",
    rank: 5,
    name: "Marcus Steel",
    level: 21,
    score: 6400,
    classTitle: "Habit Stalker",
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
  return (
    <Card
      className={`border-border/80 bg-card/95 shadow-layered rounded-3xl border p-6 backdrop-blur-md ${className}`}
    >
      {/* Header */}
      <div className="border-border/60 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="font-heading text-foreground text-lg font-bold">
              {title}
            </CardTitle>
            <CardDescription className="font-body text-muted-foreground text-xs">
              {subtitle}
            </CardDescription>
          </div>
        </div>

        <Badge variant="gold" className="font-mono text-[10px]">
          LIVE
        </Badge>
      </div>

      {/* Leaderboard List */}
      <div className="mt-4 space-y-2.5">
        {entries.map((entry) => {
          const isTop1 = entry.rank === 1;
          const isTop2 = entry.rank === 2;
          const isTop3 = entry.rank === 3;

          let rankBadgeBg = "bg-muted text-muted-foreground";
          let rowHighlight =
            "border-border/60 hover:border-border hover:bg-secondary/40";

          if (isTop1) {
            rankBadgeBg =
              "bg-amber-500 text-slate-950 font-extrabold shadow-sm";
            rowHighlight =
              "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50";
          } else if (isTop2) {
            rankBadgeBg =
              "bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white font-bold";
            rowHighlight =
              "border-slate-300/30 dark:border-slate-600/30 bg-slate-500/5 hover:border-slate-400/50";
          } else if (isTop3) {
            rankBadgeBg = "bg-amber-700/80 text-white font-bold";
            rowHighlight =
              "border-amber-700/30 bg-amber-700/5 hover:border-amber-700/50";
          }

          if (entry.isCurrentUser) {
            rowHighlight =
              "border-primary/50 bg-primary/5 ring-1 ring-primary/20";
          }

          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between rounded-2xl border p-3 transition-all duration-150 ${rowHighlight}`}
            >
              {/* Left Side: Rank, Avatar, Name & Class */}
              <div className="flex items-center gap-3">
                {/* Rank Number or Crown */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-mono text-xs ${rankBadgeBg}`}
                >
                  {isTop1 ? (
                    <Crown className="h-4 w-4" />
                  ) : isTop2 || isTop3 ? (
                    <Medal className="h-3.5 w-3.5" />
                  ) : (
                    entry.rank
                  )}
                </div>

                {/* Avatar Placeholder */}
                <div className="font-heading relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-xs font-bold text-white shadow-xs">
                  {entry.name.slice(0, 2).toUpperCase()}
                  <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 font-mono text-[8px] font-bold text-white">
                    {entry.level}
                  </span>
                </div>

                {/* Name & Class Title */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading text-foreground text-xs font-bold">
                      {entry.name}
                    </span>
                    {entry.isCurrentUser && (
                      <Badge
                        variant="brand"
                        className="h-4 px-1 font-mono text-[9px]"
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

              {/* Right Side: Score / XP */}
              <div className="text-right">
                <span className="text-foreground font-mono text-xs font-bold">
                  {entry.score.toLocaleString()}
                </span>
                <p className="text-muted-foreground font-mono text-[10px]">
                  XP Earned
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Reset Timer */}
      <div className="border-border/50 text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 font-mono text-[11px]">
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>Resets in 2d 14h</span>
        </span>
        <span className="text-primary font-semibold">Tier I Bracket</span>
      </div>
    </Card>
  );
}
