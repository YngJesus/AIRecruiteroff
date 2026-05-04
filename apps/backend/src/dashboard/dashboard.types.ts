export interface DashboardSummary {
  totalJobs: number;
  totalCandidates: number;
  avgMatchScore: number;
  /** Candidates with match score ≥ 70 (strong fits). */
  highMatchCandidates: number;
  /** Still uploading or being analyzed. */
  pipelineInProgress: number;
  /** Failed or rejected — needs a look. */
  needsAttention: number;
  /** Ready for human interview step. */
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
    updatedAt: Date;
  }>;
}
