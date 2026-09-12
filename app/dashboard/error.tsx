"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert, RotateCcw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Dashboard Error Boundary Caught:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center"
    >
      <div className="border-border/80 bg-card/95 shadow-elevated max-w-lg rounded-3xl border p-8 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>

        <h1 className="font-heading text-foreground mt-5 text-2xl font-extrabold tracking-tight">
          Quest Hub Temporarily Disrupted
        </h1>

        <p className="font-body text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
          A synchronization conflict occurred while fetching your character
          state. Your inventory and streak records remain preserved in the
          Postgres vault.
        </p>

        {error.digest && (
          <p className="border-border/80 bg-muted/60 text-muted-foreground mt-4 rounded-xl border p-2 font-mono text-[11px]">
            Incident Ref: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            onClick={() => reset()}
            className="shadow-brand h-11 min-h-[44px] gap-2 rounded-xl text-xs font-semibold"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Retry Synchronization</span>
          </Button>

          <Button
            variant="outline"
            asChild
            className="h-11 min-h-[44px] gap-2 rounded-xl text-xs font-semibold"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              <span>Reload Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
