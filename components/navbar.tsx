"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();

  // Dashboard layout has its own Sidebar and DashboardHeader
  if (pathname.startsWith("/dashboard")) {
    return null;
  }
  return (
    <header className="border-border/70 bg-background/85 sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-colors duration-200">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity duration-150 hover:opacity-95"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-violet-500/25 transition-transform duration-200 group-hover:scale-105 active:scale-95 dark:shadow-[0_0_20px_rgba(168,85,247,0.35)]">
            <div className="bg-background/20 flex h-full w-full items-center justify-center rounded-[10px] text-white backdrop-blur-xs">
              <Shield className="h-5 w-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-heading text-foreground text-lg font-bold tracking-tight sm:text-xl">
                Life RPG
              </span>
              <span className="hidden rounded-md bg-violet-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-violet-600 sm:inline-block dark:bg-violet-400/15 dark:text-violet-300">
                ALPHA
              </span>
            </div>
            <span className="font-body text-muted-foreground text-[11px] font-medium">
              Turn Habits Into Hero Stats
            </span>
          </div>
        </Link>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-3">
          {/* Live Online Adventurers Indicator */}
          <div className="border-border/80 bg-card/60 hidden items-center gap-2 rounded-xl border px-3 py-1.5 backdrop-blur-xs sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-foreground/80 font-mono text-xs font-semibold">
              14,280{" "}
              <span className="text-muted-foreground font-normal">Active</span>
            </span>
          </div>

          <Badge
            variant="brand"
            className="hidden items-center gap-1 font-mono text-[11px] md:inline-flex"
          >
            <Sparkles className="h-3 w-3" />
            <span>Season 1</span>
          </Badge>

          {/* Animated Theme Switcher */}
          <ThemeToggle />

          {/* Sign In CTA */}
          <Link href="/login">
            <Button
              size="sm"
              className="h-9 rounded-xl px-3.5 text-xs font-semibold"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
