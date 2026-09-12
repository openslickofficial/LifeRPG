"use client";

import * as React from "react";
import { Check, Flame } from "lucide-react";

interface StreakDay {
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Tue...
  dayNumber: number; // 12
  isToday: boolean;
  hasActivity: boolean;
}

interface StreakCalendarProps {
  activityDates?: string[]; // Array of YYYY-MM-DD strings with completed tasks
  className?: string;
}

export function StreakCalendar({
  activityDates = [],
  className = "",
}: StreakCalendarProps) {
  // Generate the last 7 days dynamically
  const days: StreakDay[] = React.useMemo(() => {
    const result: StreakDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeSet = new Set(activityDates);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const dayLabel = d.toLocaleDateString("en-US", { weekday: "narrow" });
      const dayNumber = d.getDate();
      const isToday = i === 0;

      // In demo/offline preview, provide a sensible default if no dates passed
      const hasActivity = activeSet.has(dateStr);

      result.push({
        dateStr,
        dayLabel,
        dayNumber,
        isToday,
        hasActivity,
      });
    }

    return result;
  }, [activityDates]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-heading text-muted-foreground flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
          <Flame className="h-3 w-3 text-rose-500" />
          <span>Last 7 Days</span>
        </span>
        <span className="text-muted-foreground font-mono text-[10px]">
          {days.filter((d) => d.hasActivity).length} / 7 Active
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d) => (
          <div
            key={d.dateStr}
            className={`flex flex-col items-center justify-center rounded-xl border p-1.5 transition-all sm:p-2 ${
              d.hasActivity
                ? "border-rose-500/50 bg-rose-500/15 text-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.2)] dark:text-rose-400"
                : d.isToday
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/60 bg-muted/30 text-muted-foreground/60"
            }`}
            title={`${d.dateStr}: ${d.hasActivity ? "Quest Completed!" : "No Activity"}`}
          >
            <span className="font-heading text-[10px] font-bold uppercase">
              {d.dayLabel}
            </span>
            <div className="my-1 flex h-4 w-4 items-center justify-center">
              {d.hasActivity ? (
                <Check className="h-3.5 w-3.5 stroke-[3] text-rose-500 drop-shadow-xs" />
              ) : (
                <span className="font-mono text-[11px] font-semibold">
                  {d.dayNumber}
                </span>
              )}
            </div>
            <span
              className={`font-mono text-[9px] tracking-tighter ${
                d.isToday
                  ? "text-primary font-bold"
                  : "text-muted-foreground/60"
              }`}
            >
              {d.isToday ? "Today" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
