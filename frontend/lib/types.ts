// Tipos TypeScript espejando schemas Pydantic del backend

export type UserRole = "super_admin" | "admin" | "directivo" | "profesor" | "alumno";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Discipline {
  id: string;
  name: string;
  description: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
}

export interface ActivityListItem {
  id: string;
  name: string;
  discipline: string;
  venue: string;
  schedule_description: string;
  capacity: number;
  enrolled_count: number;
}

export interface ActivityDetail extends ActivityListItem {
  professor_name: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
}

// Enrollment
export interface Enrollment {
  id: string;
  activity_id: string;
  activity_name: string;
  status: string;
  enrolled_at: string;
}

export interface MyEnrollmentsResponse {
  enrollments: Enrollment[];
  total: number;
}

// Attendance
export interface EnrolledStudent {
  user_id: string;
  full_name: string;
  email: string;
}

export interface ClassSession {
  id: string;
  activity_id: string;
  activity_name: string;
  date: string;
  enrolled_students: EnrolledStudent[];
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

// Admin
export interface UserAdmin {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface PaginatedUsers {
  items: UserAdmin[];
  total: number;
  page: number;
}

export interface InstitutionConfig {
  name: string;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

// Analytics
export interface EnrollmentOverTime {
  date: string;
  count: number;
}

export interface AttendanceByActivity {
  activity_name: string;
  avg_rate: number; // 0-100
  total_sessions: number;
}

export interface EnrollmentByDiscipline {
  discipline_name: string;
  count: number;
}

export interface AnalyticsCharts {
  enrollments_over_time: EnrollmentOverTime[];
  attendance_by_activity: AttendanceByActivity[];
  enrollments_by_discipline: EnrollmentByDiscipline[];
}

export interface AnalyticsDashboardResponse {
  total_enrollments: number;
  avg_attendance_rate: number; // 0-100
  active_activities: number;
  total_students: number;
  charts: AnalyticsCharts;
}

// Setup
export interface SetupInstitutionPayload {
  name: string;
  slug: string;
  email_domains: string[];
  admin_email: string;
  admin_password: string;
  admin_full_name: string;
}
