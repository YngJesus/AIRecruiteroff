import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './entities/candidate.entity';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { ParserService } from './parser.service';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate]), UploadModule],
  controllers: [CandidatesController],
  providers: [CandidatesService, ParserService],
  exports: [CandidatesService],
})
export class CandidatesModule {}
