"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  value?: string | number;
  sublabel?: string;
  className?: string;
}

export function CircularProgress({
  percentage,
  size = 80,
  strokeWidth = 7,
  color = "text-emerald-500 dark:text-emerald-400",
  trackColor = "text-muted/40",
  label,
  value,
  sublabel,
  className = "",
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset =
    circumference - (clampedPercentage / 100) * circumference;

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center ${className}`}
      role="progressbar"
      aria-valuenow={clampedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || "Progress ring"}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackColor}
          fill="none"
        />
        {/* Animated Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={color}
          fill="none"
        />
      </svg>

      {/* Center Label / Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-foreground font-mono text-sm font-bold tracking-tight sm:text-base">
          {value !== undefined ? value : `${Math.round(clampedPercentage)}%`}
        </span>
        {sublabel && (
          <span className="text-muted-foreground font-mono text-[9px] tracking-wider uppercase">
            {sublabel}
          </span>
        )}
      </div>

      {label && (
        <span className="font-heading text-muted-foreground mt-2 text-xs font-semibold">
          {label}
        </span>
      )}
    </div>
  );
}
