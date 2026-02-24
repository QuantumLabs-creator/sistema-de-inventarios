// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";

import { PrismaUserRepository } from "@/src/modules/users/infrastructure/user.repo";
import { UpdateUserUseCase } from "@/src/modules/users/application/updateUser.usecase";
import { GetUserUseCase } from "@/src/modules/users/application/getUser.usecase";
import { DeleteUserUseCase } from "@/src/modules/users/application/deleteUser.usecase";

const repo = new PrismaUserRepository();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅
    const body = await req.json().catch(() => ({}));

    const uc = new UpdateUserUseCase(repo);
    const updated = await uc.execute(id, body);

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 400 }
    );
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅

    const uc = new GetUserUseCase(repo);
    const user = await uc.execute(id);

    return NextResponse.json(user);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 404 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅

    const uc = new DeleteUserUseCase(repo);
    await uc.execute(id);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Error" },
      { status: 400 }
    );
  }
}