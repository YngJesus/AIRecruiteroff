import { apiClient } from "./client";

export const questionsApi = {
  findAll: () => apiClient.get("/questions"),
  create: (text: string, createdByUserId: string, departmentId?: string) =>
    apiClient.post("/questions", { text, createdByUserId, departmentId }),
  update: (id: string, text?: string) =>
    apiClient.patch(`/questions/${id}`, { text }),
  delete: (id: string) => apiClient.delete(`/questions/${id}`),
};
