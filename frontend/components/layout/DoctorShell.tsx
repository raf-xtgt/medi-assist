"use client";

import { useState } from "react";
import { DoctorSidebar } from "@/components/layout/DoctorSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function DoctorShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div data-role="doctor" className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar — hidden on small screens */}
      <div className="hidden lg:flex lg:shrink-0">
        <DoctorSidebar />
      </div>

      {/* Mobile / tablet drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-56 p-0">
          <SheetTitle className="sr-only">Doctor Navigation</SheetTitle>
          <DoctorSidebar onClose={() => setOpen(false)} className="w-full border-r-0" />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          breadcrumb={[{ label: "Doctor", href: "/doctor/dashboard" }]}
        />

        {/* Mobile nav trigger row */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={18} aria-hidden="true" />
          </Button>
          <span className="text-sm font-medium text-muted-foreground">Doctor Portal</span>
        </div>

        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
