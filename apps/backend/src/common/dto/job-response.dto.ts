import { ApiProperty } from '@nestjs/swagger';

export class JobResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({
    example: [
      { skill: 'React', level: 'mid', priority: 'required' },
      { skill: 'Node.js', level: 'mid', priority: 'required' },
    ],
  })
  requiredSkills: any[];

  @ApiProperty()
  createdById: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
