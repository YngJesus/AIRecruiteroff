import { IsString, IsUUID } from 'class-validator';

export class CreateCandidateDto {
  @IsUUID()
  jobId: string;

  @IsString()
  cvFileName: string;

  @IsString()
  cvFilePath: string;
}
