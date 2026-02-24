import { Role } from "@/src/generated/prisma/enums";


export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserListResult = {
  items: UserRecord[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

export type UserListParams = {
  q?: string;        // filtra por name/email
  role?: string;     // "ADMIN" | "USER" | "WAREHOUSE"
  active?: string;   // "true" | "false" | "1" | "0"
  phone?: string;
  page: number;
  pageSize: number;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string; // plain o hashed según tu service (recomendado: hashed aquí ya)
  phone: string;
  role: Role;
  active: boolean;
};

export type UpdateUserInput = Partial<{
  name: string | null;
  email: string | null;
  password: string;   // opcional (si se cambia)
  phone: string  | null;
  role: Role;
  active: boolean;
}>;

export interface UserRepository {
  getById(id: string): Promise<UserRecord | null>;
  getByEmail(email: string): Promise<UserRecord | null>;
  list(params: UserListParams): Promise<UserListResult>;

  create(input: CreateUserInput): Promise<UserRecord>;
  update(id: string, input: UpdateUserInput): Promise<UserRecord>;
  delete(id: string, deletedBy?: string): Promise<void>;
}