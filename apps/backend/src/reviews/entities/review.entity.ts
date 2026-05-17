import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ReviewStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  candidateId: string;

  @Column()
  techLeadId: string;

  @Column()
  createdById: string;

  @Column({ type: 'json', nullable: true })
  questions: any;

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
