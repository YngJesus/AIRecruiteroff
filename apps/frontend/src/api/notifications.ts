import { apiClient } from "./client";

export const notificationsApi = {
  findMine: () => apiClient.get("/notifications/me"),
  create: (payload: any) => apiClient.post("/notifications", payload),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch("/notifications/me/mark-all-read"),
};
