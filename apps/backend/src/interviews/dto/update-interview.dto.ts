import { IsOptional, IsEnum, IsISO8601 } from 'class-validator';
import { InterviewStatus } from '../entities/interview.entity';

export class UpdateInterviewDto {
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;
}
