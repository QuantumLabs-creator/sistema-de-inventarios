// app/api/units/[id]/route.ts
import { NextResponse } from "next/server";

import { PrismaUnitRepository } from "@/src/modules/units/infrastructure/unit.repo";
import { GetUnitUseCase } from "@/src/modules/units/application/getUnit.usecase";
import { UpdateUnitUseCase } from "@/src/modules/units/application/updateUnit.usecase";
import { DeleteUnitUseCase } from "@/src/modules/units/application/deleteUnit.usecase";

const repo = new PrismaUnitRepository();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const uc = new GetUnitUseCase(repo);
    const row = await uc.execute(params.id);
    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 404 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const uc = new UpdateUnitUseCase(repo);
    const updated = await uc.execute(params.id, body);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const uc = new DeleteUnitUseCase(repo);
    await uc.execute(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 400 }
    );
  }
}