"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Sword,
  Zap,
  ShoppingBag,
  Settings,
  Shield,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain, type NavMainItem } from "@/components/nav-main";
import { NavSecondary, type NavSecondaryItem } from "@/components/nav-secondary";
import { NavUser, type NavUserData } from "@/components/nav-user";

const defaultNavMain: NavMainItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Quests",
    url: "/dashboard/quests",
    icon: Sword,
    badge: "Active",
  },
  {
    title: "Attributes",
    url: "/dashboard/attributes",
    icon: Zap,
  },
  {
    title: "Shop",
    url: "/dashboard/shop",
    icon: ShoppingBag,
    badge: "Armory",
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

const defaultNavSecondary: NavSecondaryItem[] = [
  {
    title: "How to Play",
    url: "/onboarding",
    icon: BookOpen,
  },
  {
    title: "Game Guide",
    url: "/#features",
    icon: HelpCircle,
  },
];

const defaultUser: NavUserData = {
  name: "Alex Vanguard",
  email: "adventurer@revel.app",
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexVanguard",
  level: 14,
  rank: "Solo Adventurer • Tier 1",
};

export function AppSidebar({
  user = defaultUser,
  ...props
}: {
  user?: NavUserData;
} & React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* 1. Brand Header */}
      <SidebarHeader className="border-border/60 border-b p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5 hover:bg-secondary/60 rounded-xl transition-colors"
            >
              <Link
                href="/dashboard"
                onClick={() => isMobile && setOpenMobile(false)}
                className="flex items-center gap-3"
              >
                {/* 3D Shield Emblem */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-violet-500/25">
                  <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-background/20 text-white backdrop-blur-xs">
                    <Shield className="h-5 w-5" />
                  </div>
                </div>

                {/* Brand Titles */}
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-heading text-base font-black tracking-tight text-foreground">
                      Revel
                    </span>
                    <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.2 font-mono text-[9px] font-black uppercase text-violet-600 dark:text-violet-400">
                      v1.0
                    </span>
                  </div>
                  <span className="truncate text-xs font-semibold text-muted-foreground">
                    Gamified Real Life
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 2. Main Navigation & Widgets */}
      <SidebarContent>
        <NavMain items={defaultNavMain} />

        {/* Secondary Navigation */}
        <NavSecondary items={defaultNavSecondary} className="mt-auto" />
      </SidebarContent>

      {/* 3. Footer: Canonical NavUser dropdown */}
      <SidebarFooter className="border-border/60 border-t p-2">
        <NavUser user={user} />
      </SidebarFooter>

      {/* 4. Rail for mouse hover / drag collapse */}
      <SidebarRail />
    </Sidebar>
  );
}

export { AppSidebar as Sidebar };
