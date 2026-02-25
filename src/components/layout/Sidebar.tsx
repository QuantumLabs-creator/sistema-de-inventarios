"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Package,
  Plus,
  ArrowUpDown,
  History,
  Users,
  UserPlus,
} from "lucide-react";

type Props = {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
  /** Roles del usuario actual, ej: ["ADMIN"] */
  roles?: string[];
};

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ active: boolean }>;
  roles?: string[];
};

type NavLink = {
  type: "link";
  key: string;
  label: string;
  icon: ComponentType<{ active: boolean }>;
  href: string;
  roles?: string[];
};

type NavGroup = {
  type: "group";
  key: string;
  label: string;
  icon: ComponentType<{ active: boolean }>;
  items: NavItem[];
  roles?: string[];
};

type NavNode = NavLink | NavGroup;

/** wrapper igual a tu estilo (sin dependencias extra) */
function IconWrap({
  children,
  active,
}: {
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 transition",
        active
          ? "bg-[var(--color-surface)] ring-[var(--color-border)]"
          : "bg-[var(--color-surface)] ring-[var(--color-border)] opacity-80 group-hover:opacity-100",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

/** helper para lucide -> mismo contrato icon({active}) */
function L(Icon: any, size = 18) {
  return function LucideIcon({ active }: { active: boolean }) {
    return (
      <IconWrap active={active}>
        <Icon
          size={size}
          className={active ? "text-primary" : "text-current"}
        />
      </IconWrap>
    );
  };
}

/** ✅ TU MENU (con roles en Usuarios) */
const navTree: NavNode[] = [
  {
    type: "link",
    key: "dashboard",
    label: "Dashboard",
    icon: L(LayoutDashboard, 18),
    href: "/dashboard",
  },
  {
    type: "group",
    key: "products",
    label: "Inventario",
    icon: L(Package, 18),
    items: [
      {
        href: "/dashboard/products",
        label: "Gestionar Productos",
        icon: L(Package, 18),
      },
      {
        href: "/dashboard/categories",
        label: "Gestionar Categorias",
        icon: L(Package, 18),
      },
       {
        href: "/dashboard/units",
        label: "Gestionar Unidades",
        icon: L(Package, 18),
      },
       {
        href: "/dashboard/suppliers",
        label: "Gestionar Proveedores",
        icon: L(Package, 18),
      },

    ],
  },
  {
    type: "group",
    key: "movements",
    label: "Movimientos",
    icon: L(ArrowUpDown, 18),
    items: [
      {
        href: "/movements/new",
        label: "Registrar Movimiento",
        icon: L(Plus, 18),
      },
      {
        href: "/movements/history",
        label: "Historial",
        icon: L(History, 18),
      },
    ],
  },
  {
    type: "group",
    key: "users",
    label: "Usuarios",
    icon: L(Users, 18),

    items: [
      {
        href: "/dashboard/users/",
        label: "Gestion de Usuarios",
        icon: L(Users, 18),
      },
    ],
  },
];

export default function Sidebar({
  onNavigate,
  collapsed = false,
  onToggle,
  roles = [],
}: Props) {
  const pathname = usePathname();

  // ✅ filtro por roles (si no pasas roles=["ADMIN"], no aparece Usuarios)
  const visibleTree = useMemo(() => {
    const canSee = (allowed?: string[]) =>
      !allowed || allowed.length === 0 || allowed.some((r) => roles.includes(r));

    return navTree
      .filter((n) => canSee(n.roles))
      .map((n) => {
        if (n.type === "group") {
          const items = n.items.filter((it) => canSee(it.roles));
          return { ...n, items };
        }
        return n;
      })
      .filter((n) => (n.type === "group" ? n.items.length > 0 : true));
  }, [roles]);

  // abre por defecto el grupo que contiene la ruta actual
  const activeGroupKey = useMemo(() => {
    const found = visibleTree.find((n) => {
      if (n.type === "group") return n.items.some((it) => isActive(pathname, it.href));
      return isActive(pathname, n.href);
    });
    return found?.key ?? "dashboard";
  }, [pathname, visibleTree]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenGroups((prev) => ({ ...prev, [activeGroupKey]: true }));
  }, [activeGroupKey]);

  // si está colapsado, cerramos todo (solo íconos)
  useEffect(() => {
    if (collapsed) setOpenGroups({});
  }, [collapsed]);

  return (
    <aside
      className={[
        "relative h-dvh overflow-visible border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300",
        collapsed ? "w-[72px] p-0" : "w-[280px] p-3 pt-0",
      ].join(" ")}
    >
      <button
        onClick={() => onToggle?.()}
        aria-label="Toggle sidebar"
        className="
          absolute -right-4 top-10 z-[200]
          flex h-7 w-7 items-center justify-center
          rounded-full border border-[var(--color-border)]
          bg-[var(--color-surface)] text-xs shadow-lg
          hover:bg-[var(--color-muted)]
        "
      >
        <span className={collapsed ? "rotate-0" : "rotate-180"}>⮞</span>
      </button>

      {/* Brand */}
      <div className="border-b border-[var(--color-border)] px-0">
        <div className={collapsed ? "flex justify-center" : "flex items-center gap-3"}>
          <Image
            src="/logo.png" // 🔁 cambia a tu logo
            alt="Sistema de Inventarios"
            width={collapsed ? 48 : 64}
            height={collapsed ? 48 : 64}
            className="object-contain"
            priority
          />
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight">Gestion de Inventarios</div>
              <div className="text-xs opacity-70">Dashboard • 2026</div>
            </div>
          )}
        </div>
      </div>

      {/* NAV con submenús */}
      {collapsed ? (
        // ✅ COLAPSADO: sin scroll (para que el popup no se recorte)
        <nav className="mt-3 space-y-1 px-0">
          {visibleTree.map((node) => {
            // ✅ LINK DIRECTO
            if (node.type === "link") {
              const active = isActive(pathname, node.href);
              return (
                <Link
                  key={node.key}
                  href={node.href}
                  onClick={onNavigate}
                  className={[
                    "group flex items-center rounded-xl px-3 py-2.5 text-sm transition",
                    "justify-center gap-0",
                    active
                      ? "bg-[var(--color-muted)] ring-1 ring-[var(--color-border)]"
                      : "hover:bg-[var(--color-muted)]",
                  ].join(" ")}
                >
                  <node.icon active={active} />
                </Link>
              );
            }

            // ✅ GRUPO CON SUBMENU (popup hover)
            const activeItem = node.items.find((it) => isActive(pathname, it.href));
            const active = !!activeItem;

            return (
              <div key={node.key} className="relative group">
                <button
                  type="button"
                  className={[
                    "group flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-[var(--color-muted)] ring-1 ring-[var(--color-border)]"
                      : "hover:bg-[var(--color-muted)]",
                  ].join(" ")}
                  aria-label={node.label}
                >
                  <node.icon active={active} />
                </button>

                <div
                  className="
                    invisible opacity-0 group-hover:visible group-hover:opacity-100
                    absolute left-[72px] top-0 z-50
                    min-w-[220px]
                    rounded-xl border border-[var(--color-border)]
                    bg-[var(--color-surface)] shadow-xl
                    p-2
                    transition-all duration-150
                  "
                >
                  <div className="px-2 pb-2 text-xs font-semibold opacity-70">
                    {node.label}
                  </div>

                  <div className="space-y-1">
                    {node.items.map((item) => {
                      const itemActive = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onNavigate}
                          className={[
                            "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                            itemActive
                              ? "bg-[var(--color-muted)] ring-1 ring-[var(--color-border)]"
                              : "hover:bg-[var(--color-muted)]",
                          ].join(" ")}
                        >
                          <item.icon active={itemActive} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      ) : (
        // ✅ EXPANDIDO: con scroll interno + scrollbar oculto
        <div className="mt-3 h-[calc(100dvh-120px)] overflow-y-auto scrollbar-hide">
          <nav className="space-y-2">
            {visibleTree.map((node) => {
              // ✅ LINK DIRECTO
              if (node.type === "link") {
                const active = isActive(pathname, node.href);
                return (
                  <Link
                    key={node.key}
                    href={node.href}
                    onClick={onNavigate}
                    className={[
                      "group flex items-center rounded-xl px-3 py-2.5 text-sm transition gap-3",
                      active
                        ? "bg-[var(--color-muted)] ring-1 ring-[var(--color-border)]"
                        : "hover:bg-[var(--color-muted)]",
                    ].join(" ")}
                  >
                    <node.icon active={active} />
                    <span className="font-medium">{node.label}</span>
                  </Link>
                );
              }

              // ✅ GRUPO (desplegable normal)
              const groupActive = node.items.some((it) => isActive(pathname, it.href));
              const open = !!openGroups[node.key];

              return (
                <div key={node.key} className="space-y-1">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroups((prev) => ({ ...prev, [node.key]: !prev[node.key] }))
                    }
                    className={[
                      "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
                      groupActive
                        ? "bg-[var(--color-muted)] ring-1 ring-[var(--color-border)]"
                        : "hover:bg-[var(--color-muted)]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <node.icon active={groupActive} />
                      <span className="font-medium">{node.label}</span>
                    </div>

                    <span
                      className={[
                        "text-xs opacity-70 transition",
                        open ? "rotate-90" : "",
                      ].join(" ")}
                    >
                      ⮞
                    </span>
                  </button>

                  {open && (
                    <div className="ml-3 space-y-1 border-l border-[var(--color-border)] pl-3">
                      {node.items.map((item) => {
                        const active = isActive(pathname, item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={[
                              "group flex items-center rounded-xl px-3 py-2 text-sm transition gap-3",
                              active
                                ? "bg-[var(--color-muted)] ring-1 ring-[var(--color-border)]"
                                : "hover:bg-[var(--color-muted)]",
                            ].join(" ")}
                          >
                            <item.icon active={active} />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </aside>
  );
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}