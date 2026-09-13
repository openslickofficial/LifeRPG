import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { OfflineBanner } from "@/components/OfflineBanner";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userData = undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, level, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    const username =
      profile?.username ||
      user.user_metadata?.username ||
      user.email?.split("@")[0] ||
      "Adventurer";

    userData = {
      name: username,
      email: user.email || "adventurer@revel.app",
      avatar:
        profile?.avatar_url ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      level: profile?.level ?? 14,
      rank: `Level ${profile?.level ?? 14} Adventurer`,
    };
  }

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Offline Connectivity Banner */}
      <OfflineBanner />

      {/* Canonical shadcn dashboard-01 AppSidebar */}
      <AppSidebar user={userData} />

      {/* Main Content Inset with SiteHeader & Page Content */}
      <SidebarInset className="min-w-0 bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        {/* Full shadcn dashboard-01 SiteHeader */}
        <SiteHeader />

        {/* Page Content Container (Untouched) */}
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 md:py-8 md:pb-12">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
