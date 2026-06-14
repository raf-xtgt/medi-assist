import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  collapsed?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 18, text: "text-base", wrap: "gap-2" },
  md: { icon: 22, text: "text-lg",   wrap: "gap-2.5" },
  lg: { icon: 28, text: "text-2xl",  wrap: "gap-3" },
};

export function Logo({ href = "/", size = "md", collapsed = false, className }: LogoProps) {
  const { icon, text, wrap } = sizeMap[size];

  const content = (
    <span className={cn("flex items-center", wrap, className)}>
      <span
        className="flex items-center justify-center rounded-lg bg-[var(--primary)] text-white shrink-0"
        style={{ width: icon + 10, height: icon + 10 }}
      >
        <Activity size={icon} strokeWidth={2.5} />
      </span>
      {!collapsed && (
        <span className={cn("font-semibold tracking-tight text-foreground", text)}>
          medi<span className="text-[var(--primary)]">assist</span>
        </span>
      )}
    </span>
  );

  return href ? (
    <Link href={href} className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-md">
      {content}
    </Link>
  ) : (
    content
  );
}
