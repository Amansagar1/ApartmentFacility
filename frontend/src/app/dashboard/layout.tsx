"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/api/auth.api";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.getMe();
        setUser(res.data);
      } catch (error) {
        logout();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, router, setUser, setLoading, logout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}
