import { IsUUID, IsDateString, IsString } from 'class-validator';

export class CreateAvailabilityDto {
  @IsUUID()
  userId: string;

  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}
