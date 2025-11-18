"use client";

import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to signin
      if (!isAuthenticated) {
        router.push("/signin");
        return;
      }

      // Authenticated but not authorized for this role
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect based on user role
        if (user.role === UserRole.ADMIN) {
          router.push("/");
        } else {
          router.push("/dashboard");
        }
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Not authorized for this role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
