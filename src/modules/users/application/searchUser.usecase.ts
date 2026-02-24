import type { UserRepository, UserListResult } from "../domain/user.repository";

export class SearchUsersUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(params: {
    q?: string;
    role?: string;     // ADMIN | USER | WAREHOUSE
    active?: string;   // true | false
    phone: string;
    page: number;
    pageSize: number;
  }): Promise<UserListResult> {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(500, Math.max(5, Number(params.pageSize ?? 10)));

    return this.repo.list({
      q: params.q?.trim() || undefined,
      role: params.role?.trim() || undefined,
      active: params.active?.trim() || undefined,
      phone: params.phone?.trim() || undefined,
      page,
      pageSize,
    });
  }
}