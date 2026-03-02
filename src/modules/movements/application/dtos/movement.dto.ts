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

  // ✅ nuevo (solo aplica realmente en OUT)
  unitPrice: string | null;

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

  // ✅ nuevo: precio aplicado para OUT (si no mandas, backend puede usar salePrice)
  unitPrice?: unknown;
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

  // ✅ permitir editar precio aplicado (solo OUT; el repo/usecase validará)
  unitPrice?: unknown;
};

export function assertUpdateMovementDTO(input: unknown): asserts input is UpdateMovementDTO {
  if (!input || typeof input !== "object") {
    throw new Error("Body inválido");
  }

  const x = input as any;

  if (x.reason !== undefined && x.reason !== null && typeof x.reason !== "string") {
    throw new Error("reason inválido");
  }

  // unitPrice puede venir como string/number/null
  if (
    x.unitPrice !== undefined &&
    x.unitPrice !== null &&
    typeof x.unitPrice !== "string" &&
    typeof x.unitPrice !== "number"
  ) {
    throw new Error("unitPrice inválido");
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

  // reason opcional string|null
  if (x.reason !== undefined && x.reason !== null && typeof x.reason !== "string") {
    throw new Error("reason inválido");
  }

  // unitPrice opcional (solo OUT normalmente), pero validamos tipo aquí igual
  if (
    x.unitPrice !== undefined &&
    x.unitPrice !== null &&
    typeof x.unitPrice !== "string" &&
    typeof x.unitPrice !== "number"
  ) {
    throw new Error("unitPrice inválido");
  }
}