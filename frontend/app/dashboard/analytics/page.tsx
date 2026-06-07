"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type {
  AnalyticsDashboardResponse,
  Discipline,
  AttendanceByActivity,
  EnrollmentByDiscipline,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState } from "@/components/shared/error-state";
import {
  Users,
  TrendingUp,
  Activity,
  BookOpen,
  Download,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const PIE_COLORS = [
  "#6B8EAE",
  "#4A7A9B",
  "#8BAFC8",
  "#3D6B8A",
  "#A3C4D8",
  "#2E5A7A",
  "#C0D8E8",
];

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  } catch {
    return dateStr;
  }
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

// KPI Card Skeleton
function KpiSkeleton() {
  return (
    <Card className="border border-gray-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Chart Skeleton
function ChartSkeleton() {
  return (
    <Card className="border border-gray-200">
      <CardContent className="pt-6">
        <Skeleton className="h-4 w-40 mb-6" />
        <Skeleton className="h-[300px] w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function KpiCard({ title, value, icon, color }: KpiCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-[#1F2937] leading-tight">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Custom tooltip for BarChart (attendance)
function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow text-sm">
        <p className="font-medium text-[#1F2937]">{label}</p>
        <p className="text-[#6B8EAE]">
          {payload[0].value.toFixed(1)}% asistencia
        </p>
      </div>
    );
  }
  return null;
}

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsDashboardResponse | null>(null);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load disciplines for filter
  useEffect(() => {
    api
      .get<Discipline[]>("/api/v1/disciplines")
      .then(setDisciplines)
      .catch(() => {
        // non-critical
      });
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedDiscipline !== "all") {
        params.set("discipline_id", selectedDiscipline);
      }
      const path = `/api/v1/analytics/dashboard${params.toString() ? `?${params.toString()}` : ""}`;
      const result = await api.get<AnalyticsDashboardResponse>(path);
      setData(result);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al cargar analytics"
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedDiscipline]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (selectedDiscipline !== "all") {
        params.set("discipline_id", selectedDiscipline);
      }
      const url = `${API_URL}/api/v1/analytics/export${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
          "X-Tenant-ID": "unsam",
        },
      });
      if (!response.ok) {
        throw new Error("Error al exportar");
      }
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = "sigdu_analytics.xlsx";
      a.click();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al exportar el reporte");
    } finally {
      setIsExporting(false);
    }
  };

  // Prepare chart data
  const enrollmentData = data?.charts.enrollments_over_time.map((d) => ({
    ...d,
    dateLabel: formatDate(d.date),
  }));

  const attendanceData = data?.charts.attendance_by_activity.map(
    (d: AttendanceByActivity) => ({
      ...d,
      shortName: truncate(d.activity_name, 15),
    })
  );

  const pieData = data?.charts.enrollments_by_discipline.map(
    (d: EnrollmentByDiscipline) => ({
      name: d.discipline_name,
      value: d.count,
    })
  );

  // Top activities sorted by avg_rate descending (horizontal bar)
  const topActivitiesData = data?.charts.attendance_by_activity
    .slice()
    .sort((a, b) => b.avg_rate - a.avg_rate)
    .slice(0, 6)
    .map((d: AttendanceByActivity) => ({
      ...d,
      shortName: truncate(d.activity_name, 18),
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">
            Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Métricas de inscripciones, asistencia y actividades
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting || isLoading}
          className="gap-2 bg-[#6B8EAE] hover:bg-[#5a7a9a] text-white w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exportando..." : "Exportar Excel"}
        </Button>
      </div>

      {/* Discipline filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 shrink-0">Disciplina:</span>
        <Select
          value={selectedDiscipline}
          onValueChange={(v) => setSelectedDiscipline(v ?? "all")}
        >
          <SelectTrigger className="w-[220px] bg-white border-gray-200">
            <SelectValue placeholder="Todas las disciplinas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las disciplinas</SelectItem>
            {disciplines.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedDiscipline !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDiscipline("all")}
            className="text-gray-400 hover:text-gray-600"
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Error state */}
      {!isLoading && error && (
        <ErrorState
          message={error}
          onRetry={fetchAnalytics}
        />
      )}

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiSkeleton key={i} />
          ))}
        </div>
      ) : !error && data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Inscripciones"
            value={data.total_enrollments.toLocaleString("es-AR")}
            icon={<BookOpen className="w-5 h-5" />}
            color="#6B8EAE"
          />
          <KpiCard
            title="Asistencia Promedio"
            value={`${data.avg_attendance_rate.toFixed(1)}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="#22C55E"
          />
          <KpiCard
            title="Actividades Activas"
            value={data.active_activities}
            icon={<Activity className="w-5 h-5" />}
            color="#F59E0B"
          />
          <KpiCard
            title="Total Alumnos"
            value={data.total_students.toLocaleString("es-AR")}
            icon={<Users className="w-5 h-5" />}
            color="#8B5CF6"
          />
        </div>
      ) : null}

      {/* Charts */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      ) : !error && data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Enrollments over time */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-[#1F2937]">
                Inscripciones en el tiempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!enrollmentData || enrollmentData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
                  Sin datos de inscripciones en el período
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="dateLabel"
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                      }}
                      labelFormatter={(label) => `Fecha: ${label}`}
                      formatter={(value) => [value ?? 0, "Inscripciones"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#6B8EAE"
                      strokeWidth={2}
                      dot={{ fill: "#6B8EAE", r: 3 }}
                      activeDot={{ r: 5, fill: "#6B8EAE" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Chart 2: Attendance by activity */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-[#1F2937]">
                Asistencia por actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!attendanceData || attendanceData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
                  Sin datos de asistencia registrados
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="shortName"
                      tick={{ fontSize: 10, fill: "#6B7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="avg_rate" fill="#6B8EAE" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Chart 3: Enrollments by discipline (Pie) */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-[#1F2937]">
                Distribución por disciplina
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!pieData || pieData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
                  Sin datos de disciplinas
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${truncate(name ?? "", 12)} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                      }}
                      formatter={(value, name) => [value ?? 0, name ?? ""]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span style={{ fontSize: "11px", color: "#6B7280" }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Chart 4: Top activities by attendance rate (horizontal bar) */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-[#1F2937]">
                Top actividades por asistencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!topActivitiesData || topActivitiesData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
                  Sin datos de actividades
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topActivitiesData}
                    layout="vertical"
                    margin={{ left: 8, right: 24 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="shortName"
                      width={110}
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${(Number(value) || 0).toFixed(1)}%`, "Asistencia"]}
                    />
                    <Bar
                      dataKey="avg_rate"
                      fill="#6B8EAE"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
