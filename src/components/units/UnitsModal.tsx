"use client";

import { useEffect, useState } from "react";
import type { UnitDraft } from "./types";
import { emptyUnitDraft } from "./types";

export default function UnitsModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: UnitDraft;
  onClose: () => void;
  onSubmit: (draft: UnitDraft) => void;
}) {
  const [draft, setDraft] = useState<UnitDraft>(emptyUnitDraft);

  useEffect(() => {
    if (!open) return;
    setDraft({ ...emptyUnitDraft, ...(initial ?? {}) });
  }, [open, initial]);

  if (!open) return null;

  const title = mode === "create" ? "Nueva unidad" : "Editar unidad";
  const saveLabel = mode === "create" ? "Crear" : "Guardar";

  function save() {
    const name = (draft.name ?? "").trim();
    if (!name) return alert("Nombre requerido.");

    onSubmit({
      ...draft,
      name,
      symbol: (draft.symbol ?? "").trim() ? String(draft.symbol).trim() : null,
    });
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/40" aria-label="Cerrar" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
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
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombre">
              <input
                className={inputCls}
                value={draft.name ?? ""}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Ej: Kilogramo"
              />
            </Field>

            <Field label="Símbolo (opcional)">
              <input
                className={inputCls}
                value={draft.symbol ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, symbol: e.target.value.trim() ? e.target.value : null })
                }
                placeholder="Ej: KG"
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