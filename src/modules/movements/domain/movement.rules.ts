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
}