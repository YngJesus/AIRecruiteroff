import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Job } from 'src/jobs/entities/job.entity';

export enum CandidateStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  PARSED = 'parsed',
  MATCHED = 'matched',
  FAILED = 'failed',
  AWAITING_INTERVIEW = 'awaiting-interview',
  INTERVIEW_SCHEDULED = 'interview-scheduled',
  REJECTED = 'rejected',
}

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jobId: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column()
  cvFileName: string;

  @Column()
  cvFilePath: string;

  @Column({ type: 'jsonb', nullable: true })
  parsedData: {
    skills?: { name: string; level?: string }[];
    experience?: { company?: string; role?: string; duration?: string }[];
    education?: { school?: string; degree?: string; field?: string }[];
    certifications?: { name?: string; issuer?: string; date?: string }[];
  };

  @Column({ type: 'float', default: 0 })
  matchScore: number;

  @Column({ type: 'jsonb', nullable: true })
  skillGaps: { skill: string; status: 'match' | 'gap' | 'partial' }[];

  @Column({ type: 'jsonb', nullable: true })
  generatedQuestions: { question: string; difficulty: string; skill: string }[];

  @Column({ type: 'text', nullable: true })
  processingError?: string;

  @Column({
    type: 'enum',
    enum: CandidateStatus,
    default: CandidateStatus.UPLOADED,
  })
  status: CandidateStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
