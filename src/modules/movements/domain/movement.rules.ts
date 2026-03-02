// src/modules/movements/domain/movement.rules.ts
import { Prisma } from "@/src/generated/prisma/client";

function toStr(v: unknown) {
  return String(v ?? "").trim();
}

export function normalizeText(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = toStr(v);
  return s.length ? s : null;
}

export function normalizeInt(v: unknown, defaultValue = 0): number {
  if (v === undefined || v === null || toStr(v) === "") return defaultValue;
  const n = Number(v);
  if (!Number.isFinite(n)) return defaultValue;
  return Math.trunc(n);
}

export function normalizeMoneyOptional(v: unknown, fieldName = "unitPrice"): Prisma.Decimal | null {
  const s = toStr(v);
  if (!s) return null;

  const cleaned = s.replace(",", ".");
  const n = Number(cleaned);
  if (!Number.isFinite(n)) throw new Error(`${fieldName} inválido`);

  return new (Prisma.Decimal as any)(cleaned) as Prisma.Decimal;
}

export function assertCreateMovementInput(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("Body inválido");
  const x = input as any;

  const type = toStr(x.type);
  if (!type) throw new Error("type requerido");

  const ok = ["IN", "OUT", "ADJUSTMENT", "RETURN"].includes(type);
  if (!ok) throw new Error("type inválido");

  if (!toStr(x.productId)) throw new Error("productId requerido");
  if (!toStr(x.userId)) throw new Error("userId requerido");

  if (x.quantity === undefined || toStr(x.quantity) === "") throw new Error("quantity requerido");

  // unitPrice: opcional, pero si viene debe ser num/string
  if (
    x.unitPrice !== undefined &&
    x.unitPrice !== null &&
    typeof x.unitPrice !== "string" &&
    typeof x.unitPrice !== "number"
  ) {
    throw new Error("unitPrice inválido");
  }
}

export function assertUnitPriceInRange(opts: {
  unitPrice: Prisma.Decimal;
  minSalePrice: Prisma.Decimal | null;
  maxSalePrice: Prisma.Decimal | null;
}) {
  const { unitPrice, minSalePrice, maxSalePrice } = opts;

  if (minSalePrice && (unitPrice as any).lessThan(minSalePrice as any)) {
    throw new Error("Precio menor al mínimo permitido");
  }
  if (maxSalePrice && (unitPrice as any).greaterThan(maxSalePrice as any)) {
    throw new Error("Precio mayor al máximo permitido");
  }
}