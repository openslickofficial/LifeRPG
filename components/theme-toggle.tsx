"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  const currentTheme = mounted ? theme : "system";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-border/80 bg-card/80 hover:border-primary/50 hover:shadow-brand focus-visible:ring-primary/40 relative h-10 w-10 overflow-hidden rounded-xl border shadow-xs backdrop-blur-md transition-all duration-200 active:scale-95"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            {currentTheme === "dark" ? (
              <motion.div
                key="dark"
                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center justify-center text-cyan-400"
              >
                <Moon className="h-[18px] w-[18px] drop-shadow-[0_0_8px_rgba(14,229,252,0.6)]" />
              </motion.div>
            ) : currentTheme === "light" ? (
              <motion.div
                key="light"
                initial={{ rotate: 90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -90, scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center justify-center text-amber-500"
              >
                <Sun className="h-[18px] w-[18px] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              </motion.div>
            ) : (
              <motion.div
                key="system"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center justify-center text-violet-500 dark:text-violet-400"
              >
                <Monitor className="h-[18px] w-[18px]" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="border-border/80 bg-popover/95 shadow-elevated min-w-[9.5rem] rounded-2xl border p-1.5 backdrop-blur-xl"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
            mounted && theme === "light"
              ? "bg-secondary text-primary font-semibold"
              : "text-foreground/80 hover:bg-secondary/60 hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sun className="h-4 w-4 text-amber-500 transition-transform duration-200 group-hover:scale-110" />
            <span>Light</span>
          </div>
          {mounted && theme === "light" && (
            <Check className="text-primary h-3.5 w-3.5" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
            mounted && theme === "dark"
              ? "bg-secondary text-primary font-semibold"
              : "text-foreground/80 hover:bg-secondary/60 hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Moon className="h-4 w-4 text-cyan-400 transition-transform duration-200 group-hover:scale-110" />
            <span>Dark</span>
          </div>
          {mounted && theme === "dark" && (
            <Check className="text-primary h-3.5 w-3.5" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
            mounted && theme === "system"
              ? "bg-secondary text-primary font-semibold"
              : "text-foreground/80 hover:bg-secondary/60 hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Monitor className="text-muted-foreground h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            <span>System</span>
          </div>
          {mounted && theme === "system" && (
            <Check className="text-primary h-3.5 w-3.5" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
