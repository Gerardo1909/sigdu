"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ClassSession } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CalendarDays, Users, ClipboardList, AlertTriangle, SearchX } from "lucide-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ProfessorDashboardPage() {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<ClassSession[]>("/api/v1/classes/today");
      setSessions(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar clases");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Mis Clases de Hoy</h2>
          <p className="text-sm text-gray-500 mt-1">
            Clases asignadas para el día de hoy
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarDays className="w-4 h-4" />
          <span>
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-9 w-full mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <h3 className="text-lg font-semibold text-gray-700">Error al cargar</h3>
          <p className="text-sm text-gray-500 max-w-sm">{error}</p>
          <Button variant="outline" onClick={fetchSessions}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <SearchX className="w-12 h-12 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-500">
            No tenés clases asignadas para hoy
          </h3>
          <p className="text-sm text-gray-400 max-w-sm">
            Cuando tengas clases programadas para hoy, aparecerán aquí.
          </p>
        </div>
      )}

      {/* Classes grid */}
      {!isLoading && !error && sessions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-[#1F2937] leading-snug">
                  {session.activity_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDays className="w-4 h-4 text-[#6B8EAE]" />
                  <span>{formatDate(session.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4 text-[#6B8EAE]" />
                  <span>
                    {session.enrolled_students.length} alumno
                    {session.enrolled_students.length !== 1 ? "s" : ""} inscripto
                    {session.enrolled_students.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <Link href={`/dashboard/professor/attendance/${session.id}`}>
                  <Button
                    className="w-full mt-1 bg-[#6B8EAE] hover:bg-[#5a7a9a] text-white gap-2"
                    size="sm"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Tomar Asistencia
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
