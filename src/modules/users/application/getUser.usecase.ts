import type { UserRepository, UserRecord } from "../domain/user.repository";

export class GetUserUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(id: string): Promise<UserRecord> {
    if (!id?.trim()) throw new Error("id requerido");

    const user = await this.repo.getById(id.trim());
    if (!user) throw new Error("Usuario no encontrado");

    return user;
  }
}