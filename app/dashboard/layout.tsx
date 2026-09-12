import * as React from "react";
import { Sidebar } from "@/components/Sidebar";
import { OfflineBanner } from "@/components/OfflineBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground selection:bg-primary/20 selection:text-primary relative min-h-screen">
      {/* Offline Connectivity Banner */}
      <OfflineBanner />

      {/* Slim Icon-Only Desktop Sidebar + Mobile Bottom Tab Bar */}
      <Sidebar />

      {/* Main Content Container */}
      <div className="flex-1 transition-all duration-200 md:pl-20">
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 pb-24 sm:px-6 md:py-8 md:pb-12">
          {children}
        </div>
      </div>
    </div>
  );
}
