import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'src/jobs/entities/job.entity';
import { Candidate } from 'src/candidates/entities/candidate.entity';
import { DashboardSummary } from './dashboard.types';
import { UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(Candidate)
    private readonly candidatesRepository: Repository<Candidate>,
  ) {}

  async getSummary(user: { id: string; role: UserRole }): Promise<DashboardSummary> {
    const isAdmin = user?.role === UserRole.ADMIN;

    const jobs = await this.jobsRepository.find({
      where: isAdmin ? undefined : { createdById: user.id },
      select: { id: true, title: true, createdById: true } as any,
    });

    const jobIds = jobs.map((j) => j.id);
    const jobTitleById = new Map(jobs.map((j) => [j.id, j.title]));

    const candidatesWhere = isAdmin
      ? undefined
      : jobIds.length
        ? ({ jobId: jobIds } as any)
        : ({ jobId: '__none__' } as any);

    const [totalJobs, totalCandidates, candidates, recentCandidates] =
      await Promise.all([
        isAdmin ? this.jobsRepository.count() : jobs.length,
        isAdmin
          ? this.candidatesRepository.count()
          : jobIds.length
            ? this.candidatesRepository.count({ where: { jobId: jobIds } as any })
            : 0,
        this.candidatesRepository.find({
          where: candidatesWhere as any,
          select: { id: true, status: true, matchScore: true } as any,
        }),
        this.candidatesRepository.find({
          where: candidatesWhere as any,
          order: { updatedAt: 'DESC' },
          take: 5,
          select: {
            id: true,
            jobId: true,
            cvFileName: true,
            status: true,
            matchScore: true,
            updatedAt: true,
          } as any,
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
        jobId: (candidate as any).jobId,
        jobTitle: jobTitleById.get((candidate as any).jobId) ?? '—',
        cvFileName: candidate.cvFileName,
        status: candidate.status,
        matchScore: Number(candidate.matchScore || 0),
        updatedAt: candidate.updatedAt,
      })),
    };
  }
}
