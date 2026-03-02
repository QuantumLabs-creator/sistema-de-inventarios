"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Movement, MovementType } from "./types";
import { Ban, Pencil } from "lucide-react";

function labelType(t: MovementType) {
  if (t === "IN") return "Ingreso";
  if (t === "OUT") return "Salida";
  if (t === "RETURN") return "Devolución";
  return "Ajuste";
}

function badgeCls(t: MovementType) {
  if (t === "IN") return "bg-green-100 text-green-700 border-green-300";
  if (t === "OUT") return "bg-red-100 text-red-700 border-red-300";
  if (t === "RETURN") return "bg-blue-100 text-blue-700 border-blue-300";
  return "bg-amber-100 text-amber-800 border-amber-300";
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-PE", { hour12: false });
}

function money(v: unknown) {
  const n = Number(String(v ?? "0").replace(",", "."));
  if (!Number.isFinite(n)) return "—";
  return `S/ ${n.toFixed(2)}`;
}

export function getMovementColumns(opts: {
  onEditReason: (m: Movement) => void;
  onCancel: (id: string) => void;
}): ColumnDef<Movement>[] {
  return [
    {
      id: "rowNumber",
      header: "#",
      size: 40,
      cell: ({ row }) => (
        <span className="opacity-70 tabular-nums">{row.index + 1}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ getValue }) => <span className="tabular-nums">{fmtDate(String(getValue()))}</span>,
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ getValue }) => {
        const t = getValue() as MovementType;
        return (
          <span
            className={[
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border",
              badgeCls(t),
            ].join(" ")}
          >
            {labelType(t)}
          </span>
        );
      },
    },
    {
      id: "product",
      header: "Producto",
      cell: ({ row }) => {
        const p = row.original.product;
        if (!p) return "—";
        return (
          <div className="leading-tight">
            <div className="font-medium">{p.code}</div>
            <div className="text-xs opacity-70">{p.name}</div>
          </div>
        );
      },
    },
    { accessorKey: "quantity", header: "Cant." },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <div className="tabular-nums">
          <span className="opacity-70">{row.original.stockBefore}</span>
          <span className="opacity-60"> → </span>
          <span className={row.original.stockAfter < 0 ? "text-red-600 font-semibold" : "font-semibold"}>
            {row.original.stockAfter}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "unitPrice",
      header: "Precio (salida)",
      cell: ({ row }) => {
        // solo OUT normalmente
        if (row.original.type !== "OUT") return "—";
        return money(row.original.unitPrice ?? null);
      },
    },
    {
      accessorKey: "reason",
      header: "Motivo",
      cell: ({ row }) => <span className="opacity-90">{row.original.reason ?? "—"}</span>,
    },
    {
      id: "user",
      header: "Usuario",
      cell: ({ row }) => {
        const u = row.original.user;
        if (!u) return "—";
        return (
          <div className="leading-tight">
            <div className="font-medium">{u.name}</div>
            <div className="text-xs opacity-70">{u.email}</div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => opts.onEditReason(row.original)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
            title="Editar motivo"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            onClick={() => opts.onCancel(row.original.id)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
            title="Anular"
          >
            <Ban className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
}