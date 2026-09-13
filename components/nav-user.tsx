"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronsUpDown,
  LogOut,
  User,
  Sword,
  Coins,
  Settings,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export interface NavUserData {
  name: string;
  email: string;
  avatar: string;
  level?: number;
  rank?: string;
}

export function NavUser({ user }: { user: NavUserData }) {
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={isCollapsed ? user.name : undefined}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-xl transition-colors hover:bg-secondary/70"
            >
              <Avatar className="h-8 w-8 rounded-xl border border-violet-500/30">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-xl bg-violet-600 font-heading font-black text-white text-xs">
                  {initials || "AV"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-heading font-bold text-foreground">
                  {user.name}
                </span>
                <span className="truncate text-xs font-semibold text-muted-foreground">
                  {user.rank || (user.level ? `Level ${user.level} Adventurer` : user.email)}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-2xl border-2 border-border/80 bg-popover p-1.5 shadow-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm">
                <Avatar className="h-9 w-9 rounded-xl border border-violet-500/30">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-xl bg-violet-600 font-heading font-black text-white text-xs">
                    {initials || "AV"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-heading font-bold text-foreground">
                    {user.name}
                  </span>
                  <span className="truncate text-xs font-semibold text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2.5 px-2 py-1.5 font-heading text-xs font-bold cursor-pointer rounded-lg hover:bg-secondary transition-colors"
                >
                  <User className="h-4 w-4 text-violet-500" />
                  <span>Adventurer Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/quests"
                  className="flex items-center gap-2.5 px-2 py-1.5 font-heading text-xs font-bold cursor-pointer rounded-lg hover:bg-secondary transition-colors"
                >
                  <Sword className="h-4 w-4 text-emerald-500" />
                  <span>Quest Journal</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/shop"
                  className="flex items-center gap-2.5 px-2 py-1.5 font-heading text-xs font-bold cursor-pointer rounded-lg hover:bg-secondary transition-colors"
                >
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span>Gold & Armory</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2.5 px-2 py-1.5 font-heading text-xs font-bold cursor-pointer rounded-lg hover:bg-secondary transition-colors"
                >
                  <Settings className="h-4 w-4 text-cyan-500" />
                  <span>Game Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action="/auth/signout" method="POST" className="w-full">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 px-2 py-1.5 font-heading text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
