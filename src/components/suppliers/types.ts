// src/components/suppliers/types.ts

export type Supplier = {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
};

export type SupplierDraft = Omit<Supplier, "id">;

export const emptySupplierDraft: SupplierDraft = {
  name: "",
  contact: null,
  email: null,
  phone: null,
  address: null,
  active: true,
};