"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import type { UserRole } from "@/lib/auth/types";
import { roleHome } from "@/lib/auth/guards";
import { PageLoader } from "@/components/shared/LoadingSpinner";

interface RoleGuardProps {
  allowedRole:  UserRole;
  children:     React.ReactNode;
}

/**
 * Client-side role guard. Redirects if the user is not authenticated
 * or does not have the required role.
 *
 * Middleware covers server-side protection; this component adds a
 * second layer for client-navigated transitions.
 */
export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const router               = useRouter();
  const { user, isLoading }  = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== allowedRole) {
      router.replace(roleHome(user.role as UserRole));
    }
  }, [user, isLoading, allowedRole, router]);

  if (isLoading) return <PageLoader />;
  if (!user || user.role !== allowedRole) return <PageLoader />;

  return <>{children}</>;
}
