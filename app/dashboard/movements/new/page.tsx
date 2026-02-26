"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type MovementType = "IN" | "OUT" | "RETURN" | "ADJUSTMENT";

type ProductOption = {
  id: string;
  code: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit?: { name: string; symbol: string | null } | null;
  category?: { name: string } | null;
};

type ProductsApiItem = {
  id: string;
  code: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit?: { id: string; name: string; symbol: string | null } | null;
  category?: { id: string; name: string } | null;
};

type ProductsApiList = {
  items: ProductsApiItem[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

function labelType(t: MovementType) {
  if (t === "IN") return "Ingreso";
  if (t === "OUT") return "Salida";
  if (t === "RETURN") return "Devolución";
  return "Ajuste (+)";
}

export default function MovementNewPage() {
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [products, setProducts] = useState<ProductOption[]>([]);

  // form
  const [type, setType] = useState<MovementType>("IN");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState<string>("1");
  const [reason, setReason] = useState<string>("");

  // userId (dev)
  const [userId, setUserId] = useState<string>("");

  const selected = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId]
  );

  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products?page=1&pageSize=500", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudo cargar productos");
      const json = (await res.json()) as ProductsApiList;

      setProducts(
        (json.items ?? []).map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          currentStock: Number(p.currentStock ?? 0),
          minStock: Number(p.minStock ?? 0),
          unit: p.unit ? { name: p.unit.name, symbol: p.unit.symbol } : null,
          category: p.category ? { name: p.category.name } : null,
        }))
      );
    } catch (e: any) {
      toast.error("Error cargando productos", { description: e?.message });
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    loadProducts();

    // userId dev (si lo tienes guardado)
    try {
      const u = localStorage.getItem("userId");
      if (u) setUserId(u);
    } catch {}
  }, []);

  function previewStock() {
    if (!selected) return null;
    const q = Number(String(quantity ?? "0").replace(",", "."));
    if (!Number.isFinite(q) || q <= 0) return null;

    const before = selected.currentStock;
    const after =
      type === "OUT" ? before - q : before + q; // (IN/RETURN/ADJUSTMENT) => suma

    return { before, after };
  }

  async function submit() {
    const pid = productId.trim();
    if (!pid) return toast.error("Selecciona un producto");

    const q = Number(String(quantity ?? "").replace(",", "."));
    if (!Number.isFinite(q) || q <= 0) return toast.error("Cantidad inválida");

    const uid = userId.trim();
    if (!uid) return toast.error("Falta userId (dev)");

    const payload = {
      type,
      quantity: q,
      reason: reason.trim() || null,
      productId: pid,
      userId: uid,
    };

    const tId = toast.loading("Registrando movimiento...");
    try {
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? "No se pudo registrar");
      }

      toast.dismiss(tId);
      toast.success("Movimiento registrado", {
        description: `${labelType(type)} • ${selected?.code ?? ""} ${selected?.name ?? ""}`,
      });

      // refrescar stock local (opcional)
      await loadProducts();

      // reset
      setQuantity("1");
      setReason("");
    } catch (e: any) {
      toast.dismiss(tId);
      toast.error("Error", { description: e?.message ?? "Intenta nuevamente" });
    }
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10";

  const pv = previewStock();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nuevo movimiento</h1>
          <div className="text-xs opacity-70">
            Registra ingresos, salidas, devoluciones o ajustes.
          </div>
        </div>
        <button
          onClick={loadProducts}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm hover:bg-[var(--color-muted)]"
        >
          Recargar productos
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* FORM */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tipo">
              <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as MovementType)}>
                <option value="IN">Ingreso</option>
                <option value="OUT">Salida</option>
                <option value="RETURN">Devolución</option>
                <option value="ADJUSTMENT">Ajuste (+)</option>
              </select>
            </Field>

            <Field label="Producto">
              <select
                className={inputCls}
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={loadingProducts}
              >
                <option value="">{loadingProducts ? "Cargando..." : "— Selecciona —"}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} • {p.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Cantidad">
              <input
                className={inputCls}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ej: 5"
              />
              <div className="text-[11px] opacity-60 mt-1">
                Para OUT se valida que no quede stock negativo.
              </div>
            </Field>

            <Field label="Motivo (opcional)">
              <input
                className={inputCls}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: compra, consumo, ajuste inventario..."
              />
            </Field>

            {/* userId dev */}
            <div className="sm:col-span-2">
              <Field label="User ID (dev)">
                <input
                  className={inputCls}
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    try {
                      localStorage.setItem("userId", e.target.value);
                    } catch {}
                  }}
                  placeholder="Pega aquí el userId (temporal)"
                />
                <div className="text-[11px] opacity-60 mt-1">
                  Cuando conectes auth, esto se obtiene del usuario logueado.
                </div>
              </Field>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={submit}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-medium hover:opacity-80"
              disabled={!productId || loadingProducts}
            >
              Registrar
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm space-y-3">
          <div className="text-sm font-semibold">Resumen</div>

          {!selected ? (
            <div className="text-sm opacity-70">Selecciona un producto para ver detalles.</div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="font-medium">
                {selected.code} • {selected.name}
              </div>

              <div className="opacity-80">
                Categoría: <span className="font-medium">{selected.category?.name ?? "—"}</span>
              </div>

              <div className="opacity-80">
                Unidad:{" "}
                <span className="font-medium">
                  {selected.unit
                    ? selected.unit.symbol
                      ? `${selected.unit.name} (${selected.unit.symbol})`
                      : selected.unit.name
                    : "—"}
                </span>
              </div>

              <div className="opacity-80">
                Stock actual: <span className="font-medium tabular-nums">{selected.currentStock}</span>
              </div>

              <div className="opacity-80">
                Stock mínimo: <span className="font-medium tabular-nums">{selected.minStock}</span>
              </div>

              {pv && (
                <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3">
                  <div className="text-xs font-semibold opacity-80 mb-2">Impacto</div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-70">Antes</span>
                    <span className="font-medium tabular-nums">{pv.before}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-70">Después</span>
                    <span
                      className={[
                        "font-semibold tabular-nums",
                        pv.after < 0 ? "text-red-600" : "",
                      ].join(" ")}
                    >
                      {pv.after}
                    </span>
                  </div>
                  {pv.after < 0 && (
                    <div className="text-[11px] text-red-600 mt-2">
                      Stock quedaría negativo (la API lo rechazará).
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 block">
      <div className="text-xs font-medium opacity-80">{label}</div>
      {children}
    </label>
  );
}