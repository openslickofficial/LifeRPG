import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading your adventure dashboard..."
      className="space-y-8"
    >
      {/* 1. Header Skeleton */}
      <div className="border-border/60 flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 rounded-2xl" />
          <Skeleton className="h-4 w-96 rounded-xl" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-64 rounded-2xl" />
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <Skeleton className="h-11 w-28 rounded-2xl" />
        </div>
      </div>

      {/* 2. Stat Tiles Skeleton (4 columns on desktop -> 2 on tablet -> 1 on mobile) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-2xl" />
            </div>
            <Skeleton className="mt-4 h-8 w-32 rounded-xl" />
            <Skeleton className="mt-2 h-3 w-40 rounded-lg" />
            <Skeleton className="mt-4 h-5 w-full rounded-xl" />
          </Card>
        ))}
      </div>

      {/* 3. 7-Day Streak Calendar Skeleton */}
      <Card className="rounded-3xl p-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44 rounded-xl" />
            <Skeleton className="h-3 w-64 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="mt-5 grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <Skeleton key={day} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </Card>

      {/* 4. Main Body: Quest Board Skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card className="rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-48 rounded-xl" />
                  <Skeleton className="h-3 w-72 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
            <div className="mt-5 space-y-3">
              {[1, 2, 3].map((task) => (
                <Skeleton key={task} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Attributes Summary Skeleton */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="rounded-3xl p-6 sm:p-7">
            <Skeleton className="h-6 w-40 rounded-xl" />
            <div className="mt-6 space-y-4">
              {[1, 2, 3, 4].map((attr) => (
                <div key={attr} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20 rounded-lg" />
                    <Skeleton className="h-4 w-12 rounded-lg" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <span className="sr-only">Loading dashboard components...</span>
    </div>
  );
}
