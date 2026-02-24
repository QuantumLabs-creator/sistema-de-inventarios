import { NextResponse } from "next/server";

import { PrismaUserRepository } from "@/src/modules/users/infrastructure/user.repo";
import { CreateUserUseCase } from "@/src/modules/users/application/createUser.usecase";
import { SearchUsersUseCase } from "@/src/modules/users/application/searchUser.usecase";

const repo = new PrismaUserRepository();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") ?? "").trim();
  const role = (searchParams.get("role") ?? "").trim();       // ADMIN | USER | WAREHOUSE
  const active = (searchParams.get("active") ?? "").trim();   // true | false
  const phone = (searchParams.get("phone") ?? "").trim();

  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "200");

  const uc = new SearchUsersUseCase(repo);
  const result = await uc.execute({ q, role, active, phone, page, pageSize });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const uc = new CreateUserUseCase(repo);
    const created = await uc.execute(body);

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 400 }
    );
  }
}