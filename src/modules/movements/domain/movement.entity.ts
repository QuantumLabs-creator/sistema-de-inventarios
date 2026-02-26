export class MovementEntity {
  static create(input: {
    type: "IN" | "OUT" | "ADJUSTMENT" | "RETURN";
    quantity: number;
    reason: string | null;
    productId: string;
    userId: string;
  }) {
    if (input.quantity <= 0) throw new Error("quantity debe ser > 0");
    return {
      type: input.type,
      quantity: input.quantity,
      reason: input.reason,
      productId: input.productId,
      userId: input.userId,
    };
  }
}