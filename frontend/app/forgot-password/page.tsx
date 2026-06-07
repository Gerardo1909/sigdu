"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/api/v1/auth/forgot-password", { email });
    } catch {
      // Igualmente mostramos el mensaje genérico (no revelar si el email existe)
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
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
            <CardTitle className="text-xl text-white">
              Recuperar contraseña
            </CardTitle>
            <CardDescription className="text-white/50">
              Ingresá tu email para recibir instrucciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-[#6B8EAE]/20 flex items-center justify-center mx-auto">
                  <span className="text-2xl">📧</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  Si el email existe en el sistema, recibirá instrucciones.
                  Revise su email.
                </p>
                <Link
                  href="/login"
                  className="inline-block text-sm text-[#6B8EAE] hover:underline"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#6B8EAE] hover:bg-[#5a7a9c] text-white font-semibold"
                >
                  {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
                </Button>

                <p className="text-sm text-center text-white/40">
                  <Link
                    href="/login"
                    className="text-[#6B8EAE] hover:underline"
                  >
                    Volver al inicio de sesión
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
