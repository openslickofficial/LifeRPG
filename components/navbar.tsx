"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppLogo } from "@/components/ElementIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

/** Brand mark — `public/app_logo.png`. */
export function AsteriskLogo({ className = "h-5 w-5" }: { className?: string }) {
  return <AppLogo className={className} alt="Revel" />;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState<{
    id: string;
    email?: string | null;
    user_metadata?: { username?: string; avatar_url?: string };
  } | null>(null);

  React.useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Dashboard layout has its own dedicated Sidebar and SiteHeader
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  const username =
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "Adventurer";
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
  const initials = username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navLinks = [
    { label: "Home", href: "/", targetId: "top" },
    { label: "Features", href: "/#features", targetId: "features" },
    { label: "Cinematic", href: "/#cinematic", targetId: "cinematic" },
    { label: "Companions", href: "/#companions", targetId: "companions" },
    { label: "Pricing", href: "/pricing" },
  ];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: { label: string; href: string; targetId?: string }
  ) => {
    setMobileMenuOpen(false);

    if (link.label === "Home") {
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (window.location.hash) {
          window.history.pushState(null, "", "/");
        }
      }
      return;
    }

    if (link.targetId) {
      if (pathname === "/") {
        e.preventDefault();
        const element = document.getElementById(link.targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `/#${link.targetId}`);
        }
      } else {
        e.preventDefault();
        router.push(link.href);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F5F1EB] dark:bg-[#0A0A0F] border-b border-slate-900/[0.08] dark:border-white/[0.06] text-slate-900 dark:text-white transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 sm:px-8">
        {/* Left: Simple logo mark + wordmark in new heading font */}
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              if (window.location.hash) {
                window.history.pushState(null, "", "/");
              }
            }
          }}
          className="flex items-center gap-2.5 text-slate-900 dark:text-white transition-opacity hover:opacity-90"
          aria-label="Revel Home"
        >
          <AsteriskLogo className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Revel
          </span>
        </Link>

        {/* Center: Nav links — plain white/gray text, subtle hover color shift using primary accent */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Theme Toggle + auth state */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle className="h-8 w-8 rounded-lg border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] hover:border-emerald-500/40" />

          {user ? (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/5 transition-colors hover:bg-emerald-500/10"
              aria-label="Open dashboard"
            >
              <Avatar className="h-8 w-8 border border-emerald-500/30 bg-emerald-500/10">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback className="bg-emerald-600 text-[10px] font-black text-white">
                  {initials || "AV"}
                </AvatarFallback>
              </Avatar>
              {/* <span className="hidden text-sm font-semibold text-slate-700 dark:text-slate-200 sm:inline">
                {username}
              </span> */}
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-slate-900 dark:hover:text-white"
              >
                Login
              </Link>

              <Link href="/login">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs px-4 py-2 shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer"
                >
                  Start Your Quest
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-900/[0.08] dark:border-white/[0.06] bg-[#F5F1EB] dark:bg-[#0A0A0F] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-slate-900/[0.08] dark:border-white/[0.06] pt-3">
              <div className="flex items-center gap-3">
                <ThemeToggle className="h-8 w-8 rounded-lg border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] hover:border-emerald-500/40" />

                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push("/dashboard");
                    }}
                    className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 p-1"
                    aria-label="Open dashboard"
                  >
                    <Avatar className="h-8 w-8 border border-emerald-500/30 bg-emerald-500/10">
                      <AvatarImage src={avatarUrl} alt={username} />
                      <AvatarFallback className="bg-emerald-600 text-[10px] font-black text-white">
                        {initials || "AV"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  >
                    Login
                  </Link>
                )}
              </div>

              {!user && (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs px-4 py-1.5"
                  >
                    Start Your Quest
                  </button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
