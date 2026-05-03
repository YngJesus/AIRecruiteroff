import { apiClient } from "./client";

export interface Candidate {
  id: string;
  jobId: string;
  cvFileName: string;
  cvFilePath: string;
  parsedData?: any;
  matchScore: number;
  skillGaps?: any[];
  generatedQuestions?: any[];
  status: "uploaded" | "parsed" | "matched" | "awaiting-interview" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export const candidatesApi = {
  getAll: (jobId?: string) =>
    apiClient.get<Candidate[]>("/candidates", { params: { jobId } }),
  getById: (id: string) => apiClient.get<Candidate>(`/candidates/${id}`),
  create: (data: Omit<Candidate, "id" | "createdAt" | "updatedAt">) =>
    apiClient.post<Candidate>("/candidates", data),
  update: (id: string, data: Partial<Candidate>) =>
    apiClient.patch<Candidate>(`/candidates/${id}`, data),
  updateStatus: (id: string, status: Candidate["status"]) =>
    apiClient.patch<Candidate>(`/candidates/${id}/status`, { status }),
  delete: (id: string) => apiClient.delete(`/candidates/${id}`),
};
