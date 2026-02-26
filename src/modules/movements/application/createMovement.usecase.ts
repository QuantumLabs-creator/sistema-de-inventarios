// src/modules/movements/application/createMovement.usecase.ts
import type { MovementRepository } from "../domain/movement.repository";
import { MovementEntity } from "../domain/movement.entity";
import { normalizeInt, normalizeText } from "../domain/movement.rules";
import { assertCreateMovementDTO, type CreateMovementDTO } from "./dtos/movement.dto";

export class CreateMovementUseCase {
  constructor(private readonly repo: MovementRepository) {}

  async execute(input: unknown) {
    assertCreateMovementDTO(input);
    const dto = input as CreateMovementDTO;

    const type = String(dto.type ?? "").trim() as any;

    const productId = String(dto.productId ?? "").trim();
    const userId = String(dto.userId ?? "").trim();

    const quantity = normalizeInt(dto.quantity, 0);
    if (!quantity || quantity <= 0) throw new Error("quantity debe ser > 0");

    const entity = MovementEntity.create({
      type,
      quantity,
      reason: normalizeText(dto.reason) ?? null,
      productId,
      userId,
    });

    return this.repo.create(entity);
  }
}
