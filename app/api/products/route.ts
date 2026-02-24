// app/api/products/route.ts
import { NextResponse } from "next/server";

import { PrismaProductRepository } from "@/src/modules/products/infrastructure/product.repo";
import { SearchProductsUseCase } from "@/src/modules/products/application/searchProduct.usercase";
import { CreateProductUseCase } from "@/src/modules/products/application/createProduct.usercase";

const repo = new PrismaProductRepository();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") ?? "").trim();
  const active = (searchParams.get("active") ?? "").trim(); // true | false
  const categoryId = (searchParams.get("categoryId") ?? "").trim();
  const supplierId = (searchParams.get("supplierId") ?? "").trim();
  const unitId = (searchParams.get("unitId") ?? "").trim();

  const lowStockRaw = (searchParams.get("lowStock") ?? "").trim(); // true | false
  const lowStock =
    lowStockRaw === ""
      ? undefined
      : ["true", "1", "yes", "si"].includes(lowStockRaw.toLowerCase());

  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "200");

  const uc = new SearchProductsUseCase(repo);
  const result = await uc.execute({
    q,
    active,
    categoryId,
    supplierId,
    unitId,
    lowStock,
    page,
    pageSize,
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const uc = new CreateProductUseCase(repo);
    const created = await uc.execute(body);

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 400 });
  }
}