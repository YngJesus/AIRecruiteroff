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
  status:
    | "uploaded"
    | "processing"
    | "parsed"
    | "matched"
    | "failed"
    | "awaiting-interview"
    | "interview-scheduled"
    | "rejected";
  processingError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadCandidateResponse {
  candidateId: string;
  status: "queued";
}

export const candidatesApi = {
  findAll: (jobId?: string) =>
    apiClient.get<Candidate[]>("/candidates", { params: { jobId } }),
  findOne: (id: string) => apiClient.get<Candidate>(`/candidates/${id}`),
  create: (data: Omit<Candidate, "id" | "createdAt" | "updatedAt">) =>
    apiClient.post<Candidate>("/candidates", data),
  update: (id: string, data: Partial<Candidate>) =>
    apiClient.patch<Candidate>(`/candidates/${id}`, data),
  updateStatus: (id: string, status: Candidate["status"]) =>
    apiClient.patch<Candidate>(`/candidates/${id}/status`, { status }),
  getStatus: (id: string) =>
    apiClient.get<{
      id: string;
      status: Candidate["status"];
      processingError?: string;
    }>(`/candidates/${id}/status`),
  downloadCV: (id: string) =>
    apiClient.get<Blob>(`/candidates/${id}/cv`, { responseType: "blob" }),
  delete: (id: string) => apiClient.delete(`/candidates/${id}`),
  uploadCV: (jobId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<UploadCandidateResponse>(
      `/candidates/upload?jobId=${jobId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },
};
