import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Ocurrió un error al cargar los datos.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <AlertTriangle className="w-12 h-12 text-red-400" />
      <h3 className="text-lg font-semibold text-white/70">Error</h3>
      <p className="text-sm text-white/40 max-w-sm">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="mt-2 border-white/20 text-white/70 hover:bg-white/10"
        >
          Reintentar
        </Button>
      )}
    </div>
  );
}
