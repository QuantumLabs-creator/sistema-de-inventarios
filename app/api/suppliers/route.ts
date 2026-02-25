// app/api/suppliers/route.ts
import { NextResponse } from "next/server";

import { PrismaSupplierRepository } from "@/src/modules/suppliers/infrastructure/supplier.repo";
import { CreateSupplierUseCase } from "@/src/modules/suppliers/application/createSupplier.usecase";
import { SearchSupplierUseCase } from "@/src/modules/suppliers/application/searchSupplier.usecase";

const repo = new PrismaSupplierRepository();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") ?? "").trim();
  const active = (searchParams.get("active") ?? "").trim();
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "50");

  const uc = new SearchSupplierUseCase(repo);
  const result = await uc.execute({ q, active, page, pageSize });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const uc = new CreateSupplierUseCase(repo);
    const created = await uc.execute(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 400 }
    );
  }
}