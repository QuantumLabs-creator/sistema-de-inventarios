export type MovementType = "IN" | "OUT" | "ADJUSTMENT" | "RETURN";

export type Movement = {
  id: string;
  type: MovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string | null;
  createdAt: string;

  productId: string;
  userId: string;

  product?: { id: string; code: string; name: string } | null;
  user?: { id: string; name: string; email: string } | null;

  // ✅ opcional si tu backend lo manda (si no, queda undefined y no rompe)
  unitPrice?: string | null;
};

export type OptionItem = { id: string; name: string };
export type ProductOptionItem = { id: string; code: string; name: string };