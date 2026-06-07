"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { UserAdmin, PaginatedUsers, UserRole } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, ChevronDown } from "lucide-react";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "alumno", label: "Alumno" },
  { value: "profesor", label: "Profesor" },
  { value: "directivo", label: "Directivo" },
  { value: "admin", label: "Admin" },
];

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  directivo: "Directivo",
  profesor: "Profesor",
  alumno: "Alumno",
};

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "bg-purple-100 text-purple-700 border-purple-200",
  admin: "bg-blue-100 text-blue-700 border-blue-200",
  directivo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  profesor: "bg-amber-100 text-amber-700 border-amber-200",
  alumno: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<PaginatedUsers>("/api/v1/admin/users?page=1&limit=50");
      setUsers(data.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole, userName: string) => {
    setChangingRoleId(userId);
    try {
      await api.patch(`/api/v1/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Rol de ${userName} actualizado a ${ROLE_LABELS[newRole]}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar rol");
    } finally {
      setChangingRoleId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1F2937]">Usuarios</h2>
        <p className="text-sm text-gray-500 mt-1">
          Gestioná los usuarios registrados en el sistema (mostrando primeros 50)
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <p className="text-sm text-gray-500">{error}</p>
          <Button variant="outline" onClick={fetchUsers}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-600">Nombre</TableHead>
                <TableHead className="font-semibold text-gray-600">Email</TableHead>
                <TableHead className="font-semibold text-gray-600">Rol</TableHead>
                <TableHead className="font-semibold text-gray-600">Estado</TableHead>
                <TableHead className="w-40 text-right font-semibold text-gray-600">
                  Cambiar Rol
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                    No hay usuarios registrados.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-[#1F2937]">
                      {u.full_name}
                    </TableCell>
                    <TableCell className="text-gray-500">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs border ${ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {ROLE_LABELS[u.role] ?? u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs border ${
                          u.is_active
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }`}
                      >
                        {u.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={changingRoleId === u.id}
                          className="inline-flex items-center gap-1 h-7 px-2 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {changingRoleId === u.id ? "Guardando..." : "Cambiar rol"}
                          <ChevronDown className="w-3 h-3" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel className="text-xs text-gray-500">
                            Seleccionar rol
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {ROLE_OPTIONS.map((opt) => (
                            <DropdownMenuItem
                              key={opt.value}
                              disabled={u.role === opt.value}
                              onClick={() =>
                                handleRoleChange(u.id, opt.value, u.full_name)
                              }
                              className={
                                u.role === opt.value
                                  ? "text-gray-300 cursor-default"
                                  : "cursor-pointer"
                              }
                            >
                              {opt.label}
                              {u.role === opt.value && (
                                <span className="ml-auto text-xs text-gray-400">
                                  actual
                                </span>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
