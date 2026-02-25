"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { Category, CategoryDraft } from "@/src/components/categories/types";
import { emptyCategoryDraft } from "@/src/components/categories/types";
import CategoriesTable from "@/src/components/categories/CategoryTable";
import CategoriesModal from "@/src/components/categories/CategoryModal";

// ✅ API real
type ApiCategory = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt?: string;
};

type ApiList = {
  items: ApiCategory[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

function apiToUi(c: ApiCategory): Category {
  return {
    id: c.id,
    name: c.name ?? "",
    description: c.description ?? null,
    active: !!c.active,
    createdAt: c.createdAt,
  };
}

function uiToApi(d: CategoryDraft) {
  return {
    name: d.name.trim(),
    description: (d.description ?? "").trim() || null,
    active: !!d.active,
  };
}

export default function CategoriesPage() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // paginación (opcional)
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
  const [initialDraft, setInitialDraft] =
    useState<CategoryDraft>(emptyCategoryDraft);

  async function loadCategories() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.set("page", String(page));
      sp.set("pageSize", String(pageSize));

      const res = await fetch(`/api/categories?${sp.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudo cargar categorías");

      const json = (await res.json()) as ApiList;
      setData(json.items.map(apiToUi));
      setMeta(json.meta);
    } catch (e: any) {
      toast.error("Error cargando categorías", {
        description: e?.message ?? "Intenta nuevamente",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function onCreate() {
    setMode("create");
    setEditingId(null);
    setInitialDraft(emptyCategoryDraft);
    setOpen(true);
  }

  function onEdit(c: Category) {
    setMode("edit");
    setEditingId(c.id);

    const { id, ...rest } = c;
    setInitialDraft(rest);

    setOpen(true);
  }

  async function doDelete(id: string) {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "No se pudo eliminar");
    }
  }

  function onDelete(id: string) {
    const c = data.find((x) => x.id === id);

    toast("¿Desactivar categoría?", {
      description: c ? `${c.name}` : "Esta acción no se puede deshacer.",
      action: {
        label: "Desactivar",
        onClick: async () => {
          const tId = toast.loading("Desactivando...");
          try {
            await doDelete(id);
            toast.dismiss(tId);
            toast.success("Categoría desactivada");

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

  async function createCategory(draft: CategoryDraft) {
    const payload = uiToApi(draft);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error creando categoría");
    }

    return (await res.json()) as ApiCategory;
  }

  async function updateCategory(id: string, draft: CategoryDraft) {
    const payload = uiToApi(draft);

    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error actualizando categoría");
    }

    return (await res.json()) as ApiCategory;
  }

  async function onSubmit(draft: CategoryDraft) {
    const tId =
      mode === "create"
        ? toast.loading("Creando categoría...")
        : toast.loading("Guardando cambios...");

    try {
      if (mode === "create") {
        const created = await createCategory(draft);

        toast.dismiss(tId);
        toast.success("Categoría creada", { description: draft.name });

        setData((prev) => [apiToUi(created), ...prev]);
        setMeta((m) => ({ ...m, total: m.total + 1 }));
        setOpen(false);
        return;
      }

      if (mode === "edit" && editingId) {
        const updated = await updateCategory(editingId, draft);

        toast.dismiss(tId);
        toast.success("Cambios guardados", { description: draft.name });

        setData((prev) =>
          prev.map((x) => (x.id === editingId ? apiToUi(updated) : x))
        );
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
          <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
          <div className="text-xs opacity-70">
            {loading ? "Cargando..." : `${meta.total} categoría(s)`}
          </div>
        </div>
      </div>

      <CategoriesTable
        data={data}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <CategoriesModal
        open={open}
        mode={mode}
        initial={initialDraft}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}