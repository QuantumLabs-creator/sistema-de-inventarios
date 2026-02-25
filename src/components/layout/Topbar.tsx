"use client";

import { useTheme } from "../theme/ThemeProvider";

export default function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-2 hover:opacity-80 md:hidden"
            onClick={onOpenMenu}
            aria-label="Abrir menú"
          >
            {/* icon menu */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div>
            <div className="text-sm font-semibold leading-4">
              Gestión - Inventario
            </div>
            <div className="text-[11px] opacity-70 leading-4">
              Panel de administración
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Toggle theme */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-1.5 text-xs hover:opacity-80"
            title="Cambiar tema"
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>

          <div className="hidden sm:block text-xs opacity-70">
            2026
          </div>

          <div className="h-9 w-9 rounded-full bg-[var(--color-bg-muted)] ring-1 ring-[var(--color-border)]" />
        </div>
      </div>
    </header>
  );
}