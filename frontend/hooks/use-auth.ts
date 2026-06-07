"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getToken, setToken, removeToken } from "@/lib/auth";
import type { User, UserRole, TokenResponse } from "@/lib/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Al montar, verificar si hay un token y cargar el usuario
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    api
      .get<User>("/api/v1/auth/me")
      .then((user) => {
        setState({ user, isLoading: false, isAuthenticated: true });
      })
      .catch(() => {
        removeToken();
        setState({ user: null, isLoading: false, isAuthenticated: false });
      });
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const data = await api.post<TokenResponse>("/api/v1/auth/login", {
        email,
        password,
      });

      setToken(data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      setState({
        user: data.user,
        isLoading: false,
        isAuthenticated: true,
      });

      return data.user;
    },
    []
  );

  const logout = useCallback(() => {
    removeToken();
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.push("/");
  }, [router]);

  const redirectByRole = useCallback(
    (role: UserRole) => {
      switch (role) {
        case "alumno":
          router.push("/dashboard/student");
          break;
        case "profesor":
          router.push("/dashboard/professor");
          break;
        case "admin":
        case "super_admin":
          router.push("/dashboard/admin");
          break;
        case "directivo":
          router.push("/dashboard/analytics");
          break;
        default:
          router.push("/dashboard");
      }
    },
    [router]
  );

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login,
    logout,
    redirectByRole,
  };
}
