import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export const metadata = {
  title: "Pricing — Revel",
  description: "Simple, transparent pricing. Revel is currently free during public beta.",
};

export default function PricingPage() {
  return (
    <div className="relative min-h-[calc(100vh-57px)] w-full flex flex-col justify-center items-center overflow-hidden bg-[#0A0A0F] text-white px-6 py-20">
      {/* Soft Radial Accent Glow matching site atmosphere */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[650px] max-w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,rgba(16,185,129,0.02)_60%,transparent_75%)] blur-3xl" />

      <div className="relative z-10 max-w-md w-full text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-emerald-400 backdrop-blur-xs mb-5">
          <Sparkles className="h-3 w-3 fill-emerald-400/80 text-emerald-400" />
          <span>Fair Play Guarantee</span>
        </div>

        {/* Heading in font-display */}
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Pricing coming soon.
        </h1>

        {/* Subtext */}
        <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed font-body">
          Revel is currently 100% free during our public beta. Supporter tiers and guild subscriptions will launch soon with zero pay-to-win mechanics.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Link href="/login" className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm px-6 py-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer"
            >
              Start Free Quest
            </button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-medium text-xs sm:text-sm px-5 py-3 transition-colors cursor-pointer gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
