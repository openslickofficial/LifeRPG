"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-background/95 backdrop-blur-md px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 lg:px-6">
      {/* Left: SidebarTrigger */}
      <div className="flex items-center min-w-0">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      </div>

      {/* Right Actions: Season 1 Hub Pill, Theme Toggle */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Season 1 Hub Badge */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-bold text-violet-600 dark:text-violet-400 font-heading">
          <Sparkles className="h-3 w-3" />
          <span>Season 1 Hub</span>
        </div>

        {/* System mode change toggle button [light/dark] */}
        <ThemeToggle />
      </div>
    </header>
  );
}
