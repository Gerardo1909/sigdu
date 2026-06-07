"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
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

const ALLOWED_DOMAINS = [
  "unsam.edu.ar",
  "estudiantes.unsam.edu.ar",
  "demo.sigdu.com",
];

function isAllowedDomain(email: string): boolean {
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  return ALLOWED_DOMAINS.includes(parts[1].toLowerCase());
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validaciones en cliente
    if (!isAllowedDomain(email)) {
      setError(
        `El email debe pertenecer a uno de los dominios autorizados: ${ALLOWED_DOMAINS.join(", ")}`
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/api/v1/auth/register", {
        email,
        password,
        full_name: fullName,
      });
      toast.success("Cuenta creada exitosamente. Podés iniciar sesión.");
      router.push("/login");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al registrarse";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold tracking-tight text-white">
              SIG<span className="text-[#6B8EAE]">DU</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-white/40">
            Sistema de Gestión Deportiva Universitaria
          </p>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-sm text-white">
          <CardHeader>
            <CardTitle className="text-xl text-white">Crear cuenta</CardTitle>
            <CardDescription className="text-white/50">
              Registrate con tu email institucional UNSAM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-white/80">
                  Nombre completo
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Juan García"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-[#6B8EAE]"
                />
              </div>

              <div className="space-y-1">
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
                <p className="text-xs text-white/30">
                  Dominios permitidos: unsam.edu.ar, estudiantes.unsam.edu.ar
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-white/80">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-[#6B8EAE]"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-white/80">
                  Confirmar contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repetí la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isSubmitting ? "Registrando..." : "Crear cuenta"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-center text-white/40">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="text-[#6B8EAE] hover:underline">
                Iniciá sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
