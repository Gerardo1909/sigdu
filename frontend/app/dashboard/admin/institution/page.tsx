"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { InstitutionConfig } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Save } from "lucide-react";

export default function InstitutionPage() {
  const [config, setConfig] = useState<InstitutionConfig>({
    name: "",
    logo_url: null,
    contact_email: null,
    contact_phone: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<InstitutionConfig>("/api/v1/admin/institution");
      setConfig(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar configuración");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.name.trim()) {
      toast.error("El nombre de la institución es obligatorio");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put<InstitutionConfig>("/api/v1/admin/institution", {
        name: config.name.trim(),
        logo_url: config.logo_url || null,
        contact_email: config.contact_email || null,
        contact_phone: config.contact_phone || null,
      });
      toast.success("Configuración guardada correctamente");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1F2937]">Configuración de la Institución</h2>
        <p className="text-sm text-gray-500 mt-1">
          Datos generales de la institución en el sistema
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <p className="text-sm text-gray-500">{error}</p>
          <Button variant="outline" onClick={fetchConfig}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Form */}
      {!isLoading && !error && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-700">
              Datos de la institución
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="inst-name">Nombre de la institución *</Label>
                <Input
                  id="inst-name"
                  placeholder="Ej: UNSAM"
                  value={config.name}
                  onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inst-email">Email de contacto</Label>
                <Input
                  id="inst-email"
                  type="email"
                  placeholder="Ej: deportes@unsam.edu.ar"
                  value={config.contact_email ?? ""}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      contact_email: e.target.value || null,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inst-phone">Teléfono de contacto</Label>
                <Input
                  id="inst-phone"
                  type="tel"
                  placeholder="Ej: +54 11 4580-7000"
                  value={config.contact_phone ?? ""}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      contact_phone: e.target.value || null,
                    }))
                  }
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#6B8EAE] hover:bg-[#5a7a9a] text-white gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
