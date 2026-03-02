import { NextResponse } from "next/server";
import { PrismaMovementRepository } from "@/src/modules/movements/infrastructure/movement.repo";
import { GetMovementUseCase } from "@/src/modules/movements/application/getMovement.usecase";
import { UpdateMovementUseCase } from "@/src/modules/movements/application/updateMovement.usecase";

const repo = new PrismaMovementRepository();

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(ctx.params);

    const uc = new GetMovementUseCase(repo);
    const row = await uc.execute(id);

    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 404 });
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(ctx.params);
    const body = await req.json();

    const uc = new UpdateMovementUseCase(repo);
    const updated = await uc.execute(id, body);

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 400 });
  }
}