"use client";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label:    string;
  href:     string;
  icon:     React.ElementType;
}

const navGroups: { group: string; items: NavItem[] }[] = [
  {
    group: "Operations",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Users",     href: "/admin/users",     icon: Users },
      { label: "Clinics",   href: "/admin/clinics",   icon: Building2 },
    ],
  },
  {
    group: "Configuration",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname  = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      data-role="admin"
      className={cn(
        "relative flex h-full flex-col border-r border-border bg-[#0F1D2E] transition-all duration-200",
        collapsed ? "w-16" : "w-64",
        className
      )}
      aria-label="Admin navigation"
    >
      {/* Logo */}
      <div className={cn("flex h-14 shrink-0 items-center border-b border-white/10", collapsed ? "justify-center px-0" : "px-4")}>
        <Logo href="/admin/dashboard" size="md" collapsed={collapsed} />
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Sidebar navigation">
        <TooltipProvider delayDuration={0}>
          {navGroups.map((group, gi) => (
            <div key={group.group} className={cn(gi > 0 && "mt-4")}>
              {!collapsed && (
                <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  {group.group}
                </p>
              )}
              {collapsed && gi > 0 && (
                <Separator className="mx-auto mb-2 mt-2 w-8 bg-white/10" />
              )}
              <ul role="list" className="flex flex-col gap-0.5 px-2">
                {group.items.map((item) => {
                  const Icon      = item.icon;
                  const isActive  = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  const link = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex min-h-[38px] items-center gap-3 rounded-md px-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[var(--color-brand-blue)] text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white",
                        collapsed && "justify-center"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                      {!collapsed && item.label}
                    </Link>
                  );

                  return (
                    <li key={item.href}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </TooltipProvider>
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-white/10 p-2 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-white/50 hover:bg-white/10 hover:text-white"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={16} aria-hidden="true" />
          ) : (
            <ChevronLeft size={16} aria-hidden="true" />
          )}
        </Button>
      </div>
    </aside>
  );
}
