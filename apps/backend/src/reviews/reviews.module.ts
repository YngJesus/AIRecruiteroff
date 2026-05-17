import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Interview } from 'src/interviews/entities/interview.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { CandidatesModule } from 'src/candidates/candidates.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Interview]),
    CandidatesModule,
    NotificationsModule,
    UsersModule,
  ],
  providers: [ReviewsService],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
