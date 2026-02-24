import type { UserRepository } from "../domain/user.repository";

export class DeleteUserUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(id: string, deletedBy?: string) {
    if (!id?.trim()) throw new Error("id requerido");
    await this.repo.delete(id.trim(), deletedBy);
  }
}