// app/api/categories/[id]/route.ts
import { NextResponse } from "next/server";

import { PrismaCategoryRepository } from "@/src/modules/categories/infrastructure/category.repo";
import { GetCategoryUseCase } from "@/src/modules/categories/application/getCategory.usecase";
import { UpdateCategoryUseCase } from "@/src/modules/categories/application/updateCategory.usecase";
import { DeleteCategoryUseCase } from "@/src/modules/categories/application/deleteCategory.usecase";

const repo = new PrismaCategoryRepository();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const uc = new GetCategoryUseCase(repo);
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
    const uc = new UpdateCategoryUseCase(repo);
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
    const uc = new DeleteCategoryUseCase(repo);
    await uc.execute(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 400 }
    );
  }
}