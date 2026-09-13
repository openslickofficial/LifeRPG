import Link from "next/link";
import {
  Shield,
  Sparkles,
  Flame,
  Coins,
  Sword,
  Zap,
  Palette,
  Timer,
  AlertTriangle,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Game Guide — Revel",
  description:
    "Reference for Revel systems: quests, XP, attributes, streaks, gold, combos, and fair-play rules.",
};

const TOC = [
  { href: "#loop", label: "The loop" },
  { href: "#quests", label: "Quests & difficulty" },
  { href: "#rewards", label: "XP, gold & combos" },
  { href: "#attributes", label: "Attributes" },
  { href: "#streaks", label: "Streaks" },
  { href: "#ranks", label: "Ranks" },
  { href: "#shop", label: "Shop" },
  { href: "#fair-play", label: "Fair play" },
];

export default function GameGuidePage() {
  return (
    <div className="space-y-8">
      <div className="border-border/60 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              Game Guide
            </h1>
            <Badge variant="mana">REFERENCE</Badge>
          </div>
          <p className="font-body text-muted-foreground mt-1 max-w-2xl text-xs sm:text-sm">
            The systems behind Revel — how quests pay out, how levels scale, and
            how the anti-cheat keeps rewards honest.
          </p>
        </div>
        <Link href="/dashboard/how-to-play">
          <Button variant="outline" size="sm" className="h-10 min-h-[44px] gap-1.5 rounded-xl text-xs">
            <HelpCircle className="h-3.5 w-3.5" />
            How to Play
          </Button>
        </Link>
      </div>

      <nav
        aria-label="Guide sections"
        className="flex flex-wrap gap-2"
      >
        {TOC.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="font-heading rounded-full border border-border/80 bg-card px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <section id="loop" className="scroll-mt-24">
        <Card className="rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <CardTitle as="h2">The loop</CardTitle>
              <CardDescription className="text-xs">
                Create a quest → do the work → collect XP and gold → return tomorrow
              </CardDescription>
            </div>
          </div>
          <p className="font-body text-muted-foreground mt-4 text-sm leading-relaxed">
            Revel is a productivity RPG. Your dashboard tracks character level,
            XP, daily streak, and gold. The Quest Board is where tasks live.
            Attributes are four life stats that rise when matching quests complete.
            The Shop spends gold on cosmetics only — never on XP.
          </p>
        </Card>
      </section>

      <section id="quests" className="scroll-mt-24">
        <Card className="rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Sword className="h-5 w-5" />
            </div>
            <div>
              <CardTitle as="h2">Quests & difficulty</CardTitle>
              <CardDescription className="text-xs">
                Base payouts before multipliers. Timing is measured from focus start, minus pauses.
              </CardDescription>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-[11px] font-heading uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-4 font-semibold">Tier</th>
                  <th className="pb-2 pr-4 font-semibold">Base XP</th>
                  <th className="pb-2 pr-4 font-semibold">Base gold</th>
                  <th className="pb-2 pr-4 font-semibold">Focus floor</th>
                  <th className="pb-2 font-semibold">Daily cap</th>
                </tr>
              </thead>
              <tbody className="font-body">
                <tr className="border-b border-border/40">
                  <td className="py-3 pr-4 font-semibold">Easy · Quick Win</td>
                  <td className="py-3 pr-4 font-mono">10</td>
                  <td className="py-3 pr-4 font-mono">2</td>
                  <td className="py-3 pr-4">None</td>
                  <td className="py-3">Unlimited</td>
                </tr>
                <tr className="border-b border-border/40">
                  <td className="py-3 pr-4 font-semibold">Medium · Standard</td>
                  <td className="py-3 pr-4 font-mono">25</td>
                  <td className="py-3 pr-4 font-mono">5</td>
                  <td className="py-3 pr-4">≥ 5 minutes</td>
                  <td className="py-3">10 / day</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold">Hard · Epic Sprint</td>
                  <td className="py-3 pr-4 font-mono">50</td>
                  <td className="py-3 pr-4 font-mono">10</td>
                  <td className="py-3 pr-4">≥ 20 minutes</td>
                  <td className="py-3">5 / day</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="font-body text-muted-foreground mt-4 text-xs leading-relaxed">
            Finish too early and the quest is paid at the tier you actually
            qualified for (Hard → Medium → Easy). Extra Hard or Medium completions
            after the daily cap also drop a tier. Only one focus session can run
            at a time, with up to two pauses.
          </p>
          <Link href="/dashboard/quests" className="mt-4 inline-flex">
            <Button size="sm" className="rounded-xl text-xs font-bold">
              Go to Quest Board
            </Button>
          </Link>
        </Card>
      </section>

      <section id="rewards" className="scroll-mt-24">
        <Card className="rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle as="h2">XP, gold & combos</CardTitle>
              <CardDescription className="text-xs">
                Server-side payouts. Character XP uses a curve of 50 × level^1.5.
              </CardDescription>
            </div>
          </div>
          <ul className="font-body text-muted-foreground mt-4 space-y-2 text-sm leading-relaxed">
            <li>
              <span className="text-foreground font-semibold">Leveling:</span>{" "}
              leftover XP rolls into the next level, including multi-level jumps.
            </li>
            <li>
              <span className="text-foreground font-semibold">Combo:</span>{" "}
              complete another quest within 4 hours for +5% per step, up to +50%
              at combo 10.
            </li>
            <li>
              <span className="text-foreground font-semibold">Critical hits:</span>{" "}
              5% chance to double the final payout.
            </li>
            <li>
              <span className="text-foreground font-semibold">Variance:</span>{" "}
              each reward rolls between 0.9× and 1.1× so identical quests do not
              pay identical gold every time.
            </li>
            <li>
              <span className="text-foreground font-semibold">Repeats:</span>{" "}
              the same title in the same category within 24 hours decays (100% →
              70% → 40% → 15% floor).
            </li>
          </ul>
        </Card>
      </section>

      <section id="attributes" className="scroll-mt-24">
        <Card className="rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <CardTitle as="h2">Attributes</CardTitle>
              <CardDescription className="text-xs">
                Four life stats. Quests tagged to a stat raise that tree as well as character XP.
              </CardDescription>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
              <p className="font-heading text-sm font-bold text-rose-600 dark:text-rose-400">
                Strength · Zippo
              </p>
              <p className="font-body text-muted-foreground mt-1 text-xs">
                Training, movement, and physical grit.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <p className="font-heading text-sm font-bold text-cyan-600 dark:text-cyan-400">
                Intellect · Orbit
              </p>
              <p className="font-body text-muted-foreground mt-1 text-xs">
                Study, deep work, and problem-solving.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="font-heading text-sm font-bold text-amber-600 dark:text-amber-400">
                Discipline · Buddy
              </p>
              <p className="font-body text-muted-foreground mt-1 text-xs">
                Habits, routines, and showing up daily.
              </p>
            </div>
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
              <p className="font-heading text-sm font-bold text-violet-600 dark:text-violet-400">
                Creativity · Muse
              </p>
              <p className="font-body text-muted-foreground mt-1 text-xs">
                Making, writing, design, and original work.
              </p>
            </div>
          </div>
          <Link href="/dashboard/attributes" className="mt-4 inline-flex">
            <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
              Open skill trees
            </Button>
          </Link>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section id="streaks" className="scroll-mt-24">
          <Card className="h-full rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <CardTitle as="h2">Streaks</CardTitle>
                <CardDescription className="text-xs">
                  Complete any quest on a calendar day to keep the flame.
                </CardDescription>
              </div>
            </div>
            <ul className="font-body text-muted-foreground mt-4 space-y-2 text-sm">
              <li>7+ days: stronger flame and a 1.5× streak callout on the dashboard.</li>
              <li>30+ days: gold-tier flame intensity.</li>
              <li>Miss yesterday: fading warning. Miss two days: streak resets.</li>
              <li>Streak shields on your profile can absorb a miss when you have them.</li>
            </ul>
          </Card>
        </section>

        <section id="ranks" className="scroll-mt-24">
          <Card className="h-full rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle as="h2">Ranks</CardTitle>
                <CardDescription className="text-xs">
                  Title is derived from character level.
                </CardDescription>
              </div>
            </div>
            <ul className="mt-4 space-y-2 font-mono text-sm">
              <li className="flex justify-between gap-4">
                <span className="text-muted-foreground">1–4</span>
                <span className="font-heading font-bold">Novice</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-muted-foreground">5–9</span>
                <span className="font-heading font-bold">Adventurer</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-muted-foreground">10–19</span>
                <span className="font-heading font-bold">Veteran</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-muted-foreground">20–34</span>
                <span className="font-heading font-bold">Hero</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-muted-foreground">35+</span>
                <span className="font-heading font-bold">Legend</span>
              </li>
            </ul>
          </Card>
        </section>
      </div>

      <section id="shop" className="scroll-mt-24">
        <Card className="rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <CardTitle as="h2">Shop</CardTitle>
              <CardDescription className="text-xs">
                Gold is earned from quests. Spend it on themes and titles, never on power.
              </CardDescription>
            </div>
          </div>
          <p className="font-body text-muted-foreground mt-4 text-sm leading-relaxed">
            Cosmetic unlocks such as Arcane Violet, Cyberpunk Neon, and Midnight
            Obsidian change how the interface looks. Purchases are checked
            atomically so the purse cannot go negative.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Palette className="h-3.5 w-3.5" />
            <span>Looks only. No XP boosts for sale.</span>
          </div>
          <Link href="/dashboard/shop" className="mt-4 inline-flex">
            <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
              Visit the Armory
            </Button>
          </Link>
        </Card>
      </section>

      <section id="fair-play" className="scroll-mt-24">
        <Card className="rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle as="h2">Fair play</CardTitle>
              <CardDescription className="text-xs">
                Rewards are computed on the server. Client values are previews only.
              </CardDescription>
            </div>
          </div>
          <ul className="font-body text-muted-foreground mt-4 space-y-2 text-sm leading-relaxed">
            <li className="flex gap-2">
              <Timer className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              New quests have a 30-second create-to-complete floor so they cannot be minted and cashed instantly.
            </li>
            <li className="flex gap-2">
              <Timer className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              More than eight completions in ten minutes halves the payout (anomaly throttle).
            </li>
            <li className="flex gap-2">
              <Timer className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              Honesty is the game: check off work you actually did. The timers exist to keep the economy fair, not to watch you.
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
