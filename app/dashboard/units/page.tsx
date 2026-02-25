"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import UnitsTable from "@/src/components/units/UnitsTable";
import UnitsModal from "@/src/components/units/UnitsModal";

import type { Unit, UnitDraft } from "@/src/components/units/types";
import { emptyUnitDraft } from "@/src/components/units/types";

type ApiUnit = {
    id: string;
    name: string;
    symbol: string | null;
    active: boolean;
};

type ApiList = {
    items: ApiUnit[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
};

function apiToUi(u: ApiUnit): Unit {
    return {
        id: u.id,
        name: u.name ?? "",
        symbol: u.symbol ?? null,
        active: !!u.active,
    };
}

function uiToApi(d: UnitDraft) {
    return {
        name: d.name.trim(),
        symbol: (d.symbol ?? "").trim() || null,
        active: !!d.active,
    };
}

export default function UnitsPage() {
    const [data, setData] = useState<Unit[]>([]);
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
    const [initialDraft, setInitialDraft] = useState<UnitDraft>(emptyUnitDraft);

    async function loadUnits() {
        setLoading(true);
        try {
            const sp = new URLSearchParams();
            sp.set("page", String(page));
            sp.set("pageSize", String(pageSize));

            const res = await fetch(`/api/units?${sp.toString()}`, { cache: "no-store" });
            if (!res.ok) throw new Error("No se pudo cargar unidades");

            const json = (await res.json()) as ApiList;
            setData(json.items.map(apiToUi));
            setMeta(json.meta);
        } catch (e: any) {
            toast.error("Error cargando unidades", {
                description: e?.message ?? "Intenta nuevamente",
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUnits();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    function onCreate() {
        setMode("create");
        setEditingId(null);
        setInitialDraft(emptyUnitDraft);
        setOpen(true);
    }

    function onEdit(u: Unit) {
        setMode("edit");
        setEditingId(u.id);

        const { id, ...rest } = u;
        setInitialDraft(rest);

        setOpen(true);
    }

    async function doDelete(id: string) {
        const res = await fetch(`/api/units/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message ?? "No se pudo eliminar");
        }
    }

    function onDelete(id: string) {
        const u = data.find((x) => x.id === id);

        toast("¿Desactivar unidad?", {
            description: u
                ? `${u.name}${u.symbol ? ` (${u.symbol})` : ""}`
                : "Esta acción no se puede deshacer.",
            action: {
                label: "Desactivar",
                onClick: async () => {
                    const tId = toast.loading("Desactivando...");
                    try {
                        await doDelete(id);
                        toast.dismiss(tId);
                        toast.success("Unidad desactivada");

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

    async function createUnit(draft: UnitDraft) {
        const payload = uiToApi(draft);

        const res = await fetch("/api/units", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message ?? "Error creando unidad");
        }

        return (await res.json()) as ApiUnit;
    }

    async function updateUnit(id: string, draft: UnitDraft) {
        const payload = uiToApi(draft);

        const res = await fetch(`/api/units/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message ?? "Error actualizando unidad");
        }

        return (await res.json()) as ApiUnit;
    }

    async function onSubmit(draft: UnitDraft) {
        const tId =
            mode === "create"
                ? toast.loading("Creando unidad...")
                : toast.loading("Guardando cambios...");

        try {
            if (mode === "create") {
                const created = await createUnit(draft);

                toast.dismiss(tId);
                toast.success("Unidad creada", { description: draft.name });

                setData((prev) => [apiToUi(created), ...prev]);
                setMeta((m) => ({ ...m, total: m.total + 1 }));
                setOpen(false);
                return;
            }

            if (mode === "edit" && editingId) {
                const updated = await updateUnit(editingId, draft);

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
                    <h1 className="text-2xl font-semibold tracking-tight">Unidades</h1>
                    <div className="text-xs opacity-70">
                        {loading ? "Cargando..." : `${meta.total} unidad(es)`}
                    </div>
                </div>
            </div>

            <UnitsTable data={data} onCreate={onCreate} onEdit={onEdit} onDelete={onDelete} />

            <UnitsModal
                open={open}
                mode={mode}
                initial={initialDraft}
                onClose={() => setOpen(false)}
                onSubmit={onSubmit}
            />
        </div>
    );
}