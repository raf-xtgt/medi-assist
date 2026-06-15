import { cn } from "@/lib/utils";

interface PageShellProps {
  children:    React.ReactNode;
  className?:  string;
  maxWidth?:   "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const maxWidthMap = {
  sm:   "max-w-2xl",
  md:   "max-w-4xl",
  lg:   "max-w-5xl",
  xl:   "max-w-6xl",
  "2xl":"max-w-7xl",
  full: "max-w-none",
};

export function PageShell({ children, className, maxWidth = "2xl" }: PageShellProps) {
  return (
    <main
      className={cn(
        "h-full overflow-y-auto px-4 py-6 md:px-6 lg:px-8",
        className
      )}
    >
      <div className={cn("mx-auto w-full", maxWidthMap[maxWidth])}>
        {children}
      </div>
    </main>
  );
}
