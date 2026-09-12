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
        "bg-muted/70 dark:bg-muted/40 animate-pulse rounded-2xl",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
