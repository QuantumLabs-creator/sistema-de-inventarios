import type { MovementRepository } from "../domain/movement.repository";

export class CancelMovementUseCase {
  constructor(private readonly repo: MovementRepository) {}

  async execute(id: string, cancelledByUserId: string) {
    const mid = String(id ?? "").trim();
    const uid = String(cancelledByUserId ?? "").trim();

    if (!mid) throw new Error("id requerido");
    if (!uid) throw new Error("userId requerido");

    await this.repo.cancel(mid, uid);
    return { ok: true };
  }
}