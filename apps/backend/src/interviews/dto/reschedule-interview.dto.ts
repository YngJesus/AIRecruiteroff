import { IsUUID, IsISO8601, IsOptional } from 'class-validator';

export class RescheduleInterviewDto {
  @IsUUID()
  techLeadId: string;

  @IsISO8601()
  scheduledAt: string;

  @IsOptional()
  @IsUUID()
  availabilityId?: string;
}
