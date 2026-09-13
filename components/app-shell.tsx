'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';

const PUBLIC_NAVBAR_PATHS = new Set(['/', '/pricing']);
const HIDE_NAVBAR_PATHS = ['/login', '/onboarding'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isHiddenRoute = HIDE_NAVBAR_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const shouldShowNavbar =
    !isHiddenRoute &&
    PUBLIC_NAVBAR_PATHS.has(pathname) &&
    !pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/auth');

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
    </>
  );
}
