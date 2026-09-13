"use client";

import * as React from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  BlobMetadata,
  getBlobById,
  getBlobByAttribute,
  getMascotBlob,
} from "@/lib/blobs";
import { cn } from "@/lib/utils";

export type BlobState = "idle" | "celebrating" | "sad";
export type BlobSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface BlobCharacterProps {
  blobId?: string;
  attribute?: string | null;
  blob?: BlobMetadata;
  size?: BlobSize;
  state?: BlobState;
  showName?: boolean;
  showPower?: boolean;
  className?: string;
  onClick?: () => void;
  priority?: boolean;
}

const SIZE_MAP: Record<
  BlobSize,
  { width: number; height: number; containerClass: string; textClass: string }
> = {
  xs: { width: 36, height: 36, containerClass: "w-9 h-9", textClass: "text-xs" },
  sm: { width: 56, height: 56, containerClass: "w-14 h-14", textClass: "text-sm" },
  md: { width: 96, height: 96, containerClass: "w-24 h-24", textClass: "text-base" },
  lg: { width: 144, height: 144, containerClass: "w-36 h-36", textClass: "text-lg" },
  xl: { width: 192, height: 192, containerClass: "w-48 h-48", textClass: "text-xl" },
};

export function BlobCharacter({
  blobId,
  attribute,
  blob: propBlob,
  size = "md",
  state = "idle",
  showName = false,
  showPower = false,
  className,
  onClick,
  priority = false,
}: BlobCharacterProps) {
  const [failedImages, setFailedImages] = React.useState<Record<string, boolean>>({});
  const prefersReducedMotion = useReducedMotion();

  // Resolve blob metadata
  const blob = React.useMemo(() => {
    if (propBlob) return propBlob;
    if (blobId) {
      const found = getBlobById(blobId);
      if (found) return found;
    }
    if (attribute) {
      const found = getBlobByAttribute(attribute);
      if (found) return found;
    }
    return getMascotBlob(); // fallback to Pip
  }, [propBlob, blobId, attribute]);

  // Determine current active expression image
  const currentImageSrc = React.useMemo(() => {
    if (state === "celebrating") return blob.imageHappy;
    if (state === "sad") return blob.imageSad;
    return blob.imageNormal;
  }, [state, blob]);

  // Preload all 3 expressions in memory on client mount so transitions are snappy with zero flash
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const preload = (url: string) => {
        if (!url) return;
        const img = new window.Image();
        img.src = url;
      };
      preload(blob.imageNormal);
      preload(blob.imageHappy);
      preload(blob.imageSad);
    }
  }, [blob.imageNormal, blob.imageHappy, blob.imageSad]);

  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const isCurrentFailed = Boolean(failedImages[currentImageSrc]);

  // Animation variants layered on top of expression art
  const motionVariants: Variants = React.useMemo(() => {
    if (prefersReducedMotion) {
      return {
        idle: { y: 0, rotate: 0, scale: 1, opacity: 1 },
        celebrating: { y: 0, rotate: 0, scale: 1, opacity: 1 },
        sad: { y: 0, rotate: 0, scale: 1, opacity: 1 },
      };
    }

    return {
      idle: {
        y: [0, -6, 0],
        rotate: [0, 1.5, -1.5, 0],
        scale: 1,
        opacity: 1,
        transition: {
          y: {
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut" as const,
          },
          rotate: {
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut" as const,
          },
        },
      },
      celebrating: {
        scale: [1, 1.25, 0.95, 1.15, 1],
        rotate: [0, -8, 8, -4, 0],
        y: [0, -14, -6, -2, 0],
        opacity: 1,
        transition: {
          duration: 0.75,
          ease: [0.34, 1.56, 0.64, 1],
        },
      },
      sad: {
        y: 4,
        rotate: -6,
        scale: 0.95,
        opacity: 0.75,
        transition: {
          duration: 0.5,
          ease: "easeOut" as const,
        },
      },
    };
  }, [prefersReducedMotion]);

  return (
    <div
      className={cn("flex flex-col items-center select-none", className)}
      onClick={onClick}
    >
      {/* Visual Avatar Container */}
      <div className={cn("relative flex items-center justify-center", sizeConfig.containerClass)}>
        {/* Soft Ambient Aura Glow in Idle / Celebrating */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-xl pointer-events-none -z-10 transition-all duration-500",
            state === "celebrating" ? "opacity-60 scale-125" : state === "sad" ? "opacity-5" : "opacity-25"
          )}
          style={{ backgroundColor: blob.accentColor }}
        />

        {/* Celebrating Shockwave Glow Ring */}
        {state === "celebrating" && !prefersReducedMotion && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0.9 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.75, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full blur-md pointer-events-none -z-10"
            style={{ backgroundColor: blob.accentColor }}
          />
        )}

        {/* Animated Blob Character Container with Motion Transforms */}
        <motion.div
          variants={motionVariants}
          animate={state}
          className="relative flex items-center justify-center w-full h-full"
        >
          {/* Smooth Crossfade between expression images using AnimatePresence */}
          <AnimatePresence mode="wait" initial={false}>
            {!isCurrentFailed ? (
              <motion.div
                key={`${blob.id}-${state}-${currentImageSrc}`}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="relative flex items-center justify-center w-full h-full"
              >
                <Image
                  src={currentImageSrc}
                  alt={`${blob.name} (${state} expression)`}
                  width={sizeConfig.width}
                  height={sizeConfig.height}
                  priority={priority || state === "celebrating"}
                  onError={() =>
                    setFailedImages((prev) => ({
                      ...prev,
                      [currentImageSrc]: true,
                    }))
                  }
                  className={cn(
                    "object-contain filter drop-shadow-md transition-all duration-300",
                    state === "sad" && "grayscale-[10%] brightness-95"
                  )}
                />
              </motion.div>
            ) : (
              /* Accessible Fallback when image fails to load specifically for this expression */
              <motion.div
                key={`fallback-${blob.id}-${state}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-center justify-center rounded-full font-heading font-black text-white shadow-md select-none border-2 border-white/20",
                  sizeConfig.containerClass
                )}
                style={{ backgroundColor: blob.accentColor }}
              >
                <span className={sizeConfig.textClass}>{blob.name.charAt(0)}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Name Label */}
      {showName && (
        <span
          className={cn(
            "font-heading font-black mt-2 text-foreground tracking-tight",
            size === "sm" || size === "xs" ? "text-xs" : "text-sm"
          )}
        >
          {blob.name}
        </span>
      )}

      {/* Flavor Power Description */}
      {showPower && (
        <p className="font-body text-[11px] sm:text-xs text-muted-foreground leading-snug mt-1 text-center max-w-[200px]">
          {blob.powerText}
        </p>
      )}
    </div>
  );
}
