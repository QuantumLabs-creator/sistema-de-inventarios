// app/api/suppliers/[id]/route.ts
import { NextResponse } from "next/server";

import { PrismaSupplierRepository } from "@/src/modules/suppliers/infrastructure/supplier.repo";
import { GetSupplierUseCase } from "@/src/modules/suppliers/application/getSupplier.usecase";
import { UpdateSupplierUseCase } from "@/src/modules/suppliers/application/updateSupplier.usecase";
import { DeleteSupplierUseCase } from "@/src/modules/suppliers/application/deleteSupplier.usecase";

const repo = new PrismaSupplierRepository();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const uc = new GetSupplierUseCase(repo);
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
    const uc = new UpdateSupplierUseCase(repo);
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
    const uc = new DeleteSupplierUseCase(repo);
    await uc.execute(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 400 }
    );
  }
}