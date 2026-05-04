import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './entities/candidate.entity';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { ParserService } from './parser.service';
import { UploadModule } from 'src/upload/upload.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { BullModule } from '@nestjs/bullmq';
import { CvProcessingProcessor } from './cv-processing.processor';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate]),
    BullModule.registerQueue({ name: 'cv-processing' }),
    UploadModule,
    JobsModule,
    AiModule,
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService, ParserService, CvProcessingProcessor],
  exports: [CandidatesService],
})
export class CandidatesModule {}
