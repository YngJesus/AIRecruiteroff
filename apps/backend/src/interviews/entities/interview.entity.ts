import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Candidate } from 'src/candidates/entities/candidate.entity';
import { Job } from 'src/jobs/entities/job.entity';

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  candidateId: string;

  @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @Column()
  jobId: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column()
  techLeadId: string;

  @Column({ type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ nullable: true })
  availabilityId?: string;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
  })
  status: InterviewStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
