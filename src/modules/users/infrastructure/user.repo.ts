// src/modules/users/infrastructure/user.repo.ts
import { prisma } from "@/src/shared/db/prisma";

import bcrypt from "bcryptjs";

import type {
  UserListResult,
  UserRecord,
  UserRepository,
  CreateUserInput,
  UpdateUserInput,
  UserListParams,
} from "../domain/user.repository";

import {
  normalizeUserRole,
  normalizeBoolean,
  normalizeEmail,
  normalizeText,
  normalizePassword,
} from "../domain/user.rules";
import { Role } from "@/src/generated/prisma/enums";
import { Prisma } from "@/src/generated/prisma/client";

/** ===================== Helpers ===================== */

function mapUser(u: Prisma.UserGetPayload<{}>): UserRecord {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as Role,
    active: u.active,
    phone: u.phone,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

function parseRoleFilter(v?: string): Role | undefined {
  if (!v) return undefined;
  return normalizeUserRole(v);
}

function parseActiveFilter(v?: string): boolean | undefined {
  if (v === undefined || v === null || String(v).trim() === "") return undefined;
  return normalizeBoolean(v, true);
}

/** ===================== Repository ===================== */

export class PrismaUserRepository implements UserRepository {
  async getById(id: string): Promise<UserRecord | null> {
    const u = await prisma.user.findUnique({ where: { id } });
    return u ? mapUser(u) : null;
  }

  async getByEmail(email: string): Promise<UserRecord | null> {
    const e = normalizeEmail(email);
    if (!e) return null;

    const u = await prisma.user.findUnique({ where: { email: e } });
    return u ? mapUser(u) : null;
  }

  async list(params: UserListParams): Promise<UserListResult> {
    const q = (params.q ?? "").trim();
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(500, Math.max(5, Number(params.pageSize ?? 10)));
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = {};

    const role = parseRoleFilter(params.role);
    if (role) where.role = role;

    const active = parseActiveFilter(params.active);
    if (active !== undefined) where.active = active;

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
    ]);

    return {
      items: items.map(mapUser),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    // Normalización mínima (si ya normalizas antes en service, igual no estorba)
    const name = normalizeText(input.name) ?? "";
    const email = normalizeEmail(input.email) ?? "";
    const role = normalizeUserRole(input.role);
    const active = normalizeBoolean(input.active, true);
    const phone = normalizeText(input.phone) ?? "";

    const pass = normalizePassword(input.password);
    if (!pass) throw new Error("Password es requerido");

    // ✅ hash aquí (como tu teacher)
    const hashed = await bcrypt.hash(pass, 10);

    const created = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        phone,
        active,
      },
    });

    return mapUser(created);
  }

  async update(id: string, input: UpdateUserInput): Promise<UserRecord> {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { id } });
      if (!existing) throw new Error("User no encontrado");

      const data: Prisma.UserUpdateInput = {};

      if (input.name !== undefined) data.name = normalizeText(input.name) ?? undefined;
      if (input.email !== undefined) data.email = normalizeEmail(input.email) ?? undefined;
      if (input.role !== undefined) data.role = normalizeUserRole(input.role);
      if (input.active !== undefined) data.active = normalizeBoolean(input.active, true);
      if (input.phone !== undefined) data.phone = normalizeText(input.phone) ?? undefined;

      if (input.password !== undefined) {
        const p = normalizePassword(input.password);
        if (p) data.password = await bcrypt.hash(p, 10);
      }

      const updated = await tx.user.update({
        where: { id },
        data,
      });

      return mapUser(updated);
    });
  }

  /** Soft delete: active=false (tu schema no tiene deletedAt/deletedBy) */
  async delete(id: string, deletedBy?: string): Promise<void> {
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) return;

    // evita auto-eliminarse si quieres: (opcional)
    // if (deletedBy && deletedBy === id) throw new Error("No puedes eliminar tu propio usuario");

    await prisma.user.update({
      where: { id },
      data: { active: false },
    });
  }
}