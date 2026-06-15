"use client";

import { usePathname } from "next/navigation";
import { PatientBottomNav } from "@/components/layout/PatientBottomNav";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Routes that take over the full viewport and manage their own chrome.
 * On these routes the shared header and bottom nav are hidden.
 */
const CHROME_FREE_ROUTES = ["/patient/triage", "/patient/landing"];

export function PatientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const chromeFree = CHROME_FREE_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  if (chromeFree) {
    return (
      <div data-role="patient" className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div data-role="patient" className="flex min-h-screen flex-col bg-background">
      {/* Minimal sticky header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur-sm">
        <Logo size="sm" href="/patient/home" />
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9"
          aria-label="Notifications"
        >
          <Bell size={18} aria-hidden="true" />
          <Badge
            className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center p-0 text-[10px]"
            aria-label="2 unread notifications"
          >
            2
          </Badge>
        </Button>
      </header>

      {/* Scrollable content padded for bottom nav */}
      <main className="flex-1 overflow-y-auto pb-[76px]">
        {children}
      </main>

      <PatientBottomNav />
    </div>
  );
}
