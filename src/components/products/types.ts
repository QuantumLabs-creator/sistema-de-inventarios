// src/components/products/types.ts

export type Product = {
    id: string;

    code: string; // PROD-0001 (viene del backend)
    name: string;
    description: string | null;

    purchasePrice: string; // lo manejamos como string en UI (más fácil en inputs)
    salePrice: string;

    minStock: number;
    currentStock: number;

    active: boolean;

    categoryId: string;
    supplierId: string | null;
    unitId: string;

    // Para pintar en tabla (si tu API lo incluye)
    category?: { id: string; name: string } | null;
    supplier?: { id: string; name: string } | null;
    unit?: { id: string; name: string; symbol?: string | null } | null;
};

export type ProductDraft = Omit<Product, "id" | "code"> & {
    // code NO se edita/NO se envía si lo generas automático
};

export const emptyProductDraft: ProductDraft = {
    name: "",
    description: null,

    purchasePrice: "",
    salePrice: "",

    minStock: 0,
    currentStock: 0,

    active: true,

    categoryId: "",
    supplierId: null,
    unitId: "",

    category: null,
    supplier: null,
    unit: null,
};

export type OptionItem = { id: string; name: string };
export type UnitOptionItem = { id: string; name: string; symbol?: string | null };