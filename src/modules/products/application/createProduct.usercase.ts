// src/modules/products/application/createProduct.usecase.ts
import type { ProductRepository } from "../domain/product.repository";
import { ProductEntity } from "../domain/product.entity";
import { assertCreateProductDTO, type CreateProductDTO } from "./dtos/product.dto";
import {
    normalizeText,
    normalizeBoolean,
    normalizeInt,
    normalizeMoney,
} from "../domain/product.rules";

export class CreateProductUseCase {
    constructor(private readonly repo: ProductRepository) { }

    async execute(input: unknown) {
        assertCreateProductDTO(input);
        const dto = input as CreateProductDTO;

        const name = String(dto.name ?? "").trim();

      
        if (!name) throw new Error("name requerido");

        const entity = ProductEntity.create({
            
            name,
            description: normalizeText(dto.description) ?? null,

            purchasePrice: normalizeMoney(dto.purchasePrice, "purchasePrice"),
            salePrice: normalizeMoney(dto.salePrice, "salePrice"),

            minStock: normalizeInt(dto.minStock, 0) ?? 0,
            currentStock: normalizeInt(dto.currentStock, 0,) ?? 0,

            active: normalizeBoolean(dto.active, true),

            categoryId: String(dto.categoryId ?? "").trim(),
            supplierId: normalizeText(dto.supplierId) ?? null,
            unitId: String(dto.unitId ?? "").trim(),
        });

        // si tu repo exige code obligatorio y tú lo generas en repo, aquí pásalo null/undefined
        return this.repo.create(entity);
    }
}