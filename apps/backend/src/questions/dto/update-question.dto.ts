import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
