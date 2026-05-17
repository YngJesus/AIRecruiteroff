import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsUUID()
  createdByUserId: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
