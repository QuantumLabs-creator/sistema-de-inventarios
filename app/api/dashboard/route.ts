import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export async function GET() {
  try {
    const now = new Date();
    const dayStart = startOfDay(now);
    const monthStart = startOfMonth(now);

    const [totalProducts, activeProducts, noStockProducts] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({ where: { active: true, currentStock: { lte: 0 } } }),
    ]);

    const [movesToday, movesMonth] = await Promise.all([
      prisma.movement.count({ where: { createdAt: { gte: dayStart } } }),
      prisma.movement.count({ where: { createdAt: { gte: monthStart } } }),
    ]);

    const [totalUsers, adminUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]);

    // ✅ actividad reciente (últimos 12)
    const [lastMoves, lastProds, lastUsers] = await Promise.all([
      prisma.movement.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { product: true, user: true },
      }),
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { category: true },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

    const activity = [
      ...lastMoves.map((m) => ({
        id: m.id,
        type: (m.type === "IN" || m.type === "RETURN" ? "MOVE_IN" : "MOVE_OUT") as
          | "MOVE_IN"
          | "MOVE_OUT",
        title:
          m.type === "IN"
            ? "Ingreso registrado"
            : m.type === "OUT"
            ? "Salida registrada"
            : m.type === "RETURN"
            ? "Devolución registrada"
            : "Ajuste registrado",
        subtitle: `${m.product.code} • ${m.product.name} • cant ${m.quantity}`,
        at: m.createdAt.toISOString(),
      })),
      ...lastProds.map((p) => ({
        id: p.id,
        type: "PRODUCT" as const,
        title: "Producto creado",
        subtitle: `${p.code} • ${p.name}${p.category ? ` • ${p.category.name}` : ""}`,
        at: p.createdAt.toISOString(),
      })),
      ...lastUsers.map((u) => ({
        id: u.id,
        type: "USER" as const,
        title: "Usuario creado",
        subtitle: `${u.name} • ${u.email}`,
        at: u.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => +new Date(b.at) - +new Date(a.at))
      .slice(0, 12);

    return NextResponse.json({
      kpis: {
        productos: { total: totalProducts, activos: activeProducts, sinStock: noStockProducts },
        movimientos: { hoy: movesToday, mes: movesMonth },
        usuarios: { total: totalUsers, admins: adminUsers },
        mesActual: { month: now.getMonth() + 1, year: now.getFullYear() },
      },
      activity,
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 400 }
    );
  }
}