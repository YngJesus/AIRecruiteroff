import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate, CandidateStatus } from './entities/candidate.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
  ) {}

  async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    const candidate = this.candidatesRepository.create(createCandidateDto);
    return this.candidatesRepository.save(candidate);
  }

  async findAll(jobId?: string): Promise<Candidate[]> {
    const query = this.candidatesRepository.createQueryBuilder('candidate');

    if (jobId) {
      query.where('candidate.jobId = :jobId', { jobId });
    }

    return query.orderBy('candidate.matchScore', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findOne({
      where: { id },
      relations: ['job'],
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }

  async update(
    id: string,
    updateCandidateDto: UpdateCandidateDto,
  ): Promise<Candidate> {
    const candidate = await this.findOne(id);
    Object.assign(candidate, updateCandidateDto);
    return this.candidatesRepository.save(candidate);
  }

  async updateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    const candidate = await this.findOne(id);
    candidate.status = status;
    return this.candidatesRepository.save(candidate);
  }

  async remove(id: string): Promise<void> {
    const candidate = await this.findOne(id);
    await this.candidatesRepository.remove(candidate);
  }

  async updateMatchScore(
    id: string,
    matchScore: number,
    skillGaps: any[],
  ): Promise<Candidate> {
    const candidate = await this.findOne(id);
    candidate.matchScore = matchScore;
    candidate.skillGaps = skillGaps;
    candidate.status = CandidateStatus.MATCHED;
    return this.candidatesRepository.save(candidate);
  }

  async updateParsedData(id: string, parsedData: any): Promise<Candidate> {
    const candidate = await this.findOne(id);
    candidate.parsedData = parsedData;
    candidate.status = CandidateStatus.PARSED;
    return this.candidatesRepository.save(candidate);
  }

  async updateGeneratedQuestions(id: string, questions: any[]): Promise<Candidate> {
    const candidate = await this.findOne(id);
    candidate.generatedQuestions = questions;
    return this.candidatesRepository.save(candidate);
  }

  async markProcessingFailed(id: string, message: string): Promise<Candidate> {
    const candidate = await this.findOne(id);
    candidate.status = CandidateStatus.FAILED;
    candidate.processingError = message;
    return this.candidatesRepository.save(candidate);
  }
}
