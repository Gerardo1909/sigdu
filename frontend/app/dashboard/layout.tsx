"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRole } from "@/lib/types";
import {
  BookOpen,
  BarChart2,
  Users,
  Settings,
  Building2,
  Layers,
  LogOut,
  ClipboardList,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case "alumno":
      return [
        { label: "Mis Inscripciones", href: "/dashboard/student", icon: <BookOpen className="w-4 h-4" /> },
        { label: "Catálogo", href: "/catalog", icon: <Layers className="w-4 h-4" /> },
      ];
    case "profesor":
      return [
        { label: "Mis Clases", href: "/dashboard/professor", icon: <BookOpen className="w-4 h-4" /> },
      ];
    case "admin":
    case "super_admin":
      return [
        { label: "Disciplinas", href: "/dashboard/admin/disciplines", icon: <Layers className="w-4 h-4" /> },
        { label: "Sedes", href: "/dashboard/admin/venues", icon: <Building2 className="w-4 h-4" /> },
        { label: "Usuarios", href: "/dashboard/admin/users", icon: <Users className="w-4 h-4" /> },
        { label: "Configuración", href: "/dashboard/admin/institution", icon: <Settings className="w-4 h-4" /> },
        { label: "Analytics", href: "/dashboard/analytics", icon: <BarChart2 className="w-4 h-4" /> },
      ];
    case "directivo":
      return [
        { label: "Analytics", href: "/dashboard/analytics", icon: <BarChart2 className="w-4 h-4" /> },
        { label: "Reportes", href: "/dashboard/analytics", icon: <ClipboardList className="w-4 h-4" /> },
      ];
    default:
      return [];
  }
}

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrador",
  directivo: "Directivo",
  profesor: "Profesor",
  alumno: "Alumno",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Proteger la ruta: si no hay token, redirigir al login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Mostrar spinner mientras verifica auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex">
        <aside className="w-64 bg-[#1A1A2E] flex flex-col gap-4 p-6">
          <Skeleton className="h-8 w-24 bg-white/10" />
          <div className="space-y-2 mt-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-full bg-white/10" />
            ))}
          </div>
        </aside>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Verificando sesión...</p>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // El useEffect redirigirá
  }

  const navItems = getNavItems(user.role);
  const initials = user.full_name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A1A2E] flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            SIG<span className="text-[#6B8EAE]">DU</span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#6B8EAE]/20 text-[#6B8EAE]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-[#6B8EAE]" : "text-white/40"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer del sidebar: usuario + logout */}
        <div className="border-t border-white/10 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 bg-[#6B8EAE]/30">
              <AvatarFallback className="bg-[#6B8EAE]/30 text-[#6B8EAE] text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.full_name}
              </p>
              <Badge
                variant="outline"
                className="text-xs border-white/20 text-white/40 px-1.5 py-0"
              >
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-white/50 hover:text-white hover:bg-white/10 gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#1F2937]">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user.email}</span>
            <Badge
              variant="secondary"
              className="bg-[#6B8EAE]/10 text-[#6B8EAE] border-[#6B8EAE]/30"
            >
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 py-8 text-[#1F2937]">{children}</main>
      </div>
    </div>
  );
}
