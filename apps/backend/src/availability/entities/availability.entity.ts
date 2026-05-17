import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SlotStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  UNAVAILABLE = 'unavailable',
}

@Entity('availability')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'enum', enum: SlotStatus, default: SlotStatus.AVAILABLE })
  status: SlotStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
