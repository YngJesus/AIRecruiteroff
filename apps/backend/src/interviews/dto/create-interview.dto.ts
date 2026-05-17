import { IsUUID, IsISO8601, IsOptional } from 'class-validator';

export class CreateInterviewDto {
  @IsUUID()
  candidateId: string;

  @IsUUID()
  jobId: string;

  @IsUUID()
  techLeadId: string;

  @IsISO8601()
  scheduledAt: string;

  @IsOptional()
  @IsUUID()
  availabilityId?: string;
}
