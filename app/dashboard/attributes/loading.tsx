'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AttributesLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="status"
      aria-live="polite"
      aria-label="Loading your attributes..."
      className="space-y-8"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-11 w-36 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="rounded-3xl p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28 rounded-lg" />
                  <Skeleton className="h-3 w-40 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-20 w-20 rounded-full border-[6px] border-border/60" />
            </div>

            <div className="mt-5 rounded-2xl border border-border/60 bg-muted/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-4 w-16 rounded-lg" />
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3 w-full rounded-lg" />
                <Skeleton className="h-3 w-2/3 rounded-lg" />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex justify-between gap-3 text-xs">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="ml-auto h-3 w-28 rounded-md" />
            </div>

            <div className="mt-5 space-y-3">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-11/12 rounded-lg" />
                <Skeleton className="h-4 w-4/5 rounded-lg" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <span className="sr-only">Loading attribute cards...</span>
    </motion.div>
  );
}
