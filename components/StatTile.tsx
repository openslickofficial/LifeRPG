import * as React from "react";
import { Card } from "@/components/ui/card";

export type AccentColor = "violet" | "cyan" | "emerald" | "amber" | "rose";

interface StatTileProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subvalue?: string;
  accentColor?: AccentColor;
  trend?: string;
  children?: React.ReactNode;
  className?: string;
}

const accentColorStyles: Record<
  AccentColor,
  {
    iconBg: string;
    iconText: string;
    borderHover: string;
    valueColor?: string;
  }
> = {
  violet: {
    iconBg: "bg-violet-500/10 dark:bg-violet-500/15 border-violet-500/20",
    iconText: "text-violet-600 dark:text-violet-400",
    borderHover: "hover:border-violet-500/40",
  },
  cyan: {
    iconBg: "bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/20",
    iconText: "text-cyan-600 dark:text-cyan-400",
    borderHover: "hover:border-cyan-500/40",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20",
    iconText: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-500/40",
    valueColor: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    iconBg: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20",
    iconText: "text-amber-600 dark:text-amber-400",
    borderHover: "hover:border-amber-500/40",
    valueColor: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    iconBg: "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/20",
    iconText: "text-rose-600 dark:text-rose-400",
    borderHover: "hover:border-rose-500/40",
    valueColor: "text-rose-600 dark:text-rose-400",
  },
};

export function StatTile({
  icon,
  label,
  value,
  subvalue,
  accentColor = "violet",
  trend,
  children,
  className = "",
}: StatTileProps) {
  const styles = accentColorStyles[accentColor];

  return (
    <Card
      className={`group border-border/80 bg-card/95 shadow-layered hover:shadow-elevated relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 ${styles.borderHover} ${className}`}
    >
      {/* Top Row: Label & Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-heading text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {label}
        </span>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${styles.iconBg} ${styles.iconText} transition-transform duration-200 group-hover:scale-105`}
        >
          {icon}
        </div>
      </div>

      {/* Main Content Area: Number and optional children (like circular ring) */}
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <div>
          <div
            className={`font-mono text-3xl font-extrabold tracking-tight ${
              styles.valueColor || "text-foreground"
            }`}
          >
            {value}
          </div>
          {subvalue && (
            <p className="font-body text-muted-foreground mt-1 text-xs">
              {subvalue}
            </p>
          )}
        </div>

        {children && <div className="shrink-0">{children}</div>}
      </div>

      {/* Optional Trend or Footer Note */}
      {trend && (
        <div className="border-border/50 text-muted-foreground mt-3 flex items-center gap-1.5 border-t pt-3 font-mono text-[11px] font-medium">
          <span>{trend}</span>
        </div>
      )}
    </Card>
  );
}
