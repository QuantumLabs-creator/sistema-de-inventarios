// src/modules/movements/application/searchMovement.usecase.ts
import type { MovementRepository } from "../domain/movement.repository";
import type { MovementQueryDTO } from "./dtos/movement.dto";

export class SearchMovementsUseCase {
  constructor(private readonly repo: MovementRepository) {}

  async execute(query: MovementQueryDTO) {
    const q = (query.q ?? "").trim();
    const type = (query.type ?? "").trim();
    const productId = (query.productId ?? "").trim();
    const userId = (query.userId ?? "").trim();

    const page = Math.max(1, Number(query.page ?? 1));
    const pageSize = Math.min(500, Math.max(5, Number(query.pageSize ?? 50)));

    return this.repo.list({
      q: q || undefined,
      type: type || undefined,
      productId: productId || undefined,
      userId: userId || undefined,
      page,
      pageSize,
    });
  }
}