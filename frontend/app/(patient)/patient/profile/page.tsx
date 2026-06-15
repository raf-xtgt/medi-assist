import type { Metadata } from "next";
import { Bell, ChevronRight, HelpCircle, LogOut, Shield, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Profile" };

const menuItems = [
  { icon: User,       label: "Personal Information", desc: "Name, DOB, contact" },
  { icon: Bell,       label: "Notifications",        desc: "Alerts and reminders" },
  { icon: Shield,     label: "Privacy & Security",   desc: "Password, data access" },
  { icon: HelpCircle, label: "Help & Support",       desc: "FAQs and contact" },
];

export default function PatientProfilePage() {
  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>

        {/* Avatar block */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <Avatar className="size-20">
            <AvatarFallback className="bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] text-2xl font-semibold">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground">Jane Doe</p>
            <p className="text-sm text-muted-foreground">Patient · medi-assist</p>
          </div>
        </div>

        {/* Menu */}
        <Card className="shadow-none border-border/60">
          <CardContent className="p-0">
            <ul role="list">
              {menuItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    {i > 0 && <Separator />}
                    <button className="flex w-full items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors text-left">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)]"
                        aria-hidden="true"
                      >
                        <Icon size={17} strokeWidth={1.8} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 py-3 text-sm font-medium text-destructive hover:bg-red-50 transition-colors">
          <LogOut size={16} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );
}
