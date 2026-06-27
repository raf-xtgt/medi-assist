"use client";

import { cn } from "@/lib/utils";
import { FileText, Home, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href:  string;
  icon:  React.ElementType;
  /** Additional paths that should activate this tab */
  activePaths?: string[];
}

const navItems: NavItem[] = [
  { label: "Home",    href: "/patient/home",    icon: Home },
  { label: "Records", href: "/patient/records", icon: FileText },
  { label: "Profile", href: "/patient/profile", icon: User },
];

export function PatientBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      data-role="patient"
      aria-label="Patient navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-[60px] items-center border-t border-border bg-background safe-area-inset-bottom"
    >
      <ul role="list" className="flex w-full items-center">
        {navItems.map((item) => {
          const Icon     = item.icon;
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (item.activePaths ?? []).some(
              (p) => pathname === p || pathname.startsWith(`${p}/`)
            );

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-[var(--color-brand-teal)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
