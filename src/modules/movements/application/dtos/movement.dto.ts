// src/modules/movements/application/dtos/movement.dto.ts

function toStr(v: unknown) {
  return String(v ?? "").trim();
}

export type MovementTypeDTO = "IN" | "OUT" | "ADJUSTMENT" | "RETURN";

export type MovementDTO = {
  id: string;
  type: MovementTypeDTO;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string | null;
  createdAt: string;

  productId: string;
  userId: string;

  product?: { id: string; code: string; name: string };
  user?: { id: string; name: string; email: string };
};

export type CreateMovementDTO = {
  type: MovementTypeDTO;
  quantity: unknown; // llega como string/number
  reason?: string | null;

  productId: string;
  userId: string;
};

export type MovementQueryDTO = {
  q?: string;
  type?: string; // IN|OUT|ADJUSTMENT|RETURN
  productId?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
};

export type UpdateMovementDTO = {
  reason?: string | null;
};

export function assertUpdateMovementDTO(
  input: unknown
): asserts input is UpdateMovementDTO {
  if (!input || typeof input !== "object") {
    throw new Error("Body inválido");
  }

  const x = input as any;

  if (x.reason !== undefined && typeof x.reason !== "string") {
    throw new Error("reason inválido");
  }
}

export function assertCreateMovementDTO(input: unknown): asserts input is CreateMovementDTO {
  if (!input || typeof input !== "object") throw new Error("Body inválido");
  const x = input as any;

  const type = toStr(x.type);
  if (!type) throw new Error("type requerido");
  if (!["IN", "OUT", "ADJUSTMENT", "RETURN"].includes(type)) throw new Error("type inválido");

  if (!toStr(x.productId)) throw new Error("productId requerido");
  if (!toStr(x.userId)) throw new Error("userId requerido");

  if (x.quantity === undefined || toStr(x.quantity) === "") throw new Error("quantity requerido");
}