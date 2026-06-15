"use client";

import { useSession } from "./useSession";
import type { UserRole } from "@/lib/auth/types";

export function useRole(): UserRole | null {
  const { user } = useSession();
  return user?.role ?? null;
}
