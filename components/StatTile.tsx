import * as React from "react";

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

const badgeColorStyles: Record<
  AccentColor,
  {
    card: string;
    label: string;
    iconPill: string;
    value: string;
    subvalue: string;
    trend: string;
  }
> = {
  violet: {
    card: "bg-violet-600 text-white shadow-[0_6px_0_0_#4c1d95] border-2 border-violet-700",
    label: "text-violet-200",
    iconPill: "bg-white/20 text-white border border-white/30",
    value: "text-white",
    subvalue: "text-violet-100",
    trend: "border-violet-500/40 text-violet-200",
  },
  cyan: {
    card: "bg-blue-600 text-white shadow-[0_6px_0_0_#1e40af] border-2 border-blue-700",
    label: "text-blue-200",
    iconPill: "bg-white/20 text-white border border-white/30",
    value: "text-white",
    subvalue: "text-blue-100",
    trend: "border-blue-500/40 text-blue-200",
  },
  emerald: {
    card: "bg-emerald-500 text-white shadow-[0_6px_0_0_#065f46] border-2 border-emerald-600",
    label: "text-emerald-100",
    iconPill: "bg-white/20 text-white border border-white/30",
    value: "text-white",
    subvalue: "text-emerald-100",
    trend: "border-emerald-600/50 text-emerald-100",
  },
  amber: {
    card: "bg-amber-400 text-slate-950 shadow-[0_6px_0_0_#b45309] border-2 border-amber-500",
    label: "text-amber-950/80",
    iconPill: "bg-black/15 text-slate-950 border border-black/10",
    value: "text-slate-950",
    subvalue: "text-amber-950 font-medium",
    trend: "border-amber-600/40 text-amber-950 font-bold",
  },
  rose: {
    card: "bg-rose-600 text-white shadow-[0_6px_0_0_#9f1239] border-2 border-rose-700",
    label: "text-rose-200",
    iconPill: "bg-white/20 text-white border border-white/30",
    value: "text-white",
    subvalue: "text-rose-100",
    trend: "border-rose-500/40 text-rose-200",
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
  const styles = badgeColorStyles[accentColor];

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 transition-all duration-150 select-none hover:-translate-y-1 ${styles.card} ${className}`}
    >
      {/* Top Row: Label & Icon */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`font-heading text-xs font-black tracking-wider uppercase ${styles.label}`}
        >
          {label}
        </span>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-xs transition-transform duration-150 group-hover:scale-110 ${styles.iconPill}`}
        >
          {icon}
        </div>
      </div>

      {/* Main Score Area */}
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <div>
          <div
            className={`font-mono text-3xl font-black tracking-tight tabular-nums sm:text-4xl ${styles.value}`}
          >
            {value}
          </div>
          {subvalue && (
            <p
              className={`font-body mt-1 text-xs font-semibold ${styles.subvalue}`}
            >
              {subvalue}
            </p>
          )}
        </div>

        {children && <div className="shrink-0">{children}</div>}
      </div>

      {/* Optional Trend or Bracket Footer */}
      {trend && (
        <div
          className={`mt-4 flex items-center gap-1.5 border-t pt-3 font-mono text-[11px] font-bold ${styles.trend}`}
        >
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
