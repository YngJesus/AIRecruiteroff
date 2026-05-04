import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';
import { Candidate } from 'src/candidates/entities/candidate.entity';
import { UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
  ) {}

  async create(userId: string, createJobDto: CreateJobDto): Promise<Job> {
    if (
      !createJobDto.requiredSkills ||
      createJobDto.requiredSkills.length === 0
    ) {
      throw new BadRequestException('At least one skill is required');
    }

    const job = this.jobsRepository.create({
      ...createJobDto,
      createdById: userId,
    });
    return this.jobsRepository.save(job);
  }

  async findAll(): Promise<Job[]> {
    return this.jobsRepository.find({
      relations: ['createdBy'],
    });
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    user: { id: string; role: UserRole },
  ): Promise<Job> {
    const job = await this.findOne(id);

    if (job.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new BadRequestException(
        'Only creator or admin can update this job',
      );
    }

    Object.assign(job, updateJobDto);
    return this.jobsRepository.save(job);
  }

  async remove(
    id: string,
    user: { id: string; role: UserRole },
  ): Promise<void> {
    const job = await this.findOne(id);

    if (job.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new BadRequestException(
        'Only creator or admin can delete this job',
      );
    }

    await this.candidatesRepository.delete({ jobId: id });
    await this.jobsRepository.remove(job);
  }
}
