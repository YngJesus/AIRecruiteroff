import { Module } from '@nestjs/common';
import { Interview } from './entities/interview.entity';
import { InterviewsService } from './interviews.service';
import { InterviewsController } from './interviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from 'src/availability/entities/availability.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { CandidatesModule } from 'src/candidates/candidates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interview, Availability]),
    NotificationsModule,
    CandidatesModule,
  ],
  providers: [InterviewsService],
  controllers: [InterviewsController],
  exports: [InterviewsService],
})
export class InterviewsModule {}
