import { IsEmail, IsString, IsOptional, IsIn } from 'class-validator';
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

  @IsIn([UserRole.RECRUITER, UserRole.TECH_LEAD])
  @IsOptional()
  role?: UserRole;
}
