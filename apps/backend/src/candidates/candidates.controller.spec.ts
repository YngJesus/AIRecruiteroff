import { Test } from '@nestjs/testing';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { UploadService } from 'src/upload/upload.service';
import { JobsService } from 'src/jobs/jobs.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('CandidatesController upload', () => {
  it('queues uploaded CV and returns queued status', async () => {
    const candidatesService = {
      create: jest.fn().mockResolvedValue({ id: 'cand-1' }),
      findOne: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
    };
    const uploadService = {
      handleFileUpload: jest.fn().mockResolvedValue('/tmp/cv.pdf'),
      getDecryptedStream: jest.fn(),
    };
    const jobsService = {
      findOne: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };
    const queue = {
      add: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      controllers: [CandidatesController],
      providers: [
        { provide: CandidatesService, useValue: candidatesService },
        { provide: UploadService, useValue: uploadService },
        { provide: JobsService, useValue: jobsService },
        { provide: getQueueToken('cv-processing'), useValue: queue },
      ],
    }).compile();

    const controller = module.get(CandidatesController);
    const result = await controller.uploadCVAndCreateCandidate('job-1', {
      size: 100,
      originalname: 'cv.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('test'),
    });

    expect(queue.add).toHaveBeenCalledWith(
      'analyze-cv',
      expect.objectContaining({ candidateId: 'cand-1', jobId: 'job-1' }),
    );
    expect(result).toEqual({ candidateId: 'cand-1', status: 'queued' });
  });
});
