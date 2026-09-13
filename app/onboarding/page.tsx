"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { GroupBlobImage } from "@/components/GroupBlobImage";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setError("Username can only contain letters, numbers, and underscores.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Upsert profile username to handle both fresh accounts and pre-existing trigger accounts
      const { error: updateError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          username: cleanUsername,
          avatar_url: user.user_metadata?.avatar_url || null,
        },
        { onConflict: "id" }
      );

      if (updateError) {
        if (updateError.code === "23505") {
          setError("That username is already claimed by another adventurer.");
        } else if (
          updateError.message?.toLowerCase().includes("schema cache") ||
          updateError.message?.toLowerCase().includes("does not exist")
        ) {
          setError(
            "Supabase database tables not found. Please run supabase/full_schema.sql in your Supabase project's SQL Editor to initialize the database."
          );
        } else {
          setError(updateError.message);
        }
        setLoading(false);
        return;
      }

      // Ensure starter attributes exist
      const defaultAttributes = [
        "Strength",
        "Intellect",
        "Discipline",
        "Creativity",
      ];
      const attrInserts = defaultAttributes.map((name) => ({
        profile_id: user.id,
        name,
        level: 1,
        current_xp: 0,
      }));
      await supabase
        .from("attributes")
        .upsert(attrInserts, { onConflict: "profile_id,name" });

      // Ensure starter streak row exists
      await supabase.from("streaks").upsert(
        {
          profile_id: user.id,
          current_streak: 0,
          longest_streak: 0,
        },
        { onConflict: "profile_id" }
      );

      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save username";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-border/80 bg-card/95 shadow-elevated rounded-3xl border p-0 backdrop-blur-xl">
          <CardHeader className="space-y-3 p-8 pb-4 text-center">
            {/* Hero Welcome Group Shot */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative h-32 w-56 sm:h-36 sm:w-64">
                <GroupBlobImage
                  src="/blobs/blobs-waving-hand.png"
                  alt="Your companions welcoming you"
                  fill
                  priority
                  sizes="(max-width: 640px) 224px, 256px"
                  className="filter drop-shadow-md"
                  fallbackTitle="Your companions can't wait to meet you"
                />
              </div>
            </div>

            <div>
              <CardTitle className="font-heading text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome to Revel! Your companions can&apos;t wait to meet you.
              </CardTitle>
              <CardDescription className="font-body text-muted-foreground mt-2 text-sm leading-relaxed">
                Claim your call sign below to connect your identity and begin your adventure together.
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 p-8 pt-4">
              {error && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="font-heading text-muted-foreground text-xs font-semibold tracking-wider uppercase"
                >
                  Adventurer Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. shadow_blade"
                    maxLength={20}
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20 h-12 w-full rounded-2xl border-2 px-4 font-mono text-sm transition-all outline-none focus:ring-2"
                  />
                  <span className="text-muted-foreground absolute top-3.5 right-3.5 font-mono text-xs font-bold">
                    {username.length}/20
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-border/60 bg-muted/20 flex flex-col gap-3 border-t p-6">
              <Button
                type="submit"
                variant="success"
                size="lg"
                disabled={loading || !username.trim()}
                className="h-13 w-full rounded-2xl text-sm font-black tracking-wider uppercase"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Inscribing Call Sign...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span>Enter Character Realm</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
