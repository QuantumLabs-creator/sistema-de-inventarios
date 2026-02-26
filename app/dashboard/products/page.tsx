"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import ProductsTable from "@/src/components/products/ProductsTable";
import ProductsModal from "@/src/components/products/ProductsModal";

import type {
  Product,
  ProductDraft,
  OptionItem,
  UnitOptionItem,
} from "@/src/components/products/types";
import { emptyProductDraft } from "@/src/components/products/types";

// ✅ API real
type ApiProduct = {
  id: string;
  code: string;
  name: string;
  description: string | null;

  purchasePrice: string; // Prisma Decimal suele llegar como string
  salePrice: string;

  minStock: number;
  currentStock: number;

  minSalePrice?: string | null;
  maxSalePrice?: string | null;

  active: boolean;

  categoryId: string;
  supplierId: string | null;
  unitId: string;

  category?: { id: string; name: string };
  supplier?: { id: string; name: string } | null;
  unit?: { id: string; name: string; symbol: string | null };
};

type ApiList = {
  items: ApiProduct[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

function apiToUi(p: ApiProduct): Product {
  return {
    id: p.id,
    code: p.code ?? "",
    name: p.name ?? "",
    description: p.description ?? "",

    purchasePrice: String(p.purchasePrice ?? "0"),
    salePrice: String(p.salePrice ?? "0"),

    minStock: Number(p.minStock ?? 0),
    currentStock: Number(p.currentStock ?? 0),
    minSalePrice: p.minSalePrice ?? null,
    maxSalePrice: p.maxSalePrice ?? null,

    active: !!p.active,

    categoryId: p.categoryId ?? "",
    supplierId: p.supplierId ?? null,
    unitId: p.unitId ?? "",

    // ✅ objetos para pintar en tabla
    category: p.category ? { id: p.category.id, name: p.category.name } : null,
    supplier: p.supplier ? { id: p.supplier.id, name: p.supplier.name } : null,
    unit: p.unit
      ? { id: p.unit.id, name: p.unit.name, symbol: p.unit.symbol ?? null }
      : null,
  };
}

function uiToApi(d: ProductDraft) {
  // ✅ NO mandamos code (lo genera el repo)
  return {
    name: d.name.trim(),
    description: (d.description ?? "").trim() || null,

    purchasePrice: String(d.purchasePrice ?? "0"),
    salePrice: String(d.salePrice ?? "0"),

    minStock: Number(d.minStock ?? 0),
    currentStock: Number(d.currentStock ?? 0),
    minSalePrice: d.minSalePrice ? String(d.minSalePrice).trim() : null,
    maxSalePrice: d.maxSalePrice ? String(d.maxSalePrice).trim() : null,

    active: !!d.active,

    categoryId: String(d.categoryId ?? "").trim(),
    supplierId: d.supplierId ? String(d.supplierId).trim() : null,
    unitId: String(d.unitId ?? "").trim(),
  };
}

// debounce simple
function useDebouncedValue<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // combos del modal
  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [suppliers, setSuppliers] = useState<OptionItem[]>([]);
  const [units, setUnits] = useState<UnitOptionItem[]>([]);

  // búsqueda + paginación + filtros
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 350);

  const [active, setActive] = useState<string>(""); // "" | "true" | "false"
  const [categoryId, setCategoryId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [lowStock, setLowStock] = useState<boolean>(false);

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
  const [initialDraft, setInitialDraft] = useState<ProductDraft>(emptyProductDraft);

  async function loadProducts() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (qDebounced.trim()) sp.set("q", qDebounced.trim());

      if (active.trim()) sp.set("active", active.trim());
      if (categoryId.trim()) sp.set("categoryId", categoryId.trim());
      if (supplierId.trim()) sp.set("supplierId", supplierId.trim());
      if (unitId.trim()) sp.set("unitId", unitId.trim());
      if (lowStock) sp.set("lowStock", "true");

      sp.set("page", String(page));
      sp.set("pageSize", String(pageSize));

      const res = await fetch(`/api/products?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar productos");

      const json = (await res.json()) as ApiList;
      setData(json.items.map(apiToUi));
      setMeta(json.meta);
    } catch (e: any) {
      toast.error("Error cargando productos", {
        description: e?.message ?? "Intenta nuevamente",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadCombos() {
    // ✅ AJUSTA ESTOS ENDPOINTS a los tuyos reales
    // si aún no los tienes, déjalos vacíos y el modal igual compila.
    try {
      const [cRes, sRes, uRes] = await Promise.all([
        fetch("/api/categories?page=1&pageSize=500", { cache: "no-store" }).catch(() => null),
        fetch("/api/suppliers?page=1&pageSize=500", { cache: "no-store" }).catch(() => null),
        fetch("/api/units?page=1&pageSize=500", { cache: "no-store" }).catch(() => null),
      ]);

      if (cRes?.ok) {
        const j = await cRes.json();
        setCategories((j.items ?? []).map((x: any) => ({ id: x.id, name: x.name })));
      }
      if (sRes?.ok) {
        const j = await sRes.json();
        setSuppliers((j.items ?? []).map((x: any) => ({ id: x.id, name: x.name })));
      }
      if (uRes?.ok) {
        const j = await uRes.json();
        setUnits(
          (j.items ?? []).map((x: any) => ({
            id: x.id,
            name: x.name,
            symbol: x.symbol ?? null,
          }))
        );
      }
    } catch {
      // silencioso: combos opcionales
    }
  }

  useEffect(() => {
    loadCombos();
  }, []);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, page, active, categoryId, supplierId, unitId, lowStock]);

  function onCreate() {
    setMode("create");
    setEditingId(null);
    setInitialDraft(emptyProductDraft);
    setOpen(true);
  }

  function onEdit(p: Product) {
    setMode("edit");
    setEditingId(p.id);
    console.log("EDIT", p.minSalePrice, p.maxSalePrice);
    // ✅ tu Product NO tiene createdAt/updatedAt, así que no destructures eso
    const { id, code, ...rest } = p;
    setInitialDraft(rest);

    setOpen(true);
  }

  async function doDelete(id: string) {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "No se pudo eliminar");
    }
  }

  function onDelete(id: string) {
    const p = data.find((x) => x.id === id);

    toast("¿Desactivar producto?", {
      description: p ? `${p.code} • ${p.name}` : "Esta acción no se puede deshacer.",
      action: {
        label: "Desactivar",
        onClick: async () => {
          const tId = toast.loading("Desactivando...");
          try {
            await doDelete(id);
            toast.dismiss(tId);
            toast.success("Producto desactivado");

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

  async function createProduct(draft: ProductDraft) {
    const payload = uiToApi(draft);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error creando producto");
    }

    return (await res.json()) as ApiProduct;
  }

  async function updateProduct(id: string, draft: ProductDraft) {
    const payload = uiToApi(draft);

    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error actualizando producto");
    }

    return (await res.json()) as ApiProduct;
  }

  async function onSubmit(draft: ProductDraft) {
    const tId =
      mode === "create"
        ? toast.loading("Creando producto...")
        : toast.loading("Guardando cambios...");

    try {
      if (mode === "create") {
        const created = await createProduct(draft);

        toast.dismiss(tId);
        toast.success("Producto creado", { description: draft.name });

        setData((prev) => [apiToUi(created), ...prev]);
        setMeta((m) => ({ ...m, total: m.total + 1 }));
        setOpen(false);
        return;
      }

      if (mode === "edit" && editingId) {
        const updated = await updateProduct(editingId, draft);

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
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <div className="text-xs opacity-70">
            {loading ? "Cargando..." : `${meta.total} producto(s)`}
          </div>
        </div>
      </div>

      <ProductsTable
        data={data}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <ProductsModal
        open={open}
        mode={mode}
        initial={initialDraft}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
        categories={categories}
        suppliers={suppliers}
        units={units}
      />
    </div>
  );
}