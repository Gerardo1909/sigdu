"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;

    switch (user.role) {
      case "alumno":
        router.replace("/dashboard/student");
        break;
      case "profesor":
        router.replace("/dashboard/professor");
        break;
      case "admin":
      case "super_admin":
        router.replace("/dashboard/admin");
        break;
      case "directivo":
        router.replace("/dashboard/analytics");
        break;
      default:
        router.replace("/dashboard/student");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center h-48">
      <p className="text-gray-400 text-sm">Redirigiendo...</p>
    </div>
  );
}
