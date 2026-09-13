"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  CheckCircle2,
  Calendar,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Pause,
  Play,
  RotateCcw,
  Undo2,
  Clock,
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
import { BlobCharacter } from "@/components/BlobCharacter";
import { GroupBlobImage } from "@/components/GroupBlobImage";
import { ElementIcon } from "@/components/ElementIcon";
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
import {
  getRewardPreview,
  REWARD_TIERS,
  calculateFinalReward,
  checkMinimumTaskAge,
} from "@/lib/rpg/rewards";
import {
  createTaskAction,
  startTaskFocusAction,
  pauseSessionAction,
  resumeSessionAction,
  undoStartSessionAction,
  restartSessionAction,
  getActiveSessionAction,
  completeTaskAction,
  deleteTaskAction,
  getDailyQuestsAction,
  completeDailyQuestAction,
  TaskCompletionResult,
  DailyQuestItem,
  TaskSessionData,
  ActionResult,
} from "@/lib/actions/tasks";
import { createClient } from "@/lib/supabase/client";
import { RewardPickup } from "@/components/RewardPickup";

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
  created_at?: string;
  completed_at?: string | null;
  focus_started_at?: string | null;
  started_at?: string | null;
}

const CATEGORY_ICONS: Record<TaskCategory, React.ReactNode> = {
  Strength: <ElementIcon name="sword" size={16} className="h-4 w-4" />,
  Intellect: <ElementIcon name="lightning" size={16} className="h-4 w-4" />,
  Discipline: <ElementIcon name="defence" size={16} className="h-4 w-4" />,
  Creativity: <ElementIcon name="diamond" size={16} className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<
  TaskCategory,
  { badge: string; text: string; bg: string }
> = {
  Strength: {
    badge: "border-rose-700 bg-rose-600 text-white shadow-[0_2px_0_0_#9f1239]",
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/15",
  },
  Intellect: {
    badge: "border-blue-700 bg-blue-600 text-white shadow-[0_2px_0_0_#1e40af]",
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/15",
  },
  Discipline: {
    badge:
      "border-amber-600 bg-amber-400 text-slate-950 font-bold shadow-[0_2px_0_0_#b45309]",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/15",
  },
  Creativity: {
    badge:
      "border-emerald-700 bg-emerald-500 text-white shadow-[0_2px_0_0_#065f46]",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/15",
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
    created_at: "2026-09-12T08:00:00Z",
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
    created_at: "2026-09-12T09:00:00Z",
  },
  {
    id: "demo-q3",
    title: "Study 20 Pages of Distributed Systems",
    description: "Read architecture chapters and take bullet notes.",
    category: "Intellect",
    difficulty: "hard",
    xp_reward: 50,
    currency_reward: 10,
    status: "pending",
    due_date: null,
    created_at: "2026-09-12T09:00:00Z",
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
    created_at: "2026-09-12T09:00:00Z",
  },
];

const INITIAL_DEMO_DAILY_QUESTS: DailyQuestItem[] = [
  {
    id: "demo-dq1",
    title: "Iron Core Challenge (50 Pushups & Plank)",
    description:
      "Execute a high-tension bodyweight routine with strict cadence.",
    category: "Strength",
    xp_reward: 32,
    currency_reward: 7,
    active_date: "2026-09-12",
    isCompleted: false,
  },
  {
    id: "demo-dq2",
    title: "Lorekeeper Session (Read 25 Pages Non-Fiction)",
    description:
      "Deep cognitive absorption from an engineering or philosophy text.",
    category: "Intellect",
    xp_reward: 32,
    currency_reward: 7,
    active_date: "2026-09-12",
    isCompleted: false,
  },
  {
    id: "demo-dq3",
    title: "Deep Work Bastion (90-Min Focus Sprint)",
    description:
      "Zero social media, zero context switches. Pure high-leverage flow.",
    category: "Discipline",
    xp_reward: 63,
    currency_reward: 13,
    active_date: "2026-09-12",
    isCompleted: false,
  },
];

// Helper to generate temporary client IDs outside render cycle
function generateTempId(): string {
  return `temp-${Date.now()}`;
}

function generateSessionId(): string {
  return `session-${Date.now()}`;
}

function subscribeToClock(callback: () => void): () => void {
  const timer = setInterval(callback, 1000);
  return () => clearInterval(timer);
}

function getClockSnapshot(): number {
  return Math.floor(Date.now() / 1000);
}

function getServerSnapshot(): number {
  return 0;
}

export default function QuestsPage() {
  const [quests, setQuests] = React.useState<Quest[]>(INITIAL_DEMO_QUESTS);
  const [dailyQuests, setDailyQuests] = React.useState<DailyQuestItem[]>(
    INITIAL_DEMO_DAILY_QUESTS
  );
  const [completingDailyQuestId, setCompletingDailyQuestId] = React.useState<
    string | null
  >(null);
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

  // Reward Pickup Animation state
  const [activeRewardPickup, setActiveRewardPickup] = React.useState<{
    questId: string;
    xp: number;
    currency: number;
    isCritical?: boolean;
    comboCount?: number;
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

  // Task focus session state for timer controls & cross-device sync
  const [activeSession, setActiveSession] = React.useState<TaskSessionData | null>(null);
  const [sessionActionLoading, setSessionActionLoading] = React.useState(false);
  const nowSeconds = React.useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getServerSnapshot
  );
  const nowTime = nowSeconds * 1000;

  // Cross-device sync: Hydrate active session on mount and on window focus/visibilitychange
  React.useEffect(() => {
    let ignore = false;
    async function syncActiveSession() {
      try {
        const res = await getActiveSessionAction();
        if (!ignore && res.success) {
          setActiveSession(res.data || null);
        }
      } catch {
        // silent error fallback
      }
    }

    syncActiveSession();

    const onFocus = () => syncActiveSession();
    window.addEventListener("focus", onFocus);
    const onVisibility = () => {
      if (document.visibilityState === "visible") syncActiveSession();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      ignore = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

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
                difficulty: (t.difficulty as TaskDifficulty) || "medium",
                xp_reward: t.xp_reward,
                currency_reward: t.currency_reward,
                status: t.status as "pending" | "completed",
                due_date: t.due_date,
                completed_at: t.completed_at,
                focus_started_at: t.focus_started_at,
              }))
            );
          }

          // Fetch daily quests
          const dqRes = await getDailyQuestsAction();
          if (!ignore && dqRes.success && dqRes.data && dqRes.data.length > 0) {
            setDailyQuests(dqRes.data);
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

  // Focus Sprint Activation for Quests
  const handleStartFocus = async (taskId: string) => {
    setSessionActionLoading(true);
    const nowIso = new Date().toISOString();
    const isPreview =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=true");

    const mockSession: TaskSessionData = {
      id: generateSessionId(),
      task_id: taskId,
      profile_id: "demo-user",
      status: "running",
      started_at: nowIso,
      ended_at: null,
      paused_at: null,
      total_paused_seconds: 0,
      pause_count: 0,
    };

    if (isPreview) {
      setActiveSession(mockSession);
      setQuests((prev) =>
        prev.map((q) =>
          q.id === taskId
            ? { ...q, focus_started_at: nowIso, started_at: nowIso }
            : q
        )
      );
      showToast(
        "⏱️ Focus Sprint Started! 10s undo window active.",
        "success"
      );
      setSessionActionLoading(false);
      return;
    }

    const res = await startTaskFocusAction(taskId);
    setSessionActionLoading(false);
    if (res.success && res.data) {
      setActiveSession(res.data);
      setQuests((prev) =>
        prev.map((q) =>
          q.id === taskId
            ? { ...q, focus_started_at: nowIso, started_at: nowIso }
            : q
        )
      );
      showToast(
        "⏱️ Focus Sprint Started! 10s undo window active.",
        "success"
      );
    } else {
      showToast(res.error || "Failed to start focus session.", "error");
    }
  };

  // Pause Active Focus Session
  const handlePauseSession = async () => {
    if (!activeSession) return;
    setSessionActionLoading(true);
    const isPreview =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=true");

    const nowIso = new Date().toISOString();

    if (isPreview) {
      if (activeSession.pause_count >= 2) {
        showToast(
          "You've used your pauses for this session (maximum 2 pauses per quest).",
          "error"
        );
        setSessionActionLoading(false);
        return;
      }
      const newPauseCount = activeSession.pause_count + 1;
      setActiveSession({
        ...activeSession,
        paused_at: nowIso,
        pause_count: newPauseCount,
      });
      const remaining = Math.max(0, 2 - newPauseCount);
      showToast(
        `⏸️ Focus sprint paused (${remaining} pause${remaining === 1 ? "" : "s"} remaining). Take a quick break!`,
        "success"
      );
      setSessionActionLoading(false);
      return;
    }

    const res = await pauseSessionAction(activeSession.id);
    setSessionActionLoading(false);
    if (res.success && res.data) {
      setActiveSession(res.data);
      const remaining = Math.max(0, 2 - res.data.pause_count);
      showToast(
        `⏸️ Focus sprint paused (${remaining} pause${remaining === 1 ? "" : "s"} remaining). Take a quick break!`,
        "success"
      );
    } else {
      showToast(res.error || "Failed to pause focus session.", "error");
      if (res.error?.includes("cancelled") || res.error?.includes("expired")) {
        setActiveSession(null);
      }
    }
  };

  // Resume Paused Focus Session
  const handleResumeSession = async () => {
    if (!activeSession || !activeSession.paused_at) return;
    setSessionActionLoading(true);
    const isPreview =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=true");

    const nowMs = Date.now();
    const pausedMs = new Date(activeSession.paused_at).getTime();
    const pauseElapsed = Math.max(0, Math.floor((nowMs - pausedMs) / 1000));
    const newTotalPaused = activeSession.total_paused_seconds + pauseElapsed;

    if (isPreview) {
      if (newTotalPaused > 300) {
        setActiveSession(null);
        showToast(
          "Session exceeded 5-minute maximum pause limit and has been cancelled.",
          "error"
        );
        setSessionActionLoading(false);
        return;
      }
      setActiveSession({
        ...activeSession,
        paused_at: null,
        total_paused_seconds: newTotalPaused,
      });
      showToast("▶️ Focus sprint resumed! Keep up the momentum.", "success");
      setSessionActionLoading(false);
      return;
    }

    const res = await resumeSessionAction(activeSession.id);
    setSessionActionLoading(false);
    if (res.success && res.data) {
      setActiveSession(res.data);
      showToast("▶️ Focus sprint resumed! Keep up the momentum.", "success");
    } else {
      showToast(res.error || "Failed to resume focus session.", "error");
      if (res.error?.includes("cancelled") || res.error?.includes("expired")) {
        setActiveSession(null);
      }
    }
  };

  // Undo Start Session (within 10s grace window and 0 pauses used)
  const handleUndoStartSession = async () => {
    if (!activeSession) return;
    setSessionActionLoading(true);
    const isPreview =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=true");

    const taskId = activeSession.task_id;

    if (isPreview) {
      const elapsedSec =
        (Date.now() - new Date(activeSession.started_at).getTime()) / 1000;
      if (elapsedSec > 10) {
        showToast(
          "Undo window expired (available only within first 10 seconds). Use Restart instead.",
          "error"
        );
        setSessionActionLoading(false);
        return;
      }
      setActiveSession(null);
      setQuests((prev) =>
        prev.map((q) =>
          q.id === taskId
            ? { ...q, started_at: null, focus_started_at: null }
            : q
        )
      );
      showToast("↩️ Session start undone. No penalty applied.", "success");
      setSessionActionLoading(false);
      return;
    }

    const res = await undoStartSessionAction(activeSession.id);
    setSessionActionLoading(false);
    if (res.success) {
      setActiveSession(null);
      setQuests((prev) =>
        prev.map((q) =>
          q.id === taskId
            ? { ...q, started_at: null, focus_started_at: null }
            : q
        )
      );
      showToast("↩️ Session start undone. No penalty applied.", "success");
    } else {
      showToast(res.error || "Failed to undo session start.", "error");
    }
  };

  // Restart Session (cancels current session and creates a brand-new one)
  const handleRestartSession = async () => {
    if (!activeSession) return;
    setSessionActionLoading(true);
    const isPreview =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=true");

    const nowIso = new Date().toISOString();
    const taskId = activeSession.task_id;

    if (isPreview) {
      const newSession: TaskSessionData = {
        ...activeSession,
        id: generateSessionId(),
        started_at: nowIso,
        ended_at: null,
        paused_at: null,
        total_paused_seconds: 0,
        pause_count: 0,
      };
      setActiveSession(newSession);
      setQuests((prev) =>
        prev.map((q) =>
          q.id === taskId
            ? { ...q, started_at: nowIso, focus_started_at: nowIso }
            : q
        )
      );
      showToast("🔄 Session restarted with a fresh timer.", "success");
      setSessionActionLoading(false);
      return;
    }

    const res = await restartSessionAction(activeSession.id);
    setSessionActionLoading(false);
    if (res.success && res.data) {
      setActiveSession(res.data);
      setQuests((prev) =>
        prev.map((q) =>
          q.id === taskId
            ? { ...q, started_at: nowIso, focus_started_at: nowIso }
            : q
        )
      );
      showToast("🔄 Session restarted with a fresh timer.", "success");
    } else {
      showToast(res.error || "Failed to restart session.", "error");
    }
  };

  // Featured Daily Quest Completion Handler
  const handleCompleteDailyQuest = async (dailyQuest: DailyQuestItem) => {
    if (dailyQuest.isCompleted || completingDailyQuestId === dailyQuest.id)
      return;

    setCompletingDailyQuestId(dailyQuest.id);
    setDailyQuests((prev) =>
      prev.map((dq) =>
        dq.id === dailyQuest.id ? { ...dq, isCompleted: true } : dq
      )
    );

    const isPreview =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=true");

    setActiveRewardPickup({
      questId: dailyQuest.id,
      xp: dailyQuest.xp_reward,
      currency: dailyQuest.currency_reward,
    });

    if (isPreview) {
      showToast(
        `⚡ Daily Quest Conquered! +${dailyQuest.xp_reward} XP · +${dailyQuest.currency_reward} Gold added! (+25% Daily Bonus)`,
        "success"
      );
      setCompletingDailyQuestId(null);
      return;
    }

    const res = await completeDailyQuestAction(dailyQuest.id);
    setCompletingDailyQuestId(null);

    if (res.success && res.data) {
      const completion = res.data;
      setActiveRewardPickup({
        questId: dailyQuest.id,
        xp: completion.xpAwarded,
        currency: completion.currencyAwarded,
        isCritical: completion.wasCritical,
        comboCount: completion.comboCount,
      });

      let message = completion.wasCritical
        ? `💥 CRITICAL HIT! 2X DAILY REWARDS! +${completion.xpAwarded} XP · +${completion.currencyAwarded} Gold added!`
        : `⚡ Daily Quest Conquered! +${completion.xpAwarded} XP · +${completion.currencyAwarded} Gold added! (+25% Daily Bonus)`;

      if (completion.comboCount > 1) {
        message += ` 🔥 Combo x${completion.comboCount}!`;
      }
      showToast(message, "success");

      if (
        completion.characterLevelUp?.leveledUp ||
        completion.attributeLevelUp?.leveledUp
      ) {
        setCelebrationData({
          characterLevelUp: completion.characterLevelUp,
          attributeLevelUp: completion.attributeLevelUp,
        });
        setIsCelebrationOpen(true);
      }
    } else {
      // Rollback
      setDailyQuests((prev) =>
        prev.map((dq) =>
          dq.id === dailyQuest.id ? { ...dq, isCompleted: false } : dq
        )
      );
      showToast(res.error || "Failed to conquer daily quest.", "error");
    }
  };

  // Form Submit Handler
  const onSubmit = async (data: CreateTaskInput) => {
    // Optimistic item creation
    const tempId = generateTempId();
    const nowIso = new Date().toISOString();
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
      created_at: nowIso,
      started_at: null,
      focus_started_at: null,
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

    // Trigger initial floating reward pickup animation
    setActiveRewardPickup({
      questId: quest.id,
      xp: quest.xp_reward,
      currency: quest.currency_reward,
    });

    // 2. Call server action / RPC with network error guard
    const res = await completeTaskAction(quest.id).catch((err) => {
      console.error("Network error during task completion:", err);
      return {
        success: false,
        error: "Network connection lost. Please try again.",
        isRateLimited: false,
      } as ActionResult<TaskCompletionResult>;
    });

    if (res.success && res.data) {
      const completion = res.data as TaskCompletionResult;

      // Update pickup animation with exact awarded values, crits, and combos
      setActiveRewardPickup({
        questId: quest.id,
        xp: completion.xpAwarded,
        currency: completion.currencyAwarded,
        isCritical: completion.wasCritical,
        comboCount: completion.comboCount,
      });

      let message = completion.wasCritical
        ? `💥 CRITICAL HIT! 2X REWARD! +${completion.xpAwarded} XP · +${completion.currencyAwarded} Gold added!`
        : `Quest Completed! +${completion.xpAwarded} XP · +${completion.currencyAwarded} Gold added!`;

      if (completion.comboCount > 1) {
        message += ` 🔥 Combo x${completion.comboCount} (+${Math.round((completion.comboMultiplier - 1) * 100)}%)`;
      }

      showToast(message, "success");

      // Anti-cheat notifications:
      if (
        completion.appliedMultipliers &&
        completion.appliedMultipliers.length > 0
      ) {
        const repeatStr = completion.appliedMultipliers.find((m) =>
          m.startsWith("repeat_decay:")
        );
        if (repeatStr) {
          setTimeout(() => {
            showToast(
              `⚡ Repeat Quest: Diminishing returns applied (${repeatStr.split(":")[1]}).`,
              "rate_limit"
            );
          }, 1400);
        }

        if (completion.appliedMultipliers.includes("anomaly_throttle:0.50x")) {
          setTimeout(() => {
            showToast(
              `⏱️ Rapid completion pace detected: Soft anomaly throttle applied (50% reduction).`,
              "rate_limit"
            );
          }, 1800);
        }
      }

      // Loot drop notification
      if (completion.lootDropped) {
        setTimeout(() => {
          showToast(
            `🎁 UNEXPECTED LOOT DROP! You obtained: ${completion.lootDropped!.name} (${completion.lootDropped!.rarity.toUpperCase()}) added to vault!`,
            "success"
          );
        }, 1200);
      }

      // Streak shield consumed notification
      if (completion.streakShieldConsumed) {
        setTimeout(() => {
          showToast(
            `🛡️ Streak Shield Consumed! Your daily streak was preserved from decay.`,
            "rate_limit"
          );
        }, 800);
      }

      // Timing / focus downgraded notification
      if (completion.focusDowngraded) {
        setTimeout(() => {
          showToast(
            `⚠️ Elapsed time did not qualify for declared difficulty: Reward adjusted to qualifying tier.`,
            "rate_limit"
          );
        }, 1500);
      }

      if (
        completion.characterLevelUp?.leveledUp ||
        completion.attributeLevelUp?.leveledUp
      ) {
        setCelebrationData({
          characterLevelUp: completion.characterLevelUp,
          attributeLevelUp: completion.attributeLevelUp,
        });
        setIsCelebrationOpen(true);
      }
    } else if (
      res.error === "Give it a bit more time before completing" ||
      res.error?.includes("Give it a bit more time")
    ) {
      // Rollback optimistic update on anti-cheat rejection
      setQuests(previousQuests);
      setActiveRewardPickup(null);
      showToast("Give it a bit more time before completing", "rate_limit");
    } else if (isPreview) {
      // In preview mode: Enforce 30s minimum task age floor
      const ageCheck = checkMinimumTaskAge(
        quest.created_at || "2026-09-12T09:00:00Z"
      );
      if (!ageCheck.allowed) {
        setQuests(previousQuests);
        setActiveRewardPickup(null);
        showToast(
          ageCheck.message || "Give it a bit more time before completing",
          "rate_limit"
        );
        return;
      }

      // Count repeat completions in current state for preview demo
      const completedSameTitleToday = quests.filter(
        (q) =>
          q.status === "completed" &&
          q.category === quest.category &&
          q.title.trim().toLowerCase() === quest.title.trim().toLowerCase()
      ).length;

      // Clear active session state if completing the active quest
      const sessionForThisQuest =
        activeSession?.task_id === quest.id ? activeSession : null;
      if (sessionForThisQuest) {
        setActiveSession(null);
      }

      // In preview mode, calculate complete reward using calculateFinalReward
      const previewReward = calculateFinalReward({
        declaredDifficulty: quest.difficulty || "medium",
        createdAt: quest.created_at || "2026-09-12T09:00:00Z",
        startedAt:
          sessionForThisQuest?.started_at ||
          quest.started_at ||
          quest.focus_started_at,
        totalPausedSeconds: sessionForThisQuest?.total_paused_seconds || 0,
        completedAt: new Date().toISOString(),
        previousSameTitleCompletionsIn24h: completedSameTitleToday,
        previousComboCount: 1,
      });

      setActiveRewardPickup({
        questId: quest.id,
        xp: previewReward.final.xp,
        currency: previewReward.final.currency,
        isCritical: previewReward.wasCritical,
        comboCount: previewReward.comboCount,
      });

      const message = previewReward.wasCritical
        ? `💥 CRITICAL HIT! 2X REWARD! +${previewReward.final.xp} XP · +${previewReward.final.currency} Gold added!`
        : `Quest Completed! +${previewReward.final.xp} XP · +${previewReward.final.currency} Gold added! 🔥 Combo x${previewReward.comboCount}`;

      showToast(message, "success");

      // Repeat decay toast
      if (completedSameTitleToday > 0) {
        const decayMultiplier =
          completedSameTitleToday === 1
            ? "70%"
            : completedSameTitleToday === 2
            ? "40%"
            : "15%";
        setTimeout(() => {
          showToast(
            `⚡ Repeat Quest: Diminishing returns applied (${decayMultiplier} payout).`,
            "rate_limit"
          );
        }, 1300);
      }

      // Timing downgrade toast
      if (previewReward.multipliers.timingDowngraded) {
        setTimeout(() => {
          showToast(
            `⚠️ Elapsed time did not meet declared difficulty requirement: Reward adjusted to qualifying tier.`,
            "rate_limit"
          );
        }, 1600);
      }

      const totalXp = demoCharacterXp + previewReward.final.xp;
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
      // Rollback if server rejects
      setQuests(previousQuests);
      setActiveRewardPickup(null);
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

  const isLongInactive = React.useMemo(() => {
    if (completedQuests.length === 0) return false;
    const sorted = [...completedQuests].sort((a, b) => {
      const timeA = new Date(a.completed_at || a.created_at || 0).getTime();
      const timeB = new Date(b.completed_at || b.created_at || 0).getTime();
      return timeB - timeA;
    });
    const latestTime = new Date(
      sorted[0]?.completed_at || sorted[0]?.created_at || 0
    ).getTime();
    const currentTimestamp = nowSeconds * 1000;
    const diffDays = (currentTimestamp - latestTime) / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
  }, [completedQuests, nowSeconds]);

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
            <ElementIcon name="diamond" size={20} className="h-5 w-5 shrink-0" />
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
            <ElementIcon name="swords" size={28} className="h-7 w-7" />
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
          isLongInactive ? (
            <Card className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-rose-500/20 bg-rose-500/5 p-10 sm:p-12 text-center">
              <div className="relative h-28 w-44 sm:h-36 sm:w-56 mb-4">
                <GroupBlobImage
                  src="/blobs/blobs-hurt.png"
                  alt="Your companions have missed you"
                  fill
                  sizes="(max-width: 640px) 176px, 224px"
                  className="filter drop-shadow-md"
                  fallbackTitle="Companions Miss You"
                />
              </div>
              <CardTitle className="text-xl font-heading font-black">
                Your companions have missed you. Let&apos;s get back to it.
              </CardTitle>
              <CardDescription className="font-body mt-1.5 max-w-md text-xs sm:text-sm leading-relaxed text-muted-foreground">
                It&apos;s been over a week since your last completed quest. Forge a new quest today to jump back into action together!
              </CardDescription>
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                size="sm"
                className="mt-6 min-h-[44px] gap-2 rounded-xl text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Forge a Quest</span>
              </Button>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center">
              <BlobCharacter blobId="mascot" size="md" state="idle" />
              <CardTitle className="mt-4 text-xl font-heading font-black">
                All Daily Quests Conquered!
              </CardTitle>
              <CardDescription className="font-body mt-1.5 max-w-md text-xs leading-relaxed">
                Pip is thrilled — you have completed every active quest on your
                board! Forge a new quest or take a well-deserved breather.
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
          )
        ) : (
          <div className="space-y-8">
            {/* 24-Hour Rotating Featured Daily Quests */}
            <section
              aria-label="Featured Daily Quests"
              className="space-y-3 rounded-3xl border-2 border-amber-500/30 bg-amber-500/5 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-xs font-black text-slate-950 shadow-xs">
                    ⚡
                  </span>
                  <div>
                    <h2 className="font-heading text-foreground text-sm font-black uppercase tracking-wider">
                      Featured 24-Hour Daily Quests
                    </h2>
                    <p className="font-body text-muted-foreground text-[11px]">
                      Rotates every 24 hours · Shared across all adventurers
                    </p>
                  </div>
                </div>
                <span className="rounded-xl border border-amber-500/40 bg-amber-400/20 px-2.5 py-1 font-mono text-[10px] font-black text-amber-600 dark:text-amber-400">
                  +25% BONUS MULTIPLIER
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3">
                {dailyQuests.map((dq) => {
                  const catConfig =
                    CATEGORY_COLORS[dq.category as TaskCategory] ||
                    CATEGORY_COLORS.Discipline;
                  const CatIcon =
                    CATEGORY_ICONS[dq.category as TaskCategory] || (
                      <ElementIcon name="defence" size={16} className="h-4 w-4" />
                    );
                  return (
                    <Card
                      key={dq.id}
                      className={`relative flex flex-col justify-between rounded-2xl border-2 p-4 transition-all duration-150 ${
                        dq.isCompleted
                          ? "border-emerald-500/40 bg-emerald-500/5 opacity-80"
                          : "border-amber-500/40 bg-card hover:border-amber-500 hover:shadow-md"
                      }`}
                    >
                      <RewardPickup
                        xp={dq.xp_reward}
                        currency={dq.currency_reward}
                        isVisible={activeRewardPickup?.questId === dq.id}
                        isCritical={activeRewardPickup?.isCritical}
                        comboCount={activeRewardPickup?.comboCount}
                        onAnimationComplete={() => setActiveRewardPickup(null)}
                        className="top-2 right-4"
                      />
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-heading inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase ${catConfig.badge}`}
                          >
                            {CatIcon}
                            <span>{dq.category}</span>
                          </span>
                          <div className="flex items-center gap-1 font-mono text-[11px] font-black text-amber-600 dark:text-amber-400">
                            <span>+{dq.xp_reward} XP</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <ElementIcon name="coin" size={12} className="h-3 w-3" />
                              {dq.currency_reward}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-heading text-foreground mt-2 text-xs font-black leading-snug">
                          {dq.title}
                        </h3>
                        {dq.description && (
                          <p className="font-body text-muted-foreground mt-1 line-clamp-2 text-[11px] leading-relaxed">
                            {dq.description}
                          </p>
                        )}
                      </div>

                      <div className="border-border/50 mt-4 border-t pt-3">
                        {dq.isCompleted ? (
                          <div className="flex items-center justify-center gap-1.5 font-heading text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                            <span>Conquered Today</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="gold"
                            disabled={completingDailyQuestId === dq.id}
                            onClick={() => handleCompleteDailyQuest(dq)}
                            className="h-9 w-full min-h-[44px] rounded-xl text-[11px] font-black uppercase tracking-wider"
                          >
                            {completingDailyQuestId === dq.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                                <span>Conquer Daily (+25%)</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* User Created Active Quests List */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-foreground text-sm font-black uppercase tracking-wider">
                  Your Quest Board ({activeQuests.length})
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                {activeQuests.map((quest) => {
                  const catConfig = CATEGORY_COLORS[quest.category];
                  const CatIcon = CATEGORY_ICONS[quest.category];

                  return (
                    <Card
                      key={quest.id}
                      className="group border-border bg-card shadow-layered hover:shadow-elevated relative flex flex-col justify-between rounded-3xl border-2 p-6 transition-all duration-150 hover:-translate-y-1"
                    >
                      {/* Floating Per-Task Reward Pickup Notification */}
                      <RewardPickup
                        xp={quest.xp_reward}
                        currency={quest.currency_reward}
                        isVisible={activeRewardPickup?.questId === quest.id}
                        isCritical={activeRewardPickup?.isCritical}
                        comboCount={activeRewardPickup?.comboCount}
                        onAnimationComplete={() => setActiveRewardPickup(null)}
                        className="top-2 right-4"
                      />

                      <div>
                        {/* Top Row: Category, Difficulty & Rewards */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`font-heading inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-black tracking-wider uppercase ${catConfig.badge}`}
                            >
                              {CatIcon}
                              <span>{quest.category}</span>
                            </span>

                            {/* Difficulty Tier Badge */}
                            <span
                              className={`font-heading inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                quest.difficulty === "hard"
                                  ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                  : quest.difficulty === "easy"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {quest.difficulty || "medium"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="font-black text-emerald-600 dark:text-emerald-400">
                              +{quest.xp_reward} XP
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 font-black text-amber-600 dark:text-amber-400">
                              <ElementIcon name="coin" size={12} className="h-3 w-3" />
                              {quest.currency_reward}
                            </span>
                          </div>
                        </div>

                        {/* Quest Title & Description */}
                        <div className="mt-4">
                          <h3 className="font-heading text-foreground text-base font-black leading-snug">
                            {quest.title}
                          </h3>
                          {quest.description && (
                            <p className="font-body text-muted-foreground mt-1.5 line-clamp-2 text-xs leading-relaxed">
                              {quest.description}
                            </p>
                          )}
                        </div>

                        {/* Task Focus Sprint Timer & Anti-Cheat Controls */}
                        {(quest.difficulty === "hard" ||
                          activeSession?.task_id === quest.id) &&
                          (() => {
                            const isThisSession =
                              activeSession?.task_id === quest.id;
                            const hasOtherActive =
                              !!activeSession &&
                              activeSession.task_id !== quest.id;

                            // Helper formatter mm:ss
                            const formatTimer = (totalSec: number) => {
                              const safe = Math.max(0, Math.floor(totalSec));
                              const m = Math.floor(safe / 60);
                              const s = safe % 60;
                              return `${m.toString().padStart(2, "0")}:${s
                                .toString()
                                .padStart(2, "0")}`;
                            };

                            // State 1: None (no active session for this quest)
                            if (!isThisSession) {
                              if (hasOtherActive) {
                                return (
                                  <div className="mt-4 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 p-3.5 shadow-sm">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 text-xs font-black text-amber-600 dark:text-amber-400">
                                        <Clock className="h-4 w-4 shrink-0 stroke-[2.5]" />
                                        <span>Focus Sprint Active on Another Quest</span>
                                      </div>
                                      <span className="font-heading rounded-md border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-amber-700 dark:text-amber-300">
                                        Single Focus Lock
                                      </span>
                                    </div>
                                    <p className="font-body text-muted-foreground mt-1 text-[11px] leading-relaxed">
                                      Only 1 quest focus session is permitted at a time. Complete, pause, or restart your active session.
                                    </p>
                                  </div>
                                );
                              }

                              return (
                                <div className="mt-4 flex items-center justify-between rounded-2xl border-2 border-rose-500/30 bg-rose-500/5 p-3 shadow-sm">
                                  <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 text-white shadow-[0_2px_0_0_#9f1239]">
                                      <ElementIcon name="lightning" size={16} className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400">
                                        <span>Focus Sprint Required</span>
                                      </div>
                                      <span className="font-mono text-[10px] text-muted-foreground">
                                        20m minimum target (&lt;2h limit)
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    disabled={sessionActionLoading}
                                    onClick={() => handleStartFocus(quest.id)}
                                    className="h-9 min-h-[36px] rounded-xl px-4 text-[10px] font-black uppercase tracking-wider shadow-[0_3px_0_0_#9f1239] active:translate-y-0.5 active:shadow-none"
                                  >
                                    <Play className="mr-1 h-3.5 w-3.5 fill-current" />
                                    Start Focus
                                  </Button>
                                </div>
                              );
                            }

                            // If this quest has an active session:
                            const isPaused = !!activeSession.paused_at;
                            const startedMs = new Date(
                              activeSession.started_at
                            ).getTime();

                            if (!isPaused) {
                              // State 2: RUNNING
                              const elapsedNetSec = Math.max(
                                0,
                                Math.floor((nowTime - startedMs) / 1000) -
                                  activeSession.total_paused_seconds
                              );
                              const secondsSinceStart =
                                (nowTime - startedMs) / 1000;
                              const canUndo =
                                secondsSinceStart <= 10 &&
                                activeSession.pause_count === 0;
                              const undoSecondsRemaining = Math.max(
                                0,
                                Math.ceil(10 - secondsSinceStart)
                              );

                              return (
                                <div className="mt-4 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/10 p-3.5 shadow-md">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="relative flex h-3 w-3">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                                      </span>
                                      <div className="font-heading text-xs font-black tracking-wide text-emerald-600 dark:text-emerald-400 uppercase">
                                        Focus Running
                                      </div>
                                    </div>
                                    <div className="font-mono text-xs font-black text-foreground">
                                      ⏱️ {formatTimer(elapsedNetSec)}
                                      <span className="text-muted-foreground ml-1 text-[10px] font-medium">
                                        / 20:00 target
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-emerald-500/20 pt-2.5">
                                    {/* Pause Button */}
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      disabled={
                                        sessionActionLoading ||
                                        activeSession.pause_count >= 2
                                      }
                                      onClick={handlePauseSession}
                                      className={`h-8 rounded-xl px-3 text-[10px] font-black uppercase tracking-wider border-2 ${
                                        activeSession.pause_count >= 2
                                          ? "border-border text-muted-foreground opacity-60 cursor-not-allowed"
                                          : "border-amber-500/50 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400 shadow-[0_2px_0_0_#d97706]"
                                      }`}
                                      title={
                                        activeSession.pause_count >= 2
                                          ? "You've used your pauses for this session"
                                          : undefined
                                      }
                                    >
                                      <Pause className="mr-1 h-3 w-3 fill-current" />
                                      <span>
                                        Pause (
                                        {Math.max(
                                          0,
                                          2 - activeSession.pause_count
                                        )}{" "}
                                        left)
                                      </span>
                                    </Button>

                                    {/* Either Undo Start (<= 10s & 0 pauses) or Restart */}
                                    {canUndo ? (
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        disabled={sessionActionLoading}
                                        onClick={handleUndoStartSession}
                                        className="h-8 rounded-xl px-2.5 text-[10px] font-bold text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"
                                        title="Cancel start with zero consequence within 10 seconds"
                                      >
                                        <Undo2 className="mr-1 h-3 w-3" />
                                        <span>
                                          Undo ({undoSecondsRemaining}s)
                                        </span>
                                      </Button>
                                    ) : (
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={sessionActionLoading}
                                        onClick={handleRestartSession}
                                        className="border-border text-muted-foreground hover:text-foreground hover:bg-muted h-8 rounded-xl px-2.5 text-[10px] font-black uppercase tracking-wider"
                                        title="Cancels current session and restarts a fresh timer"
                                      >
                                        <RotateCcw className="mr-1 h-3 w-3" />
                                        <span>Restart</span>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            // State 3: PAUSED
                            const pausedAtMs = new Date(
                              activeSession.paused_at!
                            ).getTime();
                            const frozenNetSec = Math.max(
                              0,
                              Math.floor((pausedAtMs - startedMs) / 1000) -
                                activeSession.total_paused_seconds
                            );
                            const pauseElapsedSec = Math.max(
                              0,
                              Math.floor((nowTime - pausedAtMs) / 1000)
                            );
                            const cumulativePausedSec =
                              activeSession.total_paused_seconds +
                              pauseElapsedSec;

                            return (
                              <div className="mt-4 rounded-2xl border-2 border-amber-500 bg-amber-500/15 p-3.5 shadow-md">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-lg border-2 border-amber-600 bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-[0_2px_0_0_#b45309]">
                                      <Pause className="h-3 w-3 fill-current" />
                                      PAUSED
                                    </span>
                                    <span className="font-mono text-xs font-black text-amber-700 dark:text-amber-300">
                                      (Frozen: {formatTimer(frozenNetSec)})
                                    </span>
                                  </div>

                                  <div className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                    Break: {formatTimer(cumulativePausedSec)} /
                                    05:00 max
                                  </div>
                                </div>

                                <p className="mt-1.5 text-[10px] text-amber-800/80 dark:text-amber-200/80 font-medium">
                                  Exclusivity lock active. Paused time does not count toward reward minimums.
                                </p>

                                <div className="mt-3 flex items-center justify-between gap-2 border-t border-amber-500/30 pt-2.5">
                                  {/* Resume Button */}
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="success"
                                    disabled={sessionActionLoading}
                                    onClick={handleResumeSession}
                                    className="h-8 rounded-xl px-4 text-[10px] font-black uppercase tracking-wider shadow-[0_2px_0_0_#15803d]"
                                  >
                                    <Play className="mr-1 h-3 w-3 fill-current" />
                                    <span>Resume Focus</span>
                                  </Button>

                                  {/* Restart Button */}
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={sessionActionLoading}
                                    onClick={handleRestartSession}
                                    className="border-amber-600/30 text-muted-foreground hover:text-foreground h-8 rounded-xl px-3 text-[10px] font-black uppercase tracking-wider"
                                    title="Cancels paused session and starts a fresh one"
                                  >
                                    <RotateCcw className="mr-1 h-3 w-3" />
                                    <span>Restart</span>
                                  </Button>
                                </div>
                              </div>
                            );
                          })()}
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="border-border/60 mt-6 flex items-center justify-between border-t pt-4">
                        <div className="text-muted-foreground flex items-center gap-2 font-mono text-[11px] font-bold">
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
                            className="text-muted-foreground focus-visible:ring-primary flex h-11 min-h-[44px] w-11 min-w-[44px] cursor-pointer items-center justify-center rounded-2xl transition-colors hover:bg-rose-500/10 hover:text-rose-600 focus-visible:ring-2 focus-visible:outline-none active:scale-95"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>

                          {/* 3D Tactile Complete Button */}
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleCompleteQuest(quest)}
                            className="h-10 min-h-[44px] gap-1.5 rounded-2xl px-5 text-xs font-black tracking-wider uppercase"
                          >
                            <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                            <span>Complete</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )
      ) : completedQuests.length === 0 ? (
        /* Empty Completed State */
        <Card className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center">
          <BlobCharacter blobId="mascot" size="md" state="idle" />
          <CardTitle className="mt-4 text-xl font-heading font-black">
            No Quests Completed Yet
          </CardTitle>
          <CardDescription className="font-body mt-1.5 max-w-md text-xs leading-relaxed">
            Pip is standing by to celebrate your victories! Mark your first active quest complete to see it logged in your adventure history.
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
              <ElementIcon name="sword" size={20} className="h-5 w-5" />
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Difficulty Tier</Label>
                <div className="flex items-center gap-2 font-mono text-xs font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    ~{rewardPreview.xp} XP
                  </span>
                  <span>•</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    ~{rewardPreview.currency} Gold
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
                  const tierInfo = REWARD_TIERS[diff];
                  return (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      key={diff}
                      onClick={() => setValue("difficulty", diff)}
                      className={`font-heading focus-visible:ring-primary flex min-h-[52px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-2 text-center transition-all focus-visible:ring-2 focus-visible:outline-none ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary shadow-[0_3px_0_0_#7c3aed]"
                          : "border-border/80 bg-card hover:bg-secondary/60 text-muted-foreground"
                      }`}
                    >
                      <span className="text-xs font-black uppercase">{diff}</span>
                      <span className="text-[10px] font-medium opacity-80">
                        {tierInfo.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="font-body text-xs text-muted-foreground italic">
                {rewardPreview.description}
              </p>
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
