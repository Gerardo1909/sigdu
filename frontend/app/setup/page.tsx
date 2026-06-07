"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { SetupInstitutionPayload } from "@/lib/types";
import { CheckCircle2, ChevronRight, Building2, UserCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Step = 1 | 2;

interface FormData {
  name: string;
  slug: string;
  email_domains_raw: string;
  admin_email: string;
  admin_password: string;
  admin_full_name: string;
}

const initialForm: FormData = {
  name: "",
  slug: "",
  email_domains_raw: "",
  admin_email: "",
  admin_password: "",
  admin_full_name: "",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const update = (key: keyof FormData, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-populate slug when name changes (step 1)
      if (key === "name" && step === 1) {
        next.slug = slugify(value);
      }
      return next;
    });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!form.slug.trim()) {
      newErrors.slug = "El slug es obligatorio";
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      newErrors.slug = "Solo se permiten minúsculas, números y guiones";
    }
    if (!form.email_domains_raw.trim()) {
      newErrors.email_domains_raw = "Ingresá al menos un dominio";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.admin_full_name.trim()) {
      newErrors.admin_full_name = "El nombre completo es obligatorio";
    }
    if (!form.admin_email.trim()) {
      newErrors.admin_email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.admin_email)) {
      newErrors.admin_email = "Email inválido";
    }
    if (!form.admin_password) {
      newErrors.admin_password = "La contraseña es obligatoria";
    } else if (form.admin_password.length < 8) {
      newErrors.admin_password = "Mínimo 8 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setApiError(null);

    const payload: SetupInstitutionPayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      email_domains: form.email_domains_raw
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
      admin_email: form.admin_email.trim(),
      admin_password: form.admin_password,
      admin_full_name: form.admin_full_name.trim(),
    };

    try {
      const res = await fetch(`${API_URL}/api/v1/setup/institution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        setApiError("Esta institución ya existe.");
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Error desconocido" }));
        throw new Error(err.detail ?? "Error al crear la institución");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              ¡Institución creada!
            </h1>
            <p className="mt-2 text-white/60 text-sm leading-relaxed">
              Podés ingresar con tu cuenta de administrador y comenzar a
              configurar actividades, disciplinas y usuarios.
            </p>
          </div>
          <Button
            onClick={() => router.push("/login")}
            className="w-full bg-[#6B8EAE] hover:bg-[#5a7a9a] text-white"
          >
            Ir al login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12">
      {/* Brand */}
      <Link href="/" className="text-2xl font-bold text-white mb-10">
        SIG<span className="text-[#6B8EAE]">DU</span>
      </Link>

      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step >= 1
                  ? "bg-[#6B8EAE] text-white"
                  : "bg-white/10 text-white/40"
              }`}
            >
              {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
            </div>
            <span
              className={`text-sm font-medium ${
                step === 1 ? "text-white" : "text-white/40"
              }`}
            >
              Institución
            </span>
          </div>

          <div className="flex-1 h-px bg-white/10" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step >= 2
                  ? "bg-[#6B8EAE] text-white"
                  : "bg-white/10 text-white/40"
              }`}
            >
              2
            </div>
            <span
              className={`text-sm font-medium ${
                step === 2 ? "text-white" : "text-white/40"
              }`}
            >
              Administrador
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          {/* Step 1 */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#6B8EAE]" />
                <h2 className="text-lg font-semibold text-white">
                  Información de la institución
                </h2>
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="inst-name" className="text-white/70 text-sm">
                    Nombre de la institución *
                  </Label>
                  <Input
                    id="inst-name"
                    placeholder="Ej: Universidad Nacional de San Martín"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#6B8EAE]"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <Label htmlFor="inst-slug" className="text-white/70 text-sm">
                    Slug (identificador único) *
                  </Label>
                  <Input
                    id="inst-slug"
                    placeholder="Ej: unsam"
                    value={form.slug}
                    onChange={(e) => update("slug", e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#6B8EAE] font-mono text-sm"
                  />
                  <p className="text-xs text-white/30">
                    Solo minúsculas, números y guiones. Se auto-completa desde el nombre.
                  </p>
                  {errors.slug && (
                    <p className="text-xs text-red-400">{errors.slug}</p>
                  )}
                </div>

                {/* Email domains */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="inst-domains"
                    className="text-white/70 text-sm"
                  >
                    Dominios de email permitidos *
                  </Label>
                  <Input
                    id="inst-domains"
                    placeholder="unsam.edu.ar, estudiantes.unsam.edu.ar"
                    value={form.email_domains_raw}
                    onChange={(e) =>
                      update("email_domains_raw", e.target.value)
                    }
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#6B8EAE]"
                  />
                  <p className="text-xs text-white/30">
                    Separalos con comas. Solo usuarios con estos dominios podrán registrarse.
                  </p>
                  {errors.email_domains_raw && (
                    <p className="text-xs text-red-400">
                      {errors.email_domains_raw}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full bg-[#6B8EAE] hover:bg-[#5a7a9a] text-white gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-3">
                <UserCircle className="w-5 h-5 text-[#6B8EAE]" />
                <h2 className="text-lg font-semibold text-white">
                  Crear administrador inicial
                </h2>
              </div>

              <div className="space-y-5">
                {/* Full name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="admin-name"
                    className="text-white/70 text-sm"
                  >
                    Nombre completo *
                  </Label>
                  <Input
                    id="admin-name"
                    placeholder="Ej: María García"
                    value={form.admin_full_name}
                    onChange={(e) => update("admin_full_name", e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#6B8EAE]"
                  />
                  {errors.admin_full_name && (
                    <p className="text-xs text-red-400">
                      {errors.admin_full_name}
                    </p>
                  )}
                </div>

                {/* Admin email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="admin-email"
                    className="text-white/70 text-sm"
                  >
                    Email del administrador *
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@unsam.edu.ar"
                    value={form.admin_email}
                    onChange={(e) => update("admin_email", e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#6B8EAE]"
                  />
                  {errors.admin_email && (
                    <p className="text-xs text-red-400">{errors.admin_email}</p>
                  )}
                </div>

                {/* Admin password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="admin-password"
                    className="text-white/70 text-sm"
                  >
                    Contraseña *
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={form.admin_password}
                    onChange={(e) => update("admin_password", e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#6B8EAE]"
                  />
                  {errors.admin_password && (
                    <p className="text-xs text-red-400">
                      {errors.admin_password}
                    </p>
                  )}
                </div>
              </div>

              {apiError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                  <p className="text-sm text-red-400">{apiError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    setApiError(null);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 border-white/20 text-white/70 hover:bg-white/10 bg-transparent"
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#6B8EAE] hover:bg-[#5a7a9a] text-white"
                >
                  {isSubmitting ? "Creando..." : "Crear institución"}
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          ¿Ya tenés una cuenta?{" "}
          <Link
            href="/login"
            className="text-[#6B8EAE] hover:text-[#8BAFC8] transition-colors"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
