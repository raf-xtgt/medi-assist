"use client";

import { useSessionContext } from "@/providers/SessionProvider";

export function useSession() {
  const { session, isLoading, signOut } = useSessionContext();
  return { session, user: session?.user ?? null, isLoading, signOut };
}
