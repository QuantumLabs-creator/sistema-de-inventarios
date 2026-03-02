import { NextResponse } from "next/server";
import { PrismaMovementRepository } from "@/src/modules/movements/infrastructure/movement.repo";
import { CancelMovementUseCase } from "@/src/modules/movements/application/cancelMovement.usecase";

const repo = new PrismaMovementRepository();

// POST /api/movements/:id/cancel
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(ctx.params);

    const body = await req.json().catch(() => ({}));
    const userId = String((body as any)?.userId ?? "").trim();
    if (!userId) throw new Error("userId requerido");

    const uc = new CancelMovementUseCase(repo);
    await uc.execute(id, userId);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 400 });
  }
}