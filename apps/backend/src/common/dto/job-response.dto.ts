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

  @ApiProperty({ nullable: true })
  createdById: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
