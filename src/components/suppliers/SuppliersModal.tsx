"use client";

import { useEffect, useState } from "react";
import type { SupplierDraft } from "./types";
import { emptySupplierDraft } from "./types";

export default function SuppliersModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: SupplierDraft;
  onClose: () => void;
  onSubmit: (draft: SupplierDraft) => void;
}) {
  const [draft, setDraft] = useState<SupplierDraft>(emptySupplierDraft);

  useEffect(() => {
    if (!open) return;
    setDraft({ ...emptySupplierDraft, ...(initial ?? {}) });
  }, [open, initial]);

  if (!open) return null;

  const title = mode === "create" ? "Nuevo proveedor" : "Editar proveedor";
  const saveLabel = mode === "create" ? "Crear" : "Guardar";

  function save() {
    const name = (draft.name ?? "").trim();
    if (!name) return alert("Nombre requerido.");

    onSubmit({
      ...draft,
      name,
      contact: (draft.contact ?? "").trim() || null,
      email: (draft.email ?? "").trim() || null,
      phone: (draft.phone ?? "").trim() || null,
      address: (draft.address ?? "").trim() || null,
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
                placeholder="Ej: Ferretería San Martín"
              />
            </Field>

            <Field label="Contacto (opcional)">
              <input
                className={inputCls}
                value={draft.contact ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, contact: e.target.value.trim() ? e.target.value : null })
                }
                placeholder="Ej: Juan Pérez"
              />
            </Field>

            <Field label="Email (opcional)">
              <input
                className={inputCls}
                value={draft.email ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, email: e.target.value.trim() ? e.target.value : null })
                }
                placeholder="Ej: ventas@proveedor.com"
              />
            </Field>

            <Field label="Teléfono (opcional)">
              <input
                className={inputCls}
                value={draft.phone ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, phone: e.target.value.trim() ? e.target.value : null })
                }
                placeholder="Ej: 987654321"
              />
            </Field>

            <div className="lg:col-span-2">
              <Field label="Dirección (opcional)">
                <input
                  className={inputCls}
                  value={draft.address ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, address: e.target.value.trim() ? e.target.value : null })
                  }
                  placeholder="Ej: Jr. Los Olivos 123, Cajamarca"
                />
              </Field>
            </div>

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