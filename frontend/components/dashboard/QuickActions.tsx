import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickAction {
  label:    string;
  icon:     LucideIcon;
  href?:    string;
  onClick?: () => void;
  accent?:  "blue" | "teal";
}

interface QuickActionsProps {
  actions:    QuickAction[];
  className?: string;
}

const accentBtn = {
  blue: "bg-[var(--color-brand-blue-light)] text-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue)] hover:text-white",
  teal: "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal)] hover:text-white",
};

export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div
      role="group"
      aria-label="Quick actions"
      className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}
    >
      {actions.map((action) => {
        const Icon   = action.icon;
        const accent = action.accent ?? "blue";
        return (
          <Button
            key={action.label}
            variant="ghost"
            asChild={!!action.href}
            onClick={action.onClick}
            className={cn(
              "flex h-auto flex-col items-center gap-2 rounded-xl px-3 py-4 text-xs font-medium transition-colors",
              accentBtn[accent]
            )}
          >
            {action.href ? (
              <a href={action.href}>
                <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                {action.label}
              </a>
            ) : (
              <>
                <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                {action.label}
              </>
            )}
          </Button>
        );
      })}
    </div>
  );
}
