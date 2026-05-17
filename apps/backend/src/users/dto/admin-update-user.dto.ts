import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
