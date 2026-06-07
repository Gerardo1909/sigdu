import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "Sin resultados",
  description = "No hay actividades disponibles con los filtros seleccionados.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <SearchX className="w-12 h-12 text-white/30" />
      <h3 className="text-lg font-semibold text-white/70">{title}</h3>
      <p className="text-sm text-white/40 max-w-sm">{description}</p>
    </div>
  );
}
