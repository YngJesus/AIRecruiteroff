import { apiClient } from "./client";

export interface Job {
  id: string;
  title: string;
  description: string;
  requiredSkills: {
    skill: string;
    level: "junior" | "mid" | "senior";
    priority: "required" | "nice-to-have";
  }[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export const jobsApi = {
  getAll: () => apiClient.get<Job[]>("/jobs"),
  getById: (id: string) => apiClient.get<Job>(`/jobs/${id}`),
  create: (data: Omit<Job, "id" | "createdById" | "createdAt" | "updatedAt">) =>
    apiClient.post<Job>("/jobs", data),
  update: (id: string, data: Partial<Job>) =>
    apiClient.patch<Job>(`/jobs/${id}`, data),
  delete: (id: string) => apiClient.delete(`/jobs/${id}`),
};
