import { Role } from "../application/dtos/user.dto";

export class UserEntity {
  static create(input: {
    name: string;
    email: string;
    password: string; // aquí ya debería venir hasheada si tu flujo es correcto
    role: Role;
    phone: string;
    active: boolean;
  }) {
    return {
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      phone: input.phone,
      active: input.active,
    };
  }
}