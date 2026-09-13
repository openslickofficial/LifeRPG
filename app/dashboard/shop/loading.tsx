'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShopLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="status"
      aria-live="polite"
      aria-label="Loading the shop..."
      className="space-y-8"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-11 w-40 rounded-2xl" />
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((tab) => (
            <Skeleton key={tab} className="h-11 w-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-11 w-44 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Card key={item} className="rounded-3xl p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-xl" />
              </div>

              <Skeleton className="h-28 w-full rounded-2xl" />

              <div className="space-y-2">
                <Skeleton className="h-6 w-40 rounded-xl" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
              </div>
            </div>

            <div className="mt-5 border-t border-border/60 pt-4">
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </Card>
        ))}
      </div>

      <span className="sr-only">Loading shop items...</span>
    </motion.div>
  );
}
