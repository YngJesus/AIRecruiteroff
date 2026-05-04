import { apiClient } from "./client";

export interface DashboardSummary {
  totalJobs: number;
  totalCandidates: number;
  avgMatchScore: number;
  candidatesByStatus: Record<string, number>;
  recentCandidates: Array<{
    id: string;
    cvFileName: string;
    status: string;
    matchScore: number;
    updatedAt: string;
  }>;
}

export const dashboardApi = {
  getSummary: () => apiClient.get<DashboardSummary>("/dashboard/summary"),
};
