import { IsUUID, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  candidateId: string;

  @IsUUID()
  techLeadId: string;

  @IsOptional()
  questions?: any;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
