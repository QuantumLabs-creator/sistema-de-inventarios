import type { Prisma } from "@/src/generated/prisma/client";

export type MovementRecord = {
  id: string;
  type: "IN" | "OUT" | "ADJUSTMENT" | "RETURN";
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string | null;
  createdAt: Date;

  productId: string;
  userId: string;

  product: { id: string; code: string; name: string };
  user: { id: string; name: string; email: string };
};

export type MovementListResult = {
  items: MovementRecord[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

export type MovementListParams = {
  q?: string;              // busca por código/nombre del producto / reason
  type?: string;           // IN|OUT|ADJUSTMENT|RETURN
  productId?: string;
  userId?: string;
  page: number;
  pageSize: number;
};

export type CreateMovementInput = {
  type: "IN" | "OUT" | "ADJUSTMENT" | "RETURN";
  quantity: unknown;
  reason?: unknown;
  productId: string;
  userId: string;
};

export type UpdateMovementInput = {
  reason?: string | null;
};


export interface MovementRepository {
  getById(id: string): Promise<MovementRecord | null>;
  list(params: MovementListParams): Promise<MovementListResult>;
  create(input: CreateMovementInput): Promise<MovementRecord>;

  update(id: string, input: UpdateMovementInput): Promise<MovementRecord>;
  cancel(id: string, cancelledByUserId: string): Promise<void>;
}