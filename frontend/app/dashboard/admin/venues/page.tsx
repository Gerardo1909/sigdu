"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Venue } from "@/lib/types";
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

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCapacity, setFormCapacity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchVenues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<Venue[]>("/api/v1/admin/venues");
      setVenues(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar sedes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    const capacityNum = formCapacity ? parseInt(formCapacity, 10) : undefined;
    if (formCapacity && (isNaN(capacityNum!) || capacityNum! <= 0)) {
      toast.error("La capacidad debe ser un número positivo");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/api/v1/admin/venues", {
        name: formName.trim(),
        address: formAddress.trim() || null,
        capacity: capacityNum ?? null,
      });
      toast.success("Sede creada correctamente");
      setDialogOpen(false);
      setFormName("");
      setFormAddress("");
      setFormCapacity("");
      await fetchVenues();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la sede "${name}"?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/v1/admin/venues/${id}`);
      toast.success(`Sede "${name}" eliminada`);
      await fetchVenues();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const openDialog = () => {
    setFormName("");
    setFormAddress("");
    setFormCapacity("");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Sedes</h2>
          <p className="text-sm text-gray-500 mt-1">
            Administrá las sedes donde se realizan las actividades
          </p>
        </div>
        <Button
          onClick={openDialog}
          className="bg-[#6B8EAE] hover:bg-[#5a7a9a] text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Sede
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
          <Button variant="outline" onClick={fetchVenues}>
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
                <TableHead className="font-semibold text-gray-600">Dirección</TableHead>
                <TableHead className="font-semibold text-gray-600">Capacidad</TableHead>
                <TableHead className="w-24 text-right font-semibold text-gray-600">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-gray-400">
                    No hay sedes registradas. Creá la primera.
                  </TableCell>
                </TableRow>
              ) : (
                venues.map((v) => (
                  <TableRow key={v.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-[#1F2937]">{v.name}</TableCell>
                    <TableCell className="text-gray-500">{v.address || "—"}</TableCell>
                    <TableCell className="text-gray-500">
                      {v.capacity != null ? v.capacity : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === v.id}
                        onClick={() => handleDelete(v.id, v.name)}
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
            <DialogTitle>Nueva Sede</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="venue-name">Nombre *</Label>
              <Input
                id="venue-name"
                placeholder="Ej: Campus Principal"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="venue-address">Dirección</Label>
              <Input
                id="venue-address"
                placeholder="Ej: Av. Constituyentes 3450"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="venue-capacity">Capacidad</Label>
              <Input
                id="venue-capacity"
                type="number"
                placeholder="Ej: 50"
                min={1}
                value={formCapacity}
                onChange={(e) => setFormCapacity(e.target.value)}
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
