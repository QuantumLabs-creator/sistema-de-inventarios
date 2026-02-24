"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "./types";
import { Pencil, Trash2 } from "lucide-react";

export function getUserColumns(opts: {
  onEdit: (u: User) => void;
  onDelete: (id: string) => void;
}): ColumnDef<User>[] {
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
      accessorKey: "fullName",
      header: "Nombre",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Teléfono" },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ getValue }) => {
        const v = String(getValue() ?? "");
        const isAdmin = v === "ADMIN";
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border
              ${isAdmin ? "bg-indigo-100 text-indigo-700 border-indigo-300" : "bg-zinc-100 text-zinc-700 border-zinc-300"}`}
          >
            {isAdmin ? "ADMIN" : "USER"}
          </span>
        );
      },
    },
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
            <Pencil className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => opts.onDelete(row.original.id)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
          >
            <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
  ];
}