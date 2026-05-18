import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { Interview } from 'src/interviews/entities/interview.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { CandidatesService } from 'src/candidates/candidates.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';
import { UsersService } from 'src/users/users.service';
import { User, UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private repo: Repository<Review>,
    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,
    private readonly candidatesService: CandidatesService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  private async assertTechLeadOwnership(review: Review, user: User) {
    if (user.role === UserRole.ADMIN) return;
    if (review.techLeadId !== user.id) {
      throw new ForbiddenException('Not your review');
    }
  }

  async createAndNotify(dto: CreateReviewDto, recruiter: User) {
    const candidate = await this.candidatesService.findOne(
      dto.candidateId,
      recruiter,
    );
    const techLead = await this.usersService.findById(dto.techLeadId);

    if (techLead.role !== UserRole.TECH_LEAD) {
      throw new BadRequestException('Selected user is not a tech lead');
    }

    if (
      recruiter.departmentId &&
      techLead.departmentId &&
      recruiter.departmentId !== techLead.departmentId
    ) {
      throw new ForbiddenException(
        'Tech lead must be in your department',
      );
    }

    const existing = await this.repo.findOne({
      where: { candidateId: dto.candidateId, status: ReviewStatus.PENDING },
    });
    if (existing) {
      throw new BadRequestException(
        'This candidate already has a pending review',
      );
    }

    const r = this.repo.create({
      candidateId: dto.candidateId,
      techLeadId: dto.techLeadId,
      createdById: recruiter.id,
      questions: dto.questions ?? candidate.generatedQuestions ?? [],
      score: dto.score ?? candidate.matchScore,
      notes: dto.notes,
      status: ReviewStatus.PENDING,
    });
    const saved = await this.repo.save(r);

    await this.notificationsService.create({
      userId: saved.techLeadId,
      type: NotificationType.REVIEW_ASSIGNED,
      payload: {
        reviewId: saved.id,
        candidateId: saved.candidateId,
        createdById: saved.createdById,
      },
    });
    return saved;
  }

  async findInterviewPrepByTechLead(techLeadId: string, user: User) {
    if (user.role !== UserRole.ADMIN && user.id !== techLeadId) {
      throw new ForbiddenException('Cannot view another tech lead briefings');
    }

    const reviews = await this.repo.find({
      where: { techLeadId, status: ReviewStatus.ACCEPTED },
      order: { updatedAt: 'DESC' },
    });

    const briefings: {
      reviewId: string;
      candidateId: string;
      questions: any[];
      score: number;
      notes: string | null;
      acceptedAt: Date;
      candidate: {
        id: string;
        cvFileName: string;
        jobId: string;
        jobTitle?: string;
        matchScore: number;
        skillGaps: any;
        parsedData: any;
        status: string;
      };
      interview: {
        id: string;
        scheduledAt: Date;
        status: string;
      } | null;
    }[] = [];

    for (const r of reviews) {
      let candidate;
      try {
        // Load without department filter — tech lead already owns this review.
        candidate = await this.candidatesService.findOne(r.candidateId);
      } catch {
        continue;
      }

      const interviews = await this.interviewRepo.find({
        where: { candidateId: r.candidateId, techLeadId },
        order: { scheduledAt: 'DESC' },
        take: 1,
      });
      const interview = interviews[0] ?? null;

      briefings.push({
        reviewId: r.id,
        candidateId: r.candidateId,
        questions: r.questions ?? candidate.generatedQuestions ?? [],
        score: r.score ?? candidate.matchScore,
        notes: r.notes,
        acceptedAt: r.updatedAt,
        candidate: {
          id: candidate.id,
          cvFileName: candidate.cvFileName,
          jobId: candidate.jobId,
          jobTitle: candidate.job?.title,
          matchScore: candidate.matchScore,
          skillGaps: candidate.skillGaps,
          parsedData: candidate.parsedData,
          status: candidate.status,
        },
        interview: interview
          ? {
              id: interview.id,
              scheduledAt: interview.scheduledAt,
              status: interview.status,
            }
          : null,
      });
    }

    return briefings.sort((a, b) => {
      const aHas = Boolean(a.interview?.scheduledAt);
      const bHas = Boolean(b.interview?.scheduledAt);
      if (aHas && bHas) {
        return (
          new Date(a.interview!.scheduledAt).getTime() -
          new Date(b.interview!.scheduledAt).getTime()
        );
      }
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return (
        new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime()
      );
    });
  }

  async findByTechLead(techLeadId: string, user: User) {
    if (user.role !== UserRole.ADMIN && user.id !== techLeadId) {
      throw new ForbiddenException('Cannot view another tech lead reviews');
    }

    const reviews = await this.repo.find({
      where: { techLeadId, status: ReviewStatus.PENDING },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      reviews.map(async (r) => {
        const candidate = await this.candidatesService.findOne(r.candidateId);
        return {
          ...r,
          candidate: {
            id: candidate.id,
            cvFileName: candidate.cvFileName,
            jobId: candidate.jobId,
            jobTitle: candidate.job?.title,
            matchScore: candidate.matchScore,
            skillGaps: candidate.skillGaps,
            parsedData: candidate.parsedData,
            status: candidate.status,
          },
        };
      }),
    );
  }

  async findOne(id: string) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Review not found');
    return r;
  }

  async updateQuestions(id: string, questions: any[], user: User) {
    const r = await this.findOne(id);
    await this.assertTechLeadOwnership(r, user);
    if (r.status !== ReviewStatus.PENDING) {
      throw new BadRequestException('Review already processed');
    }
    r.questions = questions;
    await this.repo.save(r);
    await this.candidatesService.update(r.candidateId, {
      generatedQuestions: questions,
    } as any);
    return r;
  }

  async accept(id: string, user: User) {
    const r = await this.findOne(id);
    await this.assertTechLeadOwnership(r, user);
    if (r.status !== ReviewStatus.PENDING) {
      throw new BadRequestException('Review already processed');
    }
    r.status = ReviewStatus.ACCEPTED;
    await this.repo.save(r);
    await this.candidatesService.updateStatus(
      r.candidateId,
      'awaiting-interview' as any,
    );
    await this.notificationsService.create({
      userId: r.createdById,
      type: NotificationType.REVIEW_RESULT,
      payload: {
        reviewId: r.id,
        candidateId: r.candidateId,
        result: 'accepted',
      },
    });
    return r;
  }

  async reject(id: string, user: User) {
    const r = await this.findOne(id);
    await this.assertTechLeadOwnership(r, user);
    if (r.status !== ReviewStatus.PENDING) {
      throw new BadRequestException('Review already processed');
    }
    r.status = ReviewStatus.REJECTED;
    await this.repo.save(r);
    await this.candidatesService.updateStatus(r.candidateId, 'rejected' as any);
    await this.notificationsService.create({
      userId: r.createdById,
      type: NotificationType.REVIEW_RESULT,
      payload: {
        reviewId: r.id,
        candidateId: r.candidateId,
        result: 'rejected',
      },
    });
    return r;
  }
}
