import Link from "next/link";
import {
  Zap,
  Sword,
  Shield,
  Palette,
  ArrowLeft,
  Sparkles,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/CircularProgress";
import { createClient } from "@/lib/supabase/server";
import { getLevelProgress } from "@/lib/rpg/leveling";

interface AttributeDefinition {
  name: "Strength" | "Intellect" | "Discipline" | "Creativity";
  title: string;
  icon: React.ReactNode;
  accentColor: "rose" | "cyan" | "violet" | "amber";
  textColor: string;
  borderColor: string;
  bgTint: string;
  badgeVariant: "xp" | "gold" | "streak" | "mana";
  description: string;
  actions: string[];
  perks: { level: number; name: string; description: string }[];
  defaultLevel: number;
  defaultXp: number;
}

const ATTRIBUTE_DEFINITIONS: AttributeDefinition[] = [
  {
    name: "Intellect",
    title: "Master of Systems & Cognition",
    icon: <Zap className="h-6 w-6 text-cyan-500" />,
    accentColor: "cyan",
    textColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "border-cyan-500/30 hover:border-cyan-500/60",
    bgTint: "bg-cyan-500/5",
    badgeVariant: "mana",
    description:
      "Represents computational reasoning, architectural design, deep literature synthesis, and rapid problem-solving capacity.",
    actions: [
      "Algorithm challenges & system architecture design",
      "Reading 20+ pages of dense non-fiction or textbooks",
      "Writing technical documentation or post-mortems",
    ],
    perks: [
      {
        level: 5,
        name: "Deep Flow State",
        description: "+15 minutes extended peak focus endurance",
      },
      {
        level: 15,
        name: "Synaptic Synthesis",
        description: "+25% bonus XP on all technical engineering quests",
      },
    ],
    defaultLevel: 16,
    defaultXp: 185,
  },
  {
    name: "Strength",
    title: "Vessel of Physical Resilience",
    icon: <Sword className="h-6 w-6 text-rose-500" />,
    accentColor: "rose",
    textColor: "text-rose-600 dark:text-rose-400",
    borderColor: "border-rose-500/30 hover:border-rose-500/60",
    bgTint: "bg-rose-500/5",
    badgeVariant: "streak",
    description:
      "Quantifies muscular endurance, cardiovascular stamina, posture integrity, and physical vitality in real life.",
    actions: [
      "Calisthenics, weightlifting & high-intensity sprints",
      "10,000 daily steps & posture stabilization routines",
      "High-protein nutrition tracking & recovery sleep",
    ],
    perks: [
      {
        level: 5,
        name: "Iron Constitution",
        description: "Fatigue threshold increased by 20%",
      },
      {
        level: 15,
        name: "Endorphin Catalyst",
        description: "+15% passive daily energy recovery",
      },
    ],
    defaultLevel: 12,
    defaultXp: 90,
  },
  {
    name: "Discipline",
    title: "Bastion of Willpower & Habits",
    icon: <Shield className="h-6 w-6 text-violet-500" />,
    accentColor: "violet",
    textColor: "text-violet-600 dark:text-violet-400",
    borderColor: "border-violet-500/30 hover:border-violet-500/60",
    bgTint: "bg-violet-500/5",
    badgeVariant: "xp",
    description:
      "Measures resistance to instant dopamine traps, adherence to routines, daily habits, and deep focus consistency.",
    actions: [
      "Completing 90-minute uninterrupted deep work blocks",
      "Maintaining morning and evening ritual schedules",
      "Screen-time limit adherence & resisting digital distractions",
    ],
    perks: [
      {
        level: 5,
        name: "Unbroken Resolve",
        description: "Daily habit streaks receive 1 freeze shield",
      },
      {
        level: 15,
        name: "Grandmaster Routine",
        description: "+50% gold rewards on morning routine completion",
      },
    ],
    defaultLevel: 18,
    defaultXp: 310,
  },
  {
    name: "Creativity",
    title: "Beacon of Originality & Vision",
    icon: <Palette className="h-6 w-6 text-amber-500" />,
    accentColor: "amber",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/30 hover:border-amber-500/60",
    bgTint: "bg-amber-500/5",
    badgeVariant: "gold",
    description:
      "Captures visual design craft, divergent thinking, creative writing, artistic output, and innovative product solutions.",
    actions: [
      "UI/UX wireframing, typography exploration & design systems",
      "Writing essays, scripts, or creative worldbuilding",
      "Brainstorming non-linear solutions to complex roadblocks",
    ],
    perks: [
      {
        level: 5,
        name: "Aesthetic Eye",
        description: "+10% XP on all design and concept milestones",
      },
      {
        level: 15,
        name: "Eureka Insight",
        description: "Chance to trigger double gold on creative completions",
      },
    ],
    defaultLevel: 10,
    defaultXp: 75,
  },
];

export default async function AttributesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch live attributes if user is authenticated
  const liveAttributesMap = new Map<string, { level: number; xp: number }>();

  if (user) {
    const { data: dbAttrs } = await supabase
      .from("attributes")
      .select("*")
      .eq("profile_id", user.id);

    if (dbAttrs) {
      for (const row of dbAttrs) {
        liveAttributesMap.set(row.name, {
          level: row.level,
          xp: row.current_xp,
        });
      }
    }
  }

  // Calculate combined level and archetype
  let totalAttributeLevels = 0;
  let highestAttributeName = "Discipline";
  let highestLevel = 0;

  ATTRIBUTE_DEFINITIONS.forEach((attr) => {
    const live = liveAttributesMap.get(attr.name);
    const lvl = live ? live.level : attr.defaultLevel;
    totalAttributeLevels += lvl;
    if (lvl > highestLevel) {
      highestLevel = lvl;
      highestAttributeName = attr.name;
    }
  });

  return (
    <div className="space-y-8">
      {/* 1. Header Navigation & Hero */}
      <div className="border-border/60 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              Attribute Trees & Skill Mastery
            </h1>
            <Badge variant="xp">CORE ENGINE</Badge>
          </div>
          <p className="font-body text-muted-foreground mt-1 text-xs sm:text-sm">
            Your real-world output mapped to scalable character attributes. Each
            attribute scales independently on the non-linear leveling curve.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl text-xs font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link href="/dashboard/quests">
            <Button
              size="sm"
              className="shadow-brand gap-2 rounded-xl text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Forge Quest</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Character Specialization Archetype Banner */}
      <div className="border-border/80 from-card via-card/80 to-primary/5 shadow-elevated relative overflow-hidden rounded-3xl border bg-gradient-to-r p-6 sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary h-4 w-4" />
              <span className="font-heading text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Active Archetype
              </span>
            </div>
            <h2 className="font-heading text-foreground mt-1 text-2xl font-black sm:text-3xl">
              {highestAttributeName === "Discipline"
                ? "Grand Paladin of Habit"
                : highestAttributeName === "Intellect"
                  ? "Arch-Mage of Cognition"
                  : highestAttributeName === "Strength"
                    ? "Vanguard of Vitality"
                    : "Visionary Polymath"}
            </h2>
            <p className="font-body text-muted-foreground mt-2 max-w-xl text-xs sm:text-sm">
              Highest specialization is{" "}
              <strong className="text-foreground">
                {highestAttributeName} (Lvl {highestLevel})
              </strong>
              . Complete tasks tagged with different attributes to balance or
              hyper-specialize your character sheet.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <div className="border-border/80 bg-background/80 rounded-2xl border p-4 text-center backdrop-blur-md">
              <span className="font-heading text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                Combined Rank
              </span>
              <p className="text-foreground font-mono text-2xl font-extrabold sm:text-3xl">
                Lvl {totalAttributeLevels}
              </p>
              <span className="text-muted-foreground font-mono text-[10px]">
                4 Core Disciplines
              </span>
            </div>

            <div className="border-border/80 bg-background/80 rounded-2xl border p-4 text-center backdrop-blur-md">
              <span className="font-heading text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                Perks Active
              </span>
              <p className="text-primary font-mono text-2xl font-extrabold sm:text-3xl">
                8 / 8
              </p>
              <span className="text-muted-foreground font-mono text-[10px]">
                Passive Multipliers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 4-Attribute Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {ATTRIBUTE_DEFINITIONS.map((attr) => {
          const live = liveAttributesMap.get(attr.name);
          const currentLevel = live ? live.level : attr.defaultLevel;
          const currentXp = live ? live.xp : attr.defaultXp;
          const progress = getLevelProgress(currentLevel, currentXp);
          const xpRemaining = Math.max(
            0,
            progress.xpNeededForNextLevel - progress.xpIntoLevel
          );

          // Get progress ring color
          const ringColor =
            attr.accentColor === "cyan"
              ? "text-cyan-500"
              : attr.accentColor === "rose"
                ? "text-rose-500"
                : attr.accentColor === "violet"
                  ? "text-violet-500"
                  : "text-amber-500";

          return (
            <Card
              key={attr.name}
              className={`flex flex-col justify-between rounded-3xl border p-6 transition-all duration-200 sm:p-7 ${attr.borderColor} ${attr.bgTint}`}
            >
              <div>
                {/* Top Row: Name, Level Badge, and Circular Progress Ring */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="border-border/60 bg-background/80 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-sm">
                      {attr.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-foreground text-xl font-black">
                          {attr.name}
                        </h3>
                        <Badge variant={attr.badgeVariant} className="text-xs">
                          Lvl {currentLevel}
                        </Badge>
                      </div>
                      <p className="font-body text-muted-foreground mt-0.5 text-xs font-medium">
                        {attr.title}
                      </p>
                    </div>
                  </div>

                  {/* Circular XP Progress Ring */}
                  <div className="shrink-0">
                    <CircularProgress
                      percentage={progress.percentage}
                      size={72}
                      strokeWidth={6}
                      color={ringColor}
                      value={`${progress.percentage}%`}
                      sublabel="Tier"
                    />
                  </div>
                </div>

                {/* Level Progress Bar & Numbers */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-muted-foreground">
                      Current: <strong>{progress.xpIntoLevel} XP</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Next Tier:{" "}
                      <strong>{progress.xpNeededForNextLevel} XP</strong>
                    </span>
                  </div>

                  <div className="bg-muted/80 h-2.5 w-full overflow-hidden rounded-full">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        attr.accentColor === "cyan"
                          ? "bg-cyan-500"
                          : attr.accentColor === "rose"
                            ? "bg-rose-500"
                            : attr.accentColor === "violet"
                              ? "bg-violet-500"
                              : "bg-amber-500"
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground font-mono text-[11px]">
                    {xpRemaining} XP needed to reach Level {currentLevel + 1}
                  </p>
                </div>

                {/* Description */}
                <p className="font-body text-foreground/80 mt-4 text-xs leading-relaxed sm:text-sm">
                  {attr.description}
                </p>

                {/* How to advance */}
                <div className="mt-4 space-y-2">
                  <span className="font-heading text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                    Catalyst Actions
                  </span>
                  <ul className="space-y-1.5">
                    {attr.actions.map((act, i) => (
                      <li
                        key={i}
                        className="text-muted-foreground flex items-start gap-2 text-xs"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Unlocked & Upcoming Perks */}
                <div className="mt-5 space-y-2">
                  <span className="font-heading text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                    Specialization Perks
                  </span>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {attr.perks.map((perk, i) => {
                      const isUnlocked = currentLevel >= perk.level;
                      return (
                        <div
                          key={i}
                          className={`rounded-2xl border p-3 text-xs ${
                            isUnlocked
                              ? "border-primary/40 bg-card/80 text-foreground"
                              : "border-border/40 bg-muted/30 text-muted-foreground opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span>{perk.name}</span>
                            <span className="font-mono text-[10px]">
                              {isUnlocked ? "ACTIVE" : `Lvl ${perk.level}`}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-1 text-[11px] leading-snug">
                            {perk.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Action Card Footer */}
              <div className="border-border/50 mt-6 flex items-center justify-between border-t pt-4">
                <span className="text-muted-foreground font-mono text-[11px]">
                  Curve: 50 × (Level)^1.5
                </span>
                <Link href={`/dashboard/quests?category=${attr.name}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 gap-1.5 rounded-xl text-xs font-bold hover:${attr.bgTint} ${attr.textColor}`}
                  >
                    <span>Forge {attr.name} Quest</span>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
