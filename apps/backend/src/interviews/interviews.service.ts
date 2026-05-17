import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from './entities/interview.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import {
  Availability,
  SlotStatus,
} from 'src/availability/entities/availability.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';
import { CandidatesService } from 'src/candidates/candidates.service';
import { CandidateStatus } from 'src/candidates/entities/candidate.entity';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview) private repo: Repository<Interview>,
    @InjectRepository(Availability)
    private availabilityRepo: Repository<Availability>,
    private readonly notificationsService: NotificationsService,
    private readonly candidatesService: CandidatesService,
  ) {}

  findAll(user?: { id: string; role?: string; departmentId?: string }) {
    const qb = this.repo
      .createQueryBuilder('interview')
      .leftJoinAndSelect('interview.candidate', 'candidate')
      .leftJoinAndSelect('interview.job', 'job');

    if (user?.role === 'tech_lead') {
      qb.andWhere('interview.techLeadId = :userId', { userId: user.id });
    } else if (user?.role === 'recruiter' && user.departmentId) {
      qb.andWhere(
        '(job.departmentId = :depId OR job.departmentId IS NULL)',
        { depId: user.departmentId },
      );
    }

    return qb.orderBy('interview.scheduledAt', 'ASC').getMany();
  }

  async findById(id: string) {
    const i = await this.repo.findOne({
      where: { id },
      relations: ['candidate', 'job'],
    });
    if (!i) throw new NotFoundException('Interview not found');
    return i;
  }

  async findByCandidateId(candidateId: string) {
    const list = await this.repo.find({
      where: { candidateId },
      relations: ['candidate', 'job'],
      order: { scheduledAt: 'DESC' },
      take: 1,
    });
    return list[0] ?? null;
  }

  findByTechLeadId(techLeadId: string) {
    return this.repo.find({
      where: { techLeadId },
      relations: ['candidate', 'job'],
      order: { scheduledAt: 'ASC' },
    });
  }

  private async reserveSlot(availabilityId: string, techLeadId: string) {
    const slot = await this.availabilityRepo.findOne({
      where: { id: availabilityId },
    });
    if (!slot) throw new NotFoundException('Availability slot not found');
    if (slot.userId !== techLeadId) {
      throw new BadRequestException('Slot does not belong to this tech lead');
    }
    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new BadRequestException('Slot not available');
    }
    slot.status = SlotStatus.RESERVED;
    await this.availabilityRepo.save(slot);
    return slot;
  }

  private async releaseSlot(availabilityId?: string | null) {
    if (!availabilityId) return;
    const slot = await this.availabilityRepo.findOne({
      where: { id: availabilityId },
    });
    if (slot && slot.status === SlotStatus.RESERVED) {
      slot.status = SlotStatus.AVAILABLE;
      await this.availabilityRepo.save(slot);
    }
  }

  async create(dto: CreateInterviewDto) {
    const existing = await this.findByCandidateId(dto.candidateId);
    if (existing) {
      throw new BadRequestException(
        'Interview already scheduled for this candidate. Use reschedule instead.',
      );
    }

    if (dto.availabilityId) {
      await this.reserveSlot(dto.availabilityId, dto.techLeadId);
    }

    const i = this.repo.create({
      ...dto,
      scheduledAt: new Date(dto.scheduledAt),
    });
    const saved = await this.repo.save(i);

    await this.candidatesService.updateStatus(
      saved.candidateId,
      CandidateStatus.INTERVIEW_SCHEDULED,
    );

    try {
      await this.notificationsService.create({
        userId: saved.techLeadId,
        type: NotificationType.INTERVIEW_SCHEDULED,
        payload: {
          interviewId: saved.id,
          candidateId: saved.candidateId,
          scheduledAt: saved.scheduledAt,
        },
      });
    } catch (e) {
      console.error('Failed to create notification', e);
    }
    return saved;
  }

  async reschedule(id: string, dto: RescheduleInterviewDto) {
    const interview = await this.findById(id);
    const oldSlotId = interview.availabilityId;

    if (dto.availabilityId) {
      await this.reserveSlot(dto.availabilityId, dto.techLeadId);
    }

    await this.releaseSlot(oldSlotId);

    interview.techLeadId = dto.techLeadId;
    interview.scheduledAt = new Date(dto.scheduledAt);
    interview.availabilityId = dto.availabilityId;
    const saved = await this.repo.save(interview);

    try {
      await this.notificationsService.create({
        userId: saved.techLeadId,
        type: NotificationType.INTERVIEW_SCHEDULED,
        payload: {
          interviewId: saved.id,
          candidateId: saved.candidateId,
          scheduledAt: saved.scheduledAt,
          rescheduled: true,
        },
      });
    } catch (e) {
      console.error('Failed to create notification', e);
    }

    return saved;
  }

  async update(id: string, dto: UpdateInterviewDto) {
    const i = await this.findById(id);
    Object.assign(i, dto);
    if (dto.scheduledAt) {
      i.scheduledAt = new Date(dto.scheduledAt);
    }
    return this.repo.save(i);
  }

  async remove(id: string) {
    const i = await this.findById(id);
    await this.releaseSlot(i.availabilityId);
    await this.repo.remove(i);
    await this.candidatesService.updateStatus(
      i.candidateId,
      CandidateStatus.AWAITING_INTERVIEW,
    );
    return { ok: true };
  }
}
