// src/modules/movements/application/searchMovement.usecase.ts
import type { MovementRepository, MovementListParams } from "../domain/movement.repository";

export class SearchMovementUseCase {
  constructor(private readonly repo: MovementRepository) {}

  async execute(params: MovementListParams) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(500, Math.max(5, Number(params.pageSize ?? 50)));

    return this.repo.list({
      q: (params.q ?? "").trim(),
      type: (params.type ?? "").trim(),
      productId: (params.productId ?? "").trim(),
      userId: (params.userId ?? "").trim(),
      page,
      pageSize,
    });
  }
}