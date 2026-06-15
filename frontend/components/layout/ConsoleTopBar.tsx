"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronDown, LogOut, Search, Settings, User, Wifi } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from "@/hooks/useSession";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ConsoleTopBarProps {
  breadcrumb?: { label: string; href?: string }[];
  className?: string;
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const date = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="hidden md:flex flex-col items-end leading-tight">
      <span className="text-xs font-mono font-semibold text-foreground tabular-nums">{time}</span>
      <span className="text-[10px] text-muted-foreground">{date}</span>
    </div>
  );
}

export function ConsoleTopBar({ breadcrumb, className }: ConsoleTopBarProps) {
  const { user, signOut } = useSession();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm gap-3",
        className
      )}
    >
      {/* Left: breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="shrink-0">
          <ol className="flex items-center gap-1.5 text-sm">
            {breadcrumb.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-muted-foreground/50" aria-hidden="true">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Centre: universal search */}
      <div className="relative flex-1 max-w-xs mx-auto">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
        <Input
          className="pl-8 h-8 text-sm bg-muted/50 border-border/50 placeholder:text-muted-foreground/70 focus-visible:bg-background"
          placeholder="Search patients, doctors, appointments…"
          aria-label="Universal search"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* System status */}
        <div className="hidden lg:flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 rounded-md px-2 py-1">
          <Wifi size={12} className="text-emerald-600" aria-hidden="true" />
          <span className="text-[11px] font-medium text-emerald-700">All Systems Operational</span>
        </div>

        <LiveClock />

        {/* Notifications */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative size-9" aria-label="Notifications">
                <Bell size={17} aria-hidden="true" />
                <Badge className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center p-0 text-[10px]" aria-label="3 unread notifications">
                  3
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-9" aria-label="User menu">
                <Avatar className="size-7">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="text-xs bg-[var(--accent)] text-[var(--accent-foreground)]">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:block">{user.name}</span>
                <ChevronDown size={14} className="text-muted-foreground" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile"><User size={14} data-icon="inline-start" aria-hidden="true" />Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings"><Settings size={14} data-icon="inline-start" aria-hidden="true" />Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => signOut()}>
                <LogOut size={14} data-icon="inline-start" aria-hidden="true" />Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
