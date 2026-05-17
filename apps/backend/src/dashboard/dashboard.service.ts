import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

  async getSummary(user: {
    id: string;
    role: UserRole;
  }): Promise<DashboardSummary> {
    const isAdmin = user?.role === UserRole.ADMIN;

    const jobs = await this.jobsRepository.find({
      where: isAdmin ? undefined : { createdById: user.id },
      select: { id: true, title: true, createdById: true } as any,
    });

    const jobIds = jobs.map((j) => j.id);
    const jobTitleById = new Map(jobs.map((j) => [j.id, j.title]));

    // Early return if non-admin with no jobs
    if (!isAdmin && jobIds.length === 0) {
      return {
        totalJobs: 0,
        totalCandidates: 0,
        avgMatchScore: 0,
        highMatchCandidates: 0,
        pipelineInProgress: 0,
        needsAttention: 0,
        interviewReady: 0,
        candidatesByStatus: {},
        recentJobs: [],
        recentCandidates: [],
      };
    }

    const candidatesWhere = isAdmin
      ? undefined
      : jobIds.length > 0
        ? { jobId: In(jobIds) }
        : undefined;

    const [totalJobs, totalCandidates, candidates, recentCandidates] =
      await Promise.all([
        isAdmin ? this.jobsRepository.count() : jobs.length,
        isAdmin
          ? this.candidatesRepository.count()
          : jobIds.length > 0
            ? this.candidatesRepository.count({
                where: { jobId: In(jobIds) },
              })
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

    const highMatchCandidates = candidates.filter(
      (c) => Number((c as any).matchScore || 0) >= 70,
    ).length;
    const pipelineInProgress = candidates.filter((c) =>
      ['uploaded', 'processing'].includes(String(c.status)),
    ).length;
    const needsAttention = candidates.filter((c) =>
      ['failed', 'rejected'].includes(String(c.status)),
    ).length;
    const interviewReady = candidates.filter(
      (c) => String(c.status) === 'awaiting-interview',
    ).length;

    const recentJobEntities = await this.jobsRepository.find({
      where: isAdmin ? undefined : { createdById: user.id },
      order: { updatedAt: 'DESC' },
      take: 5,
      select: { id: true, title: true } as any,
    });
    const rjIds = recentJobEntities.map((j) => j.id);
    let recentJobs: { id: string; title: string; candidateCount: number }[] =
      [];
    if (rjIds.length) {
      const raw = await this.candidatesRepository
        .createQueryBuilder('c')
        .select('c.jobId', 'jobId')
        .addSelect('COUNT(c.id)', 'cnt')
        .where('c.jobId IN (:...rjIds)', { rjIds })
        .groupBy('c.jobId')
        .getRawMany<{ jobId: string; cnt: string }>();
      const cntMap = new Map(raw.map((r) => [r.jobId, Number(r.cnt)]));
      recentJobs = recentJobEntities.map((j) => ({
        id: j.id,
        title: j.title,
        candidateCount: cntMap.get(j.id) ?? 0,
      }));
    }

    return {
      totalJobs,
      totalCandidates,
      avgMatchScore,
      highMatchCandidates,
      pipelineInProgress,
      needsAttention,
      interviewReady,
      candidatesByStatus,
      recentJobs,
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
