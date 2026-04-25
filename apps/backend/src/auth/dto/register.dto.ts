import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { IsStrongPassword } from 'src/common/validators/password.validator';
import { UserRole } from 'src/users/entities/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
