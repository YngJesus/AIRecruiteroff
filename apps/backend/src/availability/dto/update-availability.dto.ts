import { IsOptional, IsDateString, IsString } from 'class-validator';

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
