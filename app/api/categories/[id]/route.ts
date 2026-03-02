// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { PrismaCategoryRepository } from "@/src/modules/categories/infrastructure/category.repo";
import { GetCategoryUseCase } from "@/src/modules/categories/application/getCategory.usecase";
import { UpdateCategoryUseCase } from "@/src/modules/categories/application/updateCategory.usecase";
import { DeleteCategoryUseCase } from "@/src/modules/categories/application/deleteCategory.usecase";

const repo = new PrismaCategoryRepository();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const uc = new GetCategoryUseCase(repo);
    const row = await uc.execute(id);
    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 404 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const uc = new UpdateCategoryUseCase(repo);
    const updated = await uc.execute(id, body);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
     const { id } = await params;
    const uc = new DeleteCategoryUseCase(repo);
    await uc.execute(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 400 }
    );
  }
}