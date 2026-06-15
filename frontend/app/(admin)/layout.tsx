import type { Metadata } from "next";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { ConsoleTopBar } from "@/components/layout/ConsoleTopBar";

export const metadata: Metadata = {
  title: { default: "Admin Console", template: "%s | Admin | medi-assist" },
  description: "Medical practice operational console for administrators.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-role="admin"
      className="flex h-screen overflow-hidden bg-background"
    >
      {/* Persistent collapsible sidebar */}
      <AdminSidebar />

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ConsoleTopBar
          breadcrumb={[
            { label: "Admin Console", href: "/admin/dashboard" },
          ]}
        />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
