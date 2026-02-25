"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import SuppliersTable from "@/src/components/suppliers/SuppliersTable";
import SuppliersModal from "@/src/components/suppliers/SuppliersModal";

import type { Supplier, SupplierDraft } from "@/src/components/suppliers/types";
import { emptySupplierDraft } from "@/src/components/suppliers/types";

type ApiSupplier = {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
};

type ApiList = {
  items: ApiSupplier[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

function apiToUi(s: ApiSupplier): Supplier {
  return {
    id: s.id,
    name: s.name ?? "",
    contact: s.contact ?? null,
    email: s.email ?? null,
    phone: s.phone ?? null,
    address: s.address ?? null,
    active: !!s.active,
  };
}

function uiToApi(d: SupplierDraft) {
  return {
    name: d.name.trim(),
    contact: (d.contact ?? "").trim() || null,
    email: (d.email ?? "").trim() || null,
    phone: (d.phone ?? "").trim() || null,
    address: (d.address ?? "").trim() || null,
    active: !!d.active,
  };
}

function useDebouncedValue<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function SuppliersPage() {
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 350);

  const [active, setActive] = useState<string>("");

  const [page, setPage] = useState(1);
  const pageSize = 200;

  const [meta, setMeta] = useState<ApiList["meta"]>({
    total: 0,
    page: 1,
    pageSize,
    totalPages: 0,
  });

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialDraft, setInitialDraft] = useState<SupplierDraft>(emptySupplierDraft);

  async function loadSuppliers() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (qDebounced.trim()) sp.set("q", qDebounced.trim());
      if (active.trim()) sp.set("active", active.trim());

      sp.set("page", String(page));
      sp.set("pageSize", String(pageSize));

      const res = await fetch(`/api/suppliers?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar proveedores");

      const json = (await res.json()) as ApiList;
      setData(json.items.map(apiToUi));
      setMeta(json.meta);
    } catch (e: any) {
      toast.error("Error cargando proveedores", {
        description: e?.message ?? "Intenta nuevamente",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, page, active]);

  function onCreate() {
    setMode("create");
    setEditingId(null);
    setInitialDraft(emptySupplierDraft);
    setOpen(true);
  }

  function onEdit(s: Supplier) {
    setMode("edit");
    setEditingId(s.id);

    const { id, ...rest } = s;
    setInitialDraft(rest);

    setOpen(true);
  }

  async function doDelete(id: string) {
    const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "No se pudo eliminar");
    }
  }

  function onDelete(id: string) {
    const s = data.find((x) => x.id === id);

    toast("¿Desactivar proveedor?", {
      description: s ? `${s.name}` : "Esta acción no se puede deshacer.",
      action: {
        label: "Desactivar",
        onClick: async () => {
          const tId = toast.loading("Desactivando...");
          try {
            await doDelete(id);
            toast.dismiss(tId);
            toast.success("Proveedor desactivado");

            setData((prev) => prev.filter((x) => x.id !== id));
            setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }));
          } catch (e: any) {
            toast.dismiss(tId);
            toast.error("No se pudo desactivar", { description: e?.message });
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => toast.message("Cancelado"),
      },
    });
  }

  async function createSupplier(draft: SupplierDraft) {
    const payload = uiToApi(draft);

    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error creando proveedor");
    }

    return (await res.json()) as ApiSupplier;
  }

  async function updateSupplier(id: string, draft: SupplierDraft) {
    const payload = uiToApi(draft);

    const res = await fetch(`/api/suppliers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error actualizando proveedor");
    }

    return (await res.json()) as ApiSupplier;
  }

  async function onSubmit(draft: SupplierDraft) {
    const tId =
      mode === "create"
        ? toast.loading("Creando proveedor...")
        : toast.loading("Guardando cambios...");

    try {
      if (mode === "create") {
        const created = await createSupplier(draft);

        toast.dismiss(tId);
        toast.success("Proveedor creado", { description: draft.name });

        setData((prev) => [apiToUi(created), ...prev]);
        setMeta((m) => ({ ...m, total: m.total + 1 }));
        setOpen(false);
        return;
      }

      if (mode === "edit" && editingId) {
        const updated = await updateSupplier(editingId, draft);

        toast.dismiss(tId);
        toast.success("Cambios guardados", { description: draft.name });

        setData((prev) => prev.map((x) => (x.id === editingId ? apiToUi(updated) : x)));
        setOpen(false);
      }
    } catch (e: any) {
      toast.dismiss(tId);
      toast.error("Error", { description: e?.message ?? "Intenta nuevamente" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proveedores</h1>
          <div className="text-xs opacity-70">
            {loading ? "Cargando..." : `${meta.total} proveedor(es)`}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar..."
            className="w-full sm:w-[260px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
          />
          <select
            value={active}
            onChange={(e) => setActive(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      <SuppliersTable data={data} onCreate={onCreate} onEdit={onEdit} onDelete={onDelete} />

      <SuppliersModal
        open={open}
        mode={mode}
        initial={initialDraft}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}