import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Department } from 'src/departments/entities/department.entity';

export interface RequiredSkill {
  skill: string;
  level: 'junior' | 'mid' | 'senior';
  priority: 'required' | 'nice-to-have';
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  requiredSkills: RequiredSkill[];

  @Column({ nullable: true })
  createdById: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User | null;

  @Column({ nullable: true })
  departmentId?: string;

  @ManyToOne(() => Department, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department?: Department | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
