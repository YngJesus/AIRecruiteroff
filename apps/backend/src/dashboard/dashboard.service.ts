import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'src/jobs/entities/job.entity';
import { Candidate } from 'src/candidates/entities/candidate.entity';
import { DashboardSummary } from './dashboard.types';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(Candidate)
    private readonly candidatesRepository: Repository<Candidate>,
  ) {}

  async getSummary(): Promise<DashboardSummary> {
    const [totalJobs, totalCandidates, candidates, recentCandidates] =
      await Promise.all([
        this.jobsRepository.count(),
        this.candidatesRepository.count(),
        this.candidatesRepository.find(),
        this.candidatesRepository.find({
          order: { updatedAt: 'DESC' },
          take: 5,
          select: {
            id: true,
            cvFileName: true,
            status: true,
            matchScore: true,
            updatedAt: true,
          },
        }),
      ]);

    const avgMatchScore =
      candidates.length > 0
        ? Math.round(
            candidates.reduce(
              (sum, candidate) => sum + Number(candidate.matchScore || 0),
              0,
            ) / candidates.length,
          )
        : 0;

    const candidatesByStatus = candidates.reduce<Record<string, number>>(
      (acc, candidate) => {
        const key = candidate.status;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {},
    );

    return {
      totalJobs,
      totalCandidates,
      avgMatchScore,
      candidatesByStatus,
      recentCandidates: recentCandidates.map((candidate) => ({
        id: candidate.id,
        cvFileName: candidate.cvFileName,
        status: candidate.status,
        matchScore: Number(candidate.matchScore || 0),
        updatedAt: candidate.updatedAt,
      })),
    };
  }
}
