"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export interface GroupBlobImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  fallbackTitle?: string;
}

/**
 * Reusable wrapper around next/image for group blob illustrations.
 * Provides graceful fallback if image fails to load, preserving layout and accessibility.
 */
export function GroupBlobImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className,
  containerClassName,
  sizes,
  fallbackTitle = "Revel Companions",
}: GroupBlobImageProps) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center select-none backdrop-blur-xs",
          fill ? "absolute inset-0 h-full w-full" : "",
          containerClassName
        )}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="font-heading mt-2 text-xs font-bold text-slate-300">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  if (fill) {
    return (
      <div className={cn("relative h-full w-full", containerClassName)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes || "(max-width: 768px) 100vw, 500px"}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onError={() => setHasError(true)}
          className={cn("object-contain", className)}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", containerClassName)}>
      <Image
        src={src}
        alt={alt}
        width={width || 200}
        height={height || 200}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        onError={() => setHasError(true)}
        className={cn("object-contain", className)}
      />
    </div>
  );
}
