"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      // If user is super admin, let them through
      if (user?.isSuperAdmin) {
        setIsCheckingRole(false);
        return;
      }

      // Check if user ONLY has RESIDENT or EMPLOYEE roles
      // A user with NO memberships yet can still use the web app to join/create an association
      if (user?.memberships && user.memberships.length > 0) {
        const hasAdminRole = user.memberships.some(m => m.role === "ASSOCIATION_ADMIN" || m.role === "SUPER_ADMIN");
        
        if (!hasAdminRole) {
          // If they only have RESIDENT/EMPLOYEE roles, block web access
          router.replace("/download-app");
          return;
        }
      }

      setIsCheckingRole(false);
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  if (isLoading || isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}
