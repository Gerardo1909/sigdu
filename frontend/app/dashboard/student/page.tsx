"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Enrollment, MyEnrollmentsResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CalendarDays, Layers, SearchX, AlertTriangle } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  cancelled: "Cancelada",
  pending: "Pendiente",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StudentDashboardPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<MyEnrollmentsResponse>("/api/v1/enrollments/me");
      setEnrollments(data.enrollments);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar inscripciones");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Mis Inscripciones</h2>
          <p className="text-sm text-gray-500 mt-1">
            Actividades en las que estás inscripto/a
          </p>
        </div>
        <Link href="/catalog">
          <Button className="bg-[#6B8EAE] hover:bg-[#5a7a9a] text-white gap-2">
            <Layers className="w-4 h-4" />
            Explorar actividades
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
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
          <Button variant="outline" onClick={fetchEnrollments}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && enrollments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <SearchX className="w-12 h-12 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-500">
            Todavía no tenés inscripciones
          </h3>
          <p className="text-sm text-gray-400 max-w-sm">
            Explorá el catálogo de actividades y anotate en las que te interesen.
          </p>
          <Link href="/catalog">
            <Button className="bg-[#6B8EAE] hover:bg-[#5a7a9a] text-white mt-2">
              Ver catálogo
            </Button>
          </Link>
        </div>
      )}

      {/* Enrollments grid */}
      {!isLoading && !error && enrollments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((enrollment) => (
            <Card
              key={enrollment.id}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold text-[#1F2937] leading-snug">
                    {enrollment.activity_name}
                  </CardTitle>
                  <Badge
                    className={`shrink-0 text-xs border ${
                      STATUS_COLORS[enrollment.status] ??
                      "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {STATUS_LABELS[enrollment.status] ?? enrollment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <BookOpen className="w-4 h-4 text-[#6B8EAE]" />
                  <span>Actividad inscripta</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDays className="w-4 h-4 text-[#6B8EAE]" />
                  <span>Desde {formatDate(enrollment.enrolled_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
