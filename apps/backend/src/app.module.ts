import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { CandidatesModule } from './candidates/candidates.module';
import { UploadModule } from './upload/upload.module';
import { QueueModule } from './queue/queue.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DepartmentsModule } from './departments/departments.module';
import { QuestionsModule } from './questions/questions.module';
import { AvailabilityModule } from './availability/availability.module';
import { InterviewsModule } from './interviews/interviews.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    JobsModule,
    CandidatesModule,
    UploadModule,
    QueueModule,
    DashboardModule,
    DepartmentsModule,
    QuestionsModule,
    AvailabilityModule,
    InterviewsModule,
    ReviewsModule,
    // Notifications module for in-app alerts
    NotificationsModule,
  ],
})
export class AppModule {}
