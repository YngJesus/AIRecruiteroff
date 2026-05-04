import { apiClient } from "./client";

export interface DashboardSummary {
  totalJobs: number;
  totalCandidates: number;
  avgMatchScore: number;
  highMatchCandidates: number;
  pipelineInProgress: number;
  needsAttention: number;
  interviewReady: number;
  candidatesByStatus: Record<string, number>;
  recentJobs: Array<{
    id: string;
    title: string;
    candidateCount: number;
  }>;
  recentCandidates: Array<{
    id: string;
    jobId: string;
    jobTitle: string;
    cvFileName: string;
    status: string;
    matchScore: number;
    updatedAt: string;
  }>;
}

export const dashboardApi = {
  getSummary: () => apiClient.get<DashboardSummary>("/dashboard/summary"),
};
