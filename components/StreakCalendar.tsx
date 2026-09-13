"use client";

import * as React from "react";
import { Check, Flame } from "lucide-react";

interface StreakDay {
  dateStr: string; // YYYY-MM-DD
  dayLabelFull: string; // Monday, Tuesday...
  dayLabelShort: string; // Mon, Tue...
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

      const dayLabelFull = d.toLocaleDateString("en-US", { weekday: "long" });
      const dayLabelShort = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNumber = d.getDate();
      const isToday = i === 0;

      // In demo/offline preview, provide a sensible default if no dates passed
      const hasActivity = activeSet.has(dateStr);

      result.push({
        dateStr,
        dayLabelFull,
        dayLabelShort,
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
            className={`flex flex-col items-center justify-center rounded-2xl p-1.5 transition-all select-none sm:p-2 ${
              d.hasActivity
                ? "border-2 border-amber-600 bg-amber-400 text-slate-950 shadow-[0_3px_0_0_#b45309]"
                : d.isToday
                  ? "border-2 border-violet-500 bg-violet-500/15 font-bold text-violet-600 dark:text-violet-400"
                  : "border-border/70 bg-secondary/30 text-muted-foreground/60 border-2"
            }`}
            title={`${d.dateStr}: ${d.hasActivity ? "Quest Completed!" : "No Activity"}`}
          >
            <span className="hidden font-heading text-[10px] font-black uppercase sm:inline">
              {d.dayLabelFull}
            </span>
            <span className="font-heading text-[10px] font-black uppercase sm:hidden">
              {d.dayLabelShort}
            </span>
            <div className="my-1 flex h-5 w-5 items-center justify-center">
              {d.hasActivity ? (
                <Check className="h-4 w-4 stroke-[3] text-slate-950" />
              ) : (
                <span className="font-mono text-xs font-bold">
                  {d.dayNumber}
                </span>
              )}
            </div>
            <span
              className={`font-mono text-[9px] font-black tracking-wider uppercase ${
                d.isToday
                  ? d.hasActivity
                    ? "font-extrabold text-amber-950"
                    : "font-extrabold text-violet-600 dark:text-violet-400"
                  : "text-muted-foreground/50"
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
