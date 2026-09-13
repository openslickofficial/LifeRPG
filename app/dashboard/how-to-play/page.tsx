import Link from "next/link";
import {
  Sword,
  CheckCircle2,
  Sparkles,
  Flame,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlobCharacter } from "@/components/BlobCharacter";

export const metadata = {
  title: "How to Play — Revel",
  description:
    "Learn the Revel loop: create real-life quests, complete them honestly, and level up your character.",
};

const STEPS = [
  {
    num: "01",
    title: "Forge a quest",
    description:
      "Turn a real task into a quest on the Quest Board. Tag it with Strength, Intellect, Discipline, or Creativity, then pick Easy, Medium, or Hard.",
    href: "/dashboard/quests?action=new",
    cta: "Open Quest Board",
    icon: Sword,
    accent: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20",
  },
  {
    num: "02",
    title: "Do the work for real",
    description:
      "Start a focus session when the quest needs time. Medium quests need at least 5 minutes; Hard quests need at least 20. Easy habits can be checked off as soon as you finish them.",
    href: "/dashboard/quests",
    cta: "Start a session",
    icon: CheckCircle2,
    accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    num: "03",
    title: "Collect XP and gold",
    description:
      "Completing a quest awards Experience Points toward your character level and Gold for the shop. Matching attribute XP also rises, so your companions grow with you.",
    href: "/dashboard/attributes",
    cta: "View attributes",
    icon: Sparkles,
    accent: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    num: "04",
    title: "Protect the streak",
    description:
      "Finish at least one quest each day to keep your flame alive. Miss a day and Pip will nudge you — miss two and the streak resets. Come back anyway; every hero starts again.",
    href: "/dashboard",
    cta: "Back to dashboard",
    icon: Flame,
    accent: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
];

export default function HowToPlayPage() {
  return (
    <div className="space-y-8">
      <div className="border-border/60 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              How to Play
            </h1>
            <Badge variant="brand">STARTER PATH</Badge>
          </div>
          <p className="font-body text-muted-foreground mt-1 max-w-2xl text-xs sm:text-sm">
            Revel turns real-life work into an RPG. Four beats: create, complete,
            collect, and keep showing up.
          </p>
        </div>
        <Link href="/dashboard/game-guide">
          <Button variant="outline" size="sm" className="h-10 min-h-[44px] gap-1.5 rounded-xl text-xs">
            <BookOpen className="h-3.5 w-3.5" />
            Full Game Guide
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <BlobCharacter blobId="pip" size="lg" state="idle" showName />
          <div>
            <CardTitle as="h2" className="text-xl">
              Pip&apos;s first briefing
            </CardTitle>
            <CardDescription className="mt-2 max-w-xl">
              Nothing here is pay-to-win. XP and gold only come from work you
              actually do. Your companions — Zippo, Orbit, Muse, Buddy, and Pip —
              react to your streak, not to purchases.
            </CardDescription>
          </div>
        </div>
      </Card>

      <ol className="grid gap-4 md:grid-cols-2">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <li key={step.num}>
              <Card className="h-full rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${step.accent}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] font-bold tracking-widest text-muted-foreground">
                      STEP {step.num}
                    </p>
                    <CardTitle as="h2" className="mt-1 text-lg">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-xs sm:text-sm">
                      {step.description}
                    </CardDescription>
                    <Link href={step.href} className="mt-4 inline-flex">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 min-h-[44px] gap-1.5 rounded-xl text-xs sm:h-8.5 sm:min-h-0"
                      >
                        {step.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ol>

      <Card className="rounded-3xl p-6 sm:p-8">
        <h2 className="font-heading text-foreground text-lg font-bold">
          Your party
        </h2>
        <p className="font-body text-muted-foreground mt-1 text-xs sm:text-sm">
          Each companion is tied to an attribute. Level that stat and they grow
          with you.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <BlobCharacter blobId="zippo" size="md" showName showPower />
          <BlobCharacter blobId="orbit" size="md" showName showPower />
          <BlobCharacter blobId="muse" size="md" showName showPower />
          <BlobCharacter blobId="buddy" size="md" showName showPower />
          <BlobCharacter blobId="pip" size="md" showName showPower />
        </div>
      </Card>
    </div>
  );
}
