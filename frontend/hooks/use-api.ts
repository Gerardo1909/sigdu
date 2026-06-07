"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(path: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    api
      .get<T>(path)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error desconocido");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [path, trigger]);

  const refetch = useCallback(() => {
    setTrigger((n) => n + 1);
  }, []);

  return { data, isLoading, error, refetch };
}
