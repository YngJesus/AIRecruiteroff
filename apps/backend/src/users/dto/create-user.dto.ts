import { UserRole } from '../entities/user.entity';
import {
  IsEmail,
  IsString,
  IsEnum,
  MinLength,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
