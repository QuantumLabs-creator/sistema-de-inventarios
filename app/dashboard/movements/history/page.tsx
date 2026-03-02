"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import MovementsTable from "@/src/components/movements/MovementsTable";
import type { Movement, MovementType, ProductOptionItem } from "@/src/components/movements/types";

type ApiMovement = Movement;

type ApiList = {
  items: ApiMovement[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

type ProductsApiItem = {
  id: string;
  code: string;
  name: string;
};

type ProductsApiList = {
  items: ProductsApiItem[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

function useDebouncedValue<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function MovementsHistoryPage() {
  const [data, setData] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  // combos
  const [products, setProducts] = useState<ProductOptionItem[]>([]);

  // filtros
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 350);

  const [type, setType] = useState<string>("");
  const [productId, setProductId] = useState<string>("");

  // paginación
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const [meta, setMeta] = useState<ApiList["meta"]>({
    total: 0,
    page: 1,
    pageSize,
    totalPages: 1,
  });

  // modal editar motivo
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Movement | null>(null);
  const [reason, setReason] = useState("");

  // userId (dev) para cancelar
  const [userId, setUserId] = useState("");

  useEffect(() => {
    try {
      const u = localStorage.getItem("userId");
      if (u) setUserId(u);
    } catch {}
  }, []);

  async function loadProductsCombo() {
    try {
      const res = await fetch("/api/products?page=1&pageSize=500", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as ProductsApiList;

      setProducts(
        (json.items ?? []).map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
        }))
      );
    } catch {}
  }

  async function loadMovements() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (qDebounced.trim()) sp.set("q", qDebounced.trim());
      if (type.trim()) sp.set("type", type.trim());
      if (productId.trim()) sp.set("productId", productId.trim());

      sp.set("page", String(page));
      sp.set("pageSize", String(pageSize));

      const res = await fetch(`/api/movements?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar movimientos");
      const json = (await res.json()) as ApiList;

      setData(json.items ?? []);
      setMeta(json.meta);
    } catch (e: any) {
      toast.error("Error cargando movimientos", { description: e?.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProductsCombo();
  }, []);

  useEffect(() => {
    loadMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, type, productId, page]);

  function openEditReason(m: Movement) {
    setEditing(m);
    setReason(m.reason ?? "");
    setOpen(true);
  }

  async function saveReason() {
    if (!editing) return;

    const tId = toast.loading("Guardando motivo...");
    try {
      const res = await fetch(`/api/movements/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || null }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? "No se pudo actualizar");
      }

      const updated = (await res.json()) as Movement;

      toast.dismiss(tId);
      toast.success("Motivo actualizado");

      setData((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setOpen(false);
      setEditing(null);
    } catch (e: any) {
      toast.dismiss(tId);
      toast.error("Error", { description: e?.message ?? "Intenta nuevamente" });
    }
  }

  async function doCancel(id: string) {
    const uid = String(userId ?? "").trim();
    if (!uid) throw new Error("Falta userId (dev)");

    const res = await fetch(`/api/movements/${id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "No se pudo anular");
    }
  }

  function onCancel(id: string) {
    const m = data.find((x) => x.id === id);

    toast("¿Anular movimiento?", {
      description: m
        ? `${m.type} • ${m.product?.code ?? ""} ${m.product?.name ?? ""} • cant ${m.quantity}`
        : "Esta acción crea un movimiento de compensación.",
      action: {
        label: "Anular",
        onClick: async () => {
          const tId = toast.loading("Anulando...");
          try {
            await doCancel(id);
            toast.dismiss(tId);
            toast.success("Movimiento anulado");

            // refrescar lista (porque se crea un movimiento nuevo)
            await loadMovements();
          } catch (e: any) {
            toast.dismiss(tId);
            toast.error("No se pudo anular", { description: e?.message });
          }
        },
      },
      cancel: { label: "Cancelar", onClick: () => toast.message("Cancelado") },
    });
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10";

  const types: { v: "" | MovementType; label: string }[] = [
    { v: "", label: "Todos" },
    { v: "IN", label: "Ingreso" },
    { v: "OUT", label: "Salida" },
    { v: "RETURN", label: "Devolución" },
    { v: "ADJUSTMENT", label: "Ajuste" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Historial de movimientos</h1>
          <div className="text-xs opacity-70">
            {loading ? "Cargando..." : `${meta.total} movimiento(s) • pág ${meta.page}/${meta.totalPages}`}
          </div>
        </div>
      </div>

      {/* filtros server-side */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className="space-y-1 block">
            <div className="text-xs font-medium opacity-80">Buscar</div>
            <input
              className={inputCls}
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Motivo, producto, usuario..."
            />
          </label>
        </div>

        <label className="space-y-1 block">
          <div className="text-xs font-medium opacity-80">Tipo</div>
          <select
            className={inputCls}
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value);
            }}
          >
            {types.map((t) => (
              <option key={t.v} value={t.v}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 block">
          <div className="text-xs font-medium opacity-80">Producto</div>
          <select
            className={inputCls}
            value={productId}
            onChange={(e) => {
              setPage(1);
              setProductId(e.target.value);
            }}
          >
            <option value="">Todos</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} • {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* userId dev */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
        <div className="text-xs font-medium opacity-80 mb-1">User ID (dev) para anular</div>
        <input
          className={inputCls}
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            try {
              localStorage.setItem("userId", e.target.value);
            } catch {}
          }}
          placeholder="Pega aquí tu userId temporal"
        />
        <div className="text-[11px] opacity-60 mt-1">
          Cuando tengas auth, esto se obtiene del usuario logueado.
        </div>
      </div>

      <MovementsTable data={data} onEditReason={openEditReason} onCancel={onCancel} />

      {/* paginación */}
      <div className="flex items-center justify-between">
        <button
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ← Anterior
        </button>

        <div className="text-sm opacity-70">
          Página <span className="font-medium">{meta.page}</span> de{" "}
          <span className="font-medium">{meta.totalPages}</span>
        </div>

        <button
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
          disabled={meta.totalPages <= page}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente →
        </button>
      </div>

      {/* modal editar motivo */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/40"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
              <div className="text-sm font-semibold">Editar motivo</div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="text-sm opacity-80">
                {editing?.product?.code} • {editing?.product?.name} • cant {editing?.quantity}
              </div>
              <input
                className={inputCls}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo..."
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] p-4">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm hover:bg-[var(--color-muted)]"
              >
                Cancelar
              </button>
              <button
                onClick={saveReason}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-medium hover:opacity-80"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}