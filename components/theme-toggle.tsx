"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-border/80 bg-background/80 relative h-9 w-9 rounded-xl border backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 scale-100 rotate-0 text-amber-500 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-4 w-4 scale-0 rotate-90 text-sky-400 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-border/80 bg-popover/95 min-w-[8.5rem] rounded-xl border shadow-lg backdrop-blur-md"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium ${
            mounted && theme === "light"
              ? "bg-accent text-accent-foreground font-semibold"
              : ""
          }`}
        >
          <Sun className="h-4 w-4 text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium ${
            mounted && theme === "dark"
              ? "bg-accent text-accent-foreground font-semibold"
              : ""
          }`}
        >
          <Moon className="h-4 w-4 text-sky-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium ${
            mounted && theme === "system"
              ? "bg-accent text-accent-foreground font-semibold"
              : ""
          }`}
        >
          <Monitor className="text-muted-foreground h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
