import Link from "next/link";
import { Sparkles, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white shadow-md transition-transform group-hover:scale-105 dark:from-sky-500 dark:to-indigo-600 dark:shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-foreground text-lg font-bold tracking-tight sm:text-xl">
              Life RPG
            </span>
            <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
              Level Up Your Life
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="border-border/80 hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex"
          >
            <Sparkles className="h-3 w-3 text-amber-500 dark:text-amber-400" />
            <span className="text-foreground/90">Foundation Active</span>
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
