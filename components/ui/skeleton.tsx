import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "skeleton-shimmer border border-border/60 bg-[rgba(148,163,184,0.08)] dark:bg-[rgba(148,163,184,0.12)]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
