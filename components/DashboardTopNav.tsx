"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export function DashboardTopNav() {
  const pathname = usePathname();
  const segment = pathname.split("/")[2] || "Overview";
  const formattedSegment = segment.charAt(0).toUpperCase() + segment.slice(1);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
      <span className="font-heading font-black text-foreground">Revel</span>
      <span className="text-muted-foreground/60" aria-hidden="true">/</span>
      <span className="font-heading font-bold text-violet-600 dark:text-violet-400 capitalize">
        {formattedSegment}
      </span>
    </nav>
  );
}
