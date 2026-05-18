import { apiClient } from "./client";

export interface ReviewQuestion {
  question: string;
  skill?: string;
  difficulty?: string;
  type?: string;
}

export interface InterviewBriefing {
  reviewId: string;
  candidateId: string;
  questions?: ReviewQuestion[];
  score?: number;
  notes?: string;
  acceptedAt: string;
  candidate?: {
    id: string;
    cvFileName: string;
    jobId: string;
    jobTitle?: string;
    matchScore: number;
    skillGaps?: { skill: string; status: string }[];
    parsedData?: {
      skills?: { name: string; level?: string }[];
      experience?: { company?: string; role?: string; duration?: string }[];
      education?: { school?: string; degree?: string; field?: string }[];
    };
    status: string;
  };
  interview?: {
    id: string;
    scheduledAt: string;
    status: string;
  } | null;
}

export interface Review {
  id: string;
  candidateId: string;
  techLeadId: string;
  createdById: string;
  questions?: ReviewQuestion[];
  score?: number;
  notes?: string;
  status: "pending" | "accepted" | "rejected";
  candidate?: {
    id: string;
    cvFileName: string;
    jobId: string;
    jobTitle?: string;
    matchScore: number;
    skillGaps?: any[];
    parsedData?: any;
    status: string;
  };
}

export const reviewsApi = {
  create: (data: {
    candidateId: string;
    techLeadId: string;
    questions?: ReviewQuestion[];
    score?: number;
    notes?: string;
  }) => apiClient.post<Review>("/reviews", data),
  findByTechLead: (techLeadId: string) =>
    apiClient.get<Review[]>(`/reviews/techlead/${techLeadId}`),
  findInterviewPrep: async (techLeadId: string) => {
    try {
      return await apiClient.get<InterviewBriefing[]>(
        `/reviews/prep/${techLeadId}`,
      );
    } catch (err: any) {
      const status = err?.statusCode ?? err?.status;
      if (status === 404) {
        return apiClient.get<InterviewBriefing[]>(
          `/reviews/techlead/${techLeadId}/prep`,
        );
      }
      throw err;
    }
  },
  updateQuestions: (id: string, questions: ReviewQuestion[]) =>
    apiClient.patch<Review>(`/reviews/${id}/questions`, { questions }),
  accept: (id: string) => apiClient.patch<Review>(`/reviews/${id}/accept`),
  reject: (id: string) => apiClient.patch<Review>(`/reviews/${id}/reject`),
};
