// src/modules/movements/application/getMovement.usecase.ts
import type { MovementRepository } from "../domain/movement.repository";

export class GetMovementUseCase {
  constructor(private readonly repo: MovementRepository) {}

  async execute(id: string) {
    const mid = String(id ?? "").trim();
    if (!mid) throw new Error("id requerido");

    const row = await this.repo.getById(mid);
    if (!row) throw new Error("Movimiento no encontrado");

    return row;
  }
}