import * as React from "react";
import { Shield } from "lucide-react";

export default function RootLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Life RPG..."
      className="bg-background flex min-h-screen flex-col items-center justify-center p-4"
    >
      <div className="relative flex items-center justify-center">
        {/* Glowing pulse ring */}
        <div className="bg-primary/20 absolute -inset-4 animate-ping rounded-3xl opacity-75 blur-md" />

        {/* App Emblem */}
        <div className="shadow-brand relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500">
          <Shield className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
      </div>

      <p className="font-heading text-foreground mt-6 animate-pulse text-sm font-bold tracking-wider uppercase">
        Synchronizing Real-Life Quests...
      </p>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
}
