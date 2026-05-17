import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
  REVIEW_ASSIGNED = 'review_assigned',
  REVIEW_RESULT = 'review_result',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // recipient

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'json', nullable: true })
  payload: any;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
