"use client";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href:  string;
  icon:  React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard",    href: "/doctor/dashboard",    icon: LayoutDashboard },
  { label: "Appointments", href: "/doctor/appointments", icon: CalendarCheck },
  { label: "Patients",     href: "/doctor/patients",     icon: Users },
  { label: "Notes",        href: "/doctor/notes",        icon: ClipboardList },
];

interface DoctorSidebarProps {
  className?: string;
  onClose?:   () => void;
}

export function DoctorSidebar({ className, onClose }: DoctorSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      data-role="doctor"
      className={cn(
        "flex h-full w-56 shrink-0 flex-col border-r border-border bg-background",
        className
      )}
      aria-label="Doctor navigation"
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <Logo href="/doctor/dashboard" size="md" />
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8"
            onClick={onClose}
            aria-label="Close navigation"
          >
            ×
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Doctor navigation">
        <TooltipProvider delayDuration={0}>
          <ul role="list" className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const Icon     = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex min-h-[42px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)]"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                        {item.label}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </TooltipProvider>
      </nav>

      {/* Bottom separator */}
      <Separator />
      <div className="p-3">
        <p className="text-[11px] text-muted-foreground text-center">Doctor Portal</p>
      </div>
    </aside>
  );
}
