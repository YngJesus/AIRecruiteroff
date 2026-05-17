import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ required: false })
  departmentId?: string;

  @ApiProperty()
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
