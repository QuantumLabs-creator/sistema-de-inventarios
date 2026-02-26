import type { MovementRepository } from "../domain/movement.repository";
import { normalizeText } from "../domain/movement.rules";
import { assertUpdateMovementDTO, type UpdateMovementDTO } from "./dtos/movement.dto";

export class UpdateMovementUseCase {
  constructor(private readonly repo: MovementRepository) {}

  async execute(id: string, input: unknown) {
    const mid = String(id ?? "").trim();
    if (!mid) throw new Error("id requerido");

    assertUpdateMovementDTO(input);
    const dto = input as UpdateMovementDTO;

    // ✅ solo motivo/observación
    const patch = {
      reason: dto.reason !== undefined ? (normalizeText(dto.reason) ?? null) : undefined,
    };

    // repo debe tener updateReason (abajo te lo dejo)
    return this.repo.update(mid, patch);
  }
}