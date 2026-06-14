import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface ActivityItem {
  id:        string;
  icon:      LucideIcon;
  message:   string;
  timestamp: Date | string;
  accent?:   "blue" | "teal" | "success" | "warning" | "danger";
}

const dotMap: Record<string, string> = {
  blue:    "bg-[var(--color-brand-blue)]",
  teal:    "bg-[var(--color-brand-teal)]",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger:  "bg-red-500",
};

interface ActivityFeedProps {
  items:      ActivityItem[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <ul
      role="list"
      aria-label="Activity feed"
      className={cn("flex flex-col divide-y divide-border/50", className)}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const dot  = dotMap[item.accent ?? "blue"];
        return (
          <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className={cn(
                "mt-0.5 flex shrink-0 size-2 rounded-full",
                dot
              )}
              aria-hidden="true"
            />
            <span className="flex shrink-0 items-center justify-center size-7 rounded-md bg-muted text-muted-foreground">
              <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{item.message}</p>
              <time className="text-xs text-muted-foreground">
                {formatTime(item.timestamp)}
              </time>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
