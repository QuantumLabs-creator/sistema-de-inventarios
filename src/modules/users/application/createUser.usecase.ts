import type { UserRepository } from "../domain/user.repository";
import { UserEntity } from "../domain/user.entity";
import {
  normalizeUserRole,
  normalizeBoolean,
  normalizeEmail,
  normalizeText,
  normalizePassword,
} from "../domain/user.rules";
import { assertCreateUserDTO, type CreateUserDTO } from "./dtos/user.dto";

export class CreateUserUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(input: unknown) {
    assertCreateUserDTO(input);
    const dto = input as CreateUserDTO;

    const name = normalizeText(dto.name) ?? "";
    const email = normalizeEmail(dto.email) ?? "";
    const role = normalizeUserRole(dto.role);
    const phone = normalizeText(dto.phone) ?? "";
    const active = normalizeBoolean(dto.active, true);

    const pass = normalizePassword(dto.password);
    if (!pass) throw new Error("password requerido");

    const entity = UserEntity.create({
      name,
      email,
      password: pass, // ⚠️ el repo lo hashea (como hicimos en PrismaUserRepository)
      role,
      phone,
      active,
    });

    return this.repo.create(entity);
  }
}