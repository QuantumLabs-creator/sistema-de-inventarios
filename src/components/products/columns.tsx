// src/components/products/columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Product } from "./types";
import { Pencil, Trash2 } from "lucide-react";

function money(v: unknown) {
  // si tu API manda Decimal como string, esto funciona
  const n = Number(String(v ?? "0").replace(",", "."));
  if (!Number.isFinite(n)) return "—";
  return `S/ ${n.toFixed(2)}`;
}

export function getProductColumns(opts: {
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Product>[] {
  return [
    {
      id: "rowNumber",
      header: "#",
      size: 40,
      cell: ({ row }) => (
        <span className="opacity-70 tabular-nums">{row.index + 1}</span>
      ),
    },
    { accessorKey: "code", header: "Código" },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: "category",
      header: "Categoría",
      cell: ({ row }) => row.original.category?.name ?? "—",
    },
    {
      id: "unit",
      header: "Unidad",
      cell: ({ row }) => {
        const u = row.original.unit;
        if (!u) return "—";
        return u.symbol ? `${u.name} (${u.symbol})` : u.name;
      },
    },
    {
      accessorKey: "purchasePrice",
      header: "Compra",
      cell: ({ getValue }) => money(getValue()),
    },
    {
      accessorKey: "salePrice",
      header: "Venta",
      cell: ({ getValue }) => money(getValue()),
    },
    { accessorKey: "currentStock", header: "Stock" },
    { accessorKey: "minStock", header: "Mín." },
    {
      accessorKey: "active",
      header: "Estado",
      cell: ({ getValue }) => {
        const active = Boolean(getValue());
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border
              ${active ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}`}
          >
            {active ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => opts.onEdit(row.original)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => opts.onDelete(row.original.id)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
}