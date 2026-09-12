import Link from "next/link";
import { ArrowLeft, User, Shield } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="border-border/60 flex items-center justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              Settings & Account Management
            </h1>
            <Badge variant="brand">PREFERENCES</Badge>
          </div>
          <p className="font-body text-muted-foreground mt-1 text-xs sm:text-sm">
            Configure character settings, notification rules, and theme
            preferences.
          </p>
        </div>

        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Profile Details</CardTitle>
              <CardDescription className="text-xs">
                Update display handle and avatar icon
              </CardDescription>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="font-heading text-muted-foreground text-xs font-semibold uppercase">
                Account Status
              </label>
              <p className="text-foreground mt-1 font-mono text-sm font-bold">
                Active Adventurer · Level 1+
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Security & Privacy</CardTitle>
              <CardDescription className="text-xs">
                Manage OAuth connections and Row Level Security
              </CardDescription>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="font-heading text-muted-foreground text-xs font-semibold uppercase">
                Authentication Method
              </label>
              <p className="font-body text-foreground mt-1 text-sm font-semibold">
                Supabase OAuth (Google / GitHub)
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
