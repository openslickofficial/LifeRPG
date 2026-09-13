'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuestsLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="status"
      aria-live="polite"
      aria-label="Loading your quests..."
      className="space-y-8"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-11 w-40 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-1">
            <div className="flex gap-2">
              <Skeleton className="h-11 flex-1 rounded-xl" />
              <Skeleton className="h-11 flex-1 rounded-xl" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-28 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-lg" />
            </div>

            {[1, 2, 3, 4].map((card) => (
              <Card key={card} className="rounded-3xl p-5 sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-3/4 rounded-xl" />
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-2/3 rounded-lg" />
                  </div>

                  <div className="flex items-center gap-3 md:flex-col md:items-end">
                    <Skeleton className="h-9 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-28 rounded-2xl" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl p-5">
            <Skeleton className="h-6 w-36 rounded-xl" />
            <div className="mt-5 space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-2 rounded-2xl border border-border/60 bg-muted/10 p-3">
                  <Skeleton className="h-5 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-3xl p-5">
            <Skeleton className="h-6 w-32 rounded-xl" />
            <div className="mt-5 space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 p-3">
                  <Skeleton className="h-10 w-10 rounded-2xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-28 rounded-lg" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <span className="sr-only">Loading quest board...</span>
    </motion.div>
  );
}
