"use client";

import * as React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export interface NavSecondaryItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export function NavSecondary({
  items,
  className,
  ...props
}: {
  items: NavSecondaryItem[];
  className?: string;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { isMobile, setOpenMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup className={className} {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  size="sm"
                  className="text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <Link
                    href={item.url}
                    onClick={() => isMobile && setOpenMobile(false)}
                    className="flex items-center gap-3 w-full"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && (
                      <span className="font-heading text-xs font-semibold truncate">
                        {item.title}
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
