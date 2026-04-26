import {
  IsString,
  IsArray,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SkillDto {
  @IsString()
  skill: string;

  @IsEnum(['junior', 'mid', 'senior'], {
    message: 'Level must be junior, mid, or senior',
  })
  level: 'junior' | 'mid' | 'senior';

  @IsEnum(['required', 'nice-to-have'], {
    message: 'Priority must be required or nice-to-have',
  })
  priority: 'required' | 'nice-to-have';
}

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested()
  @Type(() => SkillDto)
  requiredSkills: SkillDto[];
}
