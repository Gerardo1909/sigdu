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
