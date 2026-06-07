"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type {
  ActivityListItem,
  Discipline,
  Venue,
  PaginatedResponse,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { MapPin, Clock, Users } from "lucide-react";

export default function CatalogPage() {
  const { user } = useAuth();

  const [activities, setActivities] = useState<ActivityListItem[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [selectedVenue, setSelectedVenue] = useState<string>("all");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar filtros (disciplinas y sedes) al montar
  useEffect(() => {
    Promise.all([
      api.get<Discipline[]>("/api/v1/disciplines"),
      api.get<Venue[]>("/api/v1/venues"),
    ])
      .then(([disc, ven]) => {
        setDisciplines(disc);
        setVenues(ven);
      })
      .catch(() => {
        // Filtros no críticos — continuar sin ellos
      });
  }, []);

  const fetchActivities = useCallback(() => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (selectedDiscipline !== "all") params.set("discipline", selectedDiscipline);
    if (selectedVenue !== "all") params.set("venue", selectedVenue);
    params.set("limit", "50");

    api
      .get<PaginatedResponse<ActivityListItem>>(
        `/api/v1/activities?${params.toString()}`
      )
      .then((res) => {
        setActivities(res.items);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Error al cargar actividades");
        setIsLoading(false);
      });
  }, [selectedDiscipline, selectedVenue]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

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
            className="text-sm font-medium text-[#6B8EAE] border-b border-[#6B8EAE] pb-0.5"
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

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Catálogo de Actividades
          </h1>
          <p className="mt-1 text-white/50">
            Explorá todas las actividades deportivas disponibles en UNSAM
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="min-w-[200px]">
            <Select
              value={selectedDiscipline}
              onValueChange={(v) => setSelectedDiscipline(v ?? "all")}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Disciplina" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/20 text-white">
                <SelectItem value="all">Todas las disciplinas</SelectItem>
                {disciplines.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[200px]">
            <Select value={selectedVenue} onValueChange={(v) => setSelectedVenue(v ?? "all")}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Sede" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/20 text-white">
                <SelectItem value="all">Todas las sedes</SelectItem>
                {venues.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(selectedDiscipline !== "all" || selectedVenue !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDiscipline("all");
                setSelectedVenue("all");
              }}
              className="text-white/50 hover:text-white hover:bg-white/10"
            >
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Contenido */}
        {isLoading ? (
          <LoadingState count={6} variant="cards" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchActivities} />
        ) : activities.length === 0 ? (
          <EmptyState
            title="No hay actividades"
            description="No hay actividades disponibles con los filtros seleccionados."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => {
              const available = activity.capacity - activity.enrolled_count;
              const isFull = available <= 0;
              return (
                <Link key={activity.id} href={`/catalog/${activity.id}`}>
                  <div className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:border-[#6B8EAE]/50 hover:bg-white/8 transition-all cursor-pointer h-full flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white group-hover:text-[#6B8EAE] transition-colors leading-snug">
                        {activity.name}
                      </h3>
                      <Badge
                        variant={isFull ? "destructive" : "secondary"}
                        className={
                          isFull
                            ? "bg-red-500/20 text-red-400 border-red-400/30 shrink-0"
                            : "bg-green-500/20 text-green-400 border-green-400/30 shrink-0"
                        }
                      >
                        {isFull ? "Cupo lleno" : `${available} lugares`}
                      </Badge>
                    </div>

                    <Badge
                      variant="outline"
                      className="self-start border-[#6B8EAE]/40 text-[#6B8EAE] text-xs"
                    >
                      {activity.discipline}
                    </Badge>

                    <div className="flex flex-col gap-1.5 text-sm text-white/50 mt-auto">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {activity.venue}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        {activity.schedule_description}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        {activity.enrolled_count}/{activity.capacity} inscritos
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
