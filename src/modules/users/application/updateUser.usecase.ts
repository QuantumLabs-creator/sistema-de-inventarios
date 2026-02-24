import type { UserRepository, UserRecord } from "../domain/user.repository";
import { normalizeUserUpdate } from "../domain/user.rules";
import type { UpdateUserDTO } from "./dtos/user.dto";

export class UpdateUserUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(id: string, dto: UpdateUserDTO): Promise<UserRecord> {
    if (!id?.trim()) {
      throw new Error("id requerido");
    }

    const input = normalizeUserUpdate(dto);

    return this.repo.update(id.trim(), input);
  }
}