import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job as BullJob } from 'bullmq';
import { Logger } from '@nestjs/common';
import { UploadService } from 'src/upload/upload.service';
import { CandidatesService } from './candidates.service';
import { JobsService } from 'src/jobs/jobs.service';
import { CvExtractionService } from 'src/ai/cv-extraction.service';
import { MatchingService } from 'src/ai/matching.service';
import { QuestionGeneratorService } from 'src/ai/question-generator.service';
import { CandidateStatus } from './entities/candidate.entity';

type CvProcessingJob = {
  candidateId: string;
  filepath: string;
  mimetype: string;
  jobId: string;
};

@Processor('cv-processing')
export class CvProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(CvProcessingProcessor.name);

  constructor(
    private readonly uploadService: UploadService,
    private readonly candidatesService: CandidatesService,
    private readonly jobsService: JobsService,
    private readonly cvExtractionService: CvExtractionService,
    private readonly matchingService: MatchingService,
    private readonly questionGeneratorService: QuestionGeneratorService,
  ) {
    super();
  }

  async process(job: BullJob<CvProcessingJob>) {
    const { candidateId, filepath, mimetype, jobId } = job.data;
    try {
      await this.candidatesService.updateStatus(candidateId, CandidateStatus.PROCESSING);
      let rawText = '';
      if (mimetype === 'application/pdf') {
        rawText = await this.uploadService.extractTextFromPDF(filepath);
      } else {
        rawText = await this.uploadService.extractTextFromImage(filepath);
      }

      const parsedData = await this.cvExtractionService.extract(rawText);
      await this.candidatesService.updateParsedData(candidateId, parsedData);

      const fullJob = await this.jobsService.findOne(jobId);
      const { matchScore, skillGaps } = await this.matchingService.computeMatch(
        fullJob,
        parsedData,
      );
      await this.candidatesService.updateMatchScore(candidateId, matchScore, skillGaps);

      const questions = await this.questionGeneratorService.generate(
        fullJob,
        parsedData,
        skillGaps,
      );
      await this.candidatesService.updateGeneratedQuestions(candidateId, questions);
    } catch (err: any) {
      this.logger.error(`CV processing failed for ${candidateId}`, err?.stack);
      await this.candidatesService.markProcessingFailed(
        candidateId,
        err?.message || 'Unknown processing error',
      );
    }
  }
}
