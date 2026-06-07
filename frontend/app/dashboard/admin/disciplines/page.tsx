"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Discipline } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";

export default function DisciplinesPage() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDisciplines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<Discipline[]>("/api/v1/admin/disciplines");
      setDisciplines(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar disciplinas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisciplines();
  }, [fetchDisciplines]);

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/api/v1/admin/disciplines", {
        name: formName.trim(),
        description: formDescription.trim(),
      });
      toast.success("Disciplina creada correctamente");
      setDialogOpen(false);
      setFormName("");
      setFormDescription("");
      await fetchDisciplines();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al crear";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la disciplina "${name}"?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/v1/admin/disciplines/${id}`);
      toast.success(`Disciplina "${name}" eliminada`);
      await fetchDisciplines();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const openDialog = () => {
    setFormName("");
    setFormDescription("");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Disciplinas</h2>
          <p className="text-sm text-gray-500 mt-1">
            Administrá las disciplinas disponibles en el sistema
          </p>
        </div>
        <Button
          onClick={openDialog}
          className="bg-[#6B8EAE] hover:bg-[#5a7a9a] text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Disciplina
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <p className="text-sm text-gray-500">{error}</p>
          <Button variant="outline" onClick={fetchDisciplines}>
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
                <TableHead className="font-semibold text-gray-600">Descripción</TableHead>
                <TableHead className="w-24 text-right font-semibold text-gray-600">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disciplines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-gray-400">
                    No hay disciplinas registradas. Creá la primera.
                  </TableCell>
                </TableRow>
              ) : (
                disciplines.map((d) => (
                  <TableRow key={d.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-[#1F2937]">{d.name}</TableCell>
                    <TableCell className="text-gray-500">{d.description || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === d.id}
                        onClick={() => handleDelete(d.id, d.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Disciplina</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="disc-name">Nombre *</Label>
              <Input
                id="disc-name"
                placeholder="Ej: Natación"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="disc-desc">Descripción</Label>
              <Input
                id="disc-desc"
                placeholder="Descripción breve (opcional)"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="bg-[#6B8EAE] hover:bg-[#5a7a9a] text-white"
            >
              {isSubmitting ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
