import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "404 — Page Not Found | Revel",
  description: "This quest location doesn't exist. Return to the realm.",
};

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-57px)] w-full flex flex-col justify-center items-center overflow-hidden bg-[#0A0A0F] text-white px-6 py-20">
      {/* Soft Radial Accent Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] max-w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.10)_0%,rgba(16,185,129,0.02)_60%,transparent_75%)] blur-3xl" />

      <div className="relative z-10 max-w-md w-full text-center flex flex-col items-center">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] mb-6">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>

        {/* Heading */}
        <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
          404
        </h1>
        <p className="font-display text-lg sm:text-xl font-semibold text-slate-300 mt-2">
          Quest Location Not Found
        </p>

        {/* Subtext */}
        <p className="mt-4 text-sm text-slate-400 leading-relaxed font-body max-w-sm">
          The realm you&apos;re seeking doesn&apos;t exist — or has been moved to a
          different dimension. Your progress and companions are safe.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Link href="/" className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm px-6 py-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return Home</span>
            </button>
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-medium text-xs sm:text-sm px-5 py-3 transition-colors cursor-pointer"
            >
              Go to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
