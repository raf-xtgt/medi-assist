import type { Metadata } from "next";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { TopBar } from "@/components/layout/TopBar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin | medi-assist" },
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
        <TopBar
          breadcrumb={[
            { label: "Admin", href: "/admin/dashboard" },
          ]}
        />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
