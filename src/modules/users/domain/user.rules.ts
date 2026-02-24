
import type { UpdateUserInput } from "./user.repository";
import type { Role, UpdateUserDTO } from "../application/dtos/user.dto";

/** Normaliza Role (ADMIN | USER | WAREHOUSE) */
export function normalizeUserRole(v: unknown): Role {
  const s = String(v ?? "USER").toUpperCase();

  if (s === "ADMIN" || s === "USER" || s === "WAREHOUSE") {
    return s as Role;
  }

  return "USER";
}

/** Normaliza boolean (active) */
export function normalizeBoolean(v: unknown, defaultValue = true): boolean {
  if (typeof v === "boolean") return v;

  const s = String(v ?? "").trim().toLowerCase();
  if (s === "true" || s === "1" || s === "yes" || s === "y" || s === "si") return true;
  if (s === "false" || s === "0" || s === "no" || s === "n") return false;

  return defaultValue;
}

/** Texto seguro: trim y null si queda vacío */
export function normalizeText(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

/** Email simple (no regex pesada): trim + lower + null si vacío */
export function normalizeEmail(v: unknown): string | null {
  const s = normalizeText(v);
  if (!s) return null;
  return s.toLowerCase();
}

/**
 * Password: opcional.
 * - null si no viene o si está vacío
 * - NO hashea aquí (eso debería ir en service/repository)
 */
export function normalizePassword(v: unknown): string | null {
  const s = normalizeText(v);
  if (!s) return null;
  return s;
}

/**
 * Normaliza un update parcial.
 * Solo asigna campos si vienen en el DTO (igual que tu ejemplo).
 */
export function normalizeUserUpdate(dto: UpdateUserDTO): UpdateUserInput {
  const out: UpdateUserInput = {};

  if (dto.name !== undefined) out.name = normalizeText(dto.name);
  if (dto.email !== undefined) out.email = normalizeEmail(dto.email);
  if (dto.role !== undefined) out.role = normalizeUserRole(dto.role);
  if(dto.phone !== undefined) out.phone = normalizeText(dto.phone)
  if (dto.active !== undefined) out.active = normalizeBoolean(dto.active, true);

  // password: solo si el dto lo trae y no está vacío
  if (dto.password !== undefined) {
    const p = normalizePassword(dto.password);
    if (p) out.password = p;
  }

  return out;
}