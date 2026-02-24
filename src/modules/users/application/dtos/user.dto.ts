// DTOs para transferencia de datos de Usuario

export type Role = 'ADMIN' | 'USER' | 'WAREHOUSE';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: Role;
  phone: string;
  active?: unknown;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
   phone: string;
  active?: boolean;
}

export interface SearchUsersDTO {
  query?: string;        // Búsqueda por nombre o email
  role?: Role;           // Filtro por rol
  active?: boolean;      // Filtro por estado
  phone: string;
  page?: number;         // Paginación
  limit?: number;        // Límite por página
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserWithStatsDTO extends UserDTO {
  movementsCount: number;
  ordersCount: number;
}

export function assertCreateUserDTO(input: unknown): asserts input is CreateUserDTO {
  if (!input || typeof input !== "object") throw new Error("Body inválido");

  const x = input as any;
  if (!String(x.name ?? "").trim()) throw new Error("name requerido");
  if (!String(x.email ?? "").trim()) throw new Error("email requerido");
  if (!String(x.password ?? "").trim()) throw new Error("password requerido");
}