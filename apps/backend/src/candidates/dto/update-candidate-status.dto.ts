import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CandidateStatus } from '../entities/candidate.entity';

export class UpdateCandidateStatusDto {
  @ApiProperty({
    enum: CandidateStatus,
    example: CandidateStatus.PARSED,
  })
  @IsEnum(CandidateStatus, {
    message:
      'Status must be one of: uploaded, parsed, matched, awaiting-interview, rejected',
  })
  status: CandidateStatus;
}
