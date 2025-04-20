"use client";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else {
        // Redirect to role-specific dashboard
        switch (user.role) {
          case "admin":
            router.replace("/dashboard/admin/profile");
            break;
          case "creator":
            router.replace("/dashboard/creator/profile");
            break;
          case "user":
            router.replace("/dashboard/user/profile");
            break;
          default:
            router.replace("/");
        }
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}