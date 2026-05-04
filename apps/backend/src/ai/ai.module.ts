import { Module } from '@nestjs/common';
import { ParserService } from 'src/candidates/parser.service';
import { GroqService } from './groq.service';
import { CvExtractionService } from './cv-extraction.service';
import { MatchingService } from './matching.service';
import { QuestionGeneratorService } from './question-generator.service';

@Module({
  providers: [
    ParserService,
    GroqService,
    CvExtractionService,
    MatchingService,
    QuestionGeneratorService,
  ],
  exports: [CvExtractionService, MatchingService, QuestionGeneratorService],
})
export class AiModule {}
