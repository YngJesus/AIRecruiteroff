import { apiClient } from "./client";

export interface Interview {
  id: string;
  candidateId: string;
  jobId: string;
  techLeadId: string;
  scheduledAt: string;
  availabilityId?: string;
  status: string;
  candidate?: { id: string; cvFileName: string };
  job?: { id: string; title: string };
}

export const interviewsApi = {
  findAll: () => apiClient.get<Interview[]>("/interviews"),
  findByTechLead: (techLeadId: string) =>
    apiClient.get<Interview[]>(`/interviews/techlead/${techLeadId}`),
  findByCandidate: (candidateId: string) =>
    apiClient.get<Interview | null>(`/interviews/candidate/${candidateId}`),
  create: (
    candidateId: string,
    jobId: string,
    techLeadId: string,
    scheduledAt: string,
    availabilityId?: string,
  ) =>
    apiClient.post<Interview>("/interviews", {
      candidateId,
      jobId,
      techLeadId,
      scheduledAt,
      availabilityId,
    }),
  reschedule: (
    id: string,
    techLeadId: string,
    scheduledAt: string,
    availabilityId?: string,
  ) =>
    apiClient.patch<Interview>(`/interviews/${id}/reschedule`, {
      techLeadId,
      scheduledAt,
      availabilityId,
    }),
  update: (id: string, status?: string, scheduledAt?: string) =>
    apiClient.patch<Interview>(`/interviews/${id}`, { status, scheduledAt }),
  delete: (id: string) => apiClient.delete(`/interviews/${id}`),
};
