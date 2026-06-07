"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const { login, redirectByRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      toast.success(`Bienvenido, ${user.full_name}`);
      redirectByRole(user.role);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Orbes decorativos */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-[#6B8EAE]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-[#6B8EAE]/[8%] rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-4xl font-bold tracking-widest text-white">
              SIG<span className="text-[#6B8EAE]">DU</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-white/40">
            Sistema de Gestión Deportiva Universitaria
          </p>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-sm text-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-white">Iniciar sesión</CardTitle>
            <CardDescription className="text-white/50">
              Ingresá con tu cuenta institucional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@unsam.edu.ar"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-[#6B8EAE]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-[#6B8EAE]"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#6B8EAE] hover:bg-[#5a7a9c] text-white font-semibold"
              >
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>

            <div className="mt-4 flex flex-col gap-2 text-sm text-center">
              <Link
                href="/forgot-password"
                className="text-white/50 hover:text-[#6B8EAE] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
              <span className="text-white/30">
                ¿No tenés cuenta?{" "}
                <Link
                  href="/register"
                  className="text-[#6B8EAE] hover:underline"
                >
                  Registrate
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
