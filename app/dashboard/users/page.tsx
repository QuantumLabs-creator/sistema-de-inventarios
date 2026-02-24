"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import UsersTable from "@/src/components/users/UsersTable";
import UsersModal from "@/src/components/users/UsersModal";

import type { User, UserDraft, UserRole } from "@/src/components/users/types";
import { emptyUserDraft } from "@/src/components/users/types";

// ✅ API real (según tu prisma schema)
type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "WAREHOUSE";
  active: boolean;
  phone: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

type ApiList = {
  items: ApiUser[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

function mapRole(v: unknown): UserRole {
  const x = String(v ?? "").toUpperCase();
  if (x === "ADMIN" || x === "WAREHOUSE") return x as UserRole;
  return "USER";
}

function apiToUi(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name ?? "",
    email: u.email ?? "",
    role: mapRole(u.role),
    active: !!u.active,
    phone: u.phone ?? "",
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

function uiToApi(d: UserDraft, mode: "create" | "edit") {
  const base = {
    name: d.name.trim(),
    email: d.email.trim(),
    role: d.role as UserRole,
    phone: (d.phone ?? "").trim() || null,
    active: !!d.active,
  };

  // password: requerido en create, opcional en edit
  if (mode === "create") {
    return { ...base, password: (d.password ?? "").trim() };
  }

  const pass = (d.password ?? "").trim();
  return pass ? { ...base, password: pass } : base;
}

// pequeño debounce sin libs
function useDebouncedValue<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function UsuariosPage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // búsqueda + paginación
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 350);
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
  const [initialDraft, setInitialDraft] = useState<UserDraft>(emptyUserDraft);

  async function load() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (qDebounced.trim()) sp.set("q", qDebounced.trim());
      sp.set("page", String(page));
      sp.set("pageSize", String(pageSize));

      const res = await fetch(`/api/users?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar usuarios");

      const json = (await res.json()) as ApiList;
      setData(json.items.map(apiToUi));
      setMeta(json.meta);
    } catch (e: any) {
      toast.error("Error cargando usuarios", {
        description: e?.message ?? "Intenta nuevamente",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, page]);

  function onCreate() {
    setMode("create");
    setEditingId(null);
    setInitialDraft(emptyUserDraft);
    setOpen(true);
  }

  function onEdit(u: User) {
    setMode("edit");
    setEditingId(u.id);

    // ✅ para editar no mandamos password inicial
    const { id, createdAt, updatedAt, ...rest } = u;
    setInitialDraft({ ...rest, password: "" });

    setOpen(true);
  }

  async function doDelete(id: string) {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "No se pudo eliminar");
    }
  }

  function onDelete(id: string) {
    const u = data.find((x) => x.id === id);

    toast("¿Desactivar usuario?", {
      description: u ? `${u.name} • ${u.email}` : "Esta acción no se puede deshacer.",
      action: {
        label: "Desactivar",
        onClick: async () => {
          const tId = toast.loading("Desactivando...");
          try {
            await doDelete(id);
            toast.dismiss(tId);
            toast.success("Usuario desactivado");

            // como tu delete es soft (active=false), puedes:
            // A) quitarlo de la lista
            setData((prev) => prev.filter((x) => x.id !== id));
            setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }));

            // B) o marcarlo como inactivo (si quieres mostrarlo):
            // setData((prev) => prev.map((x) => (x.id === id ? { ...x, active: false } : x)));
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

  async function createUser(draft: UserDraft) {
    const payload = uiToApi(draft, "create");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error creando usuario");
    }

    return (await res.json()) as ApiUser;
  }

  async function updateUser(id: string, draft: UserDraft) {
    const payload = uiToApi(draft, "edit");

    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error actualizando usuario");
    }

    return (await res.json()) as ApiUser;
  }

  async function onSubmit(draft: UserDraft) {
    const tId =
      mode === "create"
        ? toast.loading("Creando usuario...")
        : toast.loading("Guardando cambios...");

    try {
      if (mode === "create") {
        if (!draft.password?.trim()) throw new Error("Password requerido");
        const created = await createUser(draft);

        toast.dismiss(tId);
        toast.success("Usuario creado", { description: draft.name });

        setData((prev) => [apiToUi(created), ...prev]);
        setMeta((m) => ({ ...m, total: m.total + 1 }));
        setOpen(false);
        return;
      }

      if (mode === "edit" && editingId) {
        const updated = await updateUser(editingId, draft);

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
          <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
          <div className="text-xs opacity-70">
            {loading ? "Cargando..." : `${meta.total} usuario(s)`}
          </div>
        </div>

        {/* ✅ si quieres controlar búsqueda desde aquí (y no desde la tabla) */}
        {/* 
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        /> 
        */}
      </div>

      <UsersTable
        data={data}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <UsersModal
        open={open}
        mode={mode}
        initial={initialDraft}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}