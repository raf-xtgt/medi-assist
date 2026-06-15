import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title:      string;
  value:      string | number;
  subtitle?:  string;
  icon:       LucideIcon;
  trend?:     { value: number; label: string };
  accent?:    "blue" | "teal" | "success" | "warning" | "danger";
  className?: string;
}

const accentMap = {
  blue:    "bg-[var(--color-brand-blue-light)] text-[var(--color-brand-blue)]",
  teal:    "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)]",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger:  "bg-red-50 text-red-600",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "blue",
  className,
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <Card className={cn("shadow-none border-border/60", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs font-medium",
                  isPositive ? "text-emerald-600" : "text-red-500"
                )}
              >
                {isPositive ? (
                  <TrendingUp size={12} aria-hidden="true" />
                ) : (
                  <TrendingDown size={12} aria-hidden="true" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {trend.value}% {trend.label}
                </span>
              </div>
            )}
          </div>

          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg p-2.5",
              accentMap[accent]
            )}
            aria-hidden="true"
          >
            <Icon size={20} strokeWidth={1.8} />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
