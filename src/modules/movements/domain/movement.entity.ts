import type { Prisma } from "@/src/generated/prisma/client";
export class MovementEntity {
  static create(input: {
    type: "IN" | "OUT" | "ADJUSTMENT" | "RETURN";
    quantity: number;
    reason: string | null;
    productId: string;
    userId: string;
    unitPrice?: Prisma.Decimal | null;
  }) {
    if (input.quantity <= 0) throw new Error("quantity debe ser > 0");
    return {
      type: input.type,
      quantity: input.quantity,
      reason: input.reason,
      productId: input.productId,
      userId: input.userId,
      unitPrice: input.unitPrice ?? null,
    };
  }
}