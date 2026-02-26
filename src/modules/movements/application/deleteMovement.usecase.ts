import type { MovementRepository } from "../domain/movement.repository";

export class DeleteMovementUseCase {
  constructor(private readonly repo: MovementRepository) {}

  async execute(id: string, userId: string) {
    const mid = String(id ?? "").trim();
    const uid = String(userId ?? "").trim();
    if (!mid) throw new Error("id requerido");
    if (!uid) throw new Error("userId requerido");

    // repo debe implementar cancel(id, userId)
    // crea un movimiento compensatorio y ajusta stock
    await this.repo.cancel(mid, uid);
  }
}