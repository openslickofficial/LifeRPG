"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sword,
  Zap,
  ShoppingBag,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Quests",
    href: "/dashboard/quests",
    icon: Sword,
  },
  {
    label: "Attributes",
    href: "/dashboard/attributes",
    icon: Zap,
  },
  {
    label: "Shop",
    href: "/dashboard/shop",
    icon: ShoppingBag,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP SLIM SIDEBAR (Left fixed, icon-only with active pill)           */}
      {/* ========================================================================= */}
      <aside
        aria-label="Sidebar Navigation"
        className="border-border/70 bg-card/90 fixed top-0 bottom-0 left-0 z-40 hidden w-20 flex-col items-center justify-between border-r py-6 backdrop-blur-xl md:flex"
      >
        {/* Top: Brand Logo */}
        <div className="flex flex-col items-center gap-6">
          <Link
            href="/dashboard"
            aria-label="Life RPG Home"
            className="group focus-visible:ring-primary relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-violet-500/25 transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:outline-none active:scale-95"
          >
            <div className="bg-background/20 flex h-full w-full items-center justify-center rounded-[14px] text-white backdrop-blur-xs">
              <Shield className="h-6 w-6" />
            </div>

            {/* Logo Tooltip */}
            <span
              role="tooltip"
              className="border-border/80 bg-popover font-heading text-popover-foreground shadow-elevated pointer-events-none absolute left-16 z-50 -translate-x-2 rounded-xl border px-3 py-1.5 text-xs font-bold whitespace-nowrap opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            >
              Life RPG Dashboard
            </span>
          </Link>

          {/* Nav List */}
          <nav
            aria-label="Main Navigation"
            className="flex flex-col items-center gap-3"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`group focus-visible:ring-primary relative flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-2xl transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none ${
                    isActive
                      ? "shadow-brand bg-gradient-to-tr from-violet-600 to-indigo-600 text-white"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground active:scale-95"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />

                  {/* Accessible Hover/Focus Tooltip */}
                  <span
                    role="tooltip"
                    className="border-border/80 bg-popover font-heading text-popover-foreground shadow-elevated pointer-events-none absolute left-16 z-50 -translate-x-2 rounded-xl border px-3 py-1.5 text-xs font-bold whitespace-nowrap opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Controls: Theme Toggle & Sign Out */}
        <div className="flex flex-col items-center gap-3">
          <ThemeToggle />

          {/* Quick Sign Out Action */}
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              aria-label="Sign Out"
              title="Sign Out"
              className="group text-muted-foreground relative flex h-11 min-h-[44px] w-11 min-w-[44px] cursor-pointer items-center justify-center rounded-2xl transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none active:scale-95 dark:hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span
                role="tooltip"
                className="border-border/80 bg-popover font-heading text-popover-foreground shadow-elevated pointer-events-none absolute left-16 z-50 -translate-x-2 rounded-xl border px-3 py-1.5 text-xs font-bold whitespace-nowrap opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
              >
                Sign Out
              </span>
            </button>
          </form>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM NAVIGATION (Fixed bottom tab bar for mobile viewports)   */}
      {/* ========================================================================= */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="border-border/70 bg-card/95 fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around border-t px-1 py-1 backdrop-blur-xl md:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`focus-visible:ring-primary flex min-h-[44px] min-w-[44px] flex-col items-center justify-center rounded-xl px-2 py-1 text-[10px] font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:outline-none ${
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="font-heading tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
