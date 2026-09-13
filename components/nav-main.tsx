"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export interface NavMainItem {
  title: string;
  url: string;
  icon: React.ReactNode;
  badge?: string;
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1">
        {/* Main Hub Menu Items */}
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.url !== "/dashboard" && pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={`transition-all duration-75 rounded-xl ${
                    isActive
                      ? "bg-secondary text-primary font-bold shadow-2xs"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground font-semibold"
                  }`}
                >
                  <Link
                    href={item.url}
                    onClick={() => isMobile && setOpenMobile(false)}
                    className="flex items-center gap-3 w-full"
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <span className="font-heading text-xs tracking-wide truncate">
                        {item.title}
                      </span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="ml-auto rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-violet-600 dark:text-violet-400">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
