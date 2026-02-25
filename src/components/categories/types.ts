// src/components/categories/types.ts

export type Category = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;

  // si tu API devuelve createdAt como string ISO (recomendado)
  createdAt?: string;
};

export type CategoryDraft = Omit<Category, "id">;

export const emptyCategoryDraft: CategoryDraft = {
  name: "",
  description: null,
  active: true,
  createdAt: undefined,
};