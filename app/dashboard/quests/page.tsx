"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sword,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  AlertCircle,
  Loader2,
  Coins,
  Shield,
  Zap,
  Palette,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LevelUpCelebration,
  CharacterLevelUpData,
  AttributeLevelUpData,
} from "@/components/LevelUpCelebration";
import { checkLevelUp } from "@/lib/rpg/leveling";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createTaskSchema,
  CreateTaskInput,
  TASK_CATEGORIES,
  TASK_DIFFICULTIES,
  TaskCategory,
  TaskDifficulty,
} from "@/lib/validations/task";
import { getRewardPreview } from "@/lib/rpg/rewards";
import {
  createTaskAction,
  completeTaskAction,
  deleteTaskAction,
  ActionResult,
} from "@/lib/actions/tasks";
import { createClient } from "@/lib/supabase/client";

export interface Quest {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  difficulty?: TaskDifficulty;
  xp_reward: number;
  currency_reward: number;
  status: "pending" | "completed";
  due_date: string | null;
  completed_at?: string | null;
}

const CATEGORY_ICONS: Record<TaskCategory, React.ReactNode> = {
  Strength: <Sword className="h-4 w-4" />,
  Intellect: <Zap className="h-4 w-4" />,
  Discipline: <Shield className="h-4 w-4" />,
  Creativity: <Palette className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<
  TaskCategory,
  { badge: string; text: string; bg: string }
> = {
  Strength: {
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
  },
  Intellect: {
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    text: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  Discipline: {
    badge:
      "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
  },
  Creativity: {
    badge:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
};

const INITIAL_DEMO_QUESTS: Quest[] = [
  {
    id: "demo-q1",
    title: "Morning 90-Min Focus Deep Work Sprint",
    description:
      "Uninterrupted coding and systems design before checking email.",
    category: "Discipline",
    difficulty: "hard",
    xp_reward: 50,
    currency_reward: 10,
    status: "completed",
    due_date: null,
    completed_at: "2026-09-12T09:30:00Z",
  },
  {
    id: "demo-q2",
    title: "Push Routine & Core Stabilization",
    description: "50 pushups, 3m plank, and posture stretching.",
    category: "Strength",
    difficulty: "medium",
    xp_reward: 25,
    currency_reward: 5,
    status: "pending",
    due_date: null,
  },
  {
    id: "demo-q3",
    title: "Study 20 Pages of Distributed Systems",
    description: "Read architecture chapters and take bullet notes.",
    category: "Intellect",
    difficulty: "medium",
    xp_reward: 25,
    currency_reward: 5,
    status: "pending",
    due_date: null,
  },
  {
    id: "demo-q4",
    title: "Draft Game UI Concept Layout",
    description: "Explore color harmony and character HUD wireframes.",
    category: "Creativity",
    difficulty: "easy",
    xp_reward: 10,
    currency_reward: 2,
    status: "pending",
    due_date: null,
  },
];

// Helper to generate temporary client IDs outside render cycle
function generateTempId(): string {
  return `temp-${Date.now()}`;
}

export default function QuestsPage() {
  const [quests, setQuests] = React.useState<Quest[]>(INITIAL_DEMO_QUESTS);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"active" | "completed">(
    "active"
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<{
    type: "success" | "error" | "rate_limit";
    text: string;
    onRetry?: () => void;
  } | null>(null);

  // Level Up Celebration state
  const [isCelebrationOpen, setIsCelebrationOpen] = React.useState(false);
  const [celebrationData, setCelebrationData] = React.useState<{
    characterLevelUp?: CharacterLevelUpData | null;
    attributeLevelUp?: AttributeLevelUpData | null;
  }>({});
  // Mock character progress for interactive preview testing
  const [demoCharacterLevel, setDemoCharacterLevel] = React.useState(1);
  const [demoCharacterXp, setDemoCharacterXp] = React.useState(35); // 35/50 XP, next quest triggers level up!

  const supabase = React.useMemo(() => createClient(), []);

  // Mount effect: Load live tasks with cleanup
  React.useEffect(() => {
    let ignore = false;
    async function fetchTasks() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (ignore) return;

        if (user) {
          const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("profile_id", user.id)
            .order("created_at", { ascending: false });

          if (ignore) return;

          if (error) {
            setFetchError(error.message);
          } else if (data && data.length > 0) {
            setQuests(
              data.map((t) => ({
                id: t.id,
                title: t.title,
                description: t.description,
                category: t.category as TaskCategory,
                xp_reward: t.xp_reward,
                currency_reward: t.currency_reward,
                status: t.status as "pending" | "completed",
                due_date: t.due_date,
                completed_at: t.completed_at,
              }))
            );
          }
        }
      } catch {
        // Keep demo fallback in offline/preview environments
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchTasks();
    return () => {
      ignore = true;
    };
  }, [supabase]);

  // Refresh handler for the UI reload button
  const handleRefresh = React.useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          setFetchError(error.message);
        } else if (data && data.length > 0) {
          setQuests(
            data.map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              category: t.category as TaskCategory,
              xp_reward: t.xp_reward,
              currency_reward: t.currency_reward,
              status: t.status as "pending" | "completed",
              due_date: t.due_date,
              completed_at: t.completed_at,
            }))
          );
        }
      }
    } catch {
      // Keep demo fallback
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Toast notification helper
  const showToast = (
    text: string,
    type: "success" | "error" | "rate_limit" = "success",
    onRetry?: () => void
  ) => {
    setToastMessage({ type, text, onRetry });
    setTimeout(() => setToastMessage(null), onRetry ? 6000 : 3500);
  };

  // React Hook Form for New Quest
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Discipline",
      difficulty: "medium",
      due_date: "",
    },
  });

  const selectedCategory = useWatch({ control, name: "category" });
  const selectedDifficulty =
    useWatch({ control, name: "difficulty" }) || "medium";
  const rewardPreview = getRewardPreview(selectedDifficulty);

  // Form Submit Handler
  const onSubmit = async (data: CreateTaskInput) => {
    // Optimistic item creation
    const tempId = generateTempId();
    const optimisticTask: Quest = {
      id: tempId,
      title: data.title,
      description: data.description || null,
      category: data.category,
      difficulty: data.difficulty,
      xp_reward: rewardPreview.xp,
      currency_reward: rewardPreview.currency,
      status: "pending",
      due_date: data.due_date || null,
    };

    setQuests((prev) => [optimisticTask, ...prev]);
    setIsDialogOpen(false);
    reset();

    const isPreview =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=true");

    const res = await createTaskAction(data);

    if (res.success && res.data) {
      const serverTask = res.data as Quest;
      setQuests((prev) =>
        prev.map((q) => (q.id === tempId ? { ...q, id: serverTask.id } : q))
      );
      showToast(
        "Quest forged successfully! May fortune favor your discipline."
      );
    } else if (isPreview) {
      showToast(
        "Quest forged in preview mode! (Saved to local session)",
        "success"
      );
    } else {
      // Roll back optimistic insertion on failure
      setQuests((prev) => prev.filter((q) => q.id !== tempId));
      showToast(
        res.error || "Failed to forge quest.",
        res.isRateLimited ? "rate_limit" : "error"
      );
    }
  };

  // Optimistic Quest Completion Handler
  const handleCompleteQuest = async (quest: Quest) => {
    if (quest.status === "completed") return;

    const isPreview =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=true");

    // 1. Optimistically update local state immediately
    const previousQuests = [...quests];
    setQuests((prev) =>
      prev.map((q) =>
        q.id === quest.id
          ? {
              ...q,
              status: "completed",
              completed_at: new Date().toISOString(),
            }
          : q
      )
    );

    showToast(
      `Quest Completed! +${quest.xp_reward} XP · +${quest.currency_reward} Gold added!`,
      "success"
    );

    // 2. Call server action / RPC with network error guard
    const res: ActionResult = await completeTaskAction(quest.id).catch(
      (err) => {
        console.error("Network error during task completion:", err);
        return {
          success: false,
          error: "Network connection lost. Please try again.",
          isRateLimited: false,
        };
      }
    );

    if (res.success && res.data) {
      const rpcData = res.data as {
        characterLevelUp?: CharacterLevelUpData;
        attributeLevelUp?: AttributeLevelUpData;
      };

      if (
        rpcData.characterLevelUp?.leveledUp ||
        rpcData.attributeLevelUp?.leveledUp
      ) {
        setCelebrationData({
          characterLevelUp: rpcData.characterLevelUp,
          attributeLevelUp: rpcData.attributeLevelUp,
        });
        setIsCelebrationOpen(true);
      }
    } else if (isPreview) {
      // In preview/demo mode, compute non-linear leveling progression
      const totalXp = demoCharacterXp + quest.xp_reward;
      const levelResult = checkLevelUp(demoCharacterLevel, totalXp);

      if (levelResult.leveledUp) {
        setCelebrationData({
          characterLevelUp: {
            leveledUp: true,
            oldLevel: demoCharacterLevel,
            newLevel: levelResult.newLevel,
            levelsGained: levelResult.levelsGained,
          },
          attributeLevelUp: {
            leveledUp: true,
            attributeName: quest.category,
            oldLevel: 1,
            newLevel: 2,
            levelsGained: 1,
          },
        });
        setDemoCharacterLevel(levelResult.newLevel);
        setDemoCharacterXp(levelResult.remainingXp);
        setIsCelebrationOpen(true);
      } else {
        setDemoCharacterXp(totalXp);
      }
    } else {
      // 3. Rollback if server rejects (e.g. rate limit, auth, network error) unless preview
      setQuests(previousQuests);
      showToast(
        res.error || "Failed to complete quest.",
        res.isRateLimited ? "rate_limit" : "error",
        () => handleCompleteQuest(quest)
      );
    }
  };

  // Delete Quest Handler
  const handleDeleteQuest = async (questId: string) => {
    const isPreview =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=true");

    const previousQuests = [...quests];
    setQuests((prev) => prev.filter((q) => q.id !== questId));
    showToast("Quest removed from log.");

    const res = await deleteTaskAction(questId);
    if (!res.success && !isPreview) {
      setQuests(previousQuests);
      showToast(res.error || "Failed to delete quest.", "error");
    }
  };

  const activeQuests = quests.filter((q) => q.status === "pending");
  const completedQuests = quests.filter((q) => q.status === "completed");

  return (
    <div className="space-y-8">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`shadow-elevated fixed right-4 bottom-20 z-50 flex items-center gap-3 rounded-2xl border p-4 backdrop-blur-xl md:bottom-8 ${
            toastMessage.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
              : toastMessage.type === "rate_limit"
                ? "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-200"
                : "border-rose-500/40 bg-rose-500/15 text-rose-800 dark:text-rose-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <Sparkles
              className="h-5 w-5 shrink-0 text-emerald-500"
              aria-hidden="true"
            />
          ) : (
            <AlertCircle
              className="h-5 w-5 shrink-0 text-amber-500"
              aria-hidden="true"
            />
          )}
          <span className="font-body text-xs font-semibold">
            {toastMessage.text}
          </span>
          {toastMessage.onRetry && (
            <Button
              size="xs"
              variant="outline"
              onClick={toastMessage.onRetry}
              className="ml-2 h-7 min-h-[36px] gap-1 rounded-lg px-2.5 text-xs font-bold"
            >
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              <span>Retry</span>
            </Button>
          )}
        </div>
      )}

      {/* Top Header Row with New Quest Trigger */}
      <div className="border-border/60 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              Quest Board
            </h1>
            <Badge variant="xp">{activeQuests.length} ACTIVE</Badge>
          </div>
          <p className="font-body text-muted-foreground mt-1 text-xs sm:text-sm">
            Complete daily quests to earn XP, gold, and progress your character
            attributes.
          </p>
        </div>

        {/* Forge Quest Action Button */}
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="shadow-brand h-11 gap-2 rounded-2xl px-5 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>New Quest</span>
        </Button>
      </div>

      {/* Error state with retry option */}
      {fetchError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-800 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{fetchError}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-8 gap-1.5 rounded-xl text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {/* Tabs Navigation (Active vs Completed) */}
      <div className="border-border/60 flex items-center gap-2 border-b pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`font-heading relative cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
            activeTab === "active"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <span>Active Quests</span>
          <span className="ml-2 font-mono text-[10px] opacity-80">
            ({activeQuests.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`font-heading relative cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
            activeTab === "completed"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <span>Completed Log</span>
          <span className="ml-2 font-mono text-[10px] opacity-80">
            ({completedQuests.length})
          </span>
        </button>
      </div>

      {/* Quests Display Container */}
      <h2 className="sr-only">
        {activeTab === "active"
          ? "Active Quests List"
          : "Completed Quests Archive"}
      </h2>
      {loading ? (
        <div
          role="status"
          aria-label="Loading quests..."
          className="grid gap-4 sm:grid-cols-1 md:grid-cols-2"
        >
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-28 rounded-lg" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-5 w-3/4 rounded-xl" />
                <Skeleton className="h-3.5 w-full rounded-lg" />
              </div>
              <div className="border-border/60 mt-6 flex items-center justify-between border-t pt-4">
                <Skeleton className="h-4 w-20 rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <Skeleton className="h-9 w-24 rounded-xl" />
                </div>
              </div>
            </Card>
          ))}
          <span className="sr-only">Loading quest cards...</span>
        </div>
      ) : activeTab === "active" ? (
        activeQuests.length === 0 ? (
          /* Empty State */
          <Card className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Sword className="h-8 w-8" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl">
              All Daily Quests Conquered
            </CardTitle>
            <CardDescription className="mt-1.5 max-w-md text-xs leading-relaxed">
              You have completed every active quest on your board. Forge a new
              quest or rest to preserve your mana.
            </CardDescription>
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              size="sm"
              className="mt-6 min-h-[44px] gap-2 rounded-xl text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Forge Another Quest</span>
            </Button>
          </Card>
        ) : (
          /* Active Quests List */
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {activeQuests.map((quest) => {
              const catConfig = CATEGORY_COLORS[quest.category];
              const CatIcon = CATEGORY_ICONS[quest.category];

              return (
                <Card
                  key={quest.id}
                  className="group border-border/80 bg-card/95 shadow-layered hover:shadow-elevated relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div>
                    {/* Top Row: Category & Rewards */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${catConfig.badge}`}
                        >
                          {CatIcon}
                          <span>{quest.category}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          +{quest.xp_reward} XP
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 font-bold text-amber-600 dark:text-amber-400">
                          <Coins className="h-3 w-3" aria-hidden="true" />
                          {quest.currency_reward}
                        </span>
                      </div>
                    </div>

                    {/* Quest Title & Description */}
                    <div className="mt-4">
                      <h3 className="font-heading text-foreground text-base leading-snug font-bold">
                        {quest.title}
                      </h3>
                      {quest.description && (
                        <p className="font-body text-muted-foreground mt-1.5 line-clamp-2 text-xs leading-relaxed">
                          {quest.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="border-border/60 mt-6 flex items-center justify-between border-t pt-4">
                    <div className="text-muted-foreground flex items-center gap-2 font-mono text-[11px]">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {quest.due_date
                          ? new Date(quest.due_date).toLocaleDateString()
                          : "Today"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => handleDeleteQuest(quest.id)}
                        aria-label={`Delete ${quest.title}`}
                        className="text-muted-foreground focus-visible:ring-primary flex h-11 min-h-[44px] w-11 min-w-[44px] cursor-pointer items-center justify-center rounded-xl transition-colors hover:bg-rose-500/10 hover:text-rose-600 focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>

                      {/* Complete Button */}
                      <Button
                        size="sm"
                        onClick={() => handleCompleteQuest(quest)}
                        className="h-11 min-h-[44px] gap-1.5 rounded-xl px-4 text-xs font-semibold shadow-xs active:scale-95"
                      >
                        <Circle className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Complete</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : completedQuests.length === 0 ? (
        /* Empty Completed State */
        <Card className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center">
          <CardTitle className="text-xl">No Quests Completed Yet</CardTitle>
          <CardDescription className="mt-1 text-xs">
            Mark your first active quest complete to see it logged in your
            adventure history.
          </CardDescription>
        </Card>
      ) : (
        /* Completed Quests List */
        <div className="space-y-3">
          {completedQuests.map((quest) => (
            <div
              key={quest.id}
              className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <CheckCircle2
                  className="h-5 w-5 shrink-0 text-emerald-500"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-heading text-muted-foreground text-xs font-semibold line-through sm:text-sm">
                    {quest.title}
                  </h3>
                  <div className="text-muted-foreground mt-0.5 flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {quest.category}
                    </span>
                    <span>•</span>
                    <span>Completed</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{quest.xp_reward} XP
                  </span>
                  <span className="ml-2 font-bold text-amber-600 dark:text-amber-400">
                    +{quest.currency_reward} G
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteQuest(quest.id)}
                  aria-label={`Delete completed quest ${quest.title}`}
                  className="text-muted-foreground focus-visible:ring-primary flex h-11 min-h-[44px] w-11 min-w-[44px] cursor-pointer items-center justify-center rounded-xl hover:bg-rose-500/10 hover:text-rose-600 focus-visible:ring-2 focus-visible:outline-none"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================================================================== */}
      {/* NEW QUEST DIALOG FORM (React Hook Form + Zod createTaskSchema)         */}
      {/* ===================================================================== */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-violet-500">
              <Sword className="h-5 w-5" />
              <DialogTitle>Forge a New Quest</DialogTitle>
            </div>
            <DialogDescription>
              Assign your real-life tasks to a character attribute. Completing
              them rewards persistent XP and currency.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Title Field */}
            <div className="space-y-1.5">
              <Label htmlFor="quest-title" error={!!errors.title}>
                Quest Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="quest-title"
                placeholder="e.g. Deep Work Sprint (90m) or 10k Steps"
                {...register("title")}
                aria-invalid={!!errors.title}
                aria-describedby={
                  errors.title ? "quest-title-error" : undefined
                }
                className="h-11 rounded-xl"
              />
              {errors.title && (
                <p
                  id="quest-title-error"
                  role="alert"
                  className="font-body text-xs text-rose-500"
                >
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Category Selection Pills */}
            <div className="space-y-1.5">
              <Label>Target Attribute</Label>
              <div
                role="radiogroup"
                aria-label="Target Attribute"
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {TASK_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const Icon = CATEGORY_ICONS[cat];
                  return (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      key={cat}
                      onClick={() => setValue("category", cat)}
                      className={`font-heading focus-visible:ring-primary flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:outline-none ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary ring-primary/20 ring-2"
                          : "border-border/80 bg-card hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {Icon}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Tier & Server Reward Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Difficulty & Reward</Label>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{rewardPreview.xp} XP
                  </span>
                  <span>•</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    +{rewardPreview.currency} Gold
                  </span>
                </div>
              </div>

              <div
                role="radiogroup"
                aria-label="Difficulty level"
                className="grid grid-cols-3 gap-2"
              >
                {TASK_DIFFICULTIES.map((diff) => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      key={diff}
                      onClick={() => setValue("difficulty", diff)}
                      className={`font-heading focus-visible:ring-primary flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl border p-2 text-center text-xs font-bold uppercase transition-all focus-visible:ring-2 focus-visible:outline-none ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary ring-primary/20 ring-1"
                          : "border-border/80 bg-card hover:bg-secondary/60 text-muted-foreground"
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-1.5">
              <Label htmlFor="quest-desc">Objective Details (Optional)</Label>
              <Textarea
                id="quest-desc"
                placeholder="Specific success criteria, sprint notes, or rules..."
                rows={2}
                {...register("description")}
                className="rounded-xl"
              />
              {errors.description && (
                <p role="alert" className="font-body text-xs text-rose-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Due Date Field */}
            <div className="space-y-1.5">
              <Label htmlFor="quest-due">Due Date (Optional)</Label>
              <Input
                id="quest-due"
                type="date"
                {...register("due_date")}
                className="h-11 rounded-xl"
              />
              {errors.due_date && (
                <p role="alert" className="font-body text-xs text-rose-500">
                  {errors.due_date.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="shadow-brand rounded-xl text-xs font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    <span>Inscribing Quest...</span>
                  </>
                ) : (
                  <span>Forge Quest</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Level-Up Celebration Delight Moment Overlay */}
      <LevelUpCelebration
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        characterLevelUp={celebrationData.characterLevelUp}
        attributeLevelUp={celebrationData.attributeLevelUp}
      />
    </div>
  );
}
