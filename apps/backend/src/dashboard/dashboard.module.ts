import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from 'src/jobs/entities/job.entity';
import { Candidate } from 'src/candidates/entities/candidate.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Candidate])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
