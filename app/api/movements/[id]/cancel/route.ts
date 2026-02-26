import { NextResponse } from "next/server";
import { PrismaMovementRepository } from "@/src/modules/movements/infrastructure/movement.repo";
import { DeleteMovementUseCase } from "@/src/modules/movements/application/deleteMovement.usecase";

const repo = new PrismaMovementRepository();

// POST /api/movements/:id/cancel
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = String((body as any)?.userId ?? "").trim();
    if (!userId) throw new Error("userId requerido");

    const uc = new DeleteMovementUseCase(repo);
    await uc.execute(params.id, userId);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 400 });
  }
}