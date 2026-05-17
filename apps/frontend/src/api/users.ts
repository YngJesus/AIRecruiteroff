import { apiClient } from "./client";

export type UserRole = "admin" | "recruiter" | "tech_lead";

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export const usersApi = {
  findAll: () => apiClient.get<AdminUser[]>("/users"),
  create: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    departmentId?: string;
  }) => apiClient.post<AdminUser>("/users", data),
  update: (
    id: string,
    data: Partial<Pick<AdminUser, "firstName" | "lastName" | "role">>,
  ) => apiClient.patch<AdminUser>(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete<{ ok: true }>(`/users/${id}`),
};
