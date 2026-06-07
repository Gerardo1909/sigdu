import Link from "next/link";
import { Activity, Users, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#6B8EAE] rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SIGDU</span>
            <Badge variant="secondary" className="text-xs">
              UNSAM
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/catalog"
              className="px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Ver Actividades
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm bg-[#6B8EAE] hover:bg-[#5a7d9d] text-white rounded-md transition-colors font-medium"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <Badge className="mb-6 bg-[#6B8EAE]/20 text-[#6B8EAE] border-[#6B8EAE]/30 hover:bg-[#6B8EAE]/20">
          Universidad Nacional de San Martín
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none">
          SIGDU
        </h1>
        <p className="text-xl md:text-2xl text-white/60 mb-4 font-light">
          Inteligencia Deportiva para tu Universidad
        </p>
        <p className="text-base text-white/40 mb-10 max-w-2xl mx-auto">
          Gestión de inscripciones, asistencia y analytics deportivo en una sola
          plataforma.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center px-8 h-12 text-base bg-[#6B8EAE] hover:bg-[#5a7d9d] text-white rounded-md transition-colors font-medium"
          >
            Ver Actividades
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 h-12 text-base border border-white/20 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-white/10 rounded-xl p-6 bg-white/5">
            <Users className="w-8 h-8 text-[#6B8EAE] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Gestión de Alumnos</h3>
            <p className="text-white/50 text-sm">
              Inscripciones a actividades deportivas con validación de cupo en
              tiempo real.
            </p>
          </div>
          <div className="border border-white/10 rounded-xl p-6 bg-white/5">
            <Activity className="w-8 h-8 text-[#6B8EAE] mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Control de Asistencia
            </h3>
            <p className="text-white/50 text-sm">
              Registro de asistencia por clase con resumen de presentes y
              porcentaje.
            </p>
          </div>
          <div className="border border-white/10 rounded-xl p-6 bg-white/5">
            <BarChart3 className="w-8 h-8 text-[#6B8EAE] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics Ejecutivo</h3>
            <p className="text-white/50 text-sm">
              Dashboard con KPIs, gráficos y exportación a Excel para
              directivos.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 mt-16">
        <div className="max-w-7xl mx-auto text-center text-white/30 text-sm">
          SIGDU © 2026 — Universidad Nacional de San Martín
        </div>
      </footer>
    </main>
  );
}
