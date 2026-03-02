import { NextResponse } from "next/server";
import { PrismaMovementRepository } from "@/src/modules/movements/infrastructure/movement.repo";
import { CreateMovementUseCase } from "@/src/modules/movements/application/createMovement.usecase";
import { SearchMovementsUseCase } from "@/src/modules/movements/application/searchMovement.usecase";

const repo = new PrismaMovementRepository();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") ?? "").trim();
    const type = (searchParams.get("type") ?? "").trim();
    const productId = (searchParams.get("productId") ?? "").trim();
    const userId = (searchParams.get("userId") ?? "").trim();

    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const pageSize = Math.min(
      500,
      Math.max(5, Number(searchParams.get("pageSize") ?? "50") || 50)
    );

    const uc = new SearchMovementsUseCase(repo);
    const result = await uc.execute({
      q: q || undefined,
      type: type || undefined,
      productId: productId || undefined,
      userId: userId || undefined,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const uc = new CreateMovementUseCase(repo);
    const created = await uc.execute(body);

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 400 });
  }
}