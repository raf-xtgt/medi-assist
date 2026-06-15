import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Sign In", template: "%s | medi-assist" },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-brand-blue-light)] px-4 py-12">
      {children}
    </div>
  );
}
