import { prisma } from "@/src/shared/db/prisma";
import type { Prisma } from "@/src/generated/prisma/client";

import type {
    MovementRepository,
    MovementRecord,
    MovementListParams,
    MovementListResult,
    CreateMovementInput,
    UpdateMovementInput,
} from "../domain/movement.repository";

import { normalizeInt, normalizeText } from "../domain/movement.rules";

function mapMovement(
    m: Prisma.MovementGetPayload<{ include: { product: true; user: true } }>
): MovementRecord {
    return {
        id: m.id,
        type: m.type,
        quantity: m.quantity,
        stockBefore: m.stockBefore,
        stockAfter: m.stockAfter,
        reason: m.reason ?? null,
        createdAt: m.createdAt,

        productId: m.productId,
        userId: m.userId,

        product: { id: m.product.id, code: m.product.code, name: m.product.name },
        user: { id: m.user.id, name: m.user.name, email: m.user.email },
    };
}

function safeStr(v?: string | null) {
    const s = String(v ?? "").trim();
    return s.length ? s : undefined;
}

export class PrismaMovementRepository implements MovementRepository {
    async getById(id: string) {
        const m = await prisma.movement.findUnique({
            where: { id },
            include: { product: true, user: true },
        });
        return m ? mapMovement(m) : null;
    }

    async list(params: MovementListParams): Promise<MovementListResult> {
        const page = Math.max(1, Number(params.page ?? 1));
        const pageSize = Math.min(500, Math.max(5, Number(params.pageSize ?? 50)));
        const skip = (page - 1) * pageSize;

        const where: Prisma.MovementWhereInput = {};

        const type = safeStr(params.type);
        if (type) where.type = type as any;

        const productId = safeStr(params.productId);
        if (productId) where.productId = productId;

        const userId = safeStr(params.userId);
        if (userId) where.userId = userId;

        const q = (params.q ?? "").trim();
        if (q) {
            where.OR = [
                { reason: { contains: q, mode: "insensitive" } },
                { product: { code: { contains: q, mode: "insensitive" } } },
                { product: { name: { contains: q, mode: "insensitive" } } },
                { user: { name: { contains: q, mode: "insensitive" } } },
                { user: { email: { contains: q, mode: "insensitive" } } },
            ];
        }

        const [total, items] = await Promise.all([
            prisma.movement.count({ where }),
            prisma.movement.findMany({
                where,
                include: { product: true, user: true },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
        ]);

        return {
            items: items.map(mapMovement),
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.max(1, Math.ceil(total / pageSize)),
            },
        };
    }

    async create(input: CreateMovementInput): Promise<MovementRecord> {
        return prisma.$transaction(async (tx) => {
            const productId = String(input.productId ?? "").trim();
            const userId = String(input.userId ?? "").trim();
            const type = String(input.type ?? "").trim() as any;

            const quantity = normalizeInt(input.quantity, 0);
            if (!quantity || quantity <= 0) throw new Error("quantity debe ser > 0");

            const reason = normalizeText(input.reason);

            const product = await tx.product.findUnique({ where: { id: productId } });
            if (!product) throw new Error("Producto no encontrado");
            if (!product.active) throw new Error("Producto inactivo");

            const stockBefore = product.currentStock;
            let stockAfter = stockBefore;

            if (type === "IN" || type === "RETURN") stockAfter = stockBefore + quantity;
            else if (type === "OUT") stockAfter = stockBefore - quantity;
            else if (type === "ADJUSTMENT") {
                // en ajuste, quantity es el cambio (puede ser + o -)
                // si quieres permitir negativo: cambia normalizeInt y validación
                stockAfter = stockBefore + quantity;
            } else {
                throw new Error("type inválido");
            }

            if (stockAfter < 0) throw new Error("Stock insuficiente");

            const created = await tx.movement.create({
                data: {
                    type,
                    quantity,
                    stockBefore,
                    stockAfter,
                    reason: reason ?? null,
                    productId,
                    userId,
                },
                include: { product: true, user: true },
            });

            await tx.product.update({
                where: { id: productId },
                data: { currentStock: stockAfter },
            });

            return mapMovement(created);
        });
    }

    async update(id: string, input: UpdateMovementInput) {
        const mid = String(id ?? "").trim();
        if (!mid) throw new Error("id requerido");

        const reason =
            input.reason !== undefined ? (normalizeText(input.reason) ?? null) : undefined;

        const updated = await prisma.movement.update({
            where: { id: mid },
            data: {
                ...(reason !== undefined ? { reason } : {}),
            },
            include: { product: true, user: true },
        });

        return mapMovement(updated);
    }

    async cancel(id: string, cancelledByUserId: string): Promise<void> {
        const mid = String(id ?? "").trim();
        const uid = String(cancelledByUserId ?? "").trim();
        if (!mid) throw new Error("id requerido");
        if (!uid) throw new Error("userId requerido");

        await prisma.$transaction(async (tx) => {
            const original = await tx.movement.findUnique({
                where: { id: mid },
                include: { product: true },
            });
            if (!original) throw new Error("Movimiento no encontrado");

            const product = await tx.product.findUnique({
                where: { id: original.productId },
            });
            if (!product) throw new Error("Producto no encontrado");

            // ✅ si tu quantity siempre es positivo, usamos tal cual
            const qty = Math.abs(original.quantity);

            // ✅ tipo inverso (coherente con tu lógica actual)
            const inverseType =
                original.type === "OUT"
                    ? "IN"
                    : "OUT"; // IN, RETURN, ADJUSTMENT => OUT

            const stockBefore = product.currentStock;
            const stockAfter =
                inverseType === "IN" ? stockBefore + qty : stockBefore - qty;

            if (stockAfter < 0) throw new Error("No se puede anular: stock insuficiente");

            await tx.movement.create({
                data: {
                    type: inverseType as any,
                    quantity: qty,
                    stockBefore,
                    stockAfter,
                    reason: `ANULACIÓN de ${original.id}${original.reason ? ` • ${original.reason}` : ""}`,
                    productId: original.productId,
                    userId: uid,
                },
            });

            await tx.product.update({
                where: { id: original.productId },
                data: { currentStock: stockAfter },
            });
        });
    }

}