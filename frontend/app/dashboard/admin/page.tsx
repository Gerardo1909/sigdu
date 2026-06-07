import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Building2, Users, Settings } from "lucide-react";

const NAV_CARDS = [
  {
    title: "Disciplinas",
    description: "Creá y administrá las disciplinas deportivas del sistema.",
    href: "/dashboard/admin/disciplines",
    icon: Layers,
    color: "text-[#6B8EAE]",
    bg: "bg-[#6B8EAE]/10",
  },
  {
    title: "Sedes",
    description: "Gestioná las sedes y espacios físicos disponibles.",
    href: "/dashboard/admin/venues",
    icon: Building2,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Usuarios",
    description: "Visualizá y modificá los roles de los usuarios registrados.",
    href: "/dashboard/admin/users",
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Configuración",
    description: "Ajustá los datos generales de la institución.",
    href: "/dashboard/admin/institution",
    icon: Settings,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1F2937]">Panel de Administración</h2>
        <p className="text-sm text-gray-500 mt-1">
          Gestioná todos los aspectos del sistema desde este panel
        </p>
      </div>

      {/* Nav cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {NAV_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-[#6B8EAE]/30 cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <CardTitle className="text-base font-semibold text-[#1F2937]">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-500">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
