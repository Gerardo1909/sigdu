"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { ActivityDetail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { MapPin, Clock, Users, GraduationCap, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function ActivityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    api
      .get<ActivityDetail>(`/api/v1/activities/${params.id}`)
      .then((data) => {
        setActivity(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Error al cargar la actividad");
        setIsLoading(false);
      });
  }, [params.id]);

  async function handleEnroll() {
    if (!isAuthenticated) {
      toast.info("Debés iniciar sesión para inscribirte");
      router.push("/login");
      return;
    }
    if (!activity || user?.role !== "alumno") {
      toast.error("Solo los alumnos pueden inscribirse");
      return;
    }
    setIsEnrolling(true);
    try {
      await api.post("/api/v1/enrollments", { activity_id: activity.id });
      toast.success(`¡Te inscribiste en ${activity.name}!`);
      router.push("/dashboard/student");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al inscribirse");
    } finally {
      setIsEnrolling(false);
    }
  }

  const available = activity
    ? activity.capacity - activity.enrolled_count
    : 0;
  const isFull = available <= 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0A0A0A]/90 backdrop-blur-sm z-10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          SIG<span className="text-[#6B8EAE]">DU</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/catalog"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Ver Actividades
          </Link>
          {user ? (
            <Link href="/dashboard">
              <span className="text-sm text-white/70 hover:text-white transition-colors">
                {user.full_name}
              </span>
            </Link>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white/80 hover:bg-white/10 bg-transparent"
              >
                Iniciar Sesión
              </Button>
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-white/40 mb-8">
          <Link href="/catalog" className="hover:text-white/70 transition-colors">
            Catálogo
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span className="text-white/70">{activity?.name ?? "Actividad"}</span>
          )}
        </nav>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <div className="space-y-3 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-5 w-1/2" />
              ))}
            </div>
          </div>
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setIsLoading(true);
              setError(null);
              api
                .get<ActivityDetail>(`/api/v1/activities/${params.id}`)
                .then((data) => { setActivity(data); setIsLoading(false); })
                .catch((err: unknown) => {
                  setError(err instanceof Error ? err.message : "Error");
                  setIsLoading(false);
                });
            }}
          />
        ) : activity ? (
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <h1 className="text-3xl font-bold text-white">{activity.name}</h1>
                <Badge
                  variant={isFull ? "destructive" : "secondary"}
                  className={
                    isFull
                      ? "bg-red-500/20 text-red-400 border-red-400/30 text-sm px-3 py-1"
                      : "bg-green-500/20 text-green-400 border-green-400/30 text-sm px-3 py-1"
                  }
                >
                  {isFull ? "Cupo lleno" : `${available} lugares disponibles`}
                </Badge>
              </div>
              <Badge
                variant="outline"
                className="border-[#6B8EAE]/40 text-[#6B8EAE]"
              >
                {activity.discipline}
              </Badge>
            </div>

            {/* Detalles */}
            <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/10">
              <DetailRow icon={<MapPin className="w-4 h-4" />} label="Sede">
                {activity.venue}
              </DetailRow>
              <DetailRow icon={<Clock className="w-4 h-4" />} label="Horario">
                {activity.schedule_description}
              </DetailRow>
              <DetailRow icon={<Users className="w-4 h-4" />} label="Capacidad">
                {activity.enrolled_count} inscritos de {activity.capacity} cupos
              </DetailRow>
              {activity.professor_name && (
                <DetailRow
                  icon={<GraduationCap className="w-4 h-4" />}
                  label="Profesor/a"
                >
                  {activity.professor_name}
                </DetailRow>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleEnroll}
                disabled={isFull || isEnrolling}
                className="bg-[#6B8EAE] hover:bg-[#5a7a9c] text-white font-semibold px-8 disabled:opacity-50"
              >
                {isEnrolling ? "Inscribiendo..." : isFull ? "Sin cupos disponibles" : "Inscribirme"}
              </Button>
              <Link href="/catalog">
                <Button
                  variant="outline"
                  className="border-white/20 text-white/70 hover:bg-white/10 bg-transparent"
                >
                  Volver al catálogo
                </Button>
              </Link>
            </div>

            {!isAuthenticated && !isFull && (
              <p className="text-sm text-white/40">
                Necesitás{" "}
                <Link href="/login" className="text-[#6B8EAE] hover:underline">
                  iniciar sesión
                </Link>{" "}
                para inscribirte.
              </p>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <span className="text-[#6B8EAE] mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-col sm:flex-row sm:gap-6 min-w-0">
        <span className="text-white/40 text-sm w-24 shrink-0">{label}</span>
        <span className="text-white/90 text-sm">{children}</span>
      </div>
    </div>
  );
}
