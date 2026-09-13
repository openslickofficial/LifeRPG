"use client";

import * as React from "react";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlobCharacter } from "@/components/BlobCharacter";

interface DashboardHeaderProps {
  username: string;
  avatarUrl?: string | null;
  isCelebrating?: boolean;
  className?: string;
}

export function DashboardHeader({
  username,
  isCelebrating = false,
  className = "",
}: DashboardHeaderProps) {
  return (
    <header
      className={`border-border/60 flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-center lg:justify-between ${className}`}
    >
      {/* Greeting & Narrative with Mascot Pip */}
      <div className="flex items-center gap-3.5">
        <div className="shrink-0">
          <BlobCharacter
            blobId="mascot"
            size="sm"
            state={isCelebrating ? "celebrating" : "idle"}
          />
        </div>
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
            {isCelebrating
              ? "Pip is cheering you on — outstanding progress on today's quests!"
              : "Your daily focus streak is burning bright. Ready to conquer today's quest board?"}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with Unread Dot */}
        <button
          type="button"
          aria-label="View notifications (1 unread)"
          className="border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary/60 focus-visible:ring-primary relative flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-2xl border-2 shadow-xs transition-all duration-75 focus-visible:ring-2 focus-visible:outline-none active:translate-y-[2px]"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {/* Pulsing notification dot */}
          <span
            className="absolute top-2.5 right-2.5 flex h-2 w-2"
            aria-hidden="true"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
        </button>

        {/* Quick 3D Action Button to Quest Board */}
        <Button
          asChild
          variant="default"
          size="sm"
          className="h-11 min-h-[44px] gap-1.5 rounded-2xl px-5 text-xs font-black tracking-wider uppercase"
        >
          <a href="/dashboard/quests?action=new">
            <Plus className="h-4 w-4 stroke-[3]" aria-hidden="true" />
            <span>New Quest</span>
          </a>
        </Button>
      </div>
    </header>
  );
}
