"use client";

import * as React from "react";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  username: string;
  avatarUrl?: string | null;
  className?: string;
}

export function DashboardHeader({
  username,
  className = "",
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <header
      className={`border-border/60 flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-center lg:justify-between ${className}`}
    >
      {/* Greeting & Narrative */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400">
              {username}
            </span>{" "}
            ⚔️
          </h1>
        </div>
        <p className="font-body text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
          Your daily focus streak is burning bright. Ready to conquer
          today&apos;s quest board?
        </p>
      </div>

      {/* Search Bar & Action Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Functional-looking Search Bar */}
        <div className="relative w-full sm:w-72 md:w-80">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quests, attributes, shop..."
            aria-label="Search quests and attributes"
            className="border-border/80 bg-card/80 font-body text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-primary/20 h-10 w-full rounded-2xl border pr-12 pl-9 text-xs backdrop-blur-md transition-all outline-none focus:ring-2"
          />
          <kbd className="border-border/80 bg-muted/60 text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold shadow-xs">
            ⌘K
          </kbd>
        </div>

        {/* Notification Bell with Unread Dot */}
        <button
          type="button"
          aria-label="View notifications (1 unread)"
          className="border-border/80 bg-card/80 text-foreground/80 hover:border-primary/50 hover:bg-secondary/60 hover:text-foreground focus-visible:ring-primary relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl border shadow-xs backdrop-blur-md transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none active:scale-95"
        >
          <Bell className="h-4 w-4" />
          {/* Pulsing notification dot */}
          <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
        </button>

        {/* Quick Action Button */}
        <Button
          size="sm"
          className="shadow-brand h-10 gap-1.5 rounded-2xl px-4 text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>New Quest</span>
        </Button>
      </div>
    </header>
  );
}
