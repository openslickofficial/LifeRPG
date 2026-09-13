"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Particle {
  id: number;
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

const PARTICLES: Particle[] = [
  { id: 1, top: "12%", left: "10%", size: 4, duration: 8, delay: 0, driftX: 10, driftY: -16 },
  { id: 2, top: "24%", left: "82%", size: 5, duration: 11, delay: 1.5, driftX: -12, driftY: -20 },
  { id: 3, top: "36%", left: "18%", size: 3, duration: 9, delay: 0.8, driftX: 14, driftY: -14 },
  { id: 4, top: "45%", left: "72%", size: 5, duration: 12, delay: 2.2, driftX: -8, driftY: -18 },
  { id: 5, top: "58%", left: "14%", size: 4, duration: 10, delay: 1.1, driftX: 10, driftY: -16 },
  { id: 6, top: "68%", left: "86%", size: 5, duration: 13, delay: 3, driftX: -14, driftY: -22 },
  { id: 7, top: "78%", left: "28%", size: 3, duration: 8.5, delay: 0.4, driftX: 8, driftY: -12 },
  { id: 8, top: "18%", left: "48%", size: 4, duration: 10.5, delay: 2.7, driftX: -6, driftY: -15 },
  { id: 9, top: "84%", left: "64%", size: 6, duration: 11.5, delay: 1.8, driftX: 12, driftY: -18 },
  { id: 10, top: "28%", left: "92%", size: 3, duration: 9.5, delay: 3.2, driftX: -10, driftY: -14 },
  { id: 11, top: "50%", left: "34%", size: 4, duration: 12, delay: 0.5, driftX: 6, driftY: -16 },
  { id: 12, top: "72%", left: "52%", size: 5, duration: 10, delay: 2.1, driftX: -8, driftY: -20 },
  { id: 13, top: "88%", left: "78%", size: 4, duration: 9, delay: 1.3, driftX: 10, driftY: -14 },
  { id: 14, top: "32%", left: "6%", size: 5, duration: 11, delay: 2.9, driftX: -10, driftY: -18 },
];

export function AmbientParticles({ className = "" }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
    >
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
          }}
          className="absolute rounded-full bg-emerald-400/60 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
          animate={
            prefersReducedMotion
              ? { opacity: 0.25 }
              : {
                  x: [0, p.driftX, 0],
                  y: [0, p.driftY, 0],
                  opacity: [0.15, 0.55, 0.15],
                  scale: [1, 1.25, 1],
                }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
