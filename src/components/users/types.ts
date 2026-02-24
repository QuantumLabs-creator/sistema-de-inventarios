export type UserRole = "ADMIN" | "USER" | "WAREHOUSE";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserDraft = Omit<User, "id" | "createdAt" | "updatedAt"> & {
  password?: string;
};

export const emptyUserDraft: UserDraft = {
  name: "",
  email: "",
  role: "USER",
  active: true,
  password: "",
  phone: "",
};