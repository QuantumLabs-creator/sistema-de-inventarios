// src/components/units/types.ts

export type Unit = {
  id: string;
  name: string;
  symbol: string | null;
  active: boolean;
};

export type UnitDraft = Omit<Unit, "id">;

export const emptyUnitDraft: UnitDraft = {
  name: "",
  symbol: null,
  active: true,
};