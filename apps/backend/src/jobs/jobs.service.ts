import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
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
    userId: string,
  ): Promise<Job> {
    const job = await this.findOne(id);

    // Check if user is creator or admin
    if (job.createdById !== userId) {
      throw new BadRequestException(
        'Only creator or admin can update this job',
      );
    }

    Object.assign(job, updateJobDto);
    return this.jobsRepository.save(job);
  }

  async remove(id: string, userId: string): Promise<void> {
    const job = await this.findOne(id);

    if (job.createdById !== userId) {
      throw new BadRequestException(
        'Only creator or admin can delete this job',
      );
    }

    await this.jobsRepository.remove(job);
  }
}
