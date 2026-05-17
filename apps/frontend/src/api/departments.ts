import { apiClient } from "./client";

export const departmentsApi = {
  findAll: () => apiClient.get("/departments"),
  create: (name: string, description?: string) =>
    apiClient.post("/departments", { name, description }),
  update: (id: string, name?: string, description?: string) =>
    apiClient.patch(`/departments/${id}`, { name, description }),
  delete: (id: string) => apiClient.delete(`/departments/${id}`),
};
