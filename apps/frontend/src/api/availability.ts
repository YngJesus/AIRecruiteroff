import { apiClient } from "./client";

export const availabilityApi = {
  findForUser: (userId: string) => apiClient.get(`/availability/${userId}`),
  create: (userId: string, date: string, startTime: string, endTime: string) =>
    apiClient.post("/availability", { userId, date, startTime, endTime }),
  update: (
    id: string,
    date?: string,
    startTime?: string,
    endTime?: string,
    status?: string,
  ) =>
    apiClient.patch(`/availability/${id}`, {
      date,
      startTime,
      endTime,
      status,
    }),
  delete: (id: string) => apiClient.delete(`/availability/${id}`),
};
