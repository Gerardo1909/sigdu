"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ClassSession, EnrolledStudent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Users,
  CalendarDays,
} from "lucide-react";

interface AttendanceRecord {
  user_id: string;
  present: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function AttendancePage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [session, setSession] = useState<ClassSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Map<string, boolean>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sessions = await api.get<ClassSession[]>("/api/v1/classes/today");
      const found = sessions.find((s) => s.id === classId);
      if (!found) {
        setError("No se encontró la clase solicitada.");
        return;
      }
      setSession(found);
      // Inicializar todos como presentes
      const initialMap = new Map<string, boolean>();
      found.enrolled_students.forEach((s) => {
        initialMap.set(s.user_id, true);
      });
      setAttendance(initialMap);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar la clase");
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const toggleStudent = (userId: string) => {
    setAttendance((prev) => {
      const next = new Map(prev);
      next.set(userId, !next.get(userId));
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!session) return;
    setIsSubmitting(true);

    const records: AttendanceRecord[] = session.enrolled_students.map((s) => ({
      user_id: s.user_id,
      present: attendance.get(s.user_id) ?? false,
    }));

    const presentCount = records.filter((r) => r.present).length;
    const total = records.length;

    try {
      await api.post("/api/v1/attendance/bulk", {
        class_session_id: session.id,
        records,
      });
      toast.success(
        `Asistencia guardada: ${presentCount}/${total} presentes`
      );
      router.push("/dashboard/professor");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar";
      toast.error(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const presentCount = Array.from(attendance.values()).filter(Boolean).length;
  const total = session?.enrolled_students.length ?? 0;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard/professor")}
        className="gap-2 text-gray-500 hover:text-gray-700 -ml-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mis clases
      </Button>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-5 w-1/3" />
          <div className="space-y-2 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <h3 className="text-lg font-semibold text-gray-700">Error</h3>
          <p className="text-sm text-gray-500 max-w-sm">{error}</p>
          <Button variant="outline" onClick={fetchSession}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && session && (
        <>
          {/* Session info */}
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">
              Tomar Asistencia
            </h2>
            <p className="text-lg text-gray-600 mt-1 font-medium">
              {session.activity_name}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-[#6B8EAE]" />
                {formatDate(session.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#6B8EAE]" />
                {total} alumno{total !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Summary bar */}
          <div className="flex items-center gap-4 p-4 bg-[#6B8EAE]/10 rounded-lg border border-[#6B8EAE]/20">
            <span className="text-sm font-medium text-[#6B8EAE]">
              Presentes: {presentCount} / {total}
            </span>
            <span className="text-sm text-gray-500">
              Ausentes: {total - presentCount}
            </span>
          </div>

          {/* Student list */}
          {session.enrolled_students.length === 0 ? (
            <Card className="border border-gray-200">
              <CardContent className="py-12 text-center text-gray-400">
                No hay alumnos inscriptos en esta clase.
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Lista de alumnos
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-gray-100 p-0">
                {session.enrolled_students.map((student: EnrolledStudent) => {
                  const isPresent = attendance.get(student.user_id) ?? false;
                  return (
                    <div
                      key={student.user_id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#1F2937]">
                          {student.full_name}
                        </p>
                        <p className="text-xs text-gray-400">{student.email}</p>
                      </div>
                      <button
                        onClick={() => toggleStudent(student.user_id)}
                        className="flex items-center gap-2 focus:outline-none"
                        aria-label={`Marcar ${student.full_name} como ${isPresent ? "ausente" : "presente"}`}
                      >
                        <Badge
                          className={`gap-1.5 cursor-pointer select-none transition-colors ${
                            isPresent
                              ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                              : "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Presente
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Ausente
                            </>
                          )}
                        </Badge>
                      </button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/professor")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || session.enrolled_students.length === 0}
              className="bg-[#6B8EAE] hover:bg-[#5a7a9a] text-white min-w-[160px]"
            >
              {isSubmitting ? "Guardando..." : "Confirmar asistencia"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
