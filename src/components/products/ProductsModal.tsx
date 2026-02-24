// src/components/products/ProductsModal.tsx
"use client";

import { useEffect, useState } from "react";
import type { OptionItem, ProductDraft, UnitOptionItem } from "./types";
import { emptyProductDraft } from "./types";

export default function ProductsModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,

  categories,
  suppliers,
  units,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: ProductDraft;
  onClose: () => void;
  onSubmit: (draft: ProductDraft) => void;

  categories: OptionItem[];
  suppliers: OptionItem[];
  units: UnitOptionItem[];
}) {
  const [draft, setDraft] = useState<ProductDraft>(emptyProductDraft);

  useEffect(() => {
    if (!open) return;
    setDraft({ ...emptyProductDraft, ...(initial ?? {}) });
  }, [open, initial]);

  if (!open) return null;

  const title = mode === "create" ? "Nuevo producto" : "Editar producto";
  const saveLabel = mode === "create" ? "Crear" : "Guardar";

  function save() {
    const name = (draft.name ?? "").trim();
    const categoryId = (draft.categoryId ?? "").trim();
    const unitId = (draft.unitId ?? "").trim();

    if (!name) return alert("Nombre requerido.");
    if (!categoryId) return alert("Selecciona una categoría.");
    if (!unitId) return alert("Selecciona una unidad.");

    const pp = String(draft.purchasePrice ?? "").trim();
    const sp = String(draft.salePrice ?? "").trim();
    if (!pp) return alert("Precio de compra requerido.");
    if (!sp) return alert("Precio de venta requerido.");

    onSubmit({
      ...draft,
      name,
      categoryId,
      unitId,
      purchasePrice: pp,
      salePrice: sp,
    });
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/40" aria-label="Cerrar" onClick={onClose} />

      <div className="relative w-full max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
          <div className="text-sm font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-6 max-h-[70dvh] overflow-y-auto">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nombre">
              <input
                className={inputCls}
                value={draft.name ?? ""}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </Field>

            <Field label="Categoría">
              <select
                className={inputCls}
                value={draft.categoryId ?? ""}
                onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
              >
                <option value="">— Selecciona —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Unidad">
              <select
                className={inputCls}
                value={draft.unitId ?? ""}
                onChange={(e) => setDraft({ ...draft, unitId: e.target.value })}
              >
                <option value="">— Selecciona —</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.symbol ? `${u.name} (${u.symbol})` : u.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Proveedor (opcional)">
              <select
                className={inputCls}
                value={draft.supplierId ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, supplierId: e.target.value ? e.target.value : null })
                }
              >
                <option value="">— Sin proveedor —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Precio compra">
              <input
                className={inputCls}
                value={draft.purchasePrice ?? ""}
                onChange={(e) => setDraft({ ...draft, purchasePrice: e.target.value })}
                placeholder="Ej: 12.50"
              />
            </Field>

            <Field label="Precio venta">
              <input
                className={inputCls}
                value={draft.salePrice ?? ""}
                onChange={(e) => setDraft({ ...draft, salePrice: e.target.value })}
                placeholder="Ej: 15.00"
              />
            </Field>

            <Field label="Stock mínimo">
              <input
                type="number"
                className={inputCls}
                value={Number.isFinite(draft.minStock) ? draft.minStock : 0}
                onChange={(e) => setDraft({ ...draft, minStock: Number(e.target.value || 0) })}
              />
            </Field>

            <Field label="Stock actual">
              <input
                type="number"
                className={inputCls}
                value={Number.isFinite(draft.currentStock) ? draft.currentStock : 0}
                onChange={(e) =>
                  setDraft({ ...draft, currentStock: Number(e.target.value || 0) })
                }
              />
            </Field>

            <Field label="Estado">
              <select
                className={inputCls}
                value={draft.active ? "true" : "false"}
                onChange={(e) => setDraft({ ...draft, active: e.target.value === "true" })}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </Field>

            <div className="lg:col-span-3 sm:col-span-2">
              <Field label="Descripción (opcional)">
                <textarea
                  className={inputCls}
                  value={draft.description ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value.trim() ? e.target.value : null })
                  }
                  rows={3}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] p-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm hover:bg-[var(--color-muted)]"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-medium hover:opacity-80"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1">
      <div className="text-xs font-medium opacity-80">{label}</div>
      {children}
    </label>
  );
}