import { NextResponse } from "next/server";
import { PrismaMovementRepository } from "@/src/modules/movements/infrastructure/movement.repo";
import { GetMovementUseCase } from "@/src/modules/movements/application/getMovement.usecase";
import { UpdateMovementUseCase } from "@/src/modules/movements/application/updateMovement.usecase";

const repo = new PrismaMovementRepository();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const uc = new GetMovementUseCase(repo);
    const row = await uc.execute(params.id);
    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 404 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const uc = new UpdateMovementUseCase(repo);
    const updated = await uc.execute(params.id, body);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 400 });
  }
}